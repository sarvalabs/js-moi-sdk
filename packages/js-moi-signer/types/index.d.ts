import { Buffer } from "buffer";
import { AssetStandard, IxType } from "js-moi-utils";

export interface ISignature {
    Digest(): Uint8Array;
    
    Extra(): Uint8Array;

    getName(): string;

    getSigByte(): number

    serialize(): Uint8Array;

    unmarshall(signature: Uint8Array | String): void
}

export interface SigType {
    prefix: number;
    sigName: String;
    sign(message: Buffer, signingKey: string | Buffer): ISignature
    verify(message: Uint8Array, signature: ISignature, publicKey: Uint8Array): boolean
}

export interface ECDSA_S256 extends SigType {}

export interface SigningAlgorithms {
    ecdsa_secp256k1: ECDSA_S256
}

export interface AssetCreatePayload {
    symbol: string;
    supply: number | bigint;
    standard?: AssetStandard;
    dimension?: number;
    is_stateful?: boolean;
    is_logical?: boolean;
    logic_payload?: LogicPayload;
}

export interface AssetMintOrBurnPayload {
    asset_id: string;
    amount: number | bigint;
}

export interface LogicPayload {
    logic_id?: string;
    callsite: string;
    calldata: Uint8Array;
    manifest?: Uint8Array;
}

export type InteractionPayload = AssetCreatePayload | AssetMintOrBurnPayload | LogicPayload;

export interface InteractionObject {
    type: IxType;
    nonce?: number | bigint;

    sender?: string;
    receiver?: string;
    payer?: string;

    transfer_values?: Map<string, number | bigint>;
    perceived_values?: Map<string, number | bigint>;

    fuel_price: number | bigint;
    fuel_limit: number | bigint;
    
    payload?: InteractionPayload;
}

export interface ProcessedIxObject {
    type: IxType;
    nonce?: number | bigint;

    sender: Uint8Array;
    receiver: Uint8Array;
    payer: Uint8Array;

    transfer_values?: Map<string, number | bigint>;
    perceived_values?: Map<string, number | bigint>;

    fuel_price: number | bigint;
    fuel_limit: number | bigint;
    
    payload?: InteractionPayload;
}
