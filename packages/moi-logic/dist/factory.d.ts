import { LogicManifest } from "moi-utils";
import { JsonRpcProvider } from "moi-providers";
import { LogicDeployRequest } from "../types/logic";
import ElementDescriptor from "./element-descriptor";
export declare class LogicFactory extends ElementDescriptor {
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
