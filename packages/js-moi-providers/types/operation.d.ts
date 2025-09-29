import type { Address, Hex, AssetStandard, OpType } from "js-moi-utils";

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

export interface RawLogicPayload {
    manifest: Uint8Array;
    logic_id: Uint8Array;
    callsite: string;
    calldata?: Uint8Array;
    interfaces?: Record<string, Uint8Array>;
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
     * The dimension of the asset.
     */
    dimension?: number;
    /**
     * The decimals of the asset.
     */
    decimals?: number;
    /**
     * The standard of the asset.
     */
    standard: AssetStandard;
    /**
     * Enable events of the asset.
     */
    enable_events: boolean;
    /**
     * The id of the asset manager
     */
    manager: Hex;
    /**
     * The total supply of the asset.
     */
    max_supply: number | bigint;
    /**
     * The stateful flag of the asset.
     */
    metadata?: Record<string, Hex>;
    /**
     * The logic of the asset.
     */
    logic_payload?: LogicPayload;
}

export interface RawAssetCreatePayload {
    /**
     * The name of the asset.
     */
    symbol: string;
    /**
     * The dimension of the asset.
     */
    dimension?: number;
    /**
     * The decimals of the asset.
     */
    decimals?: number;
    /**
     * The standard of the asset.
     */
    standard: AssetStandard;
    /**
     * Enable events of the asset.
     */
    enable_events: boolean;
    /**
     * The id of the asset manager
     */
    manager: Uint8Array;
    /**
     * The total supply of the asset.
     */
    max_supply: number | bigint;
    /**
     * The stateful flag of the asset.
     */
    metadata: Map<string, Uint8Array[]>;
    /**
     * The logic of the asset.
     */
    logic_payload?: LogicPayload;
}

export interface KeyAddPayload {
    public_key: Hex;
    weight: number;
    signature_algorithm: number;
}

export interface RawKeyAddPayload {
    public_key: Uint8Array;
    weight: number;
    signature_algorithm: number;
}

export interface KeyRevokePayload {
    key_id: number;
}

export interface RawKeyRevokePayload {
    key_id: number;
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
     * The asset action payload that is provided to newly created participant.
     */
    value: AssetActionPayload;
    /**
     * The keys_payload is used to specify the keys for the participant.
     */
    keys_payload: KeyAddPayload[];
}

export interface RawParticipantCreatePayload {
    id: Uint8Array;
    value: RawAssetActionPayload;
    keys_payload: (Omit<KeyAddPayload, "public_key"> & { public_key: Uint8Array })[];
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
     * The callsite specifies the method name to invoke.
     */
    callsite: string;
    /**
     * The calldata specifies the input call data.
     */
    calldata?: Hex;
    /**
     * Funds is used to specify the asset id and amount involved.
     */
    funds?: Record<Hex, number | bigint>;
}

export interface RawAssetActionPayload {
    asset_id: Uint8Array;
    callsite: string;
    calldata: Uint8Array;
    funds?: Map<Uint8Array, number | bigint>
}

/**
 * `LogicDeployPayload` holds the data for deploying a new logic.
 */
export interface LogicDeployPayload extends Omit<LogicPayload, "logic_id"> {}

/**
 * `LogicActionPayload` holds the data for invoking or enlisting a logic.
 */
export interface LogicActionPayload extends Omit<LogicPayload, "manifest"> {}

export interface RawLogicDeployPayload extends Omit<RawLogicPayload, "logic_id"> {}

export interface RawLogicActionPayload extends Omit<RawLogicPayload, "manifest"> {}

export interface AccountConfigurePayload {
    add?: KeyAddPayload[];
    revoke?: KeyRevokePayload[];
}

export interface RawAccountConfigurePayload {
    add?: Omit<KeyAddPayload, "public_key"> & { public_key: Uint8Array }[];
    revoke?: KeyRevokePayload[];
}

export interface AccountInheritPayload {
    target_account: Hex;
    value: AssetActionPayload;
    sub_account_index: number;
}

export interface RawAccountInheritPayload {
    target_account: Uint8Array;
    value: RawAssetActionPayload;
    sub_account_index: number;
}

/**
 * `OperationPayload` is a type that holds the payload of an operation.
 *
 * @usage
 * ```typescript
 *  const operation: Operation<OpType.AssetCreate> = { ... }
 * ```
 */
export type IxOperationPayload<T extends OpType> = T extends OpType.PARTICIPANT_CREATE
    ? ParticipantCreatePayload
    : T extends OpType.ASSET_CREATE
    ? AssetCreatePayload
    : T extends OpType.ASSET_INVOKE
    ? AssetActionPayload
    : T extends OpType.LOGIC_DEPLOY
    ? LogicDeployPayload
    : T extends OpType.LOGIC_INVOKE | OpType.LOGIC_ENLIST | OpType.LOGIC_INTERACT | OpType.LOGIC_UPGRADE
    ? LogicActionPayload
    : T extends OpType.ACCOUNT_CONFIGURE
    ? AccountConfigurePayload
    : T extends OpType.ACCOUNT_INHERIT
    ? AccountInheritPayload
    : never;

export type RawIxOperationPayload<T extends OpType> = T extends OpType.PARTICIPANT_CREATE
    ? RawParticipantCreatePayload
    : T extends OpType.ASSET_CREATE
    ? AssetCreatePayload
    : T extends OpType.ASSET_INVOKE
    ? RawAssetActionPayload
    : T extends OpType.LOGIC_DEPLOY
    ? RawLogicDeployPayload
    : T extends OpType.LOGIC_INVOKE | OpType.LOGIC_ENLIST | OpType.LOGIC_INTERACT | OpType.LOGIC_UPGRADE
    ? RawLogicActionPayload
    : T extends OpType.ACCOUNT_CONFIGURE
    ? RawAccountConfigurePayload
    : T extends OpType.ACCOUNT_INHERIT
    ? RawAccountInheritPayload
    : never;

/**
 * `IxRawOperation` is a type that holds the raw operation data.
 */
export interface RawIxOperation {
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
    | IxOperation<OpType.ASSET_CREATE>
    | IxOperation<OpType.ASSET_INVOKE>
    | IxOperation<OpType.LOGIC_DEPLOY>
    | IxOperation<OpType.LOGIC_ENLIST>
    | IxOperation<OpType.LOGIC_INTERACT>
    | IxOperation<OpType.LOGIC_INVOKE>
    | IxOperation<OpType.LOGIC_UPGRADE>
    | IxOperation<OpType.PARTICIPANT_CREATE>
    | IxOperation<OpType.ACCOUNT_CONFIGURE>
    | IxOperation<OpType.ACCOUNT_INHERIT>;
