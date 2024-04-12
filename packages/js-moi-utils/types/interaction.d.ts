import { IxType } from "../src.ts/interaction";

export interface ContextDelta {
    role: number;
    behavioural_nodes: string[] | null;
    random_nodes: string[] | null;
    replaced_nodes: string[] | null;
}

export interface Participant {
    address: string;
    height: string;
    transitive_link: string;
    prev_context: string;
    latest_context: string;
    context_delta: ContextDelta;
    state_hash: string;
}

export type Participants = Participant[];


export interface Interaction {
    type: IxType;
    nonce: string;
    
    sender: string;
    receiver: string;
    payer: string;

    transfer_values: Map<string, string>;
    perceived_values: Map<string, string>;
    perceived_proofs: string;

    fuel_price: string;
    fuel_limit: string;

    payload: unknown;

    mode: string;
    compute_hash: string;
    compute_nodes: string[];

    mtq: string;
    trust_nodes: string[];
    
    hash: string;
    signature: string;

    ts_hash: string;
    participants: Participants;
    ix_index: string;
}

export type Interactions = Interaction[];
