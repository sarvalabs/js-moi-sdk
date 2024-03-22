import { Schema } from "js-moi-manifest";
import type { AbstractProvider } from "js-moi-providers";
import { ErrorUtils, hexToBytes } from "js-moi-utils";
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
type AccessorBuilderFunction = (builder: EntityBuilder) => AccessorBuilder;

/**
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
export class PersistentState {
    private logicId: string;
    private provider: AbstractProvider;
    private driver: LogicDriver;

    constructor(logic: LogicDriver, provider: AbstractProvider) {
        this.logicId = logic.getLogicId();
        this.provider = provider;
        this.driver = logic;
    }

    public async get<T = any>(createAccessorBuilder: AccessorBuilderFunction): Promise<T> {
        const [ptr, hasPersistentState] = this.driver.hasPersistentState();

        if (!hasPersistentState) {
            ErrorUtils.throwError("Persistent state is not present");
        }

        const builder = createAccessorBuilder(new EntityBuilder(ptr, this.driver));

        if (!SlotAccessorBuilder.isSlotAccessorBuilder(builder)) {
            ErrorUtils.throwError("Invalid accessor builder");
        }

        const accessors = builder.getAccessors();
        const slot = generateStorageKey(ptr, accessors);
        const result = await this.provider.getStorageAt(this.logicId, slot.hex());
        
        const type = builder.getStorageType();
        const schema = Schema.parseDataType(type, this.driver.getClassDefs(), this.driver.getElements());
        
        return new Depolorizer(hexToBytes(result)).depolorize(schema) as T;

    }
}
