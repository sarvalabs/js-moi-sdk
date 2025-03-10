import type { AssetStandard, OpType } from "../enums";
import type { Address, Hex } from "../hex";

export interface RawLogicPayload {
    manifest: Uint8Array;
    logic_id: Hex;
    callsite: string;
    calldata?: Uint8Array;
    interfaces?: Map<string, Hex>;
}

export interface LogicPayload {
    /**
     * The manifest of the logic contract.
     *
     * It is required for `LogicDeploy` operations.
     */
    manifest: Hex;
    /**
     * The unique identifier of the logic.
     *
     * It is required for `LogicDeploy` and `LogicEnlist` operations.
     */
    logic_id: Hex;
    /**
     * The callsite name of the logic contract.
     *
     * It is required for `LogicInvoke`, `LogicEnlist` and `LogicDeploy` operations.
     */
    callsite: string;
    /**
     * The calldata of the logic contract.
     *
     * It may be required for `LogicInvoke`, `LogicEnlist` and `LogicDeploy` operations.
     */
    calldata?: Hex;
    /**
     * The interfaces satisfied the foreign logic.
     *
     * It may be required for `LogicInvoke`, `LogicEnlist` and `LogicDeploy` operations.
     */
    interfaces?: Record<string, Hex>;
}

/**
 * `AssetCreatePayload` holds the data for creating a new asset
 */
export interface AssetCreatePayload {
    /**
     * The name of the asset.
     */
    symbol: string;
    /**
     * The total supply of the asset.
     */
    supply: number;
    /**
     * The standard of the asset.
     */
    standard: AssetStandard;
    /**
     * The dimension of the asset.
     */
    dimension?: number;
    /**
     * The stateful flag of the asset.
     */
    is_stateful?: boolean;
    /**
     * The logical flag of the asset.
     */
    is_logical?: boolean;
    /**
     * The logic of the asset.
     */
    logic_code?: LogicPayload;
}

export interface KeyAddPayload {
    public_key: string;
    weight: number;
    signature_algorithm: 0;
}

export interface RawParticipantCreatePayload {
    id: Uint8Array;
    amount: number;
    keys_payload: (Omit<KeyAddPayload, "public_key"> & { public_key: Uint8Array })[];
}

/**
 * `ParticipantCreatePayload` holds the data for creating a new participant account
 */
export interface ParticipantCreatePayload {
    /**
     * The `address` of the participant that is used to create a participant in network.
     */
    id: Address;
    /**
     * The amount that is provided to newly created address.
     *
     * Note: It should be more or equal to zero.
     */
    amount: number;
    /**
     * The keys_payload is used to specify the keys for the participant.
     */
    keys_payload: KeyAddPayload[];
}

export interface RawAssetActionPayload {
    asset_id: Hex;
    beneficiary: Uint8Array;
    benefactor: Uint8Array;
    amount: number;
    timestamp: number;
}

/**
 * `AssetActionPayload` holds data for transferring, approving, or revoking an asset.
 */
export interface AssetActionPayload {
    /**
     * The asset id that is used to transfer, approve, or revoke an asset.
     */
    asset_id: Hex;
    /**
     * The beneficiary address that is recipient address that is used to transfer, approve, or revoke an asset.
     */
    beneficiary: Address;
    /**
     * The benefactor is the address that authorized access to his asset funds.
     */
    benefactor: Address;
    /**
     * The amount is used to specify the amount for transfer/approve/revoke
     */
    amount: number;
    /**
     * Timestamp is used to specify the validity of the mandate.
     */
    timestamp: number;
}

export type AssetTransferPayload = Omit<AssetActionPayload, "timestamp" | "benefactor"> & Partial<Pick<AssetActionPayload, "benefactor">>;
export type RawAssetTransferPayload = Omit<RawAssetActionPayload, "timestamp" | "benefactor"> & Partial<Pick<RawAssetActionPayload, "benefactor">>;

export type AssetApprovePayload = Pick<AssetActionPayload, "beneficiary" | "asset_id" | "amount" | "timestamp">;
export type RawAssetApprovePayload = Pick<RawAssetActionPayload, "beneficiary" | "asset_id" | "amount" | "timestamp">;

export type AssetRevokePayload = Pick<AssetActionPayload, "beneficiary" | "asset_id">;
export type RawAssetRevokePayload = Pick<RawAssetActionPayload, "beneficiary" | "asset_id">;

export type AssetLockupPayload = Pick<AssetActionPayload, "beneficiary" | "asset_id" | "amount">;
export type RawAssetLockupPayload = Pick<RawAssetActionPayload, "beneficiary" | "asset_id" | "amount">;

export type AssetReleasePayload = Omit<AssetActionPayload, "timestamp">;
export type RawAssetReleasePayload = Omit<RawAssetActionPayload, "timestamp">;

export interface AssetSupplyPayload {
    /**
     * The asset id that is used to mint or burn an asset.
     */
    asset_id: Hex;
    /**
     * The amount that is used to mint or burn an asset.
     */
    amount: number;
}

export interface RawLogicDeployPayload extends Omit<RawLogicPayload, "logic_id"> {}

/**
 * `LogicDeployPayload` holds the data for deploying a new logic.
 */
export interface LogicDeployPayload extends Omit<LogicPayload, "logic_id"> {}

export interface RawLogicActionPayload extends Omit<RawLogicPayload, "manifest"> {}

/**
 * `LogicActionPayload` holds the data for invoking or enlisting a logic.
 */
export interface LogicActionPayload extends Omit<LogicPayload, "manifest"> {}

export interface KeyRevokePayload {
    key_id: number;
}

export interface AccountConfigurePayload {
    add?: Partial<KeyAddPayload>[];
    revoke?: KeyRevokePayload[];
}

export interface RawAccountConfigurePayload {
    add?: Partial<Omit<KeyAddPayload, "public_key"> & { public_key: Uint8Array }>[];
    revoke?: KeyRevokePayload[];
}

export interface RawAssetSupplyPayload {
    asset_id: Uint8Array;
    amount: number;
}

/**
 * `OperationPayload` is a type that holds the payload of an operation.
 *
 * @usage
 * ```typescript
 *  const operation: Operation<OpType.AssetCreate> = { ... }
 * ```
 */
export type IxOperationPayload<T extends OpType> = T extends OpType.ParticipantCreate
    ? ParticipantCreatePayload
    : T extends OpType.AssetCreate
    ? AssetCreatePayload
    : T extends OpType.AssetBurn | OpType.AssetMint
    ? AssetSupplyPayload
    : T extends OpType.AssetTransfer
    ? AssetTransferPayload
    : T extends OpType.AssetApprove
    ? AssetApprovePayload
    : T extends OpType.AssetRelease
    ? AssetReleasePayload
    : T extends OpType.AssetRevoke
    ? AssetRevokePayload
    : T extends OpType.AssetLockup
    ? AssetLockupPayload
    : T extends OpType.LogicDeploy
    ? LogicDeployPayload
    : T extends OpType.LogicInvoke | OpType.LogicEnlist
    ? LogicActionPayload
    : T extends OpType.AccountConfigure
    ? AccountConfigurePayload
    : never;

export type RawIxOperationPayload<T extends OpType> = T extends OpType.ParticipantCreate
    ? RawParticipantCreatePayload
    : T extends OpType.AssetCreate
    ? AssetCreatePayload
    : T extends OpType.AssetBurn | OpType.AssetMint
    ? RawAssetSupplyPayload
    : T extends OpType.AssetTransfer
    ? RawAssetTransferPayload
    : T extends OpType.AssetApprove
    ? RawAssetApprovePayload
    : T extends OpType.AssetRelease
    ? RawAssetReleasePayload
    : T extends OpType.AssetRevoke
    ? RawAssetRevokePayload
    : T extends OpType.AssetLockup
    ? RawAssetLockupPayload
    : T extends OpType.LogicDeploy
    ? RawLogicDeployPayload
    : T extends OpType.LogicInvoke | OpType.LogicEnlist
    ? RawLogicActionPayload
    : T extends OpType.AccountConfigure
    ? RawAccountConfigurePayload
    : never;

/**
 * `IxRawOperation` is a type that holds the raw operation data.
 */
export interface IxRawOperation {
    /**
     * The type of the operation.
     */
    type: OpType;
    /**
     * The POLO serialized payload of the operation.
     */
    payload: Uint8Array;
}

export interface IxOperation<TOpType extends OpType> {
    /**
     * The type of the operation.
     */
    type: TOpType;
    /**
     * The payload of the operation.
     */
    payload: IxOperationPayload<TOpType>;
}

/**
 * `AnyIxOperation` is a union type that holds all the operations.
 */
export type AnyIxOperation =
    | IxOperation<OpType.AssetBurn>
    | IxOperation<OpType.AssetCreate>
    | IxOperation<OpType.AssetMint>
    | IxOperation<OpType.AssetTransfer>
    | IxOperation<OpType.AssetApprove>
    | IxOperation<OpType.AssetRelease>
    | IxOperation<OpType.AssetRevoke>
    | IxOperation<OpType.AssetLockup>
    | IxOperation<OpType.LogicDeploy>
    | IxOperation<OpType.LogicEnlist>
    | IxOperation<OpType.LogicInvoke>
    | IxOperation<OpType.ParticipantCreate>
    | IxOperation<OpType.AccountConfigure>;
