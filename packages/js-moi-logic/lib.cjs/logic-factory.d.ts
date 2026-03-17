import { LogicManifest } from "js-moi-manifest";
import { LogicDeployPayload } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
import { LogicBase } from "./logic-base";
import { LogicContext, LogicOps } from "./logic-context";
/**
 * This class represents a factory for deploying logic.
 */
export declare class LogicFactory extends LogicBase {
    private manifest;
    private encodedManifest;
    constructor(manifest: LogicManifest.Manifest, signer: Signer);
    /**
     * Creates the payload for the logic interaction object.
     *
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicDeployPayload} The logic deploy payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicDeployPayload;
    /**
     * Processes the result of a logic interaction response.
     *
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult>} The processed logic interaction result.
     */
    protected processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult>;
    /**
     * Returns the POLO encoded manifest in hexadecimal format.
     *
     * @returns {string} The encoded manifest.
     */
    getEncodedManifest(): string;
    /**
     * Deploys a logic.
     *
     * @param {string} builderName - The name of the builder routine. (optional)
     * @param {any[]} args - Arguments for the builder routine. (optional)
     * @returns {LogicContext<LogicOps>} The logic interaction context.
     * @throws {Error} If the builder routine is not found or required arguments are missing.
     */
    deploy(builderName?: string, ...args: any[]): LogicContext<LogicOps>;
}
//# sourceMappingURL=logic-factory.d.ts.map