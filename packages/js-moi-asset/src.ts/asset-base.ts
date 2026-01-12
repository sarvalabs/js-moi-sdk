import { ElementDescriptor, LogicManifest, ManifestCoder } from "js-moi-manifest";
import type { AbstractProvider, AssetActionPayload, AssetCreatePayload, LogicActionPayload, LogicDeployPayload, Sender } from "js-moi-providers";
import { InteractionCallResponse, InteractionObject, InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, OpType } from "js-moi-utils";
import { AssetIxArguments, AssetIxObject, AssetIxResponse } from "../types/interaction";
import { AssetIxRequest } from "../types/asset";
import { AssetId } from "./asset-id";
import { RoutineOption } from "./routine-options";

/**
 * The default fuel price used for logic interactions.
 */
const DEFAULT_FUEL_PRICE = 1;

/**
 * This abstract class extends the ElementDescriptor class and serves as a base 
 * class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
export abstract class AssetBase extends ElementDescriptor {
    protected signer?: Signer;
    protected provider: AbstractProvider;
    protected manifestCoder: ManifestCoder;
    

    constructor(manifest: LogicManifest.Manifest, signer: Signer) {
        super(manifest.elements)
        this.manifestCoder = new ManifestCoder(manifest);
        this.connect(signer)
    }

    // abstract methods to be implemented by subclasses

    protected abstract createPayload(ixObject: AssetIxObject): LogicDeployPayload | LogicActionPayload;
    
    // TODO: Logic Call Result should be handled seperately
    protected abstract processResult(response: AssetIxResponse, timeout?: number): Promise<unknown | null>;

    /**
     * Returns the logic ID associated with the LogicBase instance.
     * 
     * @returns {string} The logic ID.
     */
    protected getLogicId(): AssetId {
        return new AssetId("")
    }

    /**
     * Returns the interaction type based on the routine kind.
     * 
     * @returns {OpType} The interaction type.
     */
    protected getTxType(kind: string): OpType.ASSET_CREATE | OpType.ASSET_INVOKE |
    OpType.LOGIC_ENLIST {
        switch(kind){
            case "deploy":
                return OpType.ASSET_CREATE;
            case "invoke":
                return OpType.ASSET_INVOKE;
            default:
                throw new Error("Unsupported routine kind!");
        }
    }

    /**
     * Updates the signer and provider instances for the LogicBase instance.
     * 
     * @param {Signer | AbstractProvider} signer -  The signer or provider instance.
     */
    public connect(signer: Signer): void {
        if (signer instanceof Signer) {
            this.signer = signer;
            this.provider = signer.getProvider();
            return;
        }

        this.provider = signer;
    }

    /**
     * Executes a routine with the given arguments and returns the interaction response.
     * 
     * @param {any} ixObject - The interaction object.
     * @param {any[]} args - The arguments for the routine.
     * @returns {Promise<InteractionResponse>} A promise that resolves to the 
     * interaction response.
     * @throws {Error} if the provider is not initialized within the signer, 
     * if the logic id is not defined, if the method type is unsupported,
     * or if the sendInteraction operation fails.
     */
    protected async executeRoutine(ixObject: AssetIxObject, method: string, option: RoutineOption): Promise<InteractionCallResponse | number | bigint | InteractionResponse> {
        if (this.getTxType(ixObject.routine.kind) !== OpType.ASSET_CREATE && !this.getLogicId()) {
            ErrorUtils.throwError(
                "This asset object doesn't have asset id assigned yet, please assign an asset id.",
                ErrorCode.NOT_INITIALIZED
            );
        }

        const { type, params } = await this.processArguments(ixObject, method, option);

        switch (type) {
            case "call": {
                const response = await this.provider.call(params);

                return {
                    ...response,
                    result: this.processResult.bind(this, {
                        ...response,
                        routine_name: ixObject.routine.name,
                    }),
                };
            }
            case "estimate": {
                if (!this.signer?.isInitialized()) {
                    ErrorUtils.throwError(
                        "Mutating routine calls require a signer to be initialized.",
                        ErrorCode.NOT_INITIALIZED
                    );
                }
                return this.provider.estimateFuel(params);
            }
            case "send": {
                if (!this.signer?.isInitialized()) {
                    ErrorUtils.throwError(
                        "Mutating routine calls require a signer to be initialized.",
                        ErrorCode.NOT_INITIALIZED
                    );
                }

                const response = await this.signer.sendInteraction(params);

                return {
                    ...response,
                    result: this.processResult.bind(this, {
                        ...response,
                        routine_name: ixObject.routine.name,
                    }),
                };
            }
            default:
              break;
        }

        ErrorUtils.throwError('Method "' + type + '" not supported.',ErrorCode.UNSUPPORTED_OPERATION);
    }

    /**
     * Processes the interaction arguments and returns the processed arguments object.
     * 
     * @param {AssetIxObject} ixObject - The interaction object.
     * @param {any[]} args - The interaction arguments.
     * @returns {any} The processed arguments object.
     * @throws {Error} Throws an error if there are missing arguments or missing fuel information.
     */
    protected async processArguments(ixObject: AssetIxObject, type: string, option: RoutineOption): Promise<AssetIxArguments> {
        const params: InteractionObject = {
            sender: option.sender ?? {
                id: ((await this.signer?.getIdentifier()).toString()),
                key_id: (await this.signer?.getKeyId()),
                sequence: option.sequence != null ? option.sequence : (await this.signer?.getNonce()),
            } as Sender,
            fuel_price: option.fuelPrice,
            fuel_limit: option.fuelLimit,
            ix_operations: [],
            participants: option.participants ?? [],
        }

        const opType = this.getTxType(ixObject.routine.kind);
        const payload = ixObject.createPayload();

        switch (opType) {
            case OpType.ASSET_CREATE:
                params.ix_operations = [
                    {
                        type: OpType.ASSET_CREATE,
                        payload: payload as AssetCreatePayload,
                    },
                ];
                break;
            case OpType.ASSET_INVOKE:
                params.ix_operations = [
                    {
                        type: OpType.ASSET_INVOKE,
                        payload: payload as AssetActionPayload,
                    },
                ];
                break;
            default:
                ErrorUtils.throwError(
                    `Unsupported operation type: ${opType}`,
                    ErrorCode.UNSUPPORTED_OPERATION
                );
        }

        return { type, params }
    }

    /**
     * Creates a logic interaction request object based on the given interaction object.
     * 
     * @param {AssetIxObject} ixObject - The interaction object.
     * @returns {AssetIxRequest} The logic interaction request object.
     */
    protected createIxRequest(ixObject: AssetIxObject): AssetIxRequest {
        const unwrap = async () => {
            const ix = await ixObject.call();

            return await ix.result();
        }

        return {
            unwrap,
            call: ixObject.call.bind(ixObject),
            send: ixObject.send.bind(ixObject),
            estimateFuel: ixObject.estimateFuel.bind(ixObject)
        }
    }

    /**
     * Creates a logic interaction request object with the specified routine and arguments.
     * 
     * @param {LogicManifest.Routine} routine - The routine for the logic interaction request.
     * @param {any[]} args - The arguments for the logic interaction request.
     * @returns {AssetIxRequest} The logic interaction request object.
     */
    protected createIxObject(routine: LogicManifest.Routine, ...args: any[]): AssetIxRequest {
        const option = args.at(-1) && args.at(-1) instanceof RoutineOption ? args.pop() : {};

        const ixObject: AssetIxObject = {
            routine: routine,
            arguments: args
        } as AssetIxObject

        ixObject.call = async (): Promise<InteractionCallResponse> => {
            option.particpants = option.participants ?? [];
            return this.executeRoutine(ixObject, "call", option) as Promise<InteractionCallResponse>
        }

        ixObject.send = async (): Promise<InteractionResponse> => {
            option.fuelLimit = option.fuelLimit ?? await ixObject.estimateFuel();
            option.fuelPrice = option.fuelPrice ?? DEFAULT_FUEL_PRICE;  
            option.particpants = option.participants ?? [];

            return this.executeRoutine(ixObject, "send", option) as Promise<InteractionResponse>
        }
        
        ixObject.estimateFuel = (): Promise<number|bigint> => {
            option.particpants = option.participants ?? [];
            return this.executeRoutine(ixObject, "estimate", option) as Promise<number | bigint>
        }

        ixObject.createPayload = (): AssetCreatePayload | AssetActionPayload => {
            return this.createPayload(ixObject) as AssetCreatePayload | AssetActionPayload
        }

        return this.createIxRequest(ixObject);
    }
}
