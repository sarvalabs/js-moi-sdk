import { isPrimitiveType, Schema } from "@zenz-solutions/js-moi-manifest";
import type { AbstractProvider } from "@zenz-solutions/js-moi-providers";
import { ErrorCode, ErrorUtils, hexToBytes } from "@zenz-solutions/js-moi-utils";
import { Depolorizer } from "js-polo";

import type { LogicDriver } from "../logic-driver";
import { generateStorageKey } from "./accessor";
import { SlotAccessorBuilder, type AccessorBuilder } from "./accessor-builder";
import { EntityBuilder } from "./entity-builder";

/**
 * Represents a function that builds an accessor.
 * @param builder - The entity builder.
 * @returns The accessor builder.
 */
type AccessorBuilderFunction = (builder: EntityBuilder) => AccessorBuilder | void;

/**
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
export class PersistentState {
    private logicId: string;
    private provider: AbstractProvider;
    private driver: LogicDriver;

    constructor(logic: LogicDriver, provider: AbstractProvider) {
        this.logicId = logic.getLogicId().hex();
        this.provider = provider;
        this.driver = logic;
    }

    /**
     * Returns an accessor builder for the specified slot.
     * 
     * @param slot - The slot number.
     * @param createAccessorBuilder - The function to create the accessor builder.
     * @returns The accessor builder for the specified slot.
     */
    private getBuilder(slot: number, createAccessorBuilder: AccessorBuilderFunction): AccessorBuilder {
        const entityBuilder = new EntityBuilder(slot, this.driver);
        createAccessorBuilder(entityBuilder);
        return entityBuilder.getSlotAccessorBuilder();
    }

    /**
     * Retrieves the value from the persistent state.
     * 
     * @param createAccessorBuilder - The function that creates the accessor builder.
     * @returns A promise that resolves to the retrieved value.
     * @throws An error if the persistent state is not present or if the accessor builder is invalid.
     */
    public async get<T = any>(createAccessorBuilder: AccessorBuilderFunction): Promise<T> {
        const [ptr, hasPersistentState] = this.driver.hasPersistentState();

        if (!hasPersistentState) {
            ErrorUtils.throwError("Persistent state is not present");
        }

        const builder = this.getBuilder(ptr, createAccessorBuilder);

        if (!SlotAccessorBuilder.isSlotAccessorBuilder(builder)) {
            ErrorUtils.throwError("Invalid accessor builder", ErrorCode.ACTION_REJECTED, {
                expected: SlotAccessorBuilder.name,
                got: typeof builder,
            });
        }

        const slot = generateStorageKey(builder.getBaseSlot(), builder.getAccessors());
        const result = await this.provider.getStorageAt(this.logicId, slot.hex());
        const depolorizer = new Depolorizer(hexToBytes(result));

        if (!isPrimitiveType(builder.getStorageType())) {
            return depolorizer.depolorizeInteger() as T;
        }

        const schema = Schema.parseDataType(builder.getStorageType(), this.driver.getClassDefs(), this.driver.getElements());
        return new Depolorizer(hexToBytes(result)).depolorize(schema) as T;
    }
}
