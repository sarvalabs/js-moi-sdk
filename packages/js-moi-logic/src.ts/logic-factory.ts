import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { LogicDeployPayload } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, Hex } from "js-moi-utils";
import { LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
import { LogicBase } from "./logic-base";
import { LogicContext, LogicOps } from "./logic-context";

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
     * Creates the payload for the logic interaction object.
     * 
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicDeployPayload} The logic deploy payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicDeployPayload {
        const payload = {
            manifest: this.encodedManifest,
            callsite: ixObject.routine != null ? ixObject.routine.name : "",
        } as LogicDeployPayload;

        if(ixObject.routine.accepts && Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.manifestCoder.encodeArguments(
                payload.callsite, 
                ...ixObject.arguments,
            ) as Hex;
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
        const result = await response.result(timeout);

        return {
            logic_id: result[0].logic_id ?? "",
            error: ManifestCoder.decodeException(result[0].error),
        };
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
     * @param {string} builderName - The name of the builder routine. (optional)
     * @param {any[]} args - Arguments for the builder routine. (optional)
     * @returns {LogicContext<LogicOps>} The logic interaction context.
     * @throws {Error} If the builder routine is not found or required arguments are missing.
     */
    public deploy(builderName?: string, ...args: any[]): LogicContext<LogicOps> {
        if (builderName == null) {
            const deployRoutine = { name: "", kind: "deploy" } as LogicManifest.Routine;
            return this.createIxObject(deployRoutine, ...args);
        }

        const builder = Object.values(this.manifest.elements).find(element => {
            if (element.kind === "callable") {
                const routine = element.data as LogicManifest.Routine;
                return routine.kind === "deploy" && routine.name === builderName;
            }
            return false;
        });

        if (builder) {
            const builderRoutine = builder.data as LogicManifest.Routine;

            if (builderRoutine.accepts && args.length < Object.keys(builderRoutine.accepts).length) {
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
