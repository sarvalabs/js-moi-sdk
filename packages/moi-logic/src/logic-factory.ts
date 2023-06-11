import { ABICoder } from "moi-abi";
import { ErrorCode, ErrorUtils, IxType, LogicManifest } from "moi-utils";
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
export class LogicFactory extends LogicBase {
    private manifest: LogicManifest.Manifest;
    private encodedManifest: string;

    constructor(manifest: LogicManifest.Manifest, provider: JsonRpcProvider) {
        super(manifest, provider);
        this.manifest = manifest;
        this.encodedManifest = ABICoder.encodeABI(manifest);
    }

    /**
     * getIxType
     * 
     * Retrieves the interaction type associated with the LogicFactory.
     * 
     * @returns {IxType} The interaction type.
     */
    protected getIxType(): IxType {
        return IxType.LOGIC_DEPLOY;
    }

    /**
     * createPayload
     * 
     * Creates the payload for the logic interaction object.
     * 
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicPayload {
        const payload: any = {
            manifest: this.encodedManifest,
            callsite: ixObject.routine.name
        }

        if(ixObject.routine.accepts && Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.abiCoder.encodeArguments(
                ixObject.routine.accepts, 
                ixObject.arguments
            );
        }

        return payload;
    }

    /**
     * processResult
     * 
     * Processes the result of a logic interaction response.
     * 
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult>} The processed logic interaction result.
     */
    protected async processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult> {
        try {
            const result = await response.result(response.hash, timeout);

            return { 
                logic_id: result.logic_id ? result.logic_id : "", 
                error: ABICoder.decodeException(result.error) 
            };
        } catch(err) {
            throw err;
        }
    }

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
    public deploy(builderName: string, args: any[] = []): LogicDeployRequest {
        const builder = Object.values(this.manifest.elements)
        .find(element => {
            if(element.kind === "routine"){
                element.data = element.data as LogicManifest.Routine
                return element.data.kind === "deployer" && 
                builderName === element.data.name
            }

            return false
        })

        if(builder) {
            builder.data = builder.data as LogicManifest.Routine

            if(builder.data.accepts && Object.keys(builder.data.accepts).length != args.length) {
                ErrorUtils.throwError(
                    "One or more required arguments are missing.",
                    ErrorCode.MISSING_ARGUMENT
                )
            }
    
            return this.createIxObject(builder.data, ...args)
        }

        ErrorUtils.throwError(
            "Invalid builder name, builder not found!",
            ErrorCode.INVALID_ARGUMENT
        )
    }
}
