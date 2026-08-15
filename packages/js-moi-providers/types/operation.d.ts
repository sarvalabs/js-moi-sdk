import type { Address, Hex, AssetStandard, OpType, ResourceType, AccessAction, CallerKind } from "js-moi-utils";

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
    logic_id?: Hex;
    /**
     * The callsite name of the logic contract.
     *
     * It is required for `LogicInvoke`, `LogicEnlist` and `LogicDeploy` operations.
     */
    callsite?: string;
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
    callsite?: string;
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
     * The static metadata of the asset.
     */
    static_metadata?: Record<string, Hex>;
    /**
     * The dynamic metadata of the asset.
     */
    dynamic_metadata?: Record<string, Hex>;
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
     * The static metadata of the asset.
     */
    static_metadata: Map<string, Uint8Array>;
    /**
     * The dynamic metadata of the asset.
     */
    dynamic_metadata: Map<string, Uint8Array>;
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
export interface LogicDeployPayload extends Omit<LogicPayload, "logic_id"> {
    callsite?: string;
}

/**
 * `LogicActionPayload` holds the data for invoking or enlisting a logic.
 */
export interface LogicActionPayload extends Omit<LogicPayload, "manifest"> {
    callsite: string;
}

export interface RawLogicDeployPayload extends Omit<RawLogicPayload, "logic_id"> {
    callsite?: string;
}

export interface RawLogicActionPayload extends Omit<RawLogicPayload, "manifest"> {
    callsite: string;
}

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
 * `StoragePayload` holds the data for depositing or withdrawing storage rent
 * on a logic or asset account.
 */
export interface StoragePayload {
    /**
     * The logic or asset account whose storage is being funded/released.
     */
    target_account: Hex;
    /**
     * The participant credited with the resulting storage allowance.
     * Deposit only; defaults to the signer's own identifier if omitted.
     */
    deposit_for?: Hex;
    /**
     * The amount of KMOI to spend. Deposit only.
     */
    amount?: number | bigint;
    /**
     * The number of bytes of allowance to release. Withdraw only.
     * 0 (or omitted) means "release everything currently available".
     */
    bytes_to_release?: number;
}

export interface RawStoragePayload {
    target_account: Uint8Array;
    deposit_for: Uint8Array;
    amount: number | bigint;
    bytes_to_release: number;
}

/**
 * `CallerConstraint` restricts who may satisfy a caller/origin check on an
 * access policy - either anyone, or an explicit allow-list of ids.
 */
export interface CallerConstraint {
    kind: CallerKind;
    /**
     * Participant or logic ids. Required non-empty when kind is CallerKind.SET.
     */
    set: Hex[];
}

export interface RawCallerConstraint {
    kind: CallerKind;
    set: Uint8Array[];
}

/**
 * `AccessPolicy` describes who may perform which actions on a resource,
 * optionally narrowed to a subset of it.
 */
export interface AccessPolicy {
    resource: ResourceType;
    resource_id: Hex;
    /**
     * Bitmask of permitted actions - OR multiple AccessAction values together.
     */
    actions: AccessAction;
    scope?: {
        /**
         * Key prefixes that narrow the policy within the resource.
         * Empty/omitted means the policy applies to the whole resource.
         */
        prefixes?: Hex[];
    };
    caller: CallerConstraint;
    origin: CallerConstraint;
}

export interface RawAccessPolicy {
    resource: ResourceType;
    resource_id: Uint8Array;
    actions: AccessAction;
    scope: {
        prefixes: Uint8Array[];
        /** Reserved/unused - always null in v1, but must be present in the wire format. */
        predicate: null;
    };
    caller: RawCallerConstraint;
    origin: RawCallerConstraint;
}

/**
 * `AccessPayload` holds the data for creating or replacing an access policy.
 */
export interface AccessPayload {
    target_account: Hex;
    access_policy: AccessPolicy;
}

export interface RawAccessPayload {
    target_account: Uint8Array;
    access_policy: RawAccessPolicy;
}

/**
 * `AccessDeletePayload` holds the data for removing an access policy - only
 * the resource key is needed, not the policy body.
 */
export interface AccessDeletePayload {
    target_account: Hex;
    resource: ResourceType;
    resource_id: Hex;
}

export interface RawAccessDeletePayload {
    target_account: Uint8Array;
    resource: ResourceType;
    resource_id: Uint8Array;
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
    : T extends OpType.STORAGE_DEPOSIT | OpType.STORAGE_WITHDRAW
    ? StoragePayload
    : T extends OpType.ACCESS_CREATE | OpType.ACCESS_UPDATE
    ? AccessPayload
    : T extends OpType.ACCESS_DELETE
    ? AccessDeletePayload
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
    : T extends OpType.STORAGE_DEPOSIT | OpType.STORAGE_WITHDRAW
    ? RawStoragePayload
    : T extends OpType.ACCESS_CREATE | OpType.ACCESS_UPDATE
    ? RawAccessPayload
    : T extends OpType.ACCESS_DELETE
    ? RawAccessDeletePayload
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
    | IxOperation<OpType.ACCOUNT_INHERIT>
    | IxOperation<OpType.STORAGE_DEPOSIT>
    | IxOperation<OpType.STORAGE_WITHDRAW>
    | IxOperation<OpType.ACCESS_CREATE>
    | IxOperation<OpType.ACCESS_UPDATE>
    | IxOperation<OpType.ACCESS_DELETE>;
