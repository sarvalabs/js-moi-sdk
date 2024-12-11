import { ErrorCode, ErrorUtils, isAddress, isHex, type Hex } from "js-moi-utils";

import type { JsonRpcResponse } from "./types/json-rpc.ts";
import type { RpcMethod, RpcMethodParams, RpcMethodResponse } from "./types/moi-rpc-spec.d.ts";
import type { TesseractIncludes, TesseractReference, TesseractReferenceOption, Transport } from "./types/provider.d.ts";
import type { ClientTesseractReference, IncludesParam, MoiClientInfo, RelativeTesseractOption } from "./types/shared.d.ts";

export class Provider {
    private readonly transport: Transport;

    public constructor(transport: Transport) {
        if (transport == null) {
            ErrorUtils.throwError("Transport is required", ErrorCode.INVALID_ARGUMENT);
        }

        this.transport = transport;
    }

    protected async execute<T extends RpcMethod>(method: T, ...params: RpcMethodParams<T>): Promise<RpcMethodResponse<T>> {
        const response = await this.transport.request<RpcMethodResponse<T>>(method, ...params);
        return Provider.processJsonRpcResponse(response);
    }

    public async request<T>(method: string, ...params: unknown[]): Promise<JsonRpcResponse<T>> {
        return await this.transport.request<T>(method, ...params);
    }

    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     */
    public async getVersion(): Promise<MoiClientInfo> {
        return await this.execute("moi.Version");
    }

    private async getTesseractByReference(reference: TesseractReference, includes: TesseractIncludes = []): Promise<unknown> {
        return await this.execute("moi.Tesseract", {
            include: includes,
            reference: Provider.processTesseractReference(reference),
        });
    }

    private async getTesseractByHash(tesseractHash: Hex, include?: TesseractIncludes): Promise<unknown> {
        return await this.getTesseractByReference(tesseractHash, include);
    }

    private async getTesseractByAddressAndHeight(address: Hex, height: number, include?: TesseractIncludes): Promise<unknown> {
        if (height < -1) {
            ErrorUtils.throwError("Invalid height value", ErrorCode.INVALID_ARGUMENT);
        }

        const ref: TesseractReference = { address, height };
        return await this.getTesseractByReference(ref, include);
    }

    /**
     * Retrieves a tesseract by its hash
     *
     * @param tesseractHash - The hash of the tesseract to retrieve.
     * @param include - The fields to include in the response.
     * @returns A promise that resolves to the tesseract.
     */
    public getTesseract(tesseractHash: Hex, include?: TesseractIncludes): Promise<unknown>;
    /**
     * Retrieves a tesseract by its address and height
     *
     * @param address - The address of the account that the tesseract is a part of.
     * @param height - The height of the tesseract on the account. The 0 & -1 values can be used to retrieve the oldest and latest tesseracts for the account respectively.
     * @param include - The fields to include in the response.
     *
     * @returns A promise that resolves to the tesseract.
     */
    public getTesseract(address: Hex, height: number, include?: TesseractIncludes): Promise<unknown>;
    /**
     * Retrieves a tesseract by its relative reference
     *
     * @param relativeRef - The relative reference of the tesseract to retrieve.
     * @param include - The fields to include in the response.
     *
     * @returns A promise that resolves to the tesseract.
     */
    public getTesseract(relativeRef: RelativeTesseractOption, include?: TesseractIncludes): Promise<unknown>;
    public async getTesseract(hashOrAddress: Hex | RelativeTesseractOption, heightOrInclude?: number | TesseractIncludes, include?: TesseractIncludes): Promise<unknown> {
        if (typeof hashOrAddress === "object" && (heightOrInclude == null || Array.isArray(heightOrInclude))) {
            return await this.getTesseractByAddressAndHeight(hashOrAddress.address, hashOrAddress.height, heightOrInclude);
        }

        if (isAddress(hashOrAddress) && typeof heightOrInclude === "number") {
            return await this.getTesseractByAddressAndHeight(hashOrAddress, heightOrInclude, include);
        }

        if (isHex(hashOrAddress) && (heightOrInclude == null || Array.isArray(heightOrInclude))) {
            return await this.getTesseractByHash(hashOrAddress, heightOrInclude);
        }

        ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
    }

