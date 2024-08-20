import { Buffer } from "buffer";
import { TxType } from "js-moi-utils";

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

interface IxxAssetFund {
    asset_id: string;
    amount: number;
}

interface IxxPreferences {
    compute: Uint8Array;
    consensus: Uint8Array;
}

interface IxxStep {
    type: TxType
    payload: Uint8Array
}

interface IxxParticipant {
    address: Uint8Array;
    lock_type: number;
}

export interface ProcessedIxObject {
    nonce?: number | bigint;

    sender?: Uint8Array;
    payer?: Uint8Array;

    fuel_price?: number | bigint;
    fuel_limit?: number | bigint;
    
    asset_funds: IxxAssetFund[]
    transactions: IxxStep[]
    participants: IxxParticipant[]

    perception?: Uint8Array

    preferences?: IxxPreferences
}
