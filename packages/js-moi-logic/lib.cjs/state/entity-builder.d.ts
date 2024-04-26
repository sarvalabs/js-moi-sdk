import type ElementDescriptor from "../element-descriptor";
import { type AccessorBuilder } from "./accessor-builder";
export declare class EntityBuilder {
    private readonly slot;
    private readonly elementDescriptor;
    private slotAccessorBuilder?;
    constructor(slot: number, elementDescriptor: ElementDescriptor);
    entity(label: string): AccessorBuilder;
    getSlotAccessorBuilder(): AccessorBuilder;
}
//# sourceMappingURL=entity-builder.d.ts.map