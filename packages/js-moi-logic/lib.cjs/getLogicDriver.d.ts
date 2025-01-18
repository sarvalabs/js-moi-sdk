import type { Signer } from "js-moi-signer";
import { Address, LogicId, LogicManifest } from "js-moi-utils";
import { LogicDriver } from ".";
import type { LogicCallsites } from "./types";
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
//# sourceMappingURL=getLogicDriver.d.ts.map