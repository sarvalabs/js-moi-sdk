import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { LogicActionPayload, Options } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, Hex, defineReadOnly } from "js-moi-utils";
import { AssetIxObject, AssetIxResponse, AssetIxResult } from "../types/interaction";
import { Routines } from "../types/asset";
import { AssetDescriptor } from "./asset-descriptor";
import { RoutineOption } from "js-moi-logic";
import { EphemeralState, PersistentState } from "./state";

/**
 * Represents a asset driver that serves as an interface for interacting with logics.
 */
export class AssetDriver<T extends Record<string, (...args: any) => any> = any> extends AssetDescriptor {
    public readonly routines: Routines<T> = {} as Routines<T>;
    public readonly persistentState?: PersistentState;
    public readonly ephemeralState?: EphemeralState;

    constructor(assetId: string, manifest: LogicManifest.Manifest, arg: Signer) {
        super(assetId, manifest, arg)
        this.createState();
        this.createRoutines();
    }

    /**
     * Creates the persistent and ephemeral states for the asset driver, 
     if available in logic manifest.
     */
    private createState() {
        const hasPersistance = this.stateMatrix.persistent();
        const hasEphemeral = this.stateMatrix.ephemeral();

        if(hasPersistance) {
            const persistentState = new PersistentState(this, this.provider);
            defineReadOnly(this, "persistentState", persistentState)
        }

        if(hasEphemeral) {
            const ephemeralState = new EphemeralState(this, this.provider);
            defineReadOnly(this, "ephemeralState", ephemeralState)
        }
    }

    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    private createRoutines() {
        const routines: Record<string, any> = {};

        this.manifest.elements.forEach((element: LogicManifest.Element) => {
            if (element.kind !== "callable") {
                return;
            }

            const routine = element.data as LogicManifest.Routine;

            if (!["invoke", "enlist"].includes(routine.kind)) {
                return;
            }

            routines[routine.name] = async (...params: [...args: any[], options: RoutineOption | undefined]) => {
                const argsLen =
                    params.at(-1) && params.at(-1) instanceof RoutineOption
                        ? params.length - 1
                        : params.length;

                if (routine.accepts && argsLen < routine.accepts.length) {
                    ErrorUtils.throwError(
                        "One or more required arguments are missing.",
                        ErrorCode.INVALID_ARGUMENT
                    );
                }

                const ixObject = this.createIxObject(routine, ...params);

                if (!this.isMutableRoutine(routine)) {
                    return await ixObject.unwrap();
                }

                return await ixObject.send();
            };

            routines[routine.name].isMutable = (): boolean => {
                return this.isMutableRoutine(routine)
            }

            routines[routine.name].accepts = (): LogicManifest.TypeField[] | null => {
                return routine.accepts ? routine.accepts : null
            }

            routines[routine.name].returns = (): LogicManifest.TypeField[] | null => {
                return routine.returns ? routine.returns : null
            }
        })

        defineReadOnly(this, "routines", routines as Routines<T>);
    }

    /**
     * Checks if a routine is mutable based on its name.
     * 
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    private isMutableRoutine(routine: LogicManifest.Routine): boolean {
        return ["dynamic"].includes(routine.mode);
    }

    /**
     * Creates the logic payload from the given interaction object.
     * 
     * @param {AssetIxObject} ixObject - The interaction object.
     * @returns {LogicActionPayload} The logic action payload.
     */
    protected createPayload(ixObject: AssetIxObject): LogicActionPayload {
        const payload = {
            asset_id: this.getAssetId().string(),
            callsite: ixObject.routine.name,
        } as LogicActionPayload

        if(ixObject.routine.accepts && 
        Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.manifestCoder.encodeArguments(
                ixObject.routine.name, 
                ...ixObject.arguments
            ) as Hex;
        }

        return payload;
    }

    /**
     * Processes the logic interaction result and returns the decoded data or 
     error, if available.
     * 
     * @param {AssetIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<AssetIxResult | null>} A promise that resolves to the 
     logic interaction result or null.
     */
    protected async processResult(response: AssetIxResponse, timeout?: number): Promise<AssetIxResult> {
        try {
            const result = await response.result(timeout);

            return {
                output: this.manifestCoder.decodeOutput(response.routine_name, result[0].outputs),
                error: ManifestCoder.decodeException(result[0].error)
            };
        } catch(err) {
            throw err;
        }
    }
}

/**
 * Returns a asset driver instance based on the given asset id.
 * 
 * @param {string} assetId - The asset id of the asset.
 * @param {Signer} signer - The signer instance for the logic driver.
 * @param {Options} options - The custom tesseract options for retrieving
 * 
 * @returns {Promise<AssetDriver>} A promise that resolves to a LogicDriver instance.
 */
export const getAssetDriver = async <T extends Record<string, (...args: any) => any>>(assetId: string, signer: Signer, options?: Options): Promise<AssetDriver<T>> => {
    const manifest = await signer.getProvider().getLogicManifest(assetId, "JSON", options);

    if (typeof manifest !== "object") {
        ErrorUtils.throwError(
            "Invalid logic manifest",
            ErrorCode.INVALID_ARGUMENT
        );
    }

    return new AssetDriver<T>(assetId, manifest, signer);
}