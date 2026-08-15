import { LogicManifest } from "js-moi-manifest";
import { Signer } from "js-moi-signer";
import { AssetBase } from "./asset-base";
import { AssetId } from "./asset-id";
export declare enum EngineKind {
    PISA = "PISA",
    MERU = "MERU"
}
/**
 * Abstract class representing a asset descriptor, which provides information
 about a logic.
 */
export declare abstract class AssetDescriptor extends AssetBase {
    protected assetId: AssetId;
    protected manifest: LogicManifest.Manifest;
    protected encodedManifest: string;
    protected engine: EngineKind;
    protected sealed: boolean;
    protected assetLogic: boolean;
    constructor(assetId: string, manifest: LogicManifest.Manifest, signer: Signer);
    /**
     * Returns the logic id of the logic.
     *
     * @returns {string} The logic id.
     */
    getAssetId(): AssetId;
    /**
     * Returns the logic execution engine type.
     *
     * @returns {EngineKind} The engine type.
     */
    getEngine(): EngineKind;
    /**
     * Returns the logic manifest.
     *
     * @returns {LogicManifest.Manifest} The logic manifest.
     */
    getManifest(): LogicManifest.Manifest;
    /**
     * Returns the POLO encoded logic manifest.
     *
     * @returns {string} The POLO encoded logic manifest.
     */
    getEncodedManifest(): string;
    /**
     * Checks if the logic is sealed.
     *
     * @returns {boolean} True if the logic is sealed, false otherwise.
     */
    isSealed(): boolean;
    /**
     * Checks if the logic represents an asset logic.
     *
     * @returns {boolean} True if the logic is an representation of asset logic, false otherwise.
     */
    isAssetLogic(): boolean;
    /**
     * Checks if the logic allows interactions.
     *
     * @returns {boolean} True if the logic allows interactions, false otherwise.
     */
    allowsInteractions(): boolean;
    /**
     * Checks if the logic is stateful.
     *
     * @returns {boolean} True if the logic is stateful, false otherwise.
     */
    isStateful(): boolean;
    /**
     * Checks if the logic has logic state (`state logic:` in the manifest).
     * @returns A tuple containing the pointer to the logic state and a flag indicating if it exists.
     *
     @example
     * const [ptr, exists] = logic.hasLogicState();
     */
    hasLogicState(): [number, boolean];
    /**
     * Checks if the logic has actor state (`state actor:` in the manifest).
     * @returns A tuple containing the pointer to the actor state and a flag indicating if it exists.
     *
     * @example
     * const [ptr, exists] = logic.hasActorState();
     */
    hasActorState(): [number, boolean];
}
//# sourceMappingURL=asset-descriptor.d.ts.map