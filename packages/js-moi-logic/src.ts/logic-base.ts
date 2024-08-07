import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import type { AbstractProvider } from "js-moi-providers";
import { CallorEstimateIxObject, InteractionCallResponse, InteractionObject, InteractionResponse, LogicPayload } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, IxType } from "js-moi-utils";
import { LogicIxArguments, LogicIxObject, LogicIxResponse } from "../types/interaction";
import { LogicIxRequest, RoutineOption } from "../types/logic";
import ElementDescriptor from "./element-descriptor";
import { LogicId } from "./logic-id";

const DEFAULT_FUEL_PRICE = 1;

/**
 * This abstract class extends the ElementDescriptor class and serves as a base 
 * class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
export abstract class LogicBase extends ElementDescriptor {
    protected signer?: Signer;
    protected provider: AbstractProvider;
    protected manifestCoder: ManifestCoder;

    constructor(manifest: LogicManifest.Manifest, arg: Signer | AbstractProvider) {
        super(manifest.elements)

        this.manifestCoder = new ManifestCoder(this.elements, this.classDefs)
        this.connect(arg)
    }

    // abstract methods to be implemented by subclasses

    protected abstract createPayload(ixObject: LogicIxObject): LogicPayload;
    
    // TODO: Logic Call Result should be handled seperately
    protected abstract processResult(response: LogicIxResponse, timeout?: number): Promise<unknown | null>;

    /**
     * Returns the logic ID associated with the LogicBase instance.
     * 
     * @returns {string} The logic ID.
     */
    protected getLogicId(): LogicId {
        return new LogicId("")
    }

    /**
     * Returns the interaction type based on the routine kind.
     * 
     * @returns {IxType} The interaction type.
     */
    protected getIxType(kind: string): IxType {
        switch(kind){
            case "deploy":
                return IxType.LOGIC_DEPLOY;
            case "invoke":
                return IxType.LOGIC_INVOKE;
            case "enlist":
                return IxType.LOGIC_ENLIST;
            default:
                throw new Error("Unsupported routine kind!");
        }
    }

    /**
     * Updates the signer and provider instances for the LogicBase instance.
     * 
     * @param {Signer | AbstractProvider} arg -  The signer or provider instance.
     */
    public connect(arg: AbstractProvider | Signer): void {
        if (arg instanceof Signer) {
            this.signer = arg;
            this.provider = arg.getProvider();
            return;
        }
        this.provider = arg;
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
    protected async executeRoutine(ixObject: LogicIxObject, method: string, option: RoutineOption): Promise<InteractionCallResponse | number | bigint | InteractionResponse> {
        if (this.getIxType(ixObject.routine.kind) !== IxType.LOGIC_DEPLOY && !this.getLogicId()) {
            ErrorUtils.throwError(
                "This logic object doesn't have address set yet, please set an address first.",
                ErrorCode.NOT_INITIALIZED
            );
        }

        const { type, params } = this.processArguments(ixObject, method, option);

        switch (type) {
            case "call": {
                const response = await this.provider.call(params as CallorEstimateIxObject);

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
                
                return this.provider.estimateFuel(params as CallorEstimateIxObject);
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
     * @param {LogicIxObject} ixObject - The interaction object.
     * @param {any[]} args - The interaction arguments.
     * @returns {any} The processed arguments object.
     * @throws {Error} Throws an error if there are missing arguments or missing fuel information.
     */
    protected processArguments(ixObject: LogicIxObject, type: string, option: RoutineOption): LogicIxArguments {
        const params: InteractionObject = {
            transactions: [
                {
                    type: this.getIxType(ixObject.routine.kind),
                    payload: ixObject.createPayload(),
                }
            ]
        }

        if(option.sender != null) {
            params.sender = option.sender;
        } else {
            if(this.signer?.isInitialized()) {
                params.sender = this.signer.getAddress();
            }
        }

        if(option.fuelPrice != null) {
            params.fuel_price = option.fuelPrice;
        }

        if(option.fuelLimit != null) {
            params.fuel_limit = option.fuelLimit;
        }

        return { type, params: { ...params, ...option } }
    }

    /**
     * Creates a logic interaction request object based on the given interaction object.
     * 
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicIxRequest} The logic interaction request object.
     */
    protected createIxRequest(ixObject: LogicIxObject): LogicIxRequest {
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
     * @returns {LogicIxRequest} The logic interaction request object.
     */
    protected createIxObject(routine: LogicManifest.Routine, ...args: any[]): LogicIxRequest {

        const option = args.at(-1) && typeof args.at(-1) === "object" ? args.pop() : {};

        const ixObject: LogicIxObject = {
            routine: routine,
            arguments: args
        } as LogicIxObject

        ixObject.call = async (): Promise<InteractionCallResponse> => {
            return this.executeRoutine(ixObject, "call", option) as Promise<InteractionCallResponse>
        }

        ixObject.send = async (): Promise<InteractionResponse> => {
            option.fuelLimit = option.fuelLimit != null ? option.fuelLimit : await ixObject.estimateFuel();
            option.fuelPrice = option.fuelPrice != null ? option.fuelPrice : DEFAULT_FUEL_PRICE;

            return this.executeRoutine(ixObject, "send", option) as Promise<InteractionResponse>
        }
        
        ixObject.estimateFuel = (): Promise<number|bigint> => {
            return this.executeRoutine(ixObject, "estimate", option) as Promise<number | bigint>
        }

        ixObject.createPayload = (): LogicPayload => {
            return this.createPayload(ixObject)
        }

        return this.createIxRequest(ixObject);
    }
}
