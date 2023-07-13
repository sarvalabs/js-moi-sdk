import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { IxType } from "js-moi-utils";
import { LogicPayload, Signer } from "js-moi-signer";
import { InteractionResponse } from "js-moi-providers";
import ElementDescriptor from "./element-descriptor";
import { LogicExecuteRequest } from "../types/logic";
import { LogicIxArguments, LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
/**
 * This abstract class extends the ElementDescriptor class and serves as a base
 class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
export declare abstract class LogicBase extends ElementDescriptor {
    protected signer: Signer;
    protected manifestCoder: ManifestCoder;
    constructor(manifest: LogicManifest.Manifest, signer: Signer);
    protected abstract createPayload(ixObject: LogicIxObject): LogicPayload;
    protected abstract getIxType(): IxType;
    protected abstract processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult | null>;
    /**
     * Returns the logic ID associated with the LogicBase instance.
     *
     * @returns {string} The logic ID.
     */
    protected getLogicId(): string;
    /**
     * Updates the signer or establishes a connection with a new signer.
     *
     * @param {Signer} signer - The updated signer object or the new signer object to connect.
     */
    connect(signer: Signer): void;
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
    protected executeRoutine(ixObject: LogicIxObject, ...args: any[]): Promise<InteractionResponse>;
    /**
     * Processes the interaction arguments and returns the processed arguments object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @param {any[]} args - The interaction arguments.
     * @returns {any} The processed arguments object.
     * @throws {Error} Throws an error if there are missing arguments or missing fuel information.
     */
    protected processArguments(ixObject: LogicIxObject, args: any[]): LogicIxArguments;
    /**
     * Creates a logic execute request object based on the given interaction object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicExecuteRequest} The logic execute request object.
     */
    protected createIxRequest(ixObject: LogicIxObject): LogicExecuteRequest;
    /**
     * Creates a logic execute request object with the specified routine and arguments.
     *
     * @param {LogicManifest.Routine} routine - The routine for the logic execute request.
     * @param {any[]} args - The arguments for the logic execute request.
     * @returns {LogicExecuteRequest} The logic execute request object.
     */
    protected createIxObject(routine: LogicManifest.Routine, ...args: any[]): LogicExecuteRequest;
}
