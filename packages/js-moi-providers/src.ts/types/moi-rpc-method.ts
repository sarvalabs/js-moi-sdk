import { Hex, OpType } from "js-moi-utils";
import type { AccountParam, AssetParam, IncludesParam, InteractionParam, LogicParam, MoiClientInfo, SignedInteraction, TesseractReferenceParam } from "./shared";

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

export interface Participant {
    address: Hex;
    height: number;
    lock: string;
    notary: boolean;
    transition: Hex;
    state: Hex;
    context: ParticipantContext;
}

interface ParticipantCreatePayload {
    address: Hex;
    amount: number;
    keys: unknown[];
}

interface AssetCreatePayload {
    symbol: string;
    standard: number;
    supply: number;
    logic: unknown;
}

type OperationPayload<T extends OpType> = T extends OpType.PARTICIPANT_CREATE ? ParticipantCreatePayload : T extends OpType.ASSET_CREATE ? AssetCreatePayload : never;

export interface Operation<TOpType extends OpType> {
    type: TOpType;
    payload: OperationPayload<TOpType>;
}

export type IxOperation = Operation<OpType.PARTICIPANT_CREATE> | Operation<OpType.ASSET_CREATE>;

interface InteractionShared {
    sender: Account;
    payer: Account;
    fuel_limit: number;
    fuel_tip: number;
    operations: IxOperation[];
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

export interface InteractionRequest extends InteractionShared {
    funds: Fund[];
    participants: Pick<Participant, "address" | "lock" | "notary">[];
    preferences: InteractionPreference;
    perception: Hex;
}

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

interface MOIExecutionApi {
    "moi.Version": {
        params: [];
        response: MoiClientInfo;
    };
    "moi.Confirmation": {
        params: [InteractionParam];
        response: Confirmation;
    };
    "moi.Tesseract": {
        params: [Required<TesseractReferenceParam> & IncludesParam<"moi.Tesseract">];
        response: Tesseract;
    };
    "moi.Interaction": {
        params: [InteractionParam];
        response: Interaction;
    };
    "moi.Account": {
        params: [AccountParam & TesseractReferenceParam & IncludesParam<"moi.Account">];
        response: { account_data: unknown };
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
