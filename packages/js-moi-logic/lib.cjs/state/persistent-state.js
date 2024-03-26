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
    async get(createAccessorBuilder) {
        const [ptr, hasPersistentState] = this.driver.hasPersistentState();
        if (!hasPersistentState) {
            js_moi_utils_1.ErrorUtils.throwError("Persistent state is not present");
        }
        const builder = createAccessorBuilder(new entity_builder_1.EntityBuilder(ptr, this.driver));
        if (!accessor_builder_1.SlotAccessorBuilder.isSlotAccessorBuilder(builder)) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid accessor builder");
        }
        const accessors = builder.getAccessors();
        let type = builder.getStorageType();
        if (!(0, js_moi_manifest_1.isPrimitiveType)(type)) {
            switch (true) {
                case (0, js_moi_manifest_1.isMap)(type) || (0, js_moi_manifest_1.isArray)(type):
                    type = "integer";
                    break;
                default:
                    throw js_moi_utils_1.ErrorUtils.throwError("Invalid type for persistent state");
            }
        }
        const slot = (0, accessor_1.generateStorageKey)(ptr, accessors);
        const result = await this.provider.getStorageAt(this.logicId, slot.hex());
        const schema = js_moi_manifest_1.Schema.parseDataType(type, this.driver.getClassDefs(), this.driver.getElements());
        return new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(result)).depolorize(schema);
    }
}
exports.PersistentState = PersistentState;
//# sourceMappingURL=persistent-state.js.map