"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogicDriver = exports.LogicDriver = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const logic_base_1 = require("./logic-base");
class LogicDriver extends logic_base_1.LogicBase {
    constructor(option) {
        const id = typeof option.logicId === "string" ? new js_moi_utils_1.LogicId(option.logicId) : option.logicId;
        super({ ...option, logicId: id });
    }
}
exports.LogicDriver = LogicDriver;
/**
 * Retrieves a LogicDriver instance for the given logic ID.
 *
 * @param logicId - The ID of the logic to retrieve.
 * @param signer - The signer object used to interact with the logic.
 * @returns A promise that resolves to a LogicDriver instance.
 *
 * @throws Will throw an error if the provider fails to retrieve the logic.
 */
const getLogicDriver = async (logicId, signer) => {
    if (typeof logicId === "string" || logicId instanceof js_moi_utils_1.LogicId) {
        const provider = signer.getProvider();
        const id = typeof logicId === "string" ? new js_moi_utils_1.LogicId(logicId) : logicId;
        const { manifest: encoded } = await provider.getLogic(id, {
            modifier: { include: ["manifest"] },
        });
        const manifest = js_moi_manifest_1.ManifestCoder.decodeManifest(encoded, js_moi_manifest_1.ManifestCoderFormat.JSON);
        return new LogicDriver({ manifest, logicId: id, signer });
    }
    return new LogicDriver({ manifest: logicId, signer });
};
exports.getLogicDriver = getLogicDriver;
//# sourceMappingURL=logic-driver.js.map