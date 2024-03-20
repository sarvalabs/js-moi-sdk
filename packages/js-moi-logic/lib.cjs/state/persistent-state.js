"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistentState = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const accessor_builder_1 = require("./accessor-builder");
/**
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
class PersistentState {
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
        if (!accessor_builder_1.SlotAccessorBuilder.isSlotAccessorBuilder(builder)) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid accessor builder");
        }
        const slot = builder.generate().toBuffer('be', 32);
        const result = await this.provider.getStorageAt(this.logicId, (0, js_moi_utils_1.encodeToString)(slot));
        return result;
    }
}
exports.PersistentState = PersistentState;
class EntityBuilder {
    logicDescriptor;
    constructor(logicDescriptor) {
        this.logicDescriptor = logicDescriptor;
    }
    entity(label) {
        const [ptr, isPersistance] = this.logicDescriptor.hasPersistentState();
        if (!isPersistance) {
            js_moi_utils_1.ErrorUtils.throwError("Persistent state not found");
        }
        const element = this.logicDescriptor.getElements().get(ptr)?.data;
        if (element == null) {
            js_moi_utils_1.ErrorUtils.throwError("Element not found", js_moi_utils_1.ErrorCode.PROPERTY_NOT_DEFINED, {
                ptr
            });
        }
        const field = element.fields.find((field) => field.label === label);
        if (field == null) {
            js_moi_utils_1.ErrorUtils.throwError(`Entity '${label} not found in state`, js_moi_utils_1.ErrorCode.PROPERTY_NOT_DEFINED, {
                entity: label
            });
        }
        return new accessor_builder_1.SlotAccessorBuilder(field.slot, this.logicDescriptor);
    }
}
//# sourceMappingURL=persistent-state.js.map