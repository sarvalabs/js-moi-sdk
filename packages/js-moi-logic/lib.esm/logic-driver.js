import { ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { LogicId } from "js-moi-utils";
import { LogicBase } from "./logic-base";
export class LogicDriver extends LogicBase {
    constructor(option) {
        const id = typeof option.logicId === "string" ? new LogicId(option.logicId) : option.logicId;
        super({ ...option, logicId: id });
    }
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
export const getLogicDriver = async (logicId, signer) => {
    if (typeof logicId === "string" || logicId instanceof LogicId) {
        const provider = signer.getProvider();
        const id = typeof logicId === "string" ? new LogicId(logicId) : logicId;
        const { manifest: encoded } = await provider.getLogic(id, {
            modifier: { include: ["manifest"] },
        });
        const manifest = ManifestCoder.decodeManifest(encoded, ManifestCoderFormat.JSON);
        return new LogicDriver({ manifest, logicId: id, signer });
    }
    return new LogicDriver({ manifest: logicId, signer });
};
//# sourceMappingURL=logic-driver.js.map