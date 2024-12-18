import type { Hex, OpType } from "js-moi-utils";
import type { AccountParam, AssetParam, IncludesParam, InteractionParam, LogicParam, MoiClientInfo, SignedInteraction, TesseractReferenceParam } from "./shared";

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

interface Participant {
    address: Hex;
    height: number;
    lock: string;
    notary: boolean;
    transition: Hex;
    state: Hex;
    context: ParticipantContext;
}

interface Account {
    address: Hex;
    sequence: number;
    key_id: number;
}

interface Interaction {
    hash: Hex;
    sender: Account;
    payer: Account;
    fuel_limit: number;
    fuel_tip: number;
    tesseract: {
        hash: Hex;
        index: number;
    };
    participants: Participant[];
    operations: {
        string: OpType;
        payload: unknown[];
    }[];
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

interface Confirmations {
    hash: Hex;
    status: string;
    sender: Hex;
    fuel_used: number;
    tesseract: {
        hash: Hex;
        index: number;
    };
    operations: {
        string: OpType;
        status: string;
        payload: unknown[];
    }[];
}

interface Tesseract {
    hash: Hex;
    header: TesseractHeader;
    consensus?: Consensus;
    interactions: Interaction[];
    confirmations: Confirmations[];
}

interface MOIExecutionApi {
    "moi.Version": {
        params: [];
        response: MoiClientInfo;
    };
    "moi.Tesseract": {
        params: [Required<TesseractReferenceParam> & IncludesParam<"moi.Tesseract">];
        response: unknown;
    };
    "moi.Interaction": {
        params: [InteractionParam];
        response: { ix_data: unknown };
    };
    "moi.Account": {
        params: [AccountParam & TesseractReferenceParam & IncludesParam<"moi.Account">];
        response: { account_data: unknown };
    };
    "moi.AccountKey": {
        params: [AccountParam & { key_id: number; pending?: boolean }];
        response: { key_data: unknown };
    };
    "moi.AccountAsset": {
        params: [AccountParam & AssetParam & TesseractReferenceParam & IncludesParam<"moi.AccountAsset">];
        response: { asset_data: unknown };
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
