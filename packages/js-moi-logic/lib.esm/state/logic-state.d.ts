import type { AbstractProvider } from "js-moi-providers";
import type { LogicDriver } from "../logic-driver";
import { type AccessorBuilder } from "./accessor-builder";
import { EntityBuilder } from "./entity-builder";
/**
 * Represents a function that builds an accessor.
 * @param builder - The entity builder.
 * @returns The accessor builder.
 */
type AccessorBuilderFunction = (builder: EntityBuilder) => AccessorBuilder | void;
/**
 * Represents logic state functionality for a logic element (`state logic:`
 * in the manifest - shared/global state scoped to the logic itself, not the
 * caller). Manages slots, types, and retrieval of logic state values.
 */
export declare class LogicState {
    private logicId;
    private provider;
    private driver;
    constructor(logic: LogicDriver, provider: AbstractProvider);
    /**
     * Returns an accessor builder for the specified slot.
     *
     * @param slot - The slot number.
     * @param createAccessorBuilder - The function to create the accessor builder.
     * @returns The accessor builder for the specified slot.
     */
    private getBuilder;
    /**
     * Retrieves the value from the logic state.
     *
     * @param createAccessorBuilder - The function that creates the accessor builder.
     * @returns A promise that resolves to the retrieved value.
     * @throws An error if the logic state is not present or if the accessor builder is invalid.
     */
    get<T = any>(createAccessorBuilder: AccessorBuilderFunction): Promise<T>;
}
export {};
//# sourceMappingURL=logic-state.d.ts.map