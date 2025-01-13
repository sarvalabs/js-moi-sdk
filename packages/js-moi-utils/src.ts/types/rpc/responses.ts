import type { AccountType, OperationStatus, OpType, ReceiptStatus } from "../../enums";
import type { Address, Hex, Quantity } from "../../hex";
import type { OperationResult } from "./ix-result";

export interface NetworkInfo {
    /**
     * The chain ID of the network.
     */
    chain_id: number;
    /**
     * The version of the network.
     */
    version: string;
}

export interface SimulationResult<TOpType extends OpType> {
    op_type: OpType;
    op_status: OperationStatus;
    data: OperationResult<TOpType>;
}

export type IxOperationResult = SimulationResult<OpType.AssetCreate>;

export interface SimulationEffects {
    events: unknown[];
    BalanceChanges: unknown;
}

export interface Simulate {
    hash: Hex;
    status: ReceiptStatus;
    result: IxOperationResult[];
    effort: number;
    effects: SimulationEffects[] | null;
}

export interface AccountMetaData {
    type: AccountType;
    address: Hex;
    height: number;
    tesseract: Hex;
}

export interface AccountState {
    guardians: Hex;
    controls: Hex;
    assets: Hex;
    logics: Hex;
    storage: Hex;
}

export interface AccountKey {
    key_idx: number;
    weight: number;
    revoked: boolean;
    public_key: Hex;
    sequence: number;
    algorithm: number;
}

export interface AccountBalance {
    asset_id: Hex;
    amount: Quantity;
}

export interface AccountMandate {
    asset_id: Hex;
    spender: Address;
    amount: Quantity;
}

export interface AccountLockup {
    asset_id: Hex;
    locker: Address;
    amount: Quantity;
}

export type KramaID = string;

export interface Guardians {
    behavior: KramaID[];
    stochastic: KramaID[];
}

export interface Controls {}

export interface Enlisted {}

export interface Account {
    metadata: AccountMetaData;
    state?: AccountState;
    keys?: AccountKey[];
    balances?: AccountBalance[];
    mandates?: AccountMandate[];
    lockups?: AccountLockup[];
    guardians?: Guardians;
    enlisted?: Enlisted;
}
