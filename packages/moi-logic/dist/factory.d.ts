import { LogicManifest } from "moi-utils";
import { JsonRpcProvider } from "moi-providers";
import { LogicDeployRequest } from "../types/logic";
export declare class LogicFactory {
    private manifest;
    private encodedManifest;
    private provider;
    private abiCoder;
    constructor(manifest: LogicManifest.Manifest, provider: JsonRpcProvider);
    private createPayload;
    private processArguments;
    private processResult;
    private executeRoutine;
    private createIxObject;
    private createIxRequest;
    deploy(options: any, callback: Function): LogicDeployRequest;
}
