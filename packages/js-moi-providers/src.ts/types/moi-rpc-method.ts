import { Hex, OpType, type Address } from "js-moi-utils";
import type {
    AccountParam,
    AssetParam,
    IncludesParam,
    InteractionParam,
    LogicParam,
    MoiClientInfo,
    ResponseModifierParam,
    SignedInteraction,
    TesseractReferenceParam,
} from "./shared";

interface Account {
    address: Hex;
    sequence: number;
    key_id: number;
}

interface ParticipantContextDelta {
    behavior: Hex[];
    stochastic: Hex[];
    replaced: Hex[];
}

interface ParticipantContext {
    latest: Hex;
    previous: Hex;
    delta: ParticipantContextDelta;
}

export enum MutateLock {
    MutateLock = 0,
    ReadLock = 1,
    NoLock = 2,
}

export interface Participant {
    address: Hex;
    height: number;
    lock: MutateLock;
    notary: boolean;
    transition: Hex;
    state: Hex;
    context: ParticipantContext;
}

interface ParticipantCreatePayload {
    address: Hex;
    amount: number;
    keys_payload: {
        public_key: Uint8Array;
        weight: number;
        signature_algorithm: number;
    }[];
}

interface LogicCall {
    callsite: string;
    calldata: Hex;
    interfaces: {
        name: string;
        logic_id: Hex;
    }[];
}

interface AssetCreatePayload {
    symbol: string;
    standard: number;
    supply: number;
    dimension?: number;
    is_stateful?: boolean;
    is_logical?: boolean;
    logic?: {
        manifest: Hex;
        call: LogicCall;
    };
}

interface AssetSupplyPayload {
    asset_id: Hex;
    amount: number;
}

interface AssetActionPayload {
    asset_id: Hex;
    beneficiary: Address;
    benefactor: Address;
    amount: number;
    timestamp: number;
}

export type OperationPayload<T extends OpType> = T extends OpType.PARTICIPANT_CREATE
    ? ParticipantCreatePayload
    : T extends OpType.ASSET_CREATE
    ? AssetCreatePayload
    : T extends OpType.ASSET_BURN | OpType.ASSET_MINT
    ? AssetSupplyPayload
    : T extends OpType.ASSET_TRANSFER
    ? AssetActionPayload
    : T extends OpType.LOGIC_DEPLOY
    ? LogicDeployPayload
    : T extends OpType.LOGIC_INVOKE | OpType.LOGIC_ENLIST
    ? LogicCallPayload
    : never;

export interface Operation<TOpType extends OpType> {
    type: TOpType;
    payload: OperationPayload<TOpType>;
}

interface LogicPayload {
    manifest: Hex;
    logic_id: Hex;
    callsite: string;
    calldata?: Hex;
    interfaces?: Record<string, Hex>;
}

export type LogicDeployPayload = Omit<LogicPayload, "logic_id">;

export type LogicCallPayload = Omit<LogicPayload, "manifest">;

export type IxOperation =
    | Operation<OpType.PARTICIPANT_CREATE>
    | Operation<OpType.ASSET_CREATE>
    | Operation<OpType.ASSET_BURN>
    | Operation<OpType.ASSET_MINT>
    | Operation<OpType.ASSET_TRANSFER>
    | Operation<OpType.LOGIC_DEPLOY>
    | Operation<OpType.LOGIC_INVOKE>
    | Operation<OpType.LOGIC_ENLIST>;

export interface InteractionShared {
    sender: Account;
    payer: Address;
    fuel_limit: number;
    fuel_price: number;
    ix_operations: IxOperation[];
}

interface Fund {
    asset: Hex;
    label: string;
    type: string;
}

interface InteractionPreference {
    compute: Hex;
    consensus: {
        mtq: Hex;
        nodes: Hex[];
    };
}

export interface BaseInteractionRequest extends Omit<InteractionShared, "sender" | "payer"> {
    payer: Uint8Array;
    sender: Omit<Account, "address"> & { address: Uint8Array };
    funds: Fund[] | null;
    participants: Pick<Participant, "address" | "lock" | "notary">[];
    preferences: InteractionPreference | null;
    perception: Hex | null;
}

export type InteractionRequest = Partial<Omit<BaseInteractionRequest, keyof InteractionShared>> &
    Omit<InteractionShared, "payer" | "sender"> & {
        sender: Account;
        payer?: InteractionShared["payer"];
    };

interface InteractionTesseract {
    hash: Hex;
    index: number;
}

export interface Interaction extends InteractionShared {
    hash: Hex;
    tesseract: InteractionTesseract;
    participants: Participant[];
}

interface Consensus {
    ics: {
        seed: Hex;
        proof: Hex;
        cluster_id: Hex;
        stochastic: {
            size: number;
            nodes: Hex[];
        };
    };
    operator: Hex;
    proposer: Hex;
    propose_view: number;
    commit_view: number;
    commits: {
        qc_type: string;
        signer_indices: string;
        signature: Hex;
        previous: {
            address: Hex;
            commit_hash: Hex;
            evidence_hash: Hex;
        };
    };
}

interface TesseractHeader {
    seal: Hex;
    epoch: number;
    timestamp: number;
    interactions: Hex;
    confirmations: Hex;
    fuel: {
        limit: number;
        used: number;
        tip: number;
    };
    participants: Participant[];
}

export interface OperationPayloadConfirmation {
    type: OpType;
    status: string;
    payload: unknown[];
}

export interface Confirmation {
    hash: Hex;
    status: string;
    sender: Hex;
    fuel_used: number;
    tesseract: InteractionTesseract;
    operations: OperationPayloadConfirmation[];
}

export interface Tesseract {
    hash: Hex;
    header: TesseractHeader;
    consensus?: Consensus;
    interactions: Interaction[];
    confirmations: Confirmation[];
}

export interface AccountKey {
    key_id: number;
    weight: number;
    revoked: boolean;
    public_key: Hex;
    sequence: number;
    algorithm: string;
}

interface Mandate {
    spender: Hex;
    amount: number;
}

interface Deposit {
    locker: Hex;
    amount: number;
}

export interface AccountAsset {
    asset_id: Hex;
    balance: number;
    mandates: Mandate[];
    deposits: Deposit[];
}

export enum AccountType {
    SargaAccount = 0,
    LogicAccount = 2,
    AssetAccount = 3,
    RegularAccount = 4,
}

export type AccountMetadata = {
    type: AccountType;
    address: Address;
    height: number;
    tesseract: Hex;
};

export interface AccountInfo {
    metadata: AccountMetadata;
}

interface MOIExecutionApi {
    "moi.Protocol": {
        params: [ResponseModifierParam];
        response: MoiClientInfo;
    };
    "moi.Confirmation": {
        params: [InteractionParam];
        response: Confirmation;
    };
    "moi.Tesseract": {
        params: [Required<TesseractReferenceParam>];
        response: Tesseract;
    };
    "moi.Interaction": {
        params: [InteractionParam & ResponseModifierParam];
        response: Interaction;
    };
    "moi.Account": {
        params: [option: AccountParam & TesseractReferenceParam & ResponseModifierParam];
        response: AccountInfo;
    };
    "moi.AccountKey": {
        params: [AccountParam & { key_id: number; pending?: boolean }];
        response: AccountKey;
    };
    "moi.AccountAsset": {
        params: [AccountParam & AssetParam & TesseractReferenceParam & IncludesParam<"moi.AccountAsset">];
        response: AccountAsset[];
    };
    "moi.Asset": {
        params: [AssetParam & TesseractReferenceParam];
        response: { asset_data: unknown };
    };
    "moi.Logic": {
        params: [LogicParam & TesseractReferenceParam];
        response: { logic_data: unknown };
    };
    "moi.LogicStorage": {
        params: [LogicParam & Partial<AccountParam> & TesseractReferenceParam & { storage_key: Hex }];
        response: Hex;
    };
    "moi.LogicEvents": {
        params: [];
        response: unknown;
    };
    "moi.Submit": {
        params: [ix: SignedInteraction];
        response: Hex;
    };
    "moi.Simulate": {
        params: [ix: Pick<SignedInteraction, "interaction">];
        response: Hex;
    };
    "moi.Subscribe": {
        params: unknown[];
        response: string;
    };
    "moi.Subscription": {
        params: [];
        response: unknown;
    };
    "moi.SyncStatus": {
        params: [{ include_pending_accounts?: boolean }];
        response: unknown;
    };
    "moi.Unsubscribe": {
        params: [];
        response: unknown;
    };
}

export type RpcMethod = keyof MOIExecutionApi;

export type RpcMethodParams<T> = T extends RpcMethod ? MOIExecutionApi[T]["params"] : unknown[];

export type RpcMethodResponse<T> = T extends RpcMethod ? MOIExecutionApi[T]["response"] : unknown;
