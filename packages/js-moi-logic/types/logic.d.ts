import { LogicManifest } from "@zenz-solutions/js-moi-manifest";
import { InteractionCallResponse, InteractionResponse } from "@zenz-solutions/js-moi-providers";
import type { RoutineOption } from "../src.ts/routine-options";

export interface LogicIxRequest {
    call: () => Promise<InteractionCallResponse>;
    send: () => Promise<InteractionResponse>;
    estimateFuel: () => Promise<number | bigint>;
    unwrap: () => Promise<any>;
}

export interface Routine<T extends (...args: any[]) => any> {
    /**
     * Executes the logic interaction request with the specified routine and arguments.
     * @param {...any[]} args - The arguments for the logic interaction request.
     * @param {RoutineOption} option - The option for the logic interaction request.
     * @returns {Promise<any>} a promise that resolves to the result of the logic interaction request.
     */
    (...args: [...Parameters<T>, option?: RoutineOption]): ReturnType<T> | Promise<InteractionResponse>;
    isMutable: () => boolean;
    accepts: () => LogicManifest.TypeField[] | null;
    returns: () => LogicManifest.TypeField[] | null;
}

export type Routines<T extends Record<string, (...args: any[]) => any>> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? Routine<T[K]> : never;
}