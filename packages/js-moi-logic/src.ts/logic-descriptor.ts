import { ManifestCoder } from "js-moi-manifest";
import { Signer } from "js-moi-signer";
import { LogicId, LogicState, type EngineKind, type Hex, type LogicManifest } from "js-moi-utils";
import { LogicBase } from "./logic-base";

/**
 * Abstract class representing a logic descriptor, which provides information 
 about a logic.
 */
export abstract class LogicDescriptor extends LogicBase {
    protected logicId: LogicId;
    protected manifest: LogicManifest;

    constructor(logicId: Hex | LogicId, manifest: LogicManifest, signer: Signer) {
        super(manifest, signer);

        this.logicId = logicId instanceof LogicId ? logicId : new LogicId(logicId);
        this.manifest = manifest;
    }

    /**
     * Returns the logic id of the logic.
     *
     * @returns {string} The logic id.
     */
    public getLogicId(): LogicId {
        return this.logicId;
    }

    /**
     * Returns the logic execution engine type.
     *
     * @returns {EngineKind} The engine type.
     */
    public getEngine(): EngineKind {
        return this.manifest.engine.kind;
    }

    /**
     * Returns the logic manifest.
     *
     * @returns {LogicManifest.Manifest} The logic manifest.
     */
    public getManifest(): LogicManifest {
        return this.manifest;
    }

    /**
     * Returns the POLO encoded logic manifest.
     *
     * @returns {string} The POLO encoded logic manifest.
     */
    public getEncodedManifest(): string {
        return ManifestCoder.encodeManifest(this.manifest);
    }

    /**
     * Checks if the logic is sealed.
     *
     * @returns {boolean} True if the logic is sealed, false otherwise.
     */
    public isSealed(): boolean {
        return false;
    }

    /**
     * Checks if the logic represents an asset logic.
     *
     * @returns {boolean} True if the logic is an representation of asset logic, false otherwise.
     */
    public isAssetLogic(): boolean {
        return this.logicId.isAssetLogic();
    }

    /**
     * Checks if the logic allows interactions.
     *
     * @returns {boolean} True if the logic allows interactions, false otherwise.
     */
    public allowsInteractions(): boolean {
        return this.logicId.isIntractable();
    }

    /**
     * Checks if the logic is stateful.
     *
     * @returns {boolean} True if the logic is stateful, false otherwise.
     */
    public isStateful(): boolean {
        // TODO : Implement this method
        throw new Error("Method not implemented.");
    }

    /**
     * Checks if the logic has persistent state.
     * @returns A tuple containing the pointer to the persistent state and a flag indicating if it exists.
     * 
     @example
     * const [ptr, exists] = logic.hasPersistentState();
     */
    public hasPersistentState(): [number, boolean] {
        const ptr = this.stateMatrix.get(LogicState.Persistent);
        return ptr == null ? [0, false] : [ptr, true];
    }

    /**
     * Checks if the logic has ephemeral state.
     * @returns A tuple containing the pointer to the ephemeral state and a flag indicating if it exists.
     *
     * @example
     * const [ptr, exists] = logic.hasEphemeralState();
     */
    public hasEphemeralState(): [number, boolean] {
        const ptr = this.stateMatrix.get(LogicState.Ephemeral);
        return ptr == null ? [0, false] : [ptr, true];
    }
}
