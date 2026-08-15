import { isPrimitiveType, Schema } from "js-moi-manifest";
import { ErrorCode, ErrorUtils, hexToBytes } from "js-moi-utils";
import { Depolorizer } from "js-polo";
import { generateStorageKey } from "./accessor";
import { SlotAccessorBuilder } from "./accessor-builder";
import { EntityBuilder } from "./entity-builder";
/**
 * Represents actor state functionality for a logic element (`state actor:`
 * in the manifest - scoped per calling participant, not shared/global).
 * Does not support retrieval of actor state elements.
 */
export class ActorState {
    logicId;
    provider;
    driver;
    constructor(logic, provider) {
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
    getBuilder(slot, createAccessorBuilder) {
        const entityBuilder = new EntityBuilder(slot, this.driver);
        createAccessorBuilder(entityBuilder);
        return entityBuilder.getSlotAccessorBuilder();
    }
    /**
     * Retrieves the value from the actor state.
     *
     * @param createAccessorBuilder - The function that creates the accessor builder.
     * @returns A promise that resolves to the retrieved value.
     * @throws An error if the actor state is not present or if the accessor builder is invalid.
     */
    async get(address, createAccessorBuilder) {
        const [ptr, hasActorState] = this.driver.hasActorState();
        if (!hasActorState) {
            ErrorUtils.throwError("Actor state is not present");
        }
        const builder = this.getBuilder(ptr, createAccessorBuilder);
        if (!SlotAccessorBuilder.isSlotAccessorBuilder(builder)) {
            ErrorUtils.throwError("Invalid accessor builder", ErrorCode.ACTION_REJECTED, {
                expected: SlotAccessorBuilder.name,
                got: typeof builder,
            });
        }
        const slot = generateStorageKey(builder.getBaseSlot(), builder.getAccessors());
        const result = await this.provider.getStorageAt(this.logicId, slot.hex(), address);
        const depolorizer = new Depolorizer(hexToBytes(result));
        if (!isPrimitiveType(builder.getStorageType())) {
            return depolorizer.depolorizeInteger();
        }
        const schema = Schema.parseDataType(builder.getStorageType(), this.driver.getClassDefs(), this.driver.getElements());
        return new Depolorizer(hexToBytes(result)).depolorize(schema);
    }
}
//# sourceMappingURL=actor-state.js.map