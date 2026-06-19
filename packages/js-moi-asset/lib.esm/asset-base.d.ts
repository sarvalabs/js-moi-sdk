import { ElementDescriptor, LogicManifest, ManifestCoder } from "js-moi-manifest";
import type { AbstractProvider, LogicActionPayload, LogicDeployPayload } from "js-moi-providers";
import { InteractionCallResponse, InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { OpType } from "js-moi-utils";
import { AssetIxArguments, AssetIxObject, AssetIxResponse } from "../types/interaction";
import { AssetIxRequest } from "../types/asset";
import { AssetId } from "./asset-id";
import { RoutineOption } from "js-moi-logic";
/**
 * This abstract class extends the ElementDescriptor class and serves as a base
 * class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
export declare abstract class AssetBase extends ElementDescriptor {
    protected signer?: Signer;
    protected provider: AbstractProvider;
    protected manifestCoder: ManifestCoder;
    constructor(manifest: LogicManifest.Manifest, signer: Signer);
    protected abstract createPayload(ixObject: AssetIxObject): LogicDeployPayload | LogicActionPayload;
    protected abstract processResult(response: AssetIxResponse, timeout?: number): Promise<unknown | null>;
    /**
     * Returns the logic ID associated with the LogicBase instance.
     *
     * @returns {string} The logic ID.
     */
    protected getLogicId(): AssetId;
    /**
     * Returns the interaction type based on the routine kind.
     *
     * @returns {OpType} The interaction type.
     */
    protected getTxType(kind: string): OpType.ASSET_CREATE | OpType.ASSET_INVOKE | OpType.LOGIC_ENLIST;
    /**
     * Updates the signer and provider instances for the LogicBase instance.
     *
     * @param {Signer | AbstractProvider} signer -  The signer or provider instance.
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
    protected executeRoutine(ixObject: AssetIxObject, method: string, option: RoutineOption): Promise<InteractionCallResponse | number | bigint | InteractionResponse>;
    /**
     * Processes the interaction arguments and returns the processed arguments object.
     *
     * @param {AssetIxObject} ixObject - The interaction object.
     * @param {any[]} args - The interaction arguments.
     * @returns {any} The processed arguments object.
     * @throws {Error} Throws an error if there are missing arguments or missing fuel information.
     */
    protected processArguments(ixObject: AssetIxObject, type: string, option: RoutineOption): Promise<AssetIxArguments>;
    /**
     * Creates a logic interaction request object based on the given interaction object.
     *
     * @param {AssetIxObject} ixObject - The interaction object.
     * @returns {AssetIxRequest} The logic interaction request object.
     */
    protected createIxRequest(ixObject: AssetIxObject): AssetIxRequest;
    /**
     * Creates a logic interaction request object with the specified routine and arguments.
     *
     * @param {LogicManifest.Routine} routine - The routine for the logic interaction request.
     * @param {any[]} args - The arguments for the logic interaction request.
     * @returns {AssetIxRequest} The logic interaction request object.
     */
    protected createIxObject(routine: LogicManifest.Routine, ...args: any[]): AssetIxRequest;
}
//# sourceMappingURL=asset-base.d.ts.map