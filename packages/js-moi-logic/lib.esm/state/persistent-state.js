import { encodeToString, ErrorCode, ErrorUtils } from "js-moi-utils";
import { SlotAccessorBuilder } from "./accessor-builder";
/**
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
export class PersistentState {
    logicId;
    provider;
    manifestCoder;
    logicDescriptor;
    constructor(logicId, logicDescriptor, manifestCoder, provider) {
        this.logicId = logicId;
        this.provider = provider;
        this.manifestCoder = manifestCoder;
        this.logicDescriptor = logicDescriptor;
    }
    async get(accessor) {
        const builder = accessor(new EntityBuilder(this.logicDescriptor));
        if (!SlotAccessorBuilder.isSlotAccessorBuilder(builder)) {
            ErrorUtils.throwError("Invalid accessor builder");
        }
        const slot = builder.generate().toBuffer('be', 32);
        const result = await this.provider.getStorageAt(this.logicId, encodeToString(slot));
        return result;
    }
}
class EntityBuilder {
    logicDescriptor;
    constructor(logicDescriptor) {
        this.logicDescriptor = logicDescriptor;
    }
    entity(label) {
        const [ptr, isPersistance] = this.logicDescriptor.hasPersistentState();
        if (!isPersistance) {
            ErrorUtils.throwError("Persistent state not found");
        }
        const element = this.logicDescriptor.getElements().get(ptr)?.data;
        if (element == null) {
            ErrorUtils.throwError("Element not found", ErrorCode.PROPERTY_NOT_DEFINED, {
                ptr
            });
        }
        const field = element.fields.find((field) => field.label === label);
        if (field == null) {
            ErrorUtils.throwError(`Entity '${label} not found in state`, ErrorCode.PROPERTY_NOT_DEFINED, {
                entity: label
            });
        }
        return new SlotAccessorBuilder(field.slot, this.logicDescriptor);
    }
}
//# sourceMappingURL=persistent-state.js.map