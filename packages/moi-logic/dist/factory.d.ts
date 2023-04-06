import { LogicManifest } from "moi-abi";
import { LogicDeployRequest } from "../types/logic";
import { JsonRpcProvider } from "moi-providers";
export declare class LogicFactory {
    private manifest;
    private encodedManifest;
    private provider;
    constructor(manifest: LogicManifest.Manifest, provider: JsonRpcProvider);
    private createPayload;
    private processArguments;
    private executeRoutine;
    private createIxObject;
    private createIxRequest;
    deploy(options: any, callback: Function): LogicDeployRequest;
}
