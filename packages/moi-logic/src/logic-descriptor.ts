import { ABICoder } from "moi-abi";
import { LogicManifest } from "moi-utils";
import { ContextStateKind } from "./state";
import {LogicId} from "./logic-id";
import ElementDescriptor from "./element-descriptor";

export enum EngineKind {
    PISA = "PISA",
    MERU = "MERU"
}

export default class LogicDescriptor extends ElementDescriptor {
    protected logicId: LogicId;
    protected manifest: LogicManifest.Manifest;
    protected encodedManifest: string;
    protected engine: EngineKind;
    protected sealed: boolean;
    protected assetLogic: boolean;

    constructor(logicId: string, manifest: LogicManifest.Manifest) {
        super(manifest.elements);
        this.logicId = new LogicId(logicId);
        this.manifest = manifest;
        this.encodedManifest = ABICoder.encodeABI(this.manifest);
        this.engine = this.manifest.engine.kind as EngineKind;
        this.sealed = false;
        this.assetLogic = false;
    }

    public getLogicId(): string {
        return this.logicId.hex();
    }

    public getEngine(): EngineKind {
        return this.engine;
    }

    public getManifest(): LogicManifest.Manifest {
        return this.manifest;
    }

    public getEncodedManifest(): string {
        return this.encodedManifest;
    }

    public isSealed(): boolean {
        return this.sealed;
    }

    public isAssetLogic(): boolean {
        return this.assetLogic;
    }

    public hasPersistentState(): [number, boolean] {
        const ptr = this.stateMatrix.get(ContextStateKind.PersistentState);

        if(ptr !== undefined) {
            return [ptr, true];
        }

        return [0, false];
    }

    public hasEphemeralState(): [number, boolean] {
        const ptr = this.stateMatrix.get(ContextStateKind.EphemeralState);
        
        if(ptr !== undefined) {
            return [ptr, true];
        }

        return [0, false];
    }

    public allowsInteractions(): boolean {
        return this.logicId.isInteractive();
    }

    public isStateful(): boolean {
        return this.logicId.isStateful();
    }
}
