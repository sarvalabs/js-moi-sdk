import { Buffer } from "buffer";
import { IxType } from "js-moi-utils";
import { InteractionPayload } from "js-moi-providers";
import Signature from "../src/signature";
import ECDSA_S256 from "../src/ecdsa";

export interface SigType {
    prefix: number;
    sigName: String;
    sign(message: Buffer, signingKey: string | Buffer): Signature
    verify(message: Uint8Array, signature: Signature, publicKey: Uint8Array): boolean
}

export interface SigningAlgorithms {
    ecdsa_secp256k1: ECDSA_S256
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
