export interface IxInput {
    type: number;
    nonce: bigint;
    sender: string;
    receiver: string;
    payer: string;
    transfer_values: Map<string, bigint>;
    perceived_values: Map<string, bigint>;
    perceived_proofs: string;
    fuel_limit: bigint;
    fuel_price: bigint;
    payload: unknown;
}

export interface IxCompute {
    mode: number | bigint;
    hash: string;
    compute_nodes: string[];
}

export interface IxTrust {
    mtq: number | bigint;
    trust_nodes: string[];
}

export interface Interaction {
    input: IxInput;
    compute: IxCompute;
    trust: IxTrust;
    hash: string;
    signature: string;
}

export type Interactions = Interaction[];
