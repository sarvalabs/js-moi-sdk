import { TesseractPart } from "./common";

export interface Interaction {
    type: number;
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

    parts: TesseractPart[];
    ix_index: string;
}

export type Interactions = Interaction[];
