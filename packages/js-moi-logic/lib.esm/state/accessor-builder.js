import { BN } from "bn.js";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
import { ArrayIndexAccessor, ClassFieldAccessor, LengthAccessor, PropertyAccessor } from "./accessor";
import { ContextStateKind } from "./context-state-matrix";
export class SlotAccessorBuilder {
    accessors = [];
    baseSlot;
    logicDescriptor;
    constructor(base, logicDescriptor) {
        this.logicDescriptor = logicDescriptor;
        if (typeof base === "number") {
            this.baseSlot = new BN(base);
            return;
        }
        this.baseSlot = base;
    }
    get slotAsNumber() {
        return this.baseSlot.toNumber();
    }
    length() {
        this.accessors.push(new LengthAccessor());
        return this;
    }
    property(label) {
        this.accessors.push(new PropertyAccessor(label));
        return this;
    }
    generate() {
        return this.accessors.reduce((slotHash, accessor) => accessor.access(slotHash), this.baseSlot);
    }
    at(index) {
        this.accessors.push(new ArrayIndexAccessor(index));
        return this;
    }
    field(label) {
        const value = this.logicDescriptor.getStateMatrix().get(ContextStateKind.PersistentState);
        const element = this.logicDescriptor.getElements().get(value);
        if (element == null) {
            ErrorUtils.throwError("Element not found");
        }
        element.data = element.data;
        let field = element.data.fields[this.slotAsNumber];
        const classDef = this.logicDescriptor.getClassElement(field.type);
        classDef.data = classDef.data;
        field = classDef.data.fields.find((field) => field.label === label);
        if (field == null) {
            ErrorUtils.throwError(`Class field '${label}' not found`, ErrorCode.PROPERTY_NOT_DEFINED, {
                field: label
            });
        }
        this.accessors.push(new ClassFieldAccessor(field.slot));
        return this;
    }
    static isSlotAccessorBuilder(builder) {
        return builder instanceof SlotAccessorBuilder;
    }
}
//# sourceMappingURL=accessor-builder.js.map