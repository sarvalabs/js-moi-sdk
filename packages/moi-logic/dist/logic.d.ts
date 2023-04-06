import { LogicManifest } from "moi-abi";
import LogicDescriptor from "./descriptor";
import { JsonRpcProvider } from "moi-providers";
import { Routines } from "../types/logic";
export declare class Logic extends LogicDescriptor {
    private provider;
    routines: Routines;
    constructor(logicId: string, provider: JsonRpcProvider, manifest?: LogicManifest.Manifest);
    private normalizeRoutineName;
    private createPayload;
    private processArguments;
    private executeRoutine;
    private createIxRequest;
    private createIxObject;
}
