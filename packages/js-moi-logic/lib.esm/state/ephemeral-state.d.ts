import type { AbstractProvider } from "@zenz-solutions/js-moi-providers";
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
 * Represents ephemeral state functionality for a logic element.
 * Does not support retrieval of ephemeral state elements.
 */
export declare class EphemeralState {
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
     * Retrieves the value from the ephemeral state.
     *
     * @param createAccessorBuilder - The function that creates the accessor builder.
     * @returns A promise that resolves to the retrieved value.
     * @throws An error if the ephemeral state is not present or if the accessor builder is invalid.
     */
    get<T = any>(address: string, createAccessorBuilder: AccessorBuilderFunction): Promise<T>;
}
export {};
//# sourceMappingURL=ephemeral-state.d.ts.map