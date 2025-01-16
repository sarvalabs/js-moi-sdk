import { ElementType, ErrorCode, ErrorUtils } from "js-moi-utils";
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
        const element = this.elementDescriptor.getElements().get(this.slot);
        if (element == null) {
            ErrorUtils.throwError("Element not found", ErrorCode.PROPERTY_NOT_DEFINED, {
                ptr: this.slot,
            });
        }
        if (element.kind !== ElementType.State) {
            ErrorUtils.throwError("Element is not a state", ErrorCode.INVALID_ARGUMENT, {
                ptr: this.slot,
            });
        }
        const field = element.data.fields.find((field) => field.label === label);
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