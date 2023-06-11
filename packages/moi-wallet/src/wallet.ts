import * as bip39 from "bip39";
import elliptic from "elliptic";
import { HDNode } from "moi-hdnode";
import { randomBytes } from "crypto";
import { Signer, SigType, InteractionObject } from "moi-signer";
import { AbstractProvider, InteractionRequest } from "moi-providers";
import { ErrorCode, ErrorUtils, bytesToHex, hexToUint8 } from "moi-utils";
import * as SigningKeyErrors from "./errors";
import { serializeIxObject } from "./serializer";

const SECP256K1 = "secp256k1"

const privateMapGet = (receiver: any, privateMap: any) => {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateGet()
    }
    const descriptor = privateMap.get(receiver);
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}

const privateMapSet = (receiver: any, privateMap: any, value: any) => {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateSet()
    }
    const descriptor = privateMap.get(receiver);
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        descriptor.value = value;
    }
    return value;
}

const __vault = new WeakMap();

export class Wallet extends Signer {
    constructor(provider?: AbstractProvider) {
        super(provider)
        __vault.set(this, {
            value: void 0
        })
    }

    public load(key: Buffer, mnemonic: string, curve: string) {
        try {
            let privKey: string, pubKey: string;
            if(!key) {
                ErrorUtils.throwError(
                    "Key is required, cannot be undefined", 
                    ErrorCode.INVALID_ARGUMENT
                );
            }

            const ecPrivKey = new elliptic.ec(SECP256K1);
            const keyInBytes = hexToUint8(key)
            const keyPair = ecPrivKey.keyFromPrivate(keyInBytes)
            privKey = keyPair.getPrivate("hex")
            pubKey = keyPair.getPublic(true, "hex")
            
            privateMapSet(this, __vault, {
                _key: privKey,
                _mnemonic: mnemonic,
                _public: pubKey,
                _curve: curve
            });
        } catch(err) {
            ErrorUtils.throwError(
                "Failed to load wallet",
                ErrorCode.UNKNOWN_ERROR,
                { originalError: err }
            );
        }
    }

    public async createRandom() {
        try {
            const _random16Bytes = randomBytes(16)
            var mnemonic = bip39.entropyToMnemonic(_random16Bytes, undefined);
            await this.fromMnemonic(mnemonic, undefined);
        } catch(err) {
            ErrorUtils.throwError(
                "Failed to create random mnemonic",
                ErrorCode.UNKNOWN_ERROR,
                { originalError: err }
            )
        }
    }
    
    public async fromMnemonic(mnemonic: string, path?: string, wordlist?: string[]) {
        mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
        try {
            const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
            const hdNode = new HDNode()
            hdNode.fromSeed(seed, path);
            this.load(hdNode.privateKey(), mnemonic, SECP256K1)
        } catch(err) {
            ErrorUtils.throwError(
                "Failed to load wallet from mnemonic",
                ErrorCode.UNKNOWN_ERROR,
                { originalError: err }
            )
        }
    }

    public privateKey() { return privateMapGet(this, __vault)._key }
    public mnemonic() { return privateMapGet(this, __vault)._mnemonic }
    public publicKey() { return privateMapGet(this, __vault)._public }
    public curve() { return privateMapGet(this, __vault)._curve }

    // Signer methods
    public getAddress(): string {
        return this.publicKey();
    }

    public connect(provider: AbstractProvider): Signer {
        return new Wallet(provider)
    }

    public sign(message: Uint8Array, sigAlgo: SigType): string {
        if(sigAlgo) {
            const privateKey = this.privateKey();
            if (!privateKey) {
                ErrorUtils.throwError(
                    "Private key not found. The wallet has not been loaded or initialized.",
                    ErrorCode.NOT_INITIALIZED
                )
            }

            switch(sigAlgo.sigName) {
                case "ECDSA_S256": {
                    const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                    const sigBytes = _sig.sign(Buffer.from(message), privateKey);
                    return sigBytes.serialize().toString('hex');
                }
                default: {
                    ErrorUtils.throwError(
                        "Unsupported signature type",
                        ErrorCode.UNSUPPORTED_OPERATION
                    )
                }
            }
        }

        ErrorUtils.throwError(
            "Signature type cannot be undefiend",
            ErrorCode.INVALID_ARGUMENT
        )
    }

    public signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest {
        try {
            const ixData = serializeIxObject(ixObject);
            const signature = this.sign(ixData, sigAlgo);
            return {
                ix_args: bytesToHex(ixData),
                signature: signature
            }
        } catch(err) {
            ErrorUtils.throwError(
                "Failed to sign interaction",
                ErrorCode.UNKNOWN_ERROR,
                { originalError: err }
            )
        }
    }
}
