import { LogicManifest } from "js-moi-manifest";
import { LogicActionPayload, Options } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { AssetIxObject, AssetIxResponse, AssetIxResult } from "../types/interaction";
import { Routines } from "../types/asset";
import { AssetDescriptor } from "./asset-descriptor";
import { EphemeralState, PersistentState } from "./state";
/**
 * Represents a asset driver that serves as an interface for interacting with logics.
 */
export declare class AssetDriver<T extends Record<string, (...args: any) => any> = any> extends AssetDescriptor {
    readonly routines: Routines<T>;
    readonly persistentState?: PersistentState;
    readonly ephemeralState?: EphemeralState;
    constructor(assetId: string, manifest: LogicManifest.Manifest, arg: Signer);
    /**
     * Creates the persistent and ephemeral states for the asset driver,
     if available in logic manifest.
     */
    private createState;
    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    private createRoutines;
    /**
     * Checks if a routine is mutable based on its name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    private isMutableRoutine;
    /**
     * Creates the logic payload from the given interaction object.
     *
     * @param {AssetIxObject} ixObject - The interaction object.
     * @returns {LogicActionPayload} The logic action payload.
     */
    protected createPayload(ixObject: AssetIxObject): LogicActionPayload;
    /**
     * Processes the logic interaction result and returns the decoded data or
     error, if available.
     *
     * @param {AssetIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<AssetIxResult | null>} A promise that resolves to the
     logic interaction result or null.
     */
    protected processResult(response: AssetIxResponse, timeout?: number): Promise<AssetIxResult>;
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