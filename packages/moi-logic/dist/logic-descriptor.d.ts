import { LogicManifest } from "moi-utils";
import { LogicId } from "./logic-id";
import { LogicBase } from "./logic-base";
import { JsonRpcProvider } from "moi-providers";
export declare enum EngineKind {
    PISA = "PISA",
    MERU = "MERU"
}
/**
 * LogicDescriptor
 *
 * Abstract class representing a logic descriptor, which provides information
 about a logic.
 */
export declare abstract class LogicDescriptor extends LogicBase {
    protected logicId: LogicId;
    protected manifest: LogicManifest.Manifest;
    protected encodedManifest: string;
    protected engine: EngineKind;
    protected sealed: boolean;
    protected assetLogic: boolean;
    constructor(logicId: string, manifest: LogicManifest.Manifest, provider: JsonRpcProvider);
    /**
     * getLogicId
     *
     * Returns the logic id of the logic.
     *
     * @returns {string} The logic id.
     */
    getLogicId(): string;
    /**
     * getEngine
     *
     * Returns the logic execution engine type.
     *
     * @returns {EngineKind} The engine type.
     */
    getEngine(): EngineKind;
    /**
     * getManifest
     *
     * Returns the logic manifest.
     *
     * @returns {LogicManifest.Manifest} The logic manifest.
     */
    getManifest(): LogicManifest.Manifest;
    /**
     * getEncodedManifest
     *
     * Returns the POLO encoded logic manifest.
     *
     * @returns {string} The POLO encoded logic manifest.
     */
    getEncodedManifest(): string;
    /**
     * isSealed
     *
     * Checks if the logic is sealed.
     *
     * @returns {boolean} True if the logic is sealed, false otherwise.
     */
    isSealed(): boolean;
    /**
     * isAssetLogic
     *
     * Checks if the logic represents an asset logic.
     *
     * @returns {boolean} True if the logic is an representation of asset logic, false otherwise.
     */
    isAssetLogic(): boolean;
    /**
     * allowsInteractions
     *
     * Checks if the logic allows interactions.
     *
     * @returns {boolean} True if the logic allows interactions, false otherwise.
     */
    allowsInteractions(): boolean;
    /**
     * isStateful
     *
     * Checks if the logic is stateful.
     *
     * @returns {boolean} True if the logic is stateful, false otherwise.
     */
    isStateful(): boolean;
    /**
     * hasPersistentState
     *
     * Checks if the logic has persistent state.
     *
     * @returns {[number, boolean]} A tuple containing the pointer to the
     persistent state and a flag indicating if it exists.
     */
    hasPersistentState(): [number, boolean];
    /**
     * hasEphemeralState
     *
     * Checks if the logic has ephemeral state.
     *
     * @returns {[number, boolean]} A tuple containing the pointer to the
     ephemeral state and a flag indicating if it exists.
     */
    hasEphemeralState(): [number, boolean];
}
