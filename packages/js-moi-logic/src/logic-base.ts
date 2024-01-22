import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { InteractionCallResponse, InteractionResponse, LogicPayload } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, IxType } from "js-moi-utils";
import { LogicIxArguments, LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
import { LogicIxRequest, RoutineRequestOption } from "../types/logic";
import ElementDescriptor from "./element-descriptor";

/**
 * This abstract class extends the ElementDescriptor class and serves as a base 
 class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
export abstract class LogicBase extends ElementDescriptor {
    protected signer: Signer;
    protected manifestCoder: ManifestCoder;

    constructor(manifest: LogicManifest.Manifest, signer: Signer) {
        super(manifest.elements)
        
        this.signer = signer;
        this.manifestCoder = new ManifestCoder(this.elements, this.classDefs)
    }

    // abstract methods to be implemented by subclasses

    protected abstract createPayload(ixObject: LogicIxObject): LogicPayload;
    protected abstract getIxType(): IxType;
    
    // TODO: Logic Call Result should be handled seperately
    protected abstract processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult | null>;

    /**
     * Returns the logic ID associated with the LogicBase instance.
     * 
     * @returns {string} The logic ID.
     */
    protected getLogicId(): string {
        return ""
    }

    /**
     * Updates the signer or establishes a connection with a new signer.
     * 
     * @param {Signer} signer - The updated signer object or the new signer object to connect.
     */
    public connect(signer: Signer): void {
        this.signer = signer;
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
    protected async executeRoutine(ixObject: LogicIxObject, type: string, option: RoutineRequestOption): Promise<InteractionCallResponse | number | bigint | InteractionResponse> {
        const processedArgs = this.processArguments(ixObject, type, option);
        if(this.getIxType() !== IxType.LOGIC_DEPLOY && !this.getLogicId()) {
            ErrorUtils.throwError(
                "This logic object doesn\'t have address set yet, please set an address first.",
                ErrorCode.NOT_INITIALIZED
            )
        }

        switch(processedArgs.type) {
            case "call":
                return this.signer.call(processedArgs.params)
                .then((response) => {
                    return {
                        ...response,
                        result: this.processResult.bind(this, {
                            ...response, 
                            routine_name: ixObject.routine.name
                        })
                    }
                }).catch((err) => {
                    throw err;
                });
            case "estimate":
                return this.signer.estimateFuel(processedArgs.params)
            case "send":
                return this.signer.sendInteraction(processedArgs.params)
                .then((response) => {
                    return {
                        ...response,
                        result: this.processResult.bind(this, {
                            ...response, 
                            routine_name: ixObject.routine.name
                        })
                    }
                }).catch((err) => {
                    throw err;
                });
            default:
                break;
        }

        ErrorUtils.throwError(
            'Method "' + processedArgs.type + '" not supported.', 
            ErrorCode.UNSUPPORTED_OPERATION
        );
    }

    /**
     * Processes the interaction arguments and returns the processed arguments object.
     * 
     * @param {LogicIxObject} ixObject - The interaction object.
     * @param {any[]} args - The interaction arguments.
     * @returns {any} The processed arguments object.
     * @throws {Error} Throws an error if there are missing arguments or missing fuel information.
     */
    protected processArguments(ixObject: LogicIxObject, type: string, option: RoutineRequestOption): LogicIxArguments {
        if(option.sender == null && this.signer.isInitialized()) {
            option.sender = this.signer.getAddress();
        }

        return {
            type,
            params: {
                sender: option.sender,
                type: this.getIxType(),
                fuel_price: option.fuelPrice,
                fuel_limit: option.fuelLimit,
                payload: ixObject.createPayload(),
            }
        }
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
            const result = await ix.result()

            if(result.error) {
                throw result.error
            }

            return result.output
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
        const DEFAULT_FUEL_PRICE = 1;
        const DEFAULT_FUEL_LIMIT = 1000

        const option = args.at(-1) && typeof args.at(-1) === "object" ? args.pop() : {};


        const ixObject: LogicIxObject = {
            routine: routine,
            arguments: args
        } as LogicIxObject
        
        ixObject.estimateFuel = (): Promise<number|bigint> => {
            option.fuelPrice ??= DEFAULT_FUEL_PRICE;
            option.fuelLimit ??= DEFAULT_FUEL_LIMIT;

            return this.executeRoutine(ixObject, "estimate", option) as Promise<number | bigint>
        }

        ixObject.call = async (): Promise<InteractionCallResponse> => {
            option.fuelPrice ??= DEFAULT_FUEL_PRICE;
            option.fuelLimit ??= await ixObject.estimateFuel();

            return this.executeRoutine(ixObject, "call", option) as Promise<InteractionCallResponse>
        }

        ixObject.send = async (): Promise<InteractionResponse> => {
            option.fuelPrice ??= DEFAULT_FUEL_PRICE;
            option.fuelLimit ??= await ixObject.estimateFuel();
            return this.executeRoutine(ixObject, "send", option) as Promise<InteractionResponse>
        }

        ixObject.createPayload = (): LogicPayload => {
            return this.createPayload(ixObject)
        }

        return this.createIxRequest(ixObject)
    }
}
