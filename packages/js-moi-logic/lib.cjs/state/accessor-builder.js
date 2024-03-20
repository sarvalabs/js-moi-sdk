"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotAccessorBuilder = void 0;
const bn_js_1 = require("bn.js");
const js_moi_utils_1 = require("js-moi-utils");
const accessor_1 = require("./accessor");
const context_state_matrix_1 = require("./context-state-matrix");
class SlotAccessorBuilder {
    accessors = [];
    baseSlot;
    logicDescriptor;
    constructor(base, logicDescriptor) {
        this.logicDescriptor = logicDescriptor;
        if (typeof base === "number") {
            this.baseSlot = new bn_js_1.BN(base);
            return;
        }
        this.baseSlot = base;
    }
    get slotAsNumber() {
        return this.baseSlot.toNumber();
    }
    length() {
        this.accessors.push(new accessor_1.LengthAccessor());
        return this;
    }
    property(label) {
        this.accessors.push(new accessor_1.PropertyAccessor(label));
        return this;
    }
    generate() {
        return this.accessors.reduce((slotHash, accessor) => accessor.access(slotHash), this.baseSlot);
    }
    at(index) {
        this.accessors.push(new accessor_1.ArrayIndexAccessor(index));
        return this;
    }
    field(label) {
        const value = this.logicDescriptor.getStateMatrix().get(context_state_matrix_1.ContextStateKind.PersistentState);
        const element = this.logicDescriptor.getElements().get(value);
        if (element == null) {
            js_moi_utils_1.ErrorUtils.throwError("Element not found");
        }
        element.data = element.data;
        let field = element.data.fields[this.slotAsNumber];
        const classDef = this.logicDescriptor.getClassElement(field.type);
        classDef.data = classDef.data;
        field = classDef.data.fields.find((field) => field.label === label);
        if (field == null) {
            js_moi_utils_1.ErrorUtils.throwError(`Class field '${label}' not found`, js_moi_utils_1.ErrorCode.PROPERTY_NOT_DEFINED, {
                field: label
            });
        }
        this.accessors.push(new accessor_1.ClassFieldAccessor(field.slot));
        return this;
    }
    static isSlotAccessorBuilder(builder) {
        return builder instanceof SlotAccessorBuilder;
    }
}
exports.SlotAccessorBuilder = SlotAccessorBuilder;
//# sourceMappingURL=accessor-builder.js.map