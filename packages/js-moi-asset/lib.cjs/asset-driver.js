"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetDriver = exports.AssetDriver = void 0;
const js_moi_logic_1 = require("js-moi-logic");
const js_moi_utils_1 = require("js-moi-utils");
class AssetDriver extends js_moi_logic_1.LogicDriver {
    constructor(assetId, manifest, arg) {
        super(assetId, manifest, arg);
    }
}
exports.AssetDriver = AssetDriver;
/**
 * Returns a asset driver instance based on the given asset id.
 *
 * @param {string} assetId - The asset id of the asset.
 * @param {Signer} signer - The signer instance for the logic driver.
 * @param {Options} options - The custom tesseract options for retrieving
 *
 * @returns {Promise<AssetDriver>} A promise that resolves to a LogicDriver instance.
 */
const getAssetDriver = async (assetId, signer, options) => {
    const manifest = await signer.getProvider().getLogicManifest(assetId, "JSON", options);
    if (typeof manifest !== "object") {
        js_moi_utils_1.ErrorUtils.throwError("Invalid logic manifest", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    return new AssetDriver(assetId, manifest, signer);
};
exports.getAssetDriver = getAssetDriver;
//# sourceMappingURL=asset-driver.js.map