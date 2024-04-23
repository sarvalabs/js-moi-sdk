import { isArray, isMap, Schema, type LogicManifest } from "js-moi-manifest";
import { ErrorCode, ErrorUtils } from "js-moi-utils";

import type ElementDescriptor from "../element-descriptor";
import {
    ArrayIndexAccessor,
    ClassFieldAccessor,
    LengthAccessor,
    PropertyAccessor,
    type Accessor,
    type AccessorProvider,
    type StorageTypeProvider,
} from "./accessor";

const VALUE_TYPE_INDEX = 1;

export interface AccessorBuilder {
    /**
     * Adds a length accessor to the accessor builder.
     * This accessor can be used to retrieve the length of an array or map.
     *
     * @returns The accessor builder instance.
     */
    length(): AccessorBuilder;

    /**
     * Adds a property accessor to the accessor builder.
     *
     * Used to access to value of key in a map.
     *
     * @param key - The label of the property.
     * @returns The accessor builder instance.
     */
    property(key: string): AccessorBuilder;

    /**
     * Adds an accessor for the specified index to the AccessorBuilder.
     *
     * @param index - The index of the accessor.
     * @returns The AccessorBuilder instance.
     */
    at(index: number): AccessorBuilder;

    /**
     * Adds a field to the accessor builder.
     *
     * Used to access the value of a field in a class.
     *
     * @param fieldName - The label of the field.
     * @returns The accessor builder instance.
     */
    field(fieldName: string): AccessorBuilder;
}

export class SlotAccessorBuilder implements AccessorBuilder, AccessorProvider, StorageTypeProvider {
    private accessors: Accessor[] = [];
    public readonly elementDescriptor: ElementDescriptor;
    private slotType: string;

    public constructor(baseType: string, logicDescriptor: ElementDescriptor) {
        this.elementDescriptor = logicDescriptor;
        this.slotType = baseType;
    }

    public getStorageType(): string {
        return this.slotType;
    }

    public getAccessors(): Accessor[] {
        return this.accessors;
    }

    public length(): SlotAccessorBuilder {
        if (!isArray(this.slotType) && !isMap(this.slotType)) {
            ErrorUtils.throwError(
                `Attempting to access the length of a non-array or non-map type '${this.slotType}'.`,
                ErrorCode.UNSUPPORTED_OPERATION
            );
        }

        this.slotType = "u64";
        this.accessors.push(new LengthAccessor());

        return this;
    }

    public property(key: string): SlotAccessorBuilder {
        this.slotType = Schema.extractMapDataType(this.slotType)[VALUE_TYPE_INDEX];
        this.accessors.push(new PropertyAccessor(key));

        return this;
    }

    public at(index: number): SlotAccessorBuilder {
        this.slotType = Schema.extractArrayDataType(this.slotType);
        this.accessors.push(new ArrayIndexAccessor(index));

        return this;
    }

    public field(fieldName: string): SlotAccessorBuilder {
        if (!this.elementDescriptor.getClassDefs().has(this.slotType)) {
            ErrorUtils.throwError(
                `Attempting to access a field '${fieldName}' in ${this.slotType}, which is not a recognized class.`,
                ErrorCode.UNEXPECTED_ARGUMENT
            );
        }

        const element = this.elementDescriptor.getClassElement(this.slotType);

        element.data = element.data as LogicManifest.Class;

        const field = element.data.fields.find((field) => field.label === fieldName);

        if (field == null) {
            ErrorUtils.throwError(
                `The field '${fieldName}' is not a recognized member of the class '${this.slotType}'. Please ensure that the field name is correct and that it is defined within the class context.`,
                ErrorCode.PROPERTY_NOT_DEFINED,
                {
                    field: fieldName,
                }
            );
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
    public static fromTypeField(field: LogicManifest.TypeField, logicDescriptor: ElementDescriptor): SlotAccessorBuilder {
        return new SlotAccessorBuilder(field.type, logicDescriptor);
    }

    /**
     * Checks if the given `builder` is an instance of `SlotAccessorBuilder`.
     *
     * @param builder - The accessor builder to check.
     * @returns `true` if the `builder` is an instance of `SlotAccessorBuilder`, `false` otherwise.
     */
    public static isSlotAccessorBuilder(builder: AccessorBuilder): builder is SlotAccessorBuilder {
        return builder instanceof SlotAccessorBuilder;
    }
}
