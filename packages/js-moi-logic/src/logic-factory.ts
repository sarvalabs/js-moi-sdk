import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { ErrorCode, ErrorUtils, IxType, hexToBytes } from "js-moi-utils";
import { LogicPayload } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { LogicIxRequest } from "../types/logic";
import { LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
import { LogicBase } from "./logic-base";

/**
 * This class represents a factory for deploying logic.
 */
export class LogicFactory extends LogicBase {
    private manifest: LogicManifest.Manifest;
    private encodedManifest: string;

    constructor(manifest: LogicManifest.Manifest, signer: Signer) {
        super(manifest, signer);
        this.manifest = manifest;
        this.encodedManifest = ManifestCoder.encodeManifest(manifest);
    }

    /**
     * Retrieves the interaction type associated with the LogicFactory.
     * 
     * @returns {IxType} The interaction type.
     */
    protected getIxType(): IxType {
        return IxType.LOGIC_DEPLOY;
    }

    /**
     * Creates the payload for the logic interaction object.
     * 
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicPayload {
        const payload = {
            manifest: hexToBytes(this.encodedManifest),
            callsite: ixObject.routine.name
        } as LogicPayload;

        if(ixObject.routine.accepts && Object.keys(ixObject.routine.accepts).length > 0) {
            const calldata = this.manifestCoder.encodeArguments(
                ixObject.routine.accepts, 
                ixObject.arguments
            );
            payload.calldata = hexToBytes(calldata);
        }

        return payload;
    }

    /**
     * Processes the result of a logic interaction response.
     * 
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult>} The processed logic interaction result.
     */
    protected async processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult> {
        try {
            const result = await response.result(timeout);

            return { 
                logic_id: result.logic_id ? result.logic_id : "", 
                error: ManifestCoder.decodeException(result.error) 
            };
        } catch(err) {
            throw err;
        }
    }

    /**
     * Returns the POLO encoded manifest in hexadecimal format.
     * 
     * @returns {string} The encoded manifest.
     */
    public getEncodedManifest(): string {
        return this.encodedManifest;
    }

    /**
     * Deploys a logic.
     * 
     * @param {string} builderName - The name of the builder routine.
     * @param {any[]} args - Optional arguments for the deployment.
     * @returns {LogicIxRequest} The logic interaction request object.
     * @throws {Error} If the builder routine is not found or if there are missing arguments.
     */
    public deploy(builderName: string, args: any[] = []): LogicIxRequest {
        const builder = Object.values(this.manifest.elements)
        .find(element => {
            if(element.kind === "routine"){
                const routine = element.data as LogicManifest.Routine;
                return routine.kind === "deployer" && 
                builderName === routine.name;
            }

            return false;
        })

        if(builder) {
            const builderRoutine = builder.data as LogicManifest.Routine;

            if(builderRoutine.accepts && Object.keys(builderRoutine.accepts).length != args.length) {
                ErrorUtils.throwError(
                    "One or more required arguments are missing.",
                    ErrorCode.MISSING_ARGUMENT
                );
            }
    
            return this.createIxObject(builderRoutine, ...args);
        }

        ErrorUtils.throwError(
            "Invalid builder name, builder not found!",
            ErrorCode.INVALID_ARGUMENT
        );
    }
}
