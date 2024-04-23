import type { LogicManifest } from "js-moi-manifest";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
import type ElementDescriptor from "../element-descriptor";
import { type AccessorBuilder, SlotAccessorBuilder } from "./accessor-builder";

export class EntityBuilder {
    private readonly slot: number;
    private readonly elementDescriptor: ElementDescriptor;

    constructor(slot: number, elementDescriptor: ElementDescriptor) {
        this.slot = slot;
        this.elementDescriptor = elementDescriptor;
    }

    entity(label: string): AccessorBuilder {
        const element = this.elementDescriptor.getElements().get(this.slot)?.data as LogicManifest.State | undefined;

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

        return SlotAccessorBuilder.fromTypeField(field, this.elementDescriptor);
    }
}
