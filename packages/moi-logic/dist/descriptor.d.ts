import { LogicManifest } from "moi-utils";
import LogicId from "./logic_id";
export default class LogicDescriptor {
    protected logicId: LogicId;
    protected manifest: LogicManifest.Manifest;
    protected manifestHash: string;
    protected engine: string;
    protected state: string;
    protected sealed: boolean;
    protected assetLogic: boolean;
    protected persistentStatePtr: number;
    protected ephemeralStatePtr: number;
    constructor(logicId: string, manifest: LogicManifest.Manifest);
    getLogicId: () => string;
    getEngine: () => string;
    getManifest: () => LogicManifest.Manifest;
    getManifestHash: () => string;
    isSealed: () => boolean;
    isAssetLogic: () => boolean;
    getState: () => string;
    getPersistentState: () => [number, boolean];
    getEphemeralState: () => [number, boolean];
    allowsInteractions: () => boolean;
    isStateful: () => boolean;
}
