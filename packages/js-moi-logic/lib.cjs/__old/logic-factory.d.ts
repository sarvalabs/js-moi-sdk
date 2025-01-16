import { Signer } from "js-moi-signer";
import { type ElementData, type ElementType, type IxOperation, type LogicManifest, type OpType } from "js-moi-utils";
import { LogicBase } from "./logic-base";
import { RoutineOption } from "./routine-options";
/**
 * This class represents a factory for deploying logic.
 */
export declare class LogicFactory extends LogicBase {
    private encodedManifest;
    constructor(manifest: LogicManifest, signer: Signer);
    /**
     * Creates the payload for the logic interaction object.
     *
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicDeployPayload} The logic deploy payload.
     */
    protected createPayload(ixObject: any): {
        manifest: string;
        callsite: any;
        calldata: string;
    };
    protected createOperationPayload(callsite: string, args: unknown[]): IxOperation<OpType.LogicInvoke> | IxOperation<OpType.LogicDeploy> | IxOperation<OpType.LogicInvoke>;
    /**
     * Processes the result of a logic interaction response.
     *
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult>} The processed logic interaction result.
     */
    protected processResult(response: any, timeout?: number): Promise<{
        logic_id: any;
        error: import("js-moi-manifest").Exception | null;
    }>;
    /**
     * Returns the POLO encoded manifest in hexadecimal format.
     *
     * @returns {string} The encoded manifest.
     */
    getEncodedManifest(): string;
    /**
     * Deploys a logic.
     *
     * @param {string} callsite - The name of the builder routine.
     * @param {any[]} args - Optional arguments for the deployment.
     * @returns {LogicIxRequest} The logic interaction request object.
     * @throws {Error} If the builder routine is not found or if there are missing arguments.
     */
    deploy(callsite: string, ...args: [...any, option?: RoutineOption]): void;
    createIxObject(data: ElementData<ElementType.Routine>, arg1: any[], option: any): void;
}
//# sourceMappingURL=logic-factory.d.ts.map