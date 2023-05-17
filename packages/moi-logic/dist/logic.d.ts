import { LogicManifest } from "moi-utils";
import { JsonRpcProvider, Options } from "moi-providers";
import { Routines } from "../types/logic";
import { EphemeralState, PersistentState } from "./state";
import LogicDescriptor from "./descriptor";
export declare class LogicDriver extends LogicDescriptor {
    private provider;
    private abiCoder;
    routines: Routines;
    persistentState: PersistentState;
    ephemeralState: EphemeralState;
    constructor(logicId: string, manifest: LogicManifest.Manifest, provider: JsonRpcProvider);
    private createState;
    private createRoutines;
    private isMutableRoutine;
    private normalizeRoutineName;
    private createPayload;
    private processArguments;
    private processResult;
    private executeRoutine;
    private createIxRequest;
    private createIxObject;
}
export declare const getLogicDriver: (logicId: string, provider: JsonRpcProvider, options?: Options) => Promise<LogicDriver>;
