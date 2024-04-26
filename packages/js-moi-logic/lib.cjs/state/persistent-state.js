"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentState = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
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
        this.logicId = logic.getLogicId();
        this.provider = provider;
        this.driver = logic;
    }
    getBuilder(slot, createAccessorBuilder) {
        const entityBuilder = new entity_builder_1.EntityBuilder(slot, this.driver);
        createAccessorBuilder(entityBuilder);
        return entityBuilder.getSlotAccessorBuilder();
    }
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
        if (!(0, js_moi_manifest_1.isPrimitiveType)(builder.getStorageType())) {
            js_moi_utils_1.ErrorUtils.throwError("Cannot retrieve complex types from persistent state", js_moi_utils_1.ErrorCode.ACTION_REJECTED, {
                type: builder.getStorageType(),
            });
        }
        const slot = (0, accessor_1.generateStorageKey)(builder.getBaseSlot(), builder.getAccessors());
        const result = await this.provider.getStorageAt(this.logicId, slot.hex());
        const schema = js_moi_manifest_1.Schema.parseDataType(builder.getStorageType(), this.driver.getClassDefs(), this.driver.getElements());
        return new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(result)).depolorize(schema);
    }
}
exports.PersistentState = PersistentState;
//# sourceMappingURL=persistent-state.js.map