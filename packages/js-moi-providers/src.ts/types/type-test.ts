import type { Hex, OpType } from "js-moi-utils";

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

interface Participant {
    address: Hex;
    height: number;
    lock: string;
    notary: boolean;
    transition: Hex;
    state: Hex;
    context: ParticipantContext;
}

interface Operation {
    type: OpType;
    payload: unknown;
}

interface InteractionShared {
    sender: Account;
    payer: Account;
    fuel_limit: number;
    fuel_tip: number;
    operations: Operation[];
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

interface InteractionRequest extends InteractionShared {
    funds: Fund[];
    participants: Pick<Participant, "address" | "lock" | "notary">[];
    preferences: InteractionPreference;
    perception: Hex;
}

interface InteractionTesseract {
    hash: Hex;
    index: number;
}

interface Interaction extends InteractionShared {
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

interface OperationPayload {
    type: OpType;
    status: string;
    payload: unknown[];
}

interface Confirmations {
    hash: Hex;
    status: string;
    sender: Hex;
    fuel_used: number;
    tesseract: InteractionTesseract;
    operations: OperationPayload[];
}

interface Tesseract {
    hash: Hex;
    header: TesseractHeader;
    consensus?: Consensus;
    interactions: Interaction[];
    confirmations: Confirmations[];
}

interface AccountKey {
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

interface AccountAsset {
    asset_id: Hex;
    balance: number;
    mandates: Mandate[];
    deposits: Deposit[];
}
