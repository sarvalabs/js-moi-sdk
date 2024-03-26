"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityBuilder = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const accessor_builder_1 = require("./accessor-builder");
class EntityBuilder {
    slot;
    elementDescriptor;
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
            js_moi_utils_1.ErrorUtils.throwError(`'${label} is not member of persistance state`, js_moi_utils_1.ErrorCode.PROPERTY_NOT_DEFINED, {
                entity: label,
            });
        }
        return accessor_builder_1.SlotAccessorBuilder.fromTypeField(field, this.elementDescriptor);
    }
}
exports.EntityBuilder = EntityBuilder;
//# sourceMappingURL=entity-builder.js.map