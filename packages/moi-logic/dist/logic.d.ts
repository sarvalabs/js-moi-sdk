import LogicDescriptor from "./descriptor";
import { JsonRpcProvider, Options } from "moi-providers";
import { Routines } from "../types/logic";
import { LogicManifest } from "moi-utils";
declare class Logic extends LogicDescriptor {
    private provider;
    routines: Routines;
    constructor(logicId: string, provider: JsonRpcProvider, manifest: LogicManifest.Manifest);
    private createRoutines;
    private normalizeRoutineName;
    private createPayload;
    private processArguments;
    private processResult;
    private executeRoutine;
    private createIxRequest;
    private createIxObject;
}
export declare const getLogicObject: (logicId: string, provider: JsonRpcProvider, options?: Options) => Promise<Logic>;
export {};
