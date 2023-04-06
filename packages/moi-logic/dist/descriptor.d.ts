import { LogicManifest } from "moi-abi";
import LogicId from "./logic_id";
export default class LogicDescriptor {
    protected logicId: LogicId;
    protected manifest: LogicManifest.Manifest;
    protected manifestHash: string;
    protected engine: string;
    protected state: string;
    protected persistentStatePtr: number;
    protected ephemeralStatePtr: number;
    constructor(logicId: string, manifest: LogicManifest.Manifest);
    getLogicId: () => string;
    getEngine: () => string;
    getManifest: () => LogicManifest.Manifest;
    getManifestHash: () => string;
    getState: () => string;
    getPersistentState: () => [number, boolean];
    getEphemeralState: () => [number, boolean];
    allowsInteractions: () => boolean;
    isStateful: () => boolean;
}
