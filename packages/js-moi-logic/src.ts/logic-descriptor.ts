import { ContextStateKind, LogicManifest, ManifestCoder } from "@zenz-solutions/js-moi-manifest";
import { Signer } from "@zenz-solutions/js-moi-signer";
import { LogicBase } from "./logic-base";
import { LogicId } from "./logic-id";

export enum EngineKind {
    PISA = "PISA",
    MERU = "MERU"
}

/**
 * Abstract class representing a logic descriptor, which provides information 
 about a logic.
 */
export abstract class LogicDescriptor extends LogicBase {
    protected logicId: LogicId;
    protected manifest: LogicManifest.Manifest;
    protected encodedManifest: string;
    protected engine: EngineKind;
    protected sealed: boolean;
    protected assetLogic: boolean;

    constructor(logicId: string, manifest: LogicManifest.Manifest, signer: Signer) {
        super(manifest, signer)
        this.logicId = new LogicId(logicId);
        this.manifest = manifest;
        this.encodedManifest = ManifestCoder.encodeManifest(this.manifest);
        this.engine = this.manifest.engine.kind as EngineKind;
        this.sealed = false;
        this.assetLogic = false;
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
        return this.engine;
    }

    /**
     * Returns the logic manifest.
     * 
     * @returns {LogicManifest.Manifest} The logic manifest.
     */
    public getManifest(): LogicManifest.Manifest {
        return this.manifest;
    }

    /**
     * Returns the POLO encoded logic manifest.
     * 
     * @returns {string} The POLO encoded logic manifest.
     */
    public getEncodedManifest(): string {
        return this.encodedManifest;
    }

    /**
     * Checks if the logic is sealed.
     * 
     * @returns {boolean} True if the logic is sealed, false otherwise.
     */
    public isSealed(): boolean {
        return this.sealed;
    }

    /**
     * Checks if the logic represents an asset logic.
     * 
     * @returns {boolean} True if the logic is an representation of asset logic, false otherwise.
     */
    public isAssetLogic(): boolean {
        return this.assetLogic;
    }

    /**
     * Checks if the logic allows interactions.
     * 
     * @returns {boolean} True if the logic allows interactions, false otherwise.
     */
    public allowsInteractions(): boolean {
        return this.logicId.isInteractive();
    }

    /**
     * Checks if the logic is stateful.
     * 
     * @returns {boolean} True if the logic is stateful, false otherwise.
     */
    public isStateful(): boolean {
        return this.logicId.isStateful();
    }

    /**
     * Checks if the logic has persistent state.
     * @returns A tuple containing the pointer to the persistent state and a flag indicating if it exists.
     * 
     @example
     * const [ptr, exists] = logic.hasPersistentState();
     */
    public hasPersistentState(): [number, boolean] {
        const ptr = this.stateMatrix.get(ContextStateKind.PersistentState);

        if(ptr !== undefined) {
            return [ptr, true];
        }

        return [0, false];
    }

    /**
     * Checks if the logic has ephemeral state.
     * @returns A tuple containing the pointer to the ephemeral state and a flag indicating if it exists.
     * 
     * @example
     * const [ptr, exists] = logic.hasEphemeralState();
     */
    public hasEphemeralState(): [number, boolean] {
        const ptr = this.stateMatrix.get(ContextStateKind.EphemeralState);
        
        if(ptr !== undefined) {
            return [ptr, true];
        }

        return [0, false];
    }
}
