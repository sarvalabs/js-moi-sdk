import { ABICoder } from "moi-abi";
import { LogicManifest } from "moi-utils";
import {LogicId} from "./logic-id";
import { LogicBase } from "./logic-base";
import { JsonRpcProvider } from "moi-providers";
import { ContextStateKind } from "./state";

export enum EngineKind {
    PISA = "PISA",
    MERU = "MERU"
}

/**
 * LogicDescriptor
 * 
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

    constructor(logicId: string, manifest: LogicManifest.Manifest, provider: JsonRpcProvider) {
        super(manifest, provider)
        this.logicId = new LogicId(logicId);
        this.manifest = manifest;
        this.encodedManifest = ABICoder.encodeABI(this.manifest);
        this.engine = this.manifest.engine.kind as EngineKind;
        this.sealed = false;
        this.assetLogic = false;
    }

    /**
     * getLogicId
     * 
     * Returns the logic id of the logic.
     * 
     * @returns {string} The logic id.
     */
    public getLogicId(): string {
        return this.logicId.hex();
    }

    /**
     * getEngine
     * 
     * Returns the logic execution engine type.
     * 
     * @returns {EngineKind} The engine type.
     */
    public getEngine(): EngineKind {
        return this.engine;
    }

    /**
     * getManifest
     * 
     * Returns the logic manifest.
     * 
     * @returns {LogicManifest.Manifest} The logic manifest.
     */
    public getManifest(): LogicManifest.Manifest {
        return this.manifest;
    }

    /**
     * getEncodedManifest
     * 
     * Returns the POLO encoded logic manifest.
     * 
     * @returns {string} The POLO encoded logic manifest.
     */
    public getEncodedManifest(): string {
        return this.encodedManifest;
    }

    /**
     * isSealed
     * 
     * Checks if the logic is sealed.
     * 
     * @returns {boolean} True if the logic is sealed, false otherwise.
     */
    public isSealed(): boolean {
        return this.sealed;
    }

    /**
     * isAssetLogic
     * 
     * Checks if the logic represents an asset logic.
     * 
     * @returns {boolean} True if the logic is an representation of asset logic, false otherwise.
     */
    public isAssetLogic(): boolean {
        return this.assetLogic;
    }

    /**
     * allowsInteractions
     * 
     * Checks if the logic allows interactions.
     * 
     * @returns {boolean} True if the logic allows interactions, false otherwise.
     */
    public allowsInteractions(): boolean {
        return this.logicId.isInteractive();
    }

    /**
     * isStateful
     * 
     * Checks if the logic is stateful.
     * 
     * @returns {boolean} True if the logic is stateful, false otherwise.
     */
    public isStateful(): boolean {
        return this.logicId.isStateful();
    }

    /**
     * hasPersistentState
     * 
     * Checks if the logic has persistent state.
     * 
     * @returns {[number, boolean]} A tuple containing the pointer to the 
     persistent state and a flag indicating if it exists.
     */
    public hasPersistentState(): [number, boolean] {
        const ptr = this.stateMatrix.get(ContextStateKind.PersistentState);

        if(ptr !== undefined) {
            return [ptr, true];
        }

        return [0, false];
    }

    /**
     * hasEphemeralState
     * 
     * Checks if the logic has ephemeral state.
     * 
     * @returns {[number, boolean]} A tuple containing the pointer to the 
     ephemeral state and a flag indicating if it exists.
     */
    public hasEphemeralState(): [number, boolean] {
        const ptr = this.stateMatrix.get(ContextStateKind.EphemeralState);
        
        if(ptr !== undefined) {
            return [ptr, true];
        }

        return [0, false];
    }
}
