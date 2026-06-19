import type { InteractionObject, InteractionRequest } from "js-moi-providers";
import { AssetStandard, type Hex, OpType } from "js-moi-utils";
import { CURVE, Wallet } from "../src.ts/index";

const MNEMONIC = "profit behave tribe dash diet stool crawl general country student smooth oxygen";
const DEVIATION_PATH = "m/44'/6174'/0'/0/1";
const PRIVATE_KEY = "879b415fc8ef34da94aa62a26345b20ea76f7cc9d5485fda428dfe2d6b6d158c";
const PUBLIC_KEY = "02870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b";
const IDENTIFIER_HEX = "0x00000000870ad6c5150ea8c0355316974873313004c6b9425a855a0600000000";

const SECOND_PRIVATE_KEY = "7192a99ce478365f32e0a29c6c82f3b29d710ec908f42685737cf24a2472d623";
const SECOND_PUBLIC_KEY = "026a6a1e3c1832f886861af9b1a83767bbbe16cdffd4de1cb28c37897f30ee45a2";

const SIGNED_MESSAGE = "0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402";

const IX_ARGS = "0e9f020ee604e308f30880098e09ee10e015e0155f068304830400000000870ad6c5150ea8c0355316974873313004c6b9425a855a0600000000000000000000000000000000000000000000000000000000000000000000000001c81f0e2f0316040eef01063333333236b304de04ee04f00453494700000000870ad6c5150ea8c0355316974873313004c6b9425a855a06000000004e200f0f1f0e5f068304810400000000870ad6c5150ea8c0355316974873313004c6b9425a855a0600000000";
const SINGLE_SIG = "0e1f0e5f068304860400000000870ad6c5150ea8c0355316974873313004c6b9425a855a0600000000014630440220171d44baf8ac1295317feb237024fbc445d82e7a0afd32794fea81750c2b396202203ed06837726ca7de6bd48585124a0e1e78a3b0cdedfd8e9f55df462a60aa682602";
const MULTI_SIG = "0e3f0efe0d5f068304860400000000870ad6c5150ea8c0355316974873313004c6b9425a855a0600000000014630440220171d44baf8ac1295317feb237024fbc445d82e7a0afd32794fea81750c2b396202203ed06837726ca7de6bd48585124a0e1e78a3b0cdedfd8e9f55df462a60aa6826025f068304960400000000870ad6c5150ea8c0355316974873313004c6b9425a855a06000000000101473045022100b2abe9c9b7fb80e6d8cd9bbae9d26cd71dae50243dd12a462be3f835fba7a674022029ad3b1de7be711c9ffb4eb7b932704455fd9ea2721b85360cc7fffc43fcb93902";

const makeAssetCreateOp = (managerId: Hex) => ({
    type: OpType.ASSET_CREATE,
    payload: {
        standard: AssetStandard.MAS0,
        symbol: "SIG",
        max_supply: 20000,
        dimension: 0,
        enable_events: true,
        manager: managerId,
    },
});

describe("Wallet", () => {
    describe("Static factories", () => {
        test("fromMnemonic creates a wallet with the correct keys", async () => {
            const wallet = await Wallet.fromMnemonic(MNEMONIC, DEVIATION_PATH);

            expect(wallet.isInitialized()).toBe(true);
            expect(wallet.privateKey).toBe(PRIVATE_KEY);
            expect(wallet.publicKey).toBe(PUBLIC_KEY);
            expect(wallet.mnemonic).toBe(MNEMONIC);
            expect(wallet.curve).toBe(CURVE.SECP256K1);
            expect((await wallet.identifier).toHex()).toBe(IDENTIFIER_HEX);
        });

        test("fromMnemonicSync creates a wallet with the correct keys", () => {
            const wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);

            expect(wallet.isInitialized()).toBe(true);
            expect(wallet.privateKey).toBe(PRIVATE_KEY);
            expect(wallet.publicKey).toBe(PUBLIC_KEY);
            expect(wallet.mnemonic).toBe(MNEMONIC);
            expect(wallet.curve).toBe(CURVE.SECP256K1);
        });

        test("fromMnemonic uses the default MOI derivation path when none is provided", async () => {
            const withDefault = await Wallet.fromMnemonic(MNEMONIC);
            const withExplicit = await Wallet.fromMnemonic(MNEMONIC, "m/44'/6174'/0'/0/0");

            expect(withDefault.privateKey).toBe(withExplicit.privateKey);
        });

        test("createRandom generates a valid 12-word mnemonic wallet", async () => {
            const wallet = await Wallet.createRandom();

            expect(wallet.isInitialized()).toBe(true);
            expect(wallet.mnemonic.split(" ")).toHaveLength(12);
            expect(wallet.privateKey).toBeDefined();
            expect(wallet.curve).toBe(CURVE.SECP256K1);
        });

        test("createRandomSync generates a valid 12-word mnemonic wallet", () => {
            const wallet = Wallet.createRandomSync();

            expect(wallet.isInitialized()).toBe(true);
            expect(wallet.mnemonic.split(" ")).toHaveLength(12);
            expect(wallet.privateKey).toBeDefined();
            expect(wallet.curve).toBe(CURVE.SECP256K1);
        });

        test("deriveKeys returns the correct key pair from a private key buffer", () => {
            const { privKey, pubKey } = Wallet.deriveKeys(Buffer.from(PRIVATE_KEY, "hex"));

            expect(privKey).toBe(PRIVATE_KEY);
            expect(pubKey).toBe(PUBLIC_KEY);
        });

        test("deriveAccountKey derives the correct key pair from a mnemonic", async () => {
            const { privKey, pubKey } = await Wallet.deriveAccountKey(MNEMONIC, DEVIATION_PATH);

            expect(privKey).toBe(PRIVATE_KEY);
            expect(pubKey).toBe(PUBLIC_KEY);
        });

        test("deriveAccountKey uses the default derivation path when none is provided", async () => {
            const withDefault = await Wallet.deriveAccountKey(MNEMONIC);
            const withExplicit = await Wallet.deriveAccountKey(MNEMONIC, "m/44'/6174'/0'/0/0");

            expect(withDefault.privKey).toBe(withExplicit.privKey);
        });
    });

    describe("Key properties and getters", () => {
        let wallet: Wallet;

        beforeEach(() => {
            wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
        });

        test("privateKey returns the sender key's private key", () => {
            expect(wallet.privateKey).toBe(PRIVATE_KEY);
        });

        test("publicKey returns the sender key's compressed public key", () => {
            expect(wallet.publicKey).toBe(PUBLIC_KEY);
        });

        test("getPublicKey returns the same compressed public key as a Hex string", () => {
            expect(wallet.getPublicKey()).toBe(PUBLIC_KEY);
        });

        test("curve returns the elliptic curve name", () => {
            expect(wallet.curve).toBe(CURVE.SECP256K1);
        });

        test("mnemonic returns the seed phrase", () => {
            expect(wallet.mnemonic).toBe(MNEMONIC);
        });

        test("isInitialized returns true for a loaded wallet", () => {
            expect(wallet.isInitialized()).toBe(true);
        });

        test("identifier resolves to the participant ID derived from the primary public key", async () => {
            const id = await wallet.identifier;
            expect(id.toHex()).toBe(IDENTIFIER_HEX);
        });

        test("getIdentifier returns the same identifier as the identifier property", async () => {
            const fromProp = await wallet.identifier;
            const fromMethod = await wallet.getIdentifier();
            expect(fromProp.toHex()).toBe(fromMethod.toHex());
        });

        test("keyId resolves to the sender key index (0 by default)", async () => {
            expect(await wallet.keyId).toBe(0);
        });

        test("getKeyId returns the same key ID as the keyId property", async () => {
            expect(await wallet.getKeyId()).toBe(0);
        });

        test("subAccountId returns 0 by default", () => {
            expect(wallet.subAccountId).toBe(0);
        });

        test("getSubAccountId returns 0 by default", () => {
            expect(wallet.getSubAccountId()).toBe(0);
        });
    });

    describe("Sub-account management", () => {
        let wallet: Wallet;

        beforeEach(() => {
            wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
        });

        test("setSubAccountId updates the sub-account index", () => {
            wallet.setSubAccountId(3);
            expect(wallet.subAccountId).toBe(3);
        });

        test("identifier reflects the updated sub-account variant after setSubAccountId", async () => {
            const beforeId = (await wallet.identifier).toHex();
            wallet.setSubAccountId(1);
            const afterId = (await wallet.identifier).toHex();

            expect(afterId).not.toBe(beforeId);
            expect(afterId).toBe("0x00000000870ad6c5150ea8c0355316974873313004c6b9425a855a0600000001");
        });
    });

    describe("Multi-key management", () => {
        let wallet: Wallet;

        beforeEach(() => {
            wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
        });

        test("getKeys returns only the primary key before any addKey calls", () => {
            expect(wallet.getKeys()).toEqual([{ key_id: 0, public_key: PUBLIC_KEY }]);
        });

        test("addKey registers an additional key and returns the wallet for chaining", () => {
            const result = wallet.addKey(1, SECOND_PUBLIC_KEY, SECOND_PRIVATE_KEY);

            expect(result).toBe(wallet);
            expect(wallet.getKeys()).toHaveLength(2);
            expect(wallet.getKeys()).toContainEqual({ key_id: 1, public_key: SECOND_PUBLIC_KEY });
        });

        test("removeKey removes a non-sender key and returns the wallet for chaining", () => {
            wallet.addKey(1, SECOND_PUBLIC_KEY, SECOND_PRIVATE_KEY);
            const result = wallet.removeKey(1);

            expect(result).toBe(wallet);
            expect(wallet.getKeys()).toHaveLength(1);
            expect(wallet.getKeys()).not.toContainEqual({ key_id: 1, public_key: SECOND_PUBLIC_KEY });
        });

        test("removeKey throws when attempting to remove the current sender key", () => {
            expect(() => wallet.removeKey(0)).toThrow("Cannot remove the sender key");
        });

        test("setKeyId switches the active sender key to an already-registered key", () => {
            wallet.addKey(1, SECOND_PUBLIC_KEY, SECOND_PRIVATE_KEY);
            wallet.setKeyId(1);

            expect(wallet.publicKey).toBe(SECOND_PUBLIC_KEY);
            expect(wallet.privateKey).toBe(SECOND_PRIVATE_KEY);
        });

        test("setKeyId throws when the key ID is not registered", () => {
            expect(() => wallet.setKeyId(99)).toThrow("Key 99 is not registered");
        });
    });

    describe("Signing", () => {
        let wallet: Wallet;
        const message = "Hello, MOI";

        beforeEach(() => {
            wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
        });

        test("sign produces a deterministic ECDSA signature", async () => {
            const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];
            const keyId = await wallet.getKeyId();
            const signature = await wallet.sign(Buffer.from(message), keyId, algo);

            expect(signature).toBe(SIGNED_MESSAGE);
        });

        test("verify returns true for a valid signature", () => {
            expect(wallet.verify(Buffer.from(message), SIGNED_MESSAGE, wallet.publicKey)).toBe(true);
        });

        test("verify returns false for a tampered message", () => {
            expect(wallet.verify(Buffer.from("wrong message"), SIGNED_MESSAGE, wallet.publicKey)).toBe(false);
        });

        test("verify returns false for a wrong public key", async () => {
            const other = await Wallet.createRandom();
            expect(wallet.verify(Buffer.from(message), SIGNED_MESSAGE, other.publicKey)).toBe(false);
        });

        test("verify returns false for a malformed signature", () => {
            const garbage = SIGNED_MESSAGE.slice(0, -2) + "ff";
            expect(wallet.verify(Buffer.from(message), garbage, wallet.publicKey)).toBe(false);
        });
    });

    describe("signInteraction", () => {
        let wallet: Wallet;

        beforeEach(() => {
            wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
        });

        const buildIxObject = (managerId: Hex, keyId: number): InteractionObject => ({
            sender: { id: managerId, sequence: 0, key_id: keyId },
            fuel_price: 1,
            fuel_limit: 200,
            ix_operations: [makeAssetCreateOp(managerId)] as InteractionObject["ix_operations"],
        });

        test("produces a valid InteractionRequest with a single key", async () => {
            const id = await wallet.identifier;
            const keyId = await wallet.getKeyId();
            const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

            const result = await wallet.signInteraction(buildIxObject(id.toHex(), keyId), algo);

            expect(result).toMatchObject<InteractionRequest>({
                ix_args: expect.any(String),
                signatures: expect.any(String),
            });
            expect(result.ix_args).toBe(IX_ARGS);
            expect(result.signatures).toBe(SINGLE_SIG);
        });

        test("produces signatures from all registered keys when multiple keys are added", async () => {
            wallet.addKey(1, SECOND_PUBLIC_KEY, SECOND_PRIVATE_KEY);
            const id = await wallet.identifier;
            const keyId = await wallet.getKeyId();
            const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

            const result = await wallet.signInteraction(buildIxObject(id.toHex(), keyId), algo);

            expect(result.ix_args).toBe(IX_ARGS);
            expect(result.signatures).toBe(MULTI_SIG);
        });

        test("throws when the sender key_id is not registered on the wallet", async () => {
            const id = await wallet.identifier;
            const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

            await expect(
                wallet.signInteraction(buildIxObject(id.toHex(), 99), algo)
            ).rejects.toThrow();
        });
    });

    describe("connect", () => {
        test("attaches a provider to the wallet", async () => {
            const { VoyageProvider } = await import("js-moi-providers");
            const wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
            const provider = new VoyageProvider("devnet");

            wallet.connect(provider);

            expect(wallet.provider).toBe(provider);
        });
    });
});
