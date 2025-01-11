import { bytesToHex, ensureHexPrefix, ErrorCode, ErrorUtils, isAddress, isHex, LockType, OpType, trimHexPrefix, type Address, type Hex, type JsonRpcResponse, type Transport } from "js-moi-utils";

import { EventEmitter } from "events";
import { InteractionSerializer } from "../serializer/serializer";
import {
    type AccountAsset,
    type AccountInfo,
    type BaseInteractionRequest,
    type Confirmation,
    type Fund,
    type Interaction,
    type RpcMethod,
    type RpcMethodParams,
    type RpcMethodResponse,
    type SimulateResult,
    type Tesseract,
} from "../types/moi-rpc-method";
import type { MoiClientInfo, RelativeTesseractOption, ResponseModifierParam, SignedInteraction, TesseractIncludeFields, TesseractReference } from "../types/shared";

type LogicStorageOption = Omit<RpcMethodParams<"moi.LogicStorage">[0], "logic_id" | "storage_key" | "address">;

export class Provider extends EventEmitter {
    private readonly _transport: Transport;

    /**
     * Creates a new instance of the provider.
     *
     * @param transport - The transport to use for communication with the network.
     */
    public constructor(transport: Transport) {
        super();

        if (transport == null) {
            ErrorUtils.throwError("Transport is required", ErrorCode.INVALID_ARGUMENT);
        }

        this._transport = transport;
    }

    /**
     * The transport used to communicate with the network.
     */
    public get transport(): Transport {
        return this._transport;
    }

    /**
     * Calls a JSON-RPC method on the network using the `request` method and processes the response.
     *
     * @param method - The name of the method to invoke.
     * @param params - The parameters to pass to the method.
     *
     * @returns A promise that resolves processed result from the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    protected async call<T extends RpcMethod>(method: T, ...params: RpcMethodParams<T>): Promise<RpcMethodResponse<T>> {
        const response = await this.request<RpcMethodResponse<T>>(method, params);
        return this.processJsonRpcResponse(response);
    }

    /**
     * Sends a JSON-RPC request to the network.
     *
     * @param method - name of the method to invoke.
     * @param params - parameters to pass to the method.
     *
     * @returns A promise that resolves to the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    public async request<T>(method: string, params: unknown[] = []): Promise<JsonRpcResponse<T>> {
        return await this.transport.request<T>(method, params);
    }

    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     */
    public async getProtocol(option?: ResponseModifierParam): Promise<MoiClientInfo> {
        return await this.call("moi.Protocol", option ?? {});
    }

    private async getTesseractByReference(reference: TesseractReference): Promise<Tesseract> {
        return await this.call("moi.Tesseract", { reference });
    }

    private async getTesseractByHash(hash: Hex): Promise<Tesseract> {
        return await this.getTesseractByReference({ absolute: hash });
    }

    private async getTesseractByAddressAndHeight(address: Address, height: number): Promise<Tesseract> {
        if (height < -1) {
            ErrorUtils.throwError("Invalid height value", ErrorCode.INVALID_ARGUMENT);
        }

        return await this.getTesseractByReference({ relative: { identifier: address, height } });
    }

    /**
     * Retrieves a tesseract by its hash
     *
     * @param hash - The hash of the tesseract to retrieve.
     * @param include - The fields to include in the response.
     * @returns A promise that resolves to the tesseract.
     */
    public getTesseract(hash: Hex, include?: TesseractIncludeFields): Promise<Tesseract>;
    /**
     * Retrieves a tesseract by its address and height
     *
     * @param address - The address of the account that the tesseract is a part of.
     * @param height - The height of the tesseract on the account. The 0 & -1 values can be used to retrieve the oldest and latest tesseracts for the account respectively.
     * @param include - The fields to include in the response.
     *
     * @returns A promise that resolves to the tesseract.
     */
    public getTesseract(address: Hex, height: number, include?: TesseractIncludeFields): Promise<Tesseract>;
    /**
     * Retrieves a tesseract by its relative reference
     *
     * @param relativeRef - The relative reference of the tesseract to retrieve.
     * @param include - The fields to include in the response.
     *
     * @returns A promise that resolves to the tesseract.
     */
    public getTesseract(relativeRef: RelativeTesseractOption, include?: TesseractIncludeFields): Promise<Tesseract>;
    public async getTesseract(
        hashOrAddress: Hex | RelativeTesseractOption,
        heightOrInclude?: number | TesseractIncludeFields,
        include?: TesseractIncludeFields
    ): Promise<Tesseract> {
        if (typeof hashOrAddress === "object" && (heightOrInclude == null || Array.isArray(heightOrInclude))) {
            return await this.getTesseractByAddressAndHeight(hashOrAddress.identifier, hashOrAddress.height);
        }

        if (isAddress(hashOrAddress) && typeof heightOrInclude === "number") {
            return await this.getTesseractByAddressAndHeight(hashOrAddress, heightOrInclude);
        }

        if (isHex(hashOrAddress) && (heightOrInclude == null || Array.isArray(heightOrInclude))) {
            return await this.getTesseractByHash(hashOrAddress);
        }

        ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
    }

    /**
     * Retrieves an interaction by its hash.
     *
     * @param hash - The hash of the interaction to retrieve.
     * @returns A promise that resolves to the interaction.
     */
    public async getInteraction(hash: Hex, options?: ResponseModifierParam): Promise<Partial<Interaction>> {
        return await this.call("moi.Interaction", { hash, ...options });
    }

    /**
     * Retrieves information about an account.
     *
     * @param address The address that uniquely identifies the account
     * @param option The options to include and reference
     * @returns A promise that resolves to the account information
     */
    public async getAccount(address: Address, option?: Omit<RpcMethodParams<"moi.Account">[0], "identifier">): Promise<AccountInfo> {
        return await this.call("moi.Account", { identifier: address, ...option });
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
    public async getAccountKey(address: Address, keyId: number, pending?: boolean) {
        return await this.call("moi.AccountKey", {
            identifier: address,
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
    public async getAccountAsset(address: Address, assetId: Hex, option?: Omit<RpcMethodParams<"moi.AccountAsset">[0], "asset_id">): Promise<AccountAsset[]> {
        return await this.call("moi.AccountAsset", {
            identifier: address,
            asset_id: assetId,
            ...option,
        });
    }

    /**
     * Retrieves the interaction confirmation
     *
     * @param hash The hash of the interaction to retrieve the confirmation.
     * @returns A promise that resolves to object containing the confirmation information.
     */
    public async getConfirmation(hash: Hex): Promise<Confirmation> {
        return await this.call("moi.Confirmation", { hash });
    }

    /**
     * Retrieves information about an asset
     *
     * @param assetId The asset id that uniquely identifies the asset
     * @param option The options to include and reference
     *
     * @returns A promise that resolves to the asset information
     */
    public async getAsset(assetId: Hex, option?: Omit<RpcMethodParams<"moi.Asset">[0], "asset_id">): Promise<unknown> {
        return await this.call("moi.Asset", { asset_id: assetId, ...option });
    }

    /**
     * Retrieves information about a logic
     *
     * @param logicId A unique identifier for the logic
     * @param option The options for the tesseract reference
     *
     * @returns A promise that resolves to the logic information
     */
    public async getLogic(logicId: Hex, option?: Omit<RpcMethodParams<"moi.Logic">[0], "logic_id">): Promise<unknown> {
        return await this.call("moi.Logic", { logic_id: logicId, ...option });
    }

    /**
     * Retrieves the value of a storage key for a logic from persistent storage
     *
     * @param logicId The unique identifier for the logic
     * @param key The storage key to retrieve
     * @param option The options for the tesseract reference
     *
     * @returns A promise that resolves to the value of the storage key
     */
    public async getLogicStorage(logicId: Hex, key: Hex, option?: LogicStorageOption): Promise<Hex>;
    /**
     * Retrieves the value of a storage key for a logic from ephemeral storage
     *
     * @param logicId The unique identifier for the logic
     * @param key The storage key to retrieve
     * @param address The address of the account to retrieve the storage key from
     * @param option The options for the tesseract reference
     *
     * @returns A promise that resolves to the value of the storage key
     */
    public async getLogicStorage(logicId: Hex, key: Hex, address: Hex, option?: LogicStorageOption): Promise<Hex>;
    public async getLogicStorage(logicId: Hex, key: Hex, addressOrOption?: Hex | LogicStorageOption, option?: LogicStorageOption): Promise<Hex> {
        let params: RpcMethodParams<"moi.LogicStorage"> | undefined;

        if (addressOrOption == null || typeof addressOrOption === "object") {
            params = [{ logic_id: logicId, storage_key: key, ...addressOrOption }];
        }

        if (isAddress(addressOrOption)) {
            params = [
                {
                    logic_id: logicId,
                    storage_key: key,
                    identifier: addressOrOption,
                    ...option,
                },
            ];
        }

        if (params == null) {
            ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
        }

        return await this.call("moi.LogicStorage", ...params);
    }

    private static isSignedInteraction(ix: unknown): ix is SignedInteraction {
        if (typeof ix !== "object" || ix == null) {
            return false;
        }

        if (!("interaction" in ix) || typeof ix.interaction !== "string") {
            return false;
        }

        if (!("signatures" in ix) || !Array.isArray(ix.signatures)) {
            return false;
        }

        return true;
    }

    private ensureValidInteraction(interaction: BaseInteractionRequest) {
        if (interaction.sender == null) {
            ErrorUtils.throwError("Sender is required in the interaction", ErrorCode.INVALID_ARGUMENT, {
                field: "sender",
            });
        }

        if (interaction.fuel_price == null) {
            ErrorUtils.throwError("Fuel price is required in the interaction", ErrorCode.INVALID_ARGUMENT, {
                field: "fuel_price",
            });
        }

        if (interaction.fuel_limit == null) {
            ErrorUtils.throwError("Fuel limit is required in the interaction", ErrorCode.INVALID_ARGUMENT, {
                field: "fuel_limit",
            });
        }

        if (interaction.fuel_price < 0) {
            ErrorUtils.throwError("Fuel price must be a unsigned number", ErrorCode.INVALID_ARGUMENT, {
                field: "fuel_price",
                value: interaction.fuel_price,
            });
        }

        if (interaction.fuel_limit < 0) {
            ErrorUtils.throwError("Fuel limit must be a unsigned number", ErrorCode.INVALID_ARGUMENT, {
                field: "fuel_limit",
                value: interaction.fuel_limit,
            });
        }

        if (interaction.ix_operations == null || interaction.ix_operations.length === 0) {
            ErrorUtils.throwError("At least one operation is required in the interaction", ErrorCode.INVALID_ARGUMENT);
        }
    }

    private getInteractionParticipants(interaction: BaseInteractionRequest) {
        const participants = new Map<Address, NonNullable<BaseInteractionRequest["participants"]>[number]>([
            [interaction.sender.address, { address: interaction.sender.address, lock_type: LockType.MutateLock, notary: false }],
        ]);

        if (interaction.payer != null) {
            participants.set(interaction.payer, {
                address: interaction.payer,
                lock_type: LockType.MutateLock,
                notary: false,
            });
        }

        for (const { type, payload } of interaction.ix_operations) {
            switch (type) {
                case OpType.ParticipantCreate: {
                    participants.set(payload.address, {
                        address: payload.address,
                        lock_type: LockType.MutateLock,
                        notary: false, // TODO: Check what should be value of this or can be left blank
                    });
                    break;
                }

                case OpType.AssetMint:
                case OpType.AssetBurn: {
                    const address = ensureHexPrefix(trimHexPrefix(payload.asset_id).slice(8));
                    participants.set(address, {
                        address,
                        lock_type: LockType.MutateLock,
                        notary: false, // TODO: Check what should be value of this or can be left blank
                    });
                    break;
                }

                case OpType.AssetTransfer: {
                    participants.set(payload.beneficiary, {
                        address: payload.beneficiary,
                        lock_type: LockType.MutateLock,
                        notary: false, // TODO: Check what should be value of this or can be left blank
                    });
                    break;
                }

                case OpType.LogicInvoke:
                case OpType.LogicEnlist: {
                    const address = ensureHexPrefix(trimHexPrefix(payload.logic_id).slice(6));
                    participants.set(address, {
                        address,
                        lock_type: LockType.MutateLock,
                        notary: false, // TODO: Check what should be value of this or can be left blank
                    });
                    break;
                }
            }
        }

        for (const participant of interaction.participants ?? []) {
            if (participants.has(participant.address)) {
                continue;
            }

            participants.set(participant.address, participant);
        }

        return Array.from(participants.values());
    }

    private getInteractionFunds(interaction: BaseInteractionRequest) {
        const funds = new Map<Hex, Fund>();

        for (const { type, payload } of interaction.ix_operations) {
            switch (type) {
                case OpType.AssetTransfer:
                case OpType.AssetMint:
                case OpType.AssetBurn: {
                    funds.set(payload.asset_id, { asset_id: payload.asset_id, amount: payload.amount });
                }
            }
        }

        for (const { asset_id, amount } of interaction.funds ?? []) {
            if (funds.has(asset_id)) {
                continue;
            }

            funds.set(asset_id, { asset_id, amount });
        }

        return Array.from(funds.values());
    }

    /**
     * Simulates an interaction call without committing it to the chain. This method can be
     * used to dry run an interaction to test its validity and estimate its execution effort.
     * It is also a cost effective way to perform read-only logic calls without submitting an
     * interaction.
     *
     * This call does not require participating accounts to notarize the interaction,
     * and no signatures are verified while executing the interaction.
     *
     * @param ix - The interaction object
     * @returns A promise that resolves to the result of the simulation.
     */
    public async simulate(ix: BaseInteractionRequest): Promise<SimulateResult>;
    /**
     * Simulates an interaction call without committing it to the chain. This method can be
     * used to dry run an interaction to test its validity and estimate its execution effort.
     * It is also a cost effective way to perform read-only logic calls without submitting an
     * interaction.
     *
     * This call does not require participating accounts to notarize the interaction,
     * and no signatures are verified while executing the interaction.
     *
     * @param ix - The POLO encoded interaction submission
     * @returns A promise that resolves to the result of the simulation.
     */
    public async simulate(serializedIx: Uint8Array): Promise<SimulateResult>;
    /**
     * Simulates an interaction call without committing it to the chain. This method can be
     * used to dry run an interaction to test its validity and estimate its execution effort.
     * It is also a cost effective way to perform read-only logic calls without submitting an
     * interaction.
     *
     * This call does not require participating accounts to notarize the interaction,
     * and no signatures are verified while executing the interaction.
     *
     * @param ix - The raw interaction object or serialized interaction submission
     * @returns A promise that resolves to the result of the simulation.
     */
    public async simulate(ix: BaseInteractionRequest | Uint8Array): Promise<SimulateResult> {
        let args: Uint8Array;

        switch (true) {
            case ix instanceof Uint8Array: {
                args = ix;
                break;
            }

            case typeof ix === "object": {
                this.ensureValidInteraction(ix);

                ix.participants = this.getInteractionParticipants(ix);
                ix.funds = this.getInteractionFunds(ix);

                args = new InteractionSerializer().serialize(ix);
                break;
            }
            default: {
                ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
            }
        }

        return await this.call("moi.Simulate", { interaction: bytesToHex(args) });
    }

    /**
     * Submits a signed interaction to the MOI protocol network.
     *
     * @param interaction - The signed interaction to submit.
     * @returns A promise that resolves to the hash of the submitted interaction.
     */
    public async submit(interaction: SignedInteraction): Promise<Hex> {
        let ix: SignedInteraction | undefined;

        if (Provider.isSignedInteraction(interaction)) {
            ix = interaction;
        }

        if (ix == null) {
            ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
        }

        if (!isHex(ix.interaction)) {
            ErrorUtils.throwArgumentError("Must be a valid hex string", "interaction", ix.interaction);
        }

        if (ix.signatures.length === 0) {
            ErrorUtils.throwError("Interaction must be have at least one signature", ErrorCode.INVALID_SIGNATURE);
        }

        return await this.call("moi.Submit", {
            interaction: ix.interaction,
            signatures: ix.signatures,
        });
    }

    public async subscribe(event: string, ...params: unknown[]): Promise<string> {
        return await this.call("moi.Subscribe", [event, ...params]);
    }

    /**
     * Processes a JSON-RPC response and returns the result.
     * If the response contains an error, it throws an error with the provided message, code, and data.
     *
     * @template T - The type of the result expected from the JSON-RPC response.
     * @param {JsonRpcResponse<T>} response - The JSON-RPC response to process.
     * @returns {T} - The result from the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    public processJsonRpcResponse<T>(response: JsonRpcResponse<T>): T {
        if ("error" in response) {
            const { data } = response.error;
            const params = data ? (typeof data === "object" ? data : { data }) : {};
            ErrorUtils.throwError(response.error.message, response.error.code, params);
        }

        return response.result;
    }
}
