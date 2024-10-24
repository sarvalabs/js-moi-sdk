import { Buffer } from "buffer";
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
     * @returns A Signature instance with ECDSA_S256 prefix and parity byte as extra data
     */
    sign(message: Buffer, signingKey: Buffer | string): Signature;
    /**
     * verify
     *
     * Verifies the ECDSA signature with the given secp256k1 publicKey
     *
     * @param message the message being signed
     * @param signature the Signature instance with parity byte
     * as extra data to determine the public key's X & Y co-ordinates
     * having same or different sign
     * @param publicKey the compressed public key
     * @returns boolean, to determine whether verification is success/failure
     */
    verify(message: Uint8Array, signature: Signature, publicKey: Uint8Array): boolean;
}
//# sourceMappingURL=ecdsa.d.ts.map