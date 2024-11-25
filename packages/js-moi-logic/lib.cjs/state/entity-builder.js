"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityBuilder = void 0;
const js_moi_utils_1 = require("@zenz-solutions/js-moi-utils");
const accessor_builder_1 = require("./accessor-builder");
class EntityBuilder {
    slot;
    elementDescriptor;
    slotAccessorBuilder;
    constructor(slot, elementDescriptor) {
        this.slot = slot;
        this.elementDescriptor = elementDescriptor;
    }
    entity(label) {
        const element = this.elementDescriptor.getElements().get(this.slot)?.data;
        if (element == null) {
            js_moi_utils_1.ErrorUtils.throwError("Element not found", js_moi_utils_1.ErrorCode.PROPERTY_NOT_DEFINED, {
                ptr: this.slot,
            });
        }
        const field = element.fields.find((field) => field.label === label);
        if (field == null) {
            js_moi_utils_1.ErrorUtils.throwError(`'${label}' is not member of persistent state`, js_moi_utils_1.ErrorCode.PROPERTY_NOT_DEFINED, {
                entity: label,
            });
        }
        this.slotAccessorBuilder = new accessor_builder_1.SlotAccessorBuilder(field, this.elementDescriptor);
        return this.slotAccessorBuilder;
    }
    getSlotAccessorBuilder() {
        if (this.slotAccessorBuilder == null) {
            js_moi_utils_1.ErrorUtils.throwError("Slot accessor builder not initialized");
        }
        return this.slotAccessorBuilder;
    }
}
exports.EntityBuilder = EntityBuilder;
//# sourceMappingURL=entity-builder.js.map