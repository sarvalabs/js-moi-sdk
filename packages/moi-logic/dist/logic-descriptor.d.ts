import { LogicManifest } from "moi-utils";
import { LogicId } from "./logic-id";
import ElementDescriptor from "./element-descriptor";
export declare enum EngineKind {
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
    constructor(logicId: string, manifest: LogicManifest.Manifest);
    getLogicId(): string;
    getEngine(): EngineKind;
    getManifest(): LogicManifest.Manifest;
    getEncodedManifest(): string;
    isSealed(): boolean;
    isAssetLogic(): boolean;
    hasPersistentState(): [number, boolean];
    hasEphemeralState(): [number, boolean];
    allowsInteractions(): boolean;
    isStateful(): boolean;
}
