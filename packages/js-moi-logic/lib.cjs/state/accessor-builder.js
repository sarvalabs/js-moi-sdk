"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotAccessorBuilder = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const accessor_1 = require("./accessor");
const VALUE_TYPE_INDEX = 1;
class SlotAccessorBuilder {
    accessors = [];
    elementDescriptor;
    slotType;
    constructor(baseType, logicDescriptor) {
        this.elementDescriptor = logicDescriptor;
        this.slotType = baseType;
    }
    getStorageType() {
        return this.slotType;
    }
    getAccessors() {
        return this.accessors;
    }
    length() {
        if (!(0, js_moi_manifest_1.isArray)(this.slotType) && !(0, js_moi_manifest_1.isMap)(this.slotType)) {
            js_moi_utils_1.ErrorUtils.throwError(`Attempting to access the length of a non-array or non-map type '${this.slotType}'.`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
        }
        this.slotType = "u64";
        this.accessors.push(new accessor_1.LengthAccessor());
        return this;
    }
    property(key) {
        this.slotType = js_moi_manifest_1.Schema.extractMapDataType(this.slotType)[VALUE_TYPE_INDEX];
        this.accessors.push(new accessor_1.PropertyAccessor(key));
        return this;
    }
    at(index) {
        this.slotType = js_moi_manifest_1.Schema.extractArrayDataType(this.slotType);
        this.accessors.push(new accessor_1.ArrayIndexAccessor(index));
        return this;
    }
    field(fieldName) {
        if (!this.elementDescriptor.getClassDefs().has(this.slotType)) {
            js_moi_utils_1.ErrorUtils.throwError(`Attempting to access a field '${fieldName}' in ${this.slotType}, which is not a recognized class.`, js_moi_utils_1.ErrorCode.UNEXPECTED_ARGUMENT);
        }
        const element = this.elementDescriptor.getClassElement(this.slotType);
        element.data = element.data;
        const field = element.data.fields.find((field) => field.label === fieldName);
        if (field == null) {
            js_moi_utils_1.ErrorUtils.throwError(`The field '${fieldName}' is not a recognized member of the class '${this.slotType}'. Please ensure that the field name is correct and that it is defined within the class context.`, js_moi_utils_1.ErrorCode.PROPERTY_NOT_DEFINED, {
                field: fieldName,
            });
        }
        this.slotType = field.type;
        const accessor = new accessor_1.ClassFieldAccessor(field.slot);
        this.accessors.push(accessor);
        return this;
    }
    /**
     * Creates a SlotAccessorBuilder instance from a given {@linkcode LogicManifest.TypeField} and {@linkcode ElementDescriptor}.
     * @param field - The TypeField object.
     * @param logicDescriptor - The LogicDescriptor object.
     * @returns A new SlotAccessorBuilder instance.
     */
    static fromTypeField(field, logicDescriptor) {
        return new SlotAccessorBuilder(field.type, logicDescriptor);
    }
    /**
     * Checks if the given `builder` is an instance of `SlotAccessorBuilder`.
     *
     * @param builder - The accessor builder to check.
     * @returns `true` if the `builder` is an instance of `SlotAccessorBuilder`, `false` otherwise.
     */
    static isSlotAccessorBuilder(builder) {
        return builder instanceof SlotAccessorBuilder;
    }
}
exports.SlotAccessorBuilder = SlotAccessorBuilder;
//# sourceMappingURL=accessor-builder.js.map