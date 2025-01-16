import type { Signer } from "js-moi-signer";
import { LogicId, type Address, type LogicManifest } from "js-moi-utils";
import { LogicBase } from "./logic-base";
import type { LogicCallsites, LogicDriverOption } from "./types";
export declare class LogicDriver<TCallsites extends LogicCallsites = LogicCallsites> extends LogicBase<TCallsites> {
    constructor(option: LogicDriverOption);
}
/**
 * Retrieves a LogicDriver instance for the given logic ID.
 *
 * @param logicId - The ID of the logic to retrieve.
 * @param signer - The signer object used to interact with the logic.
 * @returns A promise that resolves to a LogicDriver instance.
 *
 * @throws Will throw an error if the provider fails to retrieve the logic.
 */
export declare const getLogicDriver: <TCallsites extends LogicCallsites = LogicCallsites>(logicId: Address | LogicId | LogicManifest, signer: Signer) => Promise<LogicDriver<TCallsites>>;
//# sourceMappingURL=logic-driver.d.ts.map