    /**
     * Retrieves an interaction by its hash.
     *
     * @param hash - The hash of the interaction to retrieve.
     * @returns A promise that resolves to the interaction.
     */
    public async getInteraction(hash: Hex): Promise<unknown> {
        return await this.execute("moi.Interaction", { hash });
    }

    /**
     * Retrieves information about an account.
     *
     * @param address The address that uniquely identifies the account
     * @param option The options to include and reference
     * @returns A promise that resolves to the account information
     */
    public async getAccount(address: Hex, option?: TesseractReferenceOption & IncludesParam<"moi.Account">): Promise<unknown> {
        return await this.execute("moi.Account", {
            address,
            include: option?.include,
            reference: option?.reference ? Provider.processTesseractReference(option.reference) : undefined,
        });
    }

    /**
     * Retrieves the account key for an account.
     *
     * @param address The address that uniquely identifies the account
     * @param keyId The key id that uniquely identifies the account key
     * @param pending Whether to include pending account keys
     *
     * @returns A promise that resolves to the account information for the provided key id
     */
    public async getAccountKey(address: Hex, keyId: number, pending?: boolean) {
        return await this.execute("moi.AccountKey", {
            address,
            key_id: keyId,
            pending,
        });
    }

    /**
     * Retrieves the balances, mandates and deposits for a specific asset on an account
     *
     * @param address The address that uniquely identifies the account
     * @param assetId The asset id that uniquely identifies the asset
     * @param option The options to include and reference
     *
     * @returns A promise that resolves to the account asset information
     */
    public async getAccountAsset(address: Hex, assetId: Hex, option?: TesseractReferenceOption & IncludesParam<"moi.AccountAsset">): Promise<unknown> {
        return await this.execute("moi.AccountAsset", {
            address,
            asset_id: assetId,
            include: option?.include,
            reference: option?.reference ? Provider.processTesseractReference(option.reference) : undefined,
        });
    }

    /**
     * Retrieves information about an asset
     *
     * @param assetId The asset id that uniquely identifies the asset
     * @param option The options to include and reference
     *
     * @returns A promise that resolves to the asset information
     */
    public async getAsset(assetId: Hex, option?: TesseractReferenceOption): Promise<unknown> {
        return await this.execute("moi.Asset", {
            asset_id: assetId,
            reference: option?.reference ? Provider.processTesseractReference(option.reference) : undefined,
        });
    }

    /**
     * Processes a JSON-RPC response and returns the result.
     * If the response contains an error, it throws an error with the provided message, code, and data.
     *
     * @template T - The type of the result expected from the JSON-RPC response.
     * @param {JsonRpcResponse<T>} response - The JSON-RPC response to process.
     * @returns {T} - The result from the JSON-RPC response.
     * @throws Will throw an error if the response contains an error.
     */
    protected static processJsonRpcResponse<T>(response: JsonRpcResponse<T>): T {
        if ("error" in response) {
            const { data } = response.error;
            const params = data ? (typeof data === "object" ? data : { data }) : {};
            ErrorUtils.throwError(response.error.message, response.error.code, params);
        }

        return response.result;
    }

    /**
     * Processes a Tesseract reference and returns a `ClientTesseractReference`.
     *
     * @param reference - The Tesseract reference to process. It can be either an absolute or relative reference.
     * @returns A `ClientTesseractReference` object containing either an absolute or relative reference.
     */
    protected static processTesseractReference(reference: TesseractReference): ClientTesseractReference {
        if (isHex(reference)) {
            return { absolute: reference };
        }

        return { relative: reference };
    }
}
