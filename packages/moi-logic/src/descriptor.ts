import { ABICoder } from "moi-abi";
import { LogicManifest } from "moi-utils";
import { ContextStateKind, ContextStateMatrix } from "./state";
import { CallSite } from "../types/logic";
import LogicId from "./logic_id";

export enum EngineKind {
    PISA = "PISA",
    MERU = "MERU"
}

export default class LogicDescriptor {
    protected logicId: LogicId;
    protected manifest: LogicManifest.Manifest;
    protected encodedManifest: string;
    protected engine: EngineKind;
    protected stateMatrix: ContextStateMatrix;
    protected sealed: boolean;
    protected assetLogic: boolean;
    protected elements: Map<number, LogicManifest.Element>
    protected callSites: Map<string, CallSite>;
    protected classDefs: Map<string, number>;

    constructor(logicId: string, manifest: LogicManifest.Manifest) {
        this.logicId = new LogicId(logicId);
        this.manifest = manifest;
        this.encodedManifest = ABICoder.encodeABI(this.manifest);
        this.engine = this.manifest.engine.kind as EngineKind;
        this.sealed = false;
        this.assetLogic = false;
        this.stateMatrix = new ContextStateMatrix(manifest.elements)
        this.initManifestMaps();
    }

    private initManifestMaps(): void {
        this.elements = new Map();
        this.callSites = new Map();
        this.classDefs = new Map();

        this.manifest.elements.forEach(element => {
            this.elements.set(element.ptr, element);
            
            switch(element.kind){
                case "class":
                    element.data = element.data as LogicManifest.Class;
                    this.classDefs.set(element.data.name, element.ptr);
                    break;
                case "routine":
                    element.data = element.data as LogicManifest.Routine;
                    const callsite = { ptr: element.ptr, kind: element.data.kind };
                    this.callSites.set(element.data.name, callsite);
                    break;
                default:
                    break;
            }
        })
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

    public getStateMatrix(): ContextStateMatrix {
        return this.stateMatrix;
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

    public getElements(): Map<number, LogicManifest.Element> {
        return this.elements;
    }

    public getCallsites(): Map<string, CallSite> {
        return this.callSites;
    } 

    public getClassDefs(): Map<string, number> {
        return this.classDefs;
    }
}
