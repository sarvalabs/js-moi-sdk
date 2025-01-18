import { ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
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
export const getLogicDriver = async <TCallsites extends LogicCallsites = LogicCallsites>(
    logicId: Address | LogicId | LogicManifest,
    signer: Signer
): Promise<LogicDriver<TCallsites>> => {
    if (typeof logicId === "string" || logicId instanceof LogicId) {
        const provider = signer.getProvider();
        const id = typeof logicId === "string" ? new LogicId(logicId) : logicId;
        const { manifest: encoded } = await provider.getLogic(id, {
            modifier: { include: ["manifest"] },
        });
        const manifest = ManifestCoder.decodeManifest(encoded, ManifestCoderFormat.JSON);

        return new LogicDriver({ manifest, logicId: id, signer });
    }

    return new LogicDriver<TCallsites>({ manifest: logicId, signer });
};
