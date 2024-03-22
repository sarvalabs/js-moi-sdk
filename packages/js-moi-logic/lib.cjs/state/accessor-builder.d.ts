import { type LogicManifest } from "js-moi-manifest";
import type ElementDescriptor from "../element-descriptor";
import { type Accessor, type AccessorProvider, type StorageTypeProvider } from "./accessor";
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
export declare class SlotAccessorBuilder implements AccessorBuilder, AccessorProvider, StorageTypeProvider {
    private accessors;
    readonly elementDescriptor: ElementDescriptor;
    private slotType;
    constructor(baseType: string, logicDescriptor: ElementDescriptor);
    getStorageType(): string;
    getAccessors(): Accessor[];
    length(): SlotAccessorBuilder;
    property(key: string): SlotAccessorBuilder;
    at(index: number): SlotAccessorBuilder;
    field(fieldName: string): SlotAccessorBuilder;
    /**
     * Creates a SlotAccessorBuilder instance from a given {@linkcode LogicManifest.TypeField} and {@linkcode ElementDescriptor}.
     * @param field - The TypeField object.
     * @param logicDescriptor - The LogicDescriptor object.
     * @returns A new SlotAccessorBuilder instance.
     */
    static fromTypeField(field: LogicManifest.TypeField, logicDescriptor: ElementDescriptor): SlotAccessorBuilder;
    /**
     * Checks if the given `builder` is an instance of `SlotAccessorBuilder`.
     *
     * @param builder - The accessor builder to check.
     * @returns `true` if the `builder` is an instance of `SlotAccessorBuilder`, `false` otherwise.
     */
    static isSlotAccessorBuilder(builder: AccessorBuilder): builder is SlotAccessorBuilder;
}
//# sourceMappingURL=accessor-builder.d.ts.map