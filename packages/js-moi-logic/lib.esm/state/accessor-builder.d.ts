import type { LogicDescriptor } from "../logic-descriptor";
import { type SlotHash } from "./accessor";
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
     * @param label - The label of the property.
     * @returns The accessor builder instance.
     */
    property(label: string): AccessorBuilder;
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
     * @param label - The label of the field.
     * @returns The accessor builder instance.
     */
    field(label: string): AccessorBuilder;
}
export declare class SlotAccessorBuilder implements AccessorBuilder {
    private accessors;
    readonly baseSlot: SlotHash;
    readonly logicDescriptor: LogicDescriptor;
    constructor(base: SlotHash | number, logicDescriptor: LogicDescriptor);
    get slotAsNumber(): number;
    length(): SlotAccessorBuilder;
    property(label: string): SlotAccessorBuilder;
    generate(): SlotHash;
    at(index: number): SlotAccessorBuilder;
    field(label: string): SlotAccessorBuilder;
    static isSlotAccessorBuilder(builder: AccessorBuilder): builder is SlotAccessorBuilder;
}
//# sourceMappingURL=accessor-builder.d.ts.map