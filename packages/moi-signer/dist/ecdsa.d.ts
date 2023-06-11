/// <reference types="node" />
import { SigType } from "../types";
import Signature from "./signature";
/**
 * ECDSA_S256
 *
 * Represents the ECDSA_S256 signature type.
 */
export default class ECDSA_S256 implements SigType {
    prefix: number;
    sigName: string;
    constructor();
    /**
     * sign
     *
     * Signs a message using the ECDSA_S256 signature algorithm.
     *
     * @param message - The message to be signed, as a Buffer.
     * @param signingKey - The private key used for signing, either as
     * a hexadecimal string or a Buffer.
     * @returns A Signature object representing the signed message.
     */
    sign(message: Buffer, signingKey: Buffer | string): Signature;
    /**
     * verify
     *
     * Verifies the signature of a message using the ECDSA_S256 signature algorithm.
     *
     * @param message - The message to be verified, as a Buffer.
     * @param signature - The signature to be verified, as a Signature instance.
     * @param publicKey - The public key used for verification, as a Buffer.
     * @returns A boolean indicating whether the signature is valid.
     */
    verify(message: Buffer, signature: Signature, publicKey: Buffer): boolean;
}
