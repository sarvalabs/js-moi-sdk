import { ABICoder } from "moi-abi";
import { ErrorCode, ErrorUtils, IxType, LogicManifest } from "moi-utils";
import { LogicPayload } from "moi-signer";
import { InteractionResponse, JsonRpcProvider } from "moi-providers";
import ElementDescriptor from "./element-descriptor";
import { LogicExecuteRequest } from "../types/logic";
import { LogicIxArguments, LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";

/**
 * LogicBase Class
 * 
 * This abstract class extends the ElementDescriptor class and serves as a base 
 class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
export abstract class LogicBase extends ElementDescriptor {
    protected provider: JsonRpcProvider;
    protected abiCoder: ABICoder;

    constructor(manifest: LogicManifest.Manifest, provider: JsonRpcProvider) {
        super(manifest.elements)
        
        this.provider = provider;
        this.abiCoder = new ABICoder(this.elements, this.classDefs)
    }

    // abstract methods to be implemented by subclasses

    protected abstract createPayload(ixObject: LogicIxObject): LogicPayload;
    protected abstract getIxType(): IxType;
    protected abstract processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult | null>;

    /**
     * getLogicId
     * 
     * Returns the logic ID associated with the LogicBase instance.
     * 
     * @returns {string} The logic ID.
     */
    protected getLogicId(): string {
        return ""
    }

    /**
     * executeRoutine
     * 
     * Executes a routine with the given arguments and returns the interaction response.
     * 
     * @param {any} ixObject - The interaction object.
     * @param {any[]} args - The arguments for the routine.
     * @returns {Promise<InteractionResponse>} A promise that resolves to the interaction response.
     * @throws {Error} Throws an error if the provider is not found or if the logic ID is not defined.
     */
    protected async executeRoutine(ixObject: LogicIxObject, ...args: any[]): Promise<InteractionResponse> {
        const processedArgs = this.processArguments(ixObject, args)

        if(!this.provider) {
            ErrorUtils.throwError(
                "Provider not found!",
                ErrorCode.NOT_INITIALIZED
            )
        }

        if(this.getIxType() !== IxType.LOGIC_DEPLOY && !this.getLogicId()) {
            ErrorUtils.throwError(
                "This logic object doesn\'t have address set yet, please set an address first.",
                ErrorCode.NOT_INITIALIZED
            )
        }

        switch(processedArgs.type) {
            case "call":
            case "estimate":
                break;
            case "send":
                return this.provider.sendInteraction(processedArgs.params)
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
     * processArguments
     * 
     * Processes the interaction arguments and returns the processed arguments object.
     * 
     * @param {LogicIxObject} ixObject - The interaction object.
     * @param {any[]} args - The interaction arguments.
     * @returns {any} The processed arguments object.
     * @throws {Error} Throws an error if there are missing arguments or missing fuel information.
     */
    protected processArguments(ixObject: LogicIxObject, args: any[]): LogicIxArguments {
        if(args.length < 2 || !args[1].sender) {
            ErrorUtils.throwError(
                "One or more required arguments are missing.",
                ErrorCode.MISSING_ARGUMENT
            )
        }

        const processedArgs: any = {
            type: args[0],
            params: {
                sender: args[1].sender
            }
        }

        if(args[0] === "send") {
            if(args[1].fuelPrice === null || args[1].fuelPrice === undefined) {
                ErrorUtils.throwError(
                    "fuel price is required",
                    ErrorCode.MISSING_ARGUMENT
                )
            }

            if(args[1].fuelLimit === null || args[1].fuelLimit === undefined) {
                ErrorUtils.throwError(
                    "fuel limit is requeired",
                    ErrorCode.MISSING_ARGUMENT
                )
            }

            processedArgs.params.type = this.getIxType();
            processedArgs.params.fuel_price = args[1].fuelPrice;
            processedArgs.params.fuel_limit = args[1].fuelLimit;
        }

        processedArgs.params.payload = ixObject.createPayload();

        return processedArgs
    }

    /**
     * createIxRequest
     * 
     * Creates a logic execute request object based on the given interaction object.
     * 
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicExecuteRequest} The logic execute request object.
     */
    protected createIxRequest(ixObject: LogicIxObject): LogicExecuteRequest {
        return {
            call: ixObject.call.bind(ixObject),
            send: ixObject.send.bind(ixObject),
            estimateGas: ixObject.estimateGas.bind(ixObject)
        }
    }

    /**
     * createIxObject
     * 
     * Creates a logic execute request object with the specified routine and arguments.
     * 
     * @param {LogicManifest.Routine} routine - The routine for the logic execute request.
     * @param {any[]} args - The arguments for the logic execute request.
     * @returns {LogicExecuteRequest} The logic execute request object.
     */
    protected createIxObject(routine: LogicManifest.Routine, ...args: any[]): LogicExecuteRequest {
        const ixObject: LogicIxObject = {
            routine: routine,
            arguments: args
        } as LogicIxObject

        // Define call, send, estimateGas methods on ixObject
        ixObject.call = (...args: any[]): Promise<InteractionResponse> => {
            return this.executeRoutine(ixObject, "call", ...args)
        }

        ixObject.send = (...args: any[]): Promise<InteractionResponse> => {
            return this.executeRoutine(ixObject, "send", ...args)
        }

        ixObject.estimateGas = (...args: any[]): Promise<InteractionResponse> => {
            return this.executeRoutine(ixObject, "estimateGas", ...args)
        }

        ixObject.createPayload = (): LogicPayload => {
            return this.createPayload(ixObject)
        }

        return this.createIxRequest(ixObject)
    }
}
