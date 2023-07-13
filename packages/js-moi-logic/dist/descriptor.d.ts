import { LogicManifest } from "js-moi-utils";
import { ContextStateMatrix } from "./state";
import { CallSite } from "../types/logic";
import { LogicId } from "./logic_id";
export declare enum EngineKind {
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
    protected elements: Map<number, LogicManifest.Element>;
    protected callSites: Map<string, CallSite>;
    protected classDefs: Map<string, number>;
    constructor(logicId: string, manifest: LogicManifest.Manifest);
    private initManifestMaps;
    getLogicId(): string;
    getEngine(): EngineKind;
    getManifest(): LogicManifest.Manifest;
    getEncodedManifest(): string;
    isSealed(): boolean;
    isAssetLogic(): boolean;
    getStateMatrix(): ContextStateMatrix;
    hasPersistentState(): [number, boolean];
    hasEphemeralState(): [number, boolean];
    allowsInteractions(): boolean;
    isStateful(): boolean;
    getElements(): Map<number, LogicManifest.Element>;
    getCallsites(): Map<string, CallSite>;
    getClassDefs(): Map<string, number>;
}
