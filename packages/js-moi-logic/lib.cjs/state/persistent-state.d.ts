import type { ManifestCoder } from "js-moi-manifest";
import type { AbstractProvider } from "js-moi-providers";
import type { LogicDescriptor } from "../logic-descriptor";
import { type AccessorBuilder } from "./accessor-builder";
/**
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
export declare class PersistentState {
    private logicId;
    private provider;
    private manifestCoder;
    private logicDescriptor;
    constructor(logicId: string, logicDescriptor: LogicDescriptor, manifestCoder: ManifestCoder, provider: AbstractProvider);
    get(accessor?: (builder: EntityBuilder) => AccessorBuilder): Promise<any>;
}
declare class EntityBuilder {
    private readonly logicDescriptor;
    constructor(logicDescriptor: LogicDescriptor);
    entity(label: string): AccessorBuilder;
}
export {};
//# sourceMappingURL=persistent-state.d.ts.map