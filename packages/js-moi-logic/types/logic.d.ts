import { LogicManifest } from "js-moi-manifest";
import type { LogicContext, LogicOps } from "../src.ts/logic-context";

export interface Routine<T extends (...args: any[]) => any> {
    /**
     * Prepares the logic interaction with the specified arguments.
     * Returns a LogicContext that can be executed with .send(), .call(), or .estimateFuel().
     * @param {...any[]} args - The arguments for the routine.
     * @returns {LogicContext} The logic interaction context.
     */
    (...args: Parameters<T>): LogicContext<LogicOps>;
    isMutable: () => boolean;
    accepts: () => LogicManifest.TypeField[] | null;
    returns: () => LogicManifest.TypeField[] | null;
}

export type Routines<T extends Record<string, (...args: any[]) => any>> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? Routine<T[K]> : never;
}
