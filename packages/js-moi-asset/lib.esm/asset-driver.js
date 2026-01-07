import { LogicDriver } from "js-moi-logic";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
export class AssetDriver extends LogicDriver {
    constructor(assetId, manifest, arg) {
        super(assetId, manifest, arg);
    }
}
/**
 * Returns a asset driver instance based on the given asset id.
 *
 * @param {string} assetId - The asset id of the asset.
 * @param {Signer} signer - The signer instance for the logic driver.
 * @param {Options} options - The custom tesseract options for retrieving
 *
 * @returns {Promise<AssetDriver>} A promise that resolves to a LogicDriver instance.
 */
export const getAssetDriver = async (assetId, signer, options) => {
    const manifest = await signer.getProvider().getLogicManifest(assetId, "JSON", options);
    if (typeof manifest !== "object") {
        ErrorUtils.throwError("Invalid logic manifest", ErrorCode.INVALID_ARGUMENT);
    }
    return new AssetDriver(assetId, manifest, signer);
};
//# sourceMappingURL=asset-driver.js.map