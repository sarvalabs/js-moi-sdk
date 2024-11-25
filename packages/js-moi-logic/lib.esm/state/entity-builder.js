import { ErrorCode, ErrorUtils } from "@zenz-solutions/js-moi-utils";
import { SlotAccessorBuilder } from "./accessor-builder";
export class EntityBuilder {
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
            ErrorUtils.throwError("Element not found", ErrorCode.PROPERTY_NOT_DEFINED, {
                ptr: this.slot,
            });
        }
        const field = element.fields.find((field) => field.label === label);
        if (field == null) {
            ErrorUtils.throwError(`'${label}' is not member of persistent state`, ErrorCode.PROPERTY_NOT_DEFINED, {
                entity: label,
            });
        }
        this.slotAccessorBuilder = new SlotAccessorBuilder(field, this.elementDescriptor);
        return this.slotAccessorBuilder;
    }
    getSlotAccessorBuilder() {
        if (this.slotAccessorBuilder == null) {
            ErrorUtils.throwError("Slot accessor builder not initialized");
        }
        return this.slotAccessorBuilder;
    }
}
//# sourceMappingURL=entity-builder.js.map