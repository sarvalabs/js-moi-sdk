import { ABICoder } from "moi-abi";
import { LogicManifest } from "moi-utils";
import { CallSite } from "../types/logic";
import LogicId from "./logic_id";
import { ContextStateKind, ContextStateMatrix } from "./state";

export enum EngineKind {
    PISA = "PISA",
    MERU = "MERU"
}

export default class LogicDescriptor {
    protected logicId: LogicId;
    protected manifest: LogicManifest.Manifest;
    protected manifestHash: string;
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
        this.manifestHash = ABICoder.encodeABI(this.manifest);
        this.sealed = false;
        this.assetLogic = false;

        const engine: LogicManifest.EngineConfig = this.manifest.engine;
        this.engine = engine.kind as EngineKind;

        const stateElements: any = this.manifest.elements.filter(element => 
            element.kind === "state"
        )

        this.stateMatrix = new ContextStateMatrix(stateElements)

        manifest.elements.forEach(element => {
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

    public getLogicId = (): string => {
        return this.logicId.hex()
    }

    public getEngine = (): EngineKind => {
        return this.engine;
    }

    public getManifest = (): LogicManifest.Manifest => {
        return this.manifest;
    }

    public getManifestHash = (): string => {
        return this.manifestHash;
    }

    public isSealed = (): boolean => {
        return this.sealed;
    }

    public isAssetLogic = (): boolean => {
        return this.assetLogic;
    }

    public getStateMatrix = (): ContextStateMatrix => {
        return this.stateMatrix;
    }

    public getPersistentState = (): [number, boolean] => {
        const ptr = this.stateMatrix.get(ContextStateKind.PersistentState);

        if(ptr !== undefined) {
            return [ptr, true];
        }

        return [0, false];
    }

    public getEphemeralState = (): [number, boolean] => {
        const ptr = this.stateMatrix.get(ContextStateKind.EphemeralState);
        
        if(ptr !== undefined) {
            return [ptr, true];
        }

        return [0, false];
    }

    public allowsInteractions = (): boolean => {
        return this.logicId.isInteractive();
    }

    public isStateful = (): boolean => {
        return this.logicId.isStateful();
    }

    public getElements = (): Map<number, LogicManifest.Element> => {
        return this.elements
    }

    public getCallsites = (): Map<string, CallSite> => {
        return this.callSites
    } 

    public getClassDefs = (): Map<string, number> => {
        return this.classDefs
    }
}
