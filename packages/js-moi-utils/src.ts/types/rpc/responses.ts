import type { AccountType, InteractionStatus, LockType, OperationStatus, OpType, ReceiptStatus } from "../../enums";
import type { Address, Hex, Quantity } from "../../hex";
import type { IxParticipant, Preference } from "../interaction";
import type { IxOperation } from "../ix-operation";
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

export interface FuelInfo {
    limit: number;
    bonus: number;
    spent: number;
}

export interface TesseractData {
    seal: Hex;
    epoch: Quantity;
    time: number;
    fuel: FuelInfo;
    interactions: Hex;
    confirmations: Hex;
    accounts: Hex;
}

export interface Stochastic {
    size: number;
    nodes: KramaID[];
}

export interface ICS {
    seed: Hex;
    proof: Hex;
    cluster_id: string;
    stochastic: Stochastic;
}

export interface PreviousICS {
    address: Address;
    commit_hash: Hex;
    evidence_hash: Hex;
}

export interface Commits {
    qc_type: string;
    signer_indices: string[];
    signature: Hex;
    previous_ics: PreviousICS[];
}

export interface ConsensusInfo {
    ics: ICS;
    operator: KramaID;
    proposer: KramaID;
    propose_view: number;
    commit_view: number;
    commits: Commits;
}

export interface IxAccount {
    identifier: Address;
    lock_type: LockType;
    notary: Address;
}

export interface InteractionInfo {
    sender: Hex;
    sponsor: Hex;
    fuel_limit: number;
    fuel_bonus: number;
    operations: IxOperation[];
    accounts: IxParticipant[];
    metadata: Hex;
    preference: Preference;
    perception: Hex;
}

export interface TesseractInfo {
    hash?: Hex;
    index?: number;
}

export interface InteractionConfirmation {
    status: ReceiptStatus;
    tesseract: TesseractInfo;
    operations: IxOperation[];
    fuel_spent: number;
}

export interface Interaction {
    hash: Hex;
    status: InteractionStatus;
    interaction: InteractionInfo;
    confirmation?: InteractionConfirmation;
}

export interface Tesseract {
    hash: Hex;
    tesseract: TesseractData;
    consensus?: ConsensusInfo;
    interactions?: Interaction[];
    confirmations?: InteractionConfirmation[];
}
