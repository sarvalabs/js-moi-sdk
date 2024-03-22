import type { AbstractProvider } from "js-moi-providers";
import type { LogicDriver } from "../logic-driver";
import { type AccessorBuilder } from "./accessor-builder";
import { EntityBuilder } from "./entity-builder";
/**
 * Represents a function that builds an accessor.
 * @param builder - The entity builder.
 * @returns The accessor builder.
 */
type AccessorBuilderFunction = (builder: EntityBuilder) => AccessorBuilder;
/**
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
export declare class PersistentState {
    private logicId;
    private provider;
    private driver;
    constructor(logic: LogicDriver, provider: AbstractProvider);
    get<T = any>(createAccessorBuilder: AccessorBuilderFunction): Promise<T>;
}
export {};
//# sourceMappingURL=persistent-state.d.ts.map