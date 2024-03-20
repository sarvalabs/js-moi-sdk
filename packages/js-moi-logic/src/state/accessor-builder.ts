import { BN } from "bn.js";
import type { LogicManifest } from "js-moi-manifest";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
import type { LogicDescriptor } from "../logic-descriptor";
import { ArrayIndexAccessor, ClassFieldAccessor, LengthAccessor, PropertyAccessor, type Accessor, type SlotHash } from "./accessor";
import { ContextStateKind } from "./context-state-matrix";

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

export class SlotAccessorBuilder implements AccessorBuilder {
    private accessors: Accessor[] = [];

    public readonly baseSlot: SlotHash;

    public readonly logicDescriptor: LogicDescriptor;

    constructor(base: SlotHash | number, logicDescriptor: LogicDescriptor) {
        this.logicDescriptor = logicDescriptor;

        if (typeof base === "number") {
            this.baseSlot = new BN(base);
            return;
        }

        this.baseSlot = base;
    }

    get slotAsNumber(): number {
        return this.baseSlot.toNumber();
    }

    
    length(): SlotAccessorBuilder {
        this.accessors.push(new LengthAccessor());
        return this;
    }

   
    property(label: string): SlotAccessorBuilder {
        this.accessors.push(new PropertyAccessor(label));
        return this;
    }

    generate(): SlotHash {
        return this.accessors.reduce((slotHash, accessor) => accessor.access(slotHash), this.baseSlot)
    }

    
    at(index: number): SlotAccessorBuilder {
        this.accessors.push(new ArrayIndexAccessor(index));
        return this;
    }

    field(label: string): SlotAccessorBuilder {
        const value = this.logicDescriptor.getStateMatrix().get(ContextStateKind.PersistentState);
        const element = this.logicDescriptor.getElements().get(value);

        if (element == null) {
            ErrorUtils.throwError("Element not found");
        }

        element.data = element.data as LogicManifest.State;
        let field = element.data.fields[this.slotAsNumber];
        const classDef = this.logicDescriptor.getClassElement(field.type);

        classDef.data = classDef.data as LogicManifest.State;
        field = classDef.data.fields.find((field) => field.label === label);

        if (field == null) {
            ErrorUtils.throwError(`Class field '${label}' not found`, ErrorCode.PROPERTY_NOT_DEFINED, {
                field: label
            });
        }

        this.accessors.push(new ClassFieldAccessor(field.slot));
        return this;
    }

    static isSlotAccessorBuilder(builder: AccessorBuilder): builder is SlotAccessorBuilder {
        return builder instanceof SlotAccessorBuilder;
    }
}