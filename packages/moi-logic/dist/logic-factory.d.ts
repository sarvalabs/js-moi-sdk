import { IxType, LogicManifest } from "moi-utils";
import { LogicPayload } from "moi-signer";
import { JsonRpcProvider } from "moi-providers";
import { LogicDeployRequest } from "../types/logic";
import { LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
import { LogicBase } from "./logic-base";
/**
 * LogicFactory Class
 *
 * This class represents a factory for deploying logic.
 */
export declare class LogicFactory extends LogicBase {
    private manifest;
    private encodedManifest;
    constructor(manifest: LogicManifest.Manifest, provider: JsonRpcProvider);
    /**
     * getIxType
     *
     * Retrieves the interaction type associated with the LogicFactory.
     *
     * @returns {IxType} The interaction type.
     */
    protected getIxType(): IxType;
    /**
     * createPayload
     *
     * Creates the payload for the logic interaction object.
     *
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicPayload;
    /**
     * processResult
     *
     * Processes the result of a logic interaction response.
     *
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult>} The processed logic interaction result.
     */
    protected processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult>;
    /**
     * deploy
     *
     * Deploys a logic.
     *
     * @param {string} builderName - The name of the builder routine.
     * @param {any[]} args - Optional arguments for the deployment.
     * @returns {LogicDeployRequest} The logic deployment request object.
     * @throws {Error} If the builder routine is not found or if there are missing arguments.
     */
    deploy(builderName: string, args?: any[]): LogicDeployRequest;
}
