import { Buffer } from "buffer";
import { OpType } from "js-moi-utils";

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

interface ProcessedIxAssetFund {
    asset_id: string;
    amount: number;
}

interface ProcessedIxPreferences {
    compute: Uint8Array;
    consensus: Uint8Array;
}

interface ProcessedIxOperation {
    type: OpType
    payload: Uint8Array
}

interface ProcessedIxParticipant {
    address: Uint8Array;
    lock_type: number;
}

interface ProcessedIxObject {
    nonce?: number | bigint;

    sender?: Uint8Array;
    payer?: Uint8Array;

    fuel_price?: number | bigint;
    fuel_limit?: number | bigint;
    
    funds: ProcessedIxAssetFund[]
    ix_operations: ProcessedIxOperation[]
    participants: ProcessedIxParticipant[]

    perception?: Uint8Array

    preferences?: ProcessedIxPreferences
}
