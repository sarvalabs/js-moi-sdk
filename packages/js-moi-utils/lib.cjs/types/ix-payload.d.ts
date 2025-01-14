import { OpType, type AssetStandard } from "../enums";
import type { Address, Hex } from "../hex";
export interface PoloLogicPayload {
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
    dimension: number;
    /**
     * The stateful flag of the asset.
     */
    is_stateful: boolean;
    /**
     * The logical flag of the asset.
     */
    is_logical: boolean;
    /**
     * The logic of the asset.
     */
    logic?: LogicPayload;
}
export interface KeyAddPayload {
    public_key: Hex;
    weight: number;
    signature_algorithm: number;
}
export interface PoloParticipantCreatePayload {
    address: Uint8Array;
    amount: number;
    keys_payload: KeyAddPayload[];
}
/**
 * `ParticipantCreatePayload` holds the data for creating a new participant account
 */
export interface ParticipantCreatePayload {
    /**
     * The `address` of the participant that is used to create a participant in network.
     */
    address: Address;
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
export interface PoloAssetActionPayload {
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
export interface PoloLogicDeployPayload extends Omit<PoloLogicPayload, "logic_id"> {
}
/**
 * `LogicDeployPayload` holds the data for deploying a new logic.
 */
export interface LogicDeployPayload extends Omit<LogicPayload, "logic_id"> {
}
export interface PoloLogicActionPayload extends Omit<PoloLogicPayload, "manifest"> {
}
/**
 * `LogicActionPayload` holds the data for invoking or enlisting a logic.
 */
export interface LogicActionPayload extends Omit<LogicPayload, "manifest"> {
}
/**
 * `OperationPayload` is a type that holds the payload of an operation.
 *
 * @usage
 * ```typescript
 *  const operation: Operation<OpType.AssetCreate> = { ... }
 * ```
 */
export type OperationPayload<T extends OpType> = T extends OpType.ParticipantCreate ? ParticipantCreatePayload : T extends OpType.AssetCreate ? AssetCreatePayload : T extends OpType.AssetBurn | OpType.AssetMint ? AssetSupplyPayload : T extends OpType.AssetTransfer ? AssetActionPayload : T extends OpType.LogicDeploy ? LogicDeployPayload : T extends OpType.LogicInvoke | OpType.LogicEnlist ? LogicActionPayload : never;
export type PoloOperationPayload<T extends OpType> = T extends OpType.ParticipantCreate ? PoloParticipantCreatePayload : T extends OpType.AssetCreate ? AssetCreatePayload : T extends OpType.AssetBurn | OpType.AssetMint ? AssetSupplyPayload : T extends OpType.AssetTransfer ? PoloAssetActionPayload : T extends OpType.LogicDeploy ? PoloLogicDeployPayload : T extends OpType.LogicInvoke | OpType.LogicEnlist ? PoloLogicActionPayload : never;
//# sourceMappingURL=ix-payload.d.ts.map