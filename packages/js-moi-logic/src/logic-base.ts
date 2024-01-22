import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { ErrorCode, ErrorUtils, IxType } from "js-moi-utils";
import { LogicPayload } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { InteractionResponse, InteractionCallResponse } from "js-moi-providers";
import ElementDescriptor from "./element-descriptor";
import { LogicIxRequest } from "../types/logic";
import { LogicIxArguments, LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";

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
    protected async executeRoutine(ixObject: LogicIxObject, ...args: any[]): Promise<InteractionCallResponse | number | bigint | InteractionResponse> {
        const processedArgs = this.processArguments(ixObject, args)

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
    protected processArguments(ixObject: LogicIxObject, args: any[]): LogicIxArguments {
        if(args.length < 2) {
            ErrorUtils.throwError(
                "One or more required arguments are missing.",
                ErrorCode.MISSING_ARGUMENT
            )
        }

        return {
            type: args[0],
            params: {
                sender: this.signer.isInitialized() ? this.signer.getAddress() : args[1].sender,
                type: this.getIxType(),
                nonce: args[1].nonce,
                fuel_price: args[1].fuelPrice,
                fuel_limit: args[1].fuelLimit,
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
        return {
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
        const ixObject: LogicIxObject = {
            routine: routine,
            arguments: args
        } as LogicIxObject

        // Define call, send, estimateFuel methods on ixObject
        ixObject.call = (...args: any[]): Promise<InteractionCallResponse> => {
            return this.executeRoutine(ixObject, "call", ...args) as Promise<InteractionCallResponse>
        }

        ixObject.send = (...args: any[]): Promise<InteractionResponse> => {
            return this.executeRoutine(ixObject, "send", ...args) as Promise<InteractionResponse>
        }

        ixObject.estimateFuel = (...args: any[]): Promise<number|bigint> => {
            return this.executeRoutine(ixObject, "estimate", ...args) as Promise<number | bigint>
        }

        ixObject.createPayload = (): LogicPayload => {
            return this.createPayload(ixObject)
        }

        return this.createIxRequest(ixObject)
    }
}
