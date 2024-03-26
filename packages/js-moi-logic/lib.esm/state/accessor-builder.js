import { isArray, isMap, Schema } from "js-moi-manifest";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
import { ArrayIndexAccessor, ClassFieldAccessor, LengthAccessor, PropertyAccessor, } from "./accessor";
const VALUE_TYPE_INDEX = 1;
export class SlotAccessorBuilder {
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
        if (!isArray(this.slotType) && !isMap(this.slotType)) {
            ErrorUtils.throwError(`Attempting to access the length of a non-array or non-map type '${this.slotType}'.`, ErrorCode.UNSUPPORTED_OPERATION);
        }
        this.slotType = "u64";
        this.accessors.push(new LengthAccessor());
        return this;
    }
    property(key) {
        this.slotType = Schema.extractMapDataType(this.slotType)[VALUE_TYPE_INDEX];
        this.accessors.push(new PropertyAccessor(key));
        return this;
    }
    at(index) {
        this.slotType = Schema.extractArrayDataType(this.slotType);
        this.accessors.push(new ArrayIndexAccessor(index));
        return this;
    }
    field(fieldName) {
        if (!this.elementDescriptor.getClassDefs().has(this.slotType)) {
            ErrorUtils.throwError(`Attempting to access a field '${fieldName}' in ${this.slotType}, which is not a recognized class.`, ErrorCode.UNEXPECTED_ARGUMENT);
        }
        const element = this.elementDescriptor.getClassElement(this.slotType);
        element.data = element.data;
        const field = element.data.fields.find((field) => field.label === fieldName);
        if (field == null) {
            ErrorUtils.throwError(`The field '${fieldName}' is not a recognized member of the class '${this.slotType}'. Please ensure that the field name is correct and that it is defined within the class context.`, ErrorCode.PROPERTY_NOT_DEFINED, {
                field: fieldName,
            });
        }
        this.slotType = field.type;
        const accessor = new ClassFieldAccessor(field.slot);
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
//# sourceMappingURL=accessor-builder.js.map