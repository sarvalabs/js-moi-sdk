"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentState = void 0;
const js_moi_manifest_1 = require("@zenz-solutions/js-moi-manifest");
const js_moi_utils_1 = require("@zenz-solutions/js-moi-utils");
const js_polo_1 = require("js-polo");
const accessor_1 = require("./accessor");
const accessor_builder_1 = require("./accessor-builder");
const entity_builder_1 = require("./entity-builder");
/**
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
class PersistentState {
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
        const entityBuilder = new entity_builder_1.EntityBuilder(slot, this.driver);
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
    async get(createAccessorBuilder) {
        const [ptr, hasPersistentState] = this.driver.hasPersistentState();
        if (!hasPersistentState) {
            js_moi_utils_1.ErrorUtils.throwError("Persistent state is not present");
        }
        const builder = this.getBuilder(ptr, createAccessorBuilder);
        if (!accessor_builder_1.SlotAccessorBuilder.isSlotAccessorBuilder(builder)) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid accessor builder", js_moi_utils_1.ErrorCode.ACTION_REJECTED, {
                expected: accessor_builder_1.SlotAccessorBuilder.name,
                got: typeof builder,
            });
        }
        const slot = (0, accessor_1.generateStorageKey)(builder.getBaseSlot(), builder.getAccessors());
        const result = await this.provider.getStorageAt(this.logicId, slot.hex());
        const depolorizer = new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(result));
        if (!(0, js_moi_manifest_1.isPrimitiveType)(builder.getStorageType())) {
            return depolorizer.depolorizeInteger();
        }
        const schema = js_moi_manifest_1.Schema.parseDataType(builder.getStorageType(), this.driver.getClassDefs(), this.driver.getElements());
        return new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(result)).depolorize(schema);
    }
}
exports.PersistentState = PersistentState;
//# sourceMappingURL=persistent-state.js.map