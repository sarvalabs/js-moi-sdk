import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { LogicDeployPayload } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, Hex } from "js-moi-utils";
import { LogicIxCallResponse, LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
import { LogicBase } from "./logic-base";
import { LogicContext, LogicOps } from "./logic-context";
import { RoutineOption } from "./routine-options";

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
                payload.callsite!,
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
    protected async processResult(response: LogicIxResponse | LogicIxCallResponse, timeout?: number): Promise<LogicIxResult> {
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
     * @param {string} builderName - The name of the builder routine. Optional only if the
     * manifest defines no deploy routine at all - required to pick one otherwise.
     * @param {any[]} args - Arguments for the builder routine. (optional)
     * @returns {LogicContext<LogicOps>} The logic interaction context.
     * @throws {Error} If a builder name is required but omitted, the builder routine is not
     * found, or required arguments are missing.
     */
    public deploy(builderName?: string, ...args: any[]): LogicContext<LogicOps> {
        // The blockchain only skips the deployer call when the manifest defines no deploy
        // routine at all - if it defines one or more, a builder name is required to pick one,
        // and an empty callsite is rejected the same as a mismatched one. Mirror that here
        // instead of always allowing an omitted builder name (see AssetFactory.create()).
        const deployRoutines = Object.values(this.manifest.elements)
            .filter((element): element is typeof element & { data: LogicManifest.Routine } => {
                return element.kind === "callable" && (element.data as LogicManifest.Routine).kind === "deploy";
            });

        if (builderName == null) {
            if (deployRoutines.length > 0) {
                ErrorUtils.throwError(
                    "Manifest defines one or more deploy routines - a builder name is required to select one.",
                    ErrorCode.MISSING_ARGUMENT
                );
            }

            const deployRoutine = { name: "", kind: "deploy" } as LogicManifest.Routine;
            return this.createIxObject(deployRoutine, ...args);
        }

        const builder = deployRoutines.find(element => element.data.name === builderName);

        if (builder) {
            const builderRoutine = builder.data;

            // A trailing RoutineOption isn't a real routine argument - exclude it from the
            // count, or a call with too few real args but a trailing RoutineOption slips past
            // this guard and fails later with a confusing encoder error instead.
            const argsLen = args.at(-1) instanceof RoutineOption ? args.length - 1 : args.length;

            if (builderRoutine.accepts && argsLen < Object.keys(builderRoutine.accepts).length) {
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
