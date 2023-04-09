export interface IxInput {
    IxType: number;
    Nonce: bigint;
    Sender: string;
    Receiver: string;
    Payer: string;
    TransferValues: Map<string, bigint>;
    PerceivedValues: Map<string, bigint>;
    PerceivedProofs: string;
    FuelLimit: bigint;
    FuelPrice: bigint;
    Payload: unknown;
}

export interface IxCompute {
    Mode: number | bigint;
    Hash: string;
    Nodes: string[];
}

export interface IxTrust {
    MTQ: number | bigint;
    Nodes: string[];
}

export interface Interaction {
    Input: IxInput;
    Compute: IxCompute;
    Trust: IxTrust;
    Hash: string;
    Signature: string;
}

export type Interactions = Interaction[];
