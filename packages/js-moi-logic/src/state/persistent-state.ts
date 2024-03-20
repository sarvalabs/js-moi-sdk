import type { LogicManifest, ManifestCoder } from "js-moi-manifest";
import type { AbstractProvider } from "js-moi-providers";
import { encodeToString, ErrorCode, ErrorUtils } from "js-moi-utils";
import type { LogicDescriptor } from "../logic-descriptor";
import { SlotAccessorBuilder, type AccessorBuilder } from "./accessor-builder";

/**
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
export class PersistentState {
    private logicId: string;
    private provider: AbstractProvider;
    private manifestCoder: ManifestCoder;
    private logicDescriptor: LogicDescriptor;

    constructor(
        logicId: string, 
        logicDescriptor: LogicDescriptor, 
        manifestCoder: ManifestCoder, 
        provider: AbstractProvider
    ) {
        this.logicId = logicId;
        this.provider = provider;
        this.manifestCoder = manifestCoder;
        this.logicDescriptor = logicDescriptor;
    }

    async get(accessor?: (builder: EntityBuilder) => AccessorBuilder) {
        const builder = accessor(new EntityBuilder(this.logicDescriptor))
        
        if(!SlotAccessorBuilder.isSlotAccessorBuilder(builder)) {
            ErrorUtils.throwError("Invalid accessor builder");
        }

        const slot = builder.generate().toBuffer('be', 32);
        const result = await this.provider.getStorageAt(this.logicId, encodeToString(slot));
        return result;
    }
}

class EntityBuilder {
    private readonly logicDescriptor: LogicDescriptor;

    constructor(logicDescriptor: LogicDescriptor) {
        this.logicDescriptor = logicDescriptor;
    }

    entity(label: string): AccessorBuilder {
        const [ptr, isPersistance] = this.logicDescriptor.hasPersistentState();

        if (!isPersistance) {
            ErrorUtils.throwError("Persistent state not found");
        }

        const element = this.logicDescriptor.getElements().get(ptr)?.data as (LogicManifest.State | undefined);

        if(element == null) {
            ErrorUtils.throwError("Element not found", ErrorCode.PROPERTY_NOT_DEFINED, {
                ptr
            });
        }

        const field = element.fields.find((field) => field.label === label);

        if(field == null) {
            ErrorUtils.throwError(`Entity '${label} not found in state`, ErrorCode.PROPERTY_NOT_DEFINED, {
                entity: label
            });
        }

        return new SlotAccessorBuilder(field.slot, this.logicDescriptor);
    }
}