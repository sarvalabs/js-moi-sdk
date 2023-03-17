/*
    This module/directory is responsible for 
    handling wallet
*/

import * as bip39 from 'bip39';
import elliptic from 'elliptic';
import { BIP32Factory } from 'bip32';
import { randomBytes } from 'crypto';
import * as ecc from 'tiny-secp256k1';
import * as schnorrkel from "@parity/schnorrkel-js";

/* Internal imports */
import { 
    MOI_DEFAULT_PATH, 
} from 'moi-utils/src/constants';
import { 
    bytesToUint8, 
    uint8ToHex, 
    hexToUint8  
} from "moi-utils";

import * as Types from "../types/index";
import * as SigningKeyErrors from "./errors";


const bip32 = BIP32Factory(ecc);

function _privateMapGet(receiver: any, privateMap: any) {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateGet()
    }
    var descriptor = privateMap.get(receiver);
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}

function _privateMapSet(receiver: any, privateMap: any, value: any) {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateSet()
    }
    var descriptor = privateMap.get(receiver);
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        descriptor.value = value;
    }
    return value;
}

let __vault = new WeakMap();
class Wallet {
    constructor() {
        __vault.set(this, {
            value: void 0
        })
    }

    load(key: Buffer | undefined, mnemonic: string | undefined, curve: string) {
        let privKey, pubKey;
        if(!key) {
            throw new Error("key cannot be undefined")
        }
        switch(curve) {
            case Types.SR25519: {
                const uint8Key = bytesToUint8(key)
                let kp = schnorrkel.keypair_from_seed(uint8Key)
                privKey = uint8ToHex(kp.slice(0, 64))
                pubKey = uint8ToHex(kp.slice(64, 96))
                break;
            }
            case Types.SECP256K1: {
                const ecPrivKey = new elliptic.ec(Types.SECP256K1);
                let keyInBytes = hexToUint8(key)
                const keyPair = ecPrivKey.keyFromPrivate(keyInBytes)
                privKey = keyPair.getPrivate("hex")
                pubKey = keyPair.getPublic(true, "hex")
                break;
            }
            default: {
                throw new Error("un-supported curve")
            }
        }
        
        _privateMapSet(this, __vault, {
            _key: privKey,
            _mnemonic: mnemonic,
            _public: pubKey,
            _curve: curve
        });
    }

    async createRandom() {
        try {
            const _random16Bytes = randomBytes(16)
            var mnemonic = bip39.entropyToMnemonic(_random16Bytes, undefined);
            await this.fromMnemonic(mnemonic, undefined);
        }catch(e: any) {
            throw new Error(e.message);
        }
    }
    
    async fromMnemonic(mnemonic: string, wordlist: undefined) {
        mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
        try {
            const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
            const masterHdNode = bip32.fromSeed(seed, undefined);
            const derviedExtendedKey = masterHdNode.derivePath(MOI_DEFAULT_PATH)
            this.load(derviedExtendedKey.privateKey, mnemonic, Types.SR25519)
        }catch(e: any) {
            throw new Error(e.message);
        }
    }

    privateKey() { return _privateMapGet(this, __vault)._key }
    mnemonic() { return _privateMapGet(this, __vault)._mnemonic }
    publicKey() { return _privateMapGet(this, __vault)._public }
    curve() { return _privateMapGet(this, __vault)._curve }
}

export default Wallet;
