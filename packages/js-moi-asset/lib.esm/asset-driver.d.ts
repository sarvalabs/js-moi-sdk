import { LogicDriver } from "js-moi-logic";
import { LogicManifest } from "js-moi-manifest";
import { Options } from "js-moi-providers";
import { Signer } from "js-moi-signer";
export declare class AssetDriver<T extends Record<string, (...args: any) => any> = any> extends LogicDriver {
    constructor(assetId: string, manifest: LogicManifest.Manifest, arg: Signer);
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
export declare const getAssetDriver: <T extends Record<string, (...args: any) => any>>(assetId: string, signer: Signer, options?: Options) => Promise<AssetDriver<T>>;
//# sourceMappingURL=asset-driver.d.ts.map