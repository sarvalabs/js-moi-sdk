import { isPrimitiveType, Schema } from "js-moi-manifest";
import { ErrorCode, ErrorUtils, hexToBytes } from "js-moi-utils";
import { Depolorizer } from "js-polo";
import { generateStorageKey } from "./accessor";
import { SlotAccessorBuilder } from "./accessor-builder";
import { EntityBuilder } from "./entity-builder";
/**
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
export class PersistentState {
    logicId;
    provider;
    driver;
    constructor(logic, provider) {
        this.logicId = logic.getLogicId();
        this.provider = provider;
        this.driver = logic;
    }
    getBuilder(slot, createAccessorBuilder) {
        const entityBuilder = new EntityBuilder(slot, this.driver);
        createAccessorBuilder(entityBuilder);
        return entityBuilder.getSlotAccessorBuilder();
    }
    async get(createAccessorBuilder) {
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
            return depolorizer.depolorizeInteger();
        }
        const schema = Schema.parseDataType(builder.getStorageType(), this.driver.getClassDefs(), this.driver.getElements());
        return new Depolorizer(hexToBytes(result)).depolorize(schema);
    }
}
//# sourceMappingURL=persistent-state.js.map