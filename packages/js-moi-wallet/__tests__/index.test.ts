import type { InteractionObject, InteractionRequest } from "js-moi-providers";
import { validatePayerSignature } from "js-moi-providers";
import {
  DEFAULT_FUEL_LIMIT,
  DEFAULT_FUEL_PRICE,
  ZERO_ADDRESS,
} from "js-moi-constants";
import { deriveAssetId, deriveLogicId } from "js-moi-identifiers";
import {
  AssetStandard,
  bytesToHex,
  hexToBytes,
  type Hex,
  ixSignaturesSchema,
  OpType,
  withHexPrefix,
} from "js-moi-utils";
import { Depolorizer } from "js-polo";
import { addSignature, CURVE, Wallet } from "../src.ts/index";
import type { Keystore } from "../types/keystore";

const MNEMONIC =
  "profit behave tribe dash diet stool crawl general country student smooth oxygen";
const DEVIATION_PATH = "m/44'/6174'/0'/0/1";
const PRIVATE_KEY =
  "879b415fc8ef34da94aa62a26345b20ea76f7cc9d5485fda428dfe2d6b6d158c";
const PUBLIC_KEY =
  "02870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b";
const IDENTIFIER_HEX =
  "0x00000000870ad6c5150ea8c0355316974873313004c6b9425a855a0600000000";

const SECOND_PRIVATE_KEY =
  "7192a99ce478365f32e0a29c6c82f3b29d710ec908f42685737cf24a2472d623";
const SECOND_PUBLIC_KEY =
  "026a6a1e3c1832f886861af9b1a83767bbbe16cdffd4de1cb28c37897f30ee45a2";

const SIGNED_MESSAGE =
  "0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402";

const IX_ARGS =
  "0e9f020ee604e308f30880098e09ee10f010f0105f068304830400000000870ad6c5150ea8c0355316974873313004c6b9425a855a0600000000000000000000000000000000000000000000000000000000000000000000000001c81f0e2f0316040eef01063333333236b304de04ee04f00453494700000000870ad6c5150ea8c0355316974873313004c6b9425a855a06000000004e200f0f0f";
const SINGLE_SIG =
  "0e1f0e5f068304860400000000870ad6c5150ea8c0355316974873313004c6b9425a855a06000000000146304402200376116d0cb4932cea3559339456b747c07f2a59365a9228f0645d89e7554e87022000cdb9a004a1e118c6d9b7565057e7135f04f41501e8f4fc3f1f629c3afd8c7902";
const MULTI_SIG =
  "0e3f0efe0d5f068304860400000000870ad6c5150ea8c0355316974873313004c6b9425a855a06000000000146304402200376116d0cb4932cea3559339456b747c07f2a59365a9228f0645d89e7554e87022000cdb9a004a1e118c6d9b7565057e7135f04f41501e8f4fc3f1f629c3afd8c79025f068304960400000000870ad6c5150ea8c0355316974873313004c6b9425a855a060000000001014630440220705bc3d410e767a84b2def04756049ba40aff1b6b3630fff5620a09533abad5302202e8a072ceb1e9e9947fa5b0d08403796b5a29144ea39dc63f31b5728617efdc702";

const PAYER_PATH = "m/44'/6174'/1'/0/0";
const PAYER_SECOND_PATH = "m/44'/6174'/1'/0/2";

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

const buildIxObject = (
  managerId: Hex,
  keyId: number,
  payer?: Hex,
): InteractionObject => ({
  sender: { id: managerId, sequence: 0, key_id: keyId },
  fuel_price: DEFAULT_FUEL_PRICE,
  fuel_limit: DEFAULT_FUEL_LIMIT,
  ix_operations: [
    makeAssetCreateOp(managerId),
  ] as InteractionObject["ix_operations"],
  ...(payer !== undefined ? { payer } : {}),
});

const decodeSignatures = (signaturesHex: string) =>
  new Depolorizer(hexToBytes(signaturesHex)).depolorize(
    ixSignaturesSchema,
  ) as Array<{
    id: Uint8Array;
    key_id: number;
    signature: Uint8Array;
  }>;

const makeMockProvider = () => ({
  sendInteraction: jest.fn().mockResolvedValue({
    hash: "0xabc",
    wait: jest.fn().mockResolvedValue({ status: true }),
    result: jest.fn(),
  }),
  getPendingInteractionCount: jest.fn().mockResolvedValue(0),
  getInteractionCount: jest.fn().mockResolvedValue(0),
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
      const withExplicit = await Wallet.fromMnemonic(
        MNEMONIC,
        "m/44'/6174'/0'/0/0",
      );

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
      const { privKey, pubKey } = Wallet.deriveKeys(
        Buffer.from(PRIVATE_KEY, "hex"),
      );

      expect(privKey).toBe(PRIVATE_KEY);
      expect(pubKey).toBe(PUBLIC_KEY);
    });

    test("deriveAccountKey derives the correct key pair from a mnemonic", async () => {
      const { privKey, pubKey } = await Wallet.deriveAccountKey(
        MNEMONIC,
        DEVIATION_PATH,
      );

      expect(privKey).toBe(PRIVATE_KEY);
      expect(pubKey).toBe(PUBLIC_KEY);
    });

    test("deriveAccountKey uses the default derivation path when none is provided", async () => {
      const withDefault = await Wallet.deriveAccountKey(MNEMONIC);
      const withExplicit = await Wallet.deriveAccountKey(
        MNEMONIC,
        "m/44'/6174'/0'/0/0",
      );

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
      expect(afterId).toBe(
        "0x00000000870ad6c5150ea8c0355316974873313004c6b9425a855a0600000001",
      );
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
      expect(wallet.getKeys()).toContainEqual({
        key_id: 1,
        public_key: SECOND_PUBLIC_KEY,
      });
    });

    test("removeKey removes a non-sender key and returns the wallet for chaining", () => {
      wallet.addKey(1, SECOND_PUBLIC_KEY, SECOND_PRIVATE_KEY);
      const result = wallet.removeKey(1);

      expect(result).toBe(wallet);
      expect(wallet.getKeys()).toHaveLength(1);
      expect(wallet.getKeys()).not.toContainEqual({
        key_id: 1,
        public_key: SECOND_PUBLIC_KEY,
      });
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
      expect(
        wallet.verify(Buffer.from(message), SIGNED_MESSAGE, wallet.publicKey),
      ).toBe(true);
    });

    test("verify returns false for a tampered message", () => {
      expect(
        wallet.verify(
          Buffer.from("wrong message"),
          SIGNED_MESSAGE,
          wallet.publicKey,
        ),
      ).toBe(false);
    });

    test("verify returns false for a wrong public key", async () => {
      const other = await Wallet.createRandom();
      expect(
        wallet.verify(Buffer.from(message), SIGNED_MESSAGE, other.publicKey),
      ).toBe(false);
    });

    test("verify returns false for a malformed signature", () => {
      const garbage = SIGNED_MESSAGE.slice(0, -2) + "ff";
      expect(
        wallet.verify(Buffer.from(message), garbage, wallet.publicKey),
      ).toBe(false);
    });
  });

  describe("signInteraction", () => {
    let wallet: Wallet;

    beforeEach(() => {
      wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
    });

    const buildIxObject = (
      managerId: Hex,
      keyId: number,
    ): InteractionObject => ({
      sender: { id: managerId, sequence: 0, key_id: keyId },
      fuel_price: 1,
      fuel_limit: 200,
      ix_operations: [
        makeAssetCreateOp(managerId),
      ] as InteractionObject["ix_operations"],
    });

    test("produces a valid InteractionRequest with a single key", async () => {
      const id = await wallet.identifier;
      const keyId = await wallet.getKeyId();
      const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

      const result = await wallet.signInteraction(
        buildIxObject(id.toHex(), keyId),
        algo,
      );

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

      const result = await wallet.signInteraction(
        buildIxObject(id.toHex(), keyId),
        algo,
      );

      expect(result.ix_args).toBe(IX_ARGS);
      expect(result.signatures).toBe(MULTI_SIG);
    });

    test("throws when the sender key_id is not registered on the wallet", async () => {
      const id = await wallet.identifier;
      const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

      await expect(
        wallet.signInteraction(buildIxObject(id.toHex(), 99), algo),
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

  describe("generateKeystore", () => {
    const PASSWORD = "test-password-123";
    let wallet: Wallet;

    beforeEach(() => {
      wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
    });

    test("returns a keystore with all required fields", () => {
      const keystore = wallet.generateKeystore(PASSWORD);

      expect(keystore).toMatchObject<Keystore>({
        id: expect.any(String),
        cipher: "aes-128-ctr",
        ciphertext: expect.any(String),
        cipherparams: { IV: expect.any(String) },
        kdf: "scrypt",
        kdfparams: {
          n: expect.any(Number),
          r: expect.any(Number),
          p: expect.any(Number),
          dklen: expect.any(Number),
          salt: expect.any(String),
        },
        mac: expect.any(String),
      });
    });

    test("id field matches the wallet's participant identifier", async () => {
      const keystore = wallet.generateKeystore(PASSWORD);
      const id = await wallet.identifier;

      expect(keystore.id).toBe(id.toHex());
      expect(keystore.id).toBe(IDENTIFIER_HEX);
    });

    test("always encrypts the primary key even when the sender key has been changed via setKeyId", () => {
      wallet.addKey(1, SECOND_PUBLIC_KEY, SECOND_PRIVATE_KEY);
      wallet.setKeyId(1);

      // sender key is now key 1, but generateKeystore must still save the identity key (key 0)
      const keystore = wallet.generateKeystore(PASSWORD);
      const restored = Wallet.fromKeystore(keystore, PASSWORD);

      expect(restored.publicKey).toBe(PUBLIC_KEY);
      expect(restored.privateKey).toBe(PRIVATE_KEY);
    });

    test("produces different ciphertext on each call due to random salt and IV", () => {
      const ks1 = wallet.generateKeystore(PASSWORD);
      const ks2 = wallet.generateKeystore(PASSWORD);

      expect(ks1.ciphertext).not.toBe(ks2.ciphertext);
      expect(ks1.kdfparams.salt).not.toBe(ks2.kdfparams.salt);
      expect(ks1.cipherparams.IV).not.toBe(ks2.cipherparams.IV);
    });

    test("id reflects the sub-account variant when subAccountId has been set", async () => {
      wallet.setSubAccountId(3);
      const keystore = wallet.generateKeystore(PASSWORD);
      const id = await wallet.identifier;

      expect(keystore.id).toBe(id.toHex());
      expect(keystore.id).not.toBe(IDENTIFIER_HEX);
    });
  });

  describe("fromKeystore", () => {
    const PASSWORD = "test-password-123";
    let wallet: Wallet;
    let keystore: Keystore;

    beforeEach(() => {
      wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
      keystore = wallet.generateKeystore(PASSWORD);
    });

    test("restores the correct private and public keys", () => {
      const restored = Wallet.fromKeystore(keystore, PASSWORD);

      expect(restored.privateKey).toBe(PRIVATE_KEY);
      expect(restored.publicKey).toBe(PUBLIC_KEY);
    });

    test("restored wallet has the same participant identifier as the original", async () => {
      const restored = Wallet.fromKeystore(keystore, PASSWORD);

      expect((await restored.identifier).toHex()).toBe(IDENTIFIER_HEX);
      expect((await restored.identifier).toHex()).toBe(
        (await wallet.identifier).toHex(),
      );
    });

    test("accepts a JSON string in addition to a parsed keystore object", () => {
      const restored = Wallet.fromKeystore(JSON.stringify(keystore), PASSWORD);

      expect(restored.privateKey).toBe(PRIVATE_KEY);
      expect(restored.publicKey).toBe(PUBLIC_KEY);
    });

    test("roundtrip preserves key pair and participant identity", async () => {
      const restored = Wallet.fromKeystore(keystore, PASSWORD);

      expect(restored.privateKey).toBe(wallet.privateKey);
      expect(restored.publicKey).toBe(wallet.publicKey);
      expect((await restored.identifier).toHex()).toBe(
        (await wallet.identifier).toHex(),
      );
    });

    test("throws when the password is incorrect", () => {
      expect(() => Wallet.fromKeystore(keystore, "wrong-password")).toThrow();
    });

    test("throws when the keystore id does not match the decrypted key", () => {
      const tampered = { ...keystore, id: "0x" + "00".repeat(32) };

      expect(() => Wallet.fromKeystore(tampered, PASSWORD)).toThrow(
        "Keystore participant id does not match the decrypted key",
      );
    });

    test("loads successfully when the keystore has no id field", () => {
      const { id: _id, ...withoutId } = keystore;
      const restored = Wallet.fromKeystore(withoutId as Keystore, PASSWORD);

      expect(restored.privateKey).toBe(PRIVATE_KEY);
      expect(restored.publicKey).toBe(PUBLIC_KEY);
    });

    test("respects subAccountId option and verifies it matches the keystore id", () => {
      wallet.setSubAccountId(2);
      const ks = wallet.generateKeystore(PASSWORD);
      const restored = Wallet.fromKeystore(ks, PASSWORD, { subAccountId: 2 });

      expect(restored.subAccountId).toBe(2);
    });

    test("throws when subAccountId in options conflicts with the participant id in the keystore", () => {
      // keystore was generated with subAccountId = 0 (default)
      expect(() =>
        Wallet.fromKeystore(keystore, PASSWORD, { subAccountId: 1 }),
      ).toThrow("Keystore participant id does not match the decrypted key");
    });
  });

  describe("signInteraction: payer account type validation", () => {
    let wallet: Wallet;

    beforeEach(() => {
      wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
    });

    test("succeeds when no payer field is set", async () => {
      const id = await wallet.identifier;
      const keyId = await wallet.getKeyId();
      const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

      const result = await wallet.signInteraction(
        buildIxObject(id.toHex(), keyId),
        algo,
      );

      expect(result).toMatchObject<InteractionRequest>({
        ix_args: expect.any(String),
        signatures: expect.any(String),
      });
    });

    test("succeeds when payer is ZERO_ADDRESS", async () => {
      const id = await wallet.identifier;
      const keyId = await wallet.getKeyId();
      const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

      const result = await wallet.signInteraction(
        buildIxObject(id.toHex(), keyId, ZERO_ADDRESS),
        algo,
      );

      expect(result).toMatchObject<InteractionRequest>({
        ix_args: expect.any(String),
        signatures: expect.any(String),
      });
    });

    test("succeeds when payer is a valid participant account", async () => {
      const senderId = (await wallet.identifier).toHex();
      const payerWallet = Wallet.fromMnemonicSync(MNEMONIC, PAYER_PATH);
      const payerId = (await payerWallet.identifier).toHex();
      const keyId = await wallet.getKeyId();
      const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

      const result = await wallet.signInteraction(
        buildIxObject(senderId, keyId, payerId),
        algo,
      );

      expect(result).toMatchObject<InteractionRequest>({
        ix_args: expect.any(String),
        signatures: expect.any(String),
      });
    });

    test("throws when payer is an asset account", async () => {
      const senderId = (await wallet.identifier).toHex();
      const assetPayerId = deriveAssetId(
        { id: senderId, sequence: 0, key_id: 0 },
        AssetStandard.MAS0,
      ).toHex();
      const keyId = await wallet.getKeyId();
      const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

      await expect(
        wallet.signInteraction(
          buildIxObject(senderId, keyId, assetPayerId),
          algo,
        ),
      ).rejects.toThrow("Payer must be a participant account");
    });

    test("throws when payer is a logic account", async () => {
      const senderId = (await wallet.identifier).toHex();
      const logicPayerId = deriveLogicId({
        id: senderId,
        sequence: 0,
        key_id: 0,
      }).toHex();
      const keyId = await wallet.getKeyId();
      const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

      await expect(
        wallet.signInteraction(
          buildIxObject(senderId, keyId, logicPayerId),
          algo,
        ),
      ).rejects.toThrow("Payer must be a participant account");
    });
  });

  describe("signAsPayer", () => {
    let senderWallet: Wallet;
    let payerWallet: Wallet;
    let senderId: Hex;
    let payerId: Hex;
    let ixRequest: InteractionRequest;

    beforeEach(async () => {
      senderWallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
      payerWallet = Wallet.fromMnemonicSync(MNEMONIC, PAYER_PATH);
      senderId = (await senderWallet.identifier).toHex();
      payerId = (await payerWallet.identifier).toHex();

      const algo = senderWallet.signingAlgorithms["ecdsa_secp256k1"];
      ixRequest = await senderWallet.signInteraction(
        buildIxObject(senderId, await senderWallet.getKeyId(), payerId),
        algo,
      );
    });

    test("returns a hex-encoded POLO signature blob", async () => {
      const payerSig = await payerWallet.signAsPayer(ixRequest.ix_args as Hex);

      expect(typeof payerSig).toBe("string");
      expect(payerSig.length).toBeGreaterThan(0);
    });

    test("produces a single signature entry tagged with the payer id", async () => {
      const payerSig = await payerWallet.signAsPayer(ixRequest.ix_args as Hex);
      const decoded = decodeSignatures(payerSig);

      expect(decoded).toHaveLength(1);
      expect(withHexPrefix(bytesToHex(decoded[0].id))).toBe(payerId);
    });

    test("uses the payer wallet sender key_id by default", async () => {
      const payerSig = await payerWallet.signAsPayer(ixRequest.ix_args as Hex);
      const decoded = decodeSignatures(payerSig);

      expect(decoded[0].key_id).toBe(0);
    });

    test("throws when the wallet identity does not match the payer in ix_args", async () => {
      await expect(
        senderWallet.signAsPayer(ixRequest.ix_args as Hex),
      ).rejects.toThrow("Payer address does not match wallet identity");
    });

    test("throws when ix_args has no payer set", async () => {
      const algo = senderWallet.signingAlgorithms["ecdsa_secp256k1"];
      const noPayerRequest = await senderWallet.signInteraction(
        buildIxObject(senderId, await senderWallet.getKeyId()),
        algo,
      );

      await expect(
        payerWallet.signAsPayer(noPayerRequest.ix_args as Hex),
      ).rejects.toThrow("Payer address does not match wallet identity");
    });

    test("uses the updated key_id after setKeyId", async () => {
      const { privKey, pubKey } = await Wallet.deriveAccountKey(
        MNEMONIC,
        PAYER_SECOND_PATH,
      );
      payerWallet.addKey(1, pubKey, privKey);
      payerWallet.setKeyId(1);

      const payerSig = await payerWallet.signAsPayer(ixRequest.ix_args as Hex);
      const decoded = decodeSignatures(payerSig);

      expect(decoded[0].key_id).toBe(1);
    });
  });

  describe("addSignature", () => {
    let senderWallet: Wallet;
    let payerWallet: Wallet;
    let senderId: Hex;
    let payerId: Hex;
    let ixRequest: InteractionRequest;
    let payerSig: Hex;

    beforeEach(async () => {
      senderWallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
      payerWallet = Wallet.fromMnemonicSync(MNEMONIC, PAYER_PATH);
      senderId = (await senderWallet.identifier).toHex();
      payerId = (await payerWallet.identifier).toHex();

      const algo = senderWallet.signingAlgorithms["ecdsa_secp256k1"];
      ixRequest = await senderWallet.signInteraction(
        buildIxObject(senderId, await senderWallet.getKeyId(), payerId),
        algo,
      );
      payerSig = await payerWallet.signAsPayer(ixRequest.ix_args as Hex);
    });

    test("merges sender and payer signatures into two entries", () => {
      const merged = addSignature(ixRequest, payerSig);
      const decoded = decodeSignatures(merged.signatures);

      expect(decoded).toHaveLength(2);
    });

    test("preserves sender signature before payer signature", () => {
      const merged = addSignature(ixRequest, payerSig);
      const decoded = decodeSignatures(merged.signatures);

      expect(withHexPrefix(bytesToHex(decoded[0].id))).toBe(senderId);
      expect(withHexPrefix(bytesToHex(decoded[1].id))).toBe(payerId);
    });

    test("does not modify ix_args", () => {
      const merged = addSignature(ixRequest, payerSig);

      expect(merged.ix_args).toBe(ixRequest.ix_args);
    });

    test("stacks additional signatures when called multiple times", async () => {
      const mergedOnce = addSignature(ixRequest, payerSig);
      const mergedTwice = addSignature(mergedOnce, payerSig);
      const decoded = decodeSignatures(mergedTwice.signatures);

      expect(decoded).toHaveLength(3);
    });

    test("throws when newSig is not a valid POLO blob", () => {
      expect(() => addSignature(ixRequest, "0xdeadbeef" as Hex)).toThrow();
    });
  });

  describe("validatePayerSignature", () => {
    let senderWallet: Wallet;
    let payerWallet: Wallet;
    let senderId: Hex;
    let payerId: Hex;
    let senderOnlyRequest: InteractionRequest;
    let mergedRequest: InteractionRequest;

    beforeEach(async () => {
      senderWallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
      payerWallet = Wallet.fromMnemonicSync(MNEMONIC, PAYER_PATH);
      senderId = (await senderWallet.identifier).toHex();
      payerId = (await payerWallet.identifier).toHex();

      const algo = senderWallet.signingAlgorithms["ecdsa_secp256k1"];
      senderOnlyRequest = await senderWallet.signInteraction(
        buildIxObject(senderId, await senderWallet.getKeyId()),
        algo,
      );

      const payerRequest = await senderWallet.signInteraction(
        buildIxObject(senderId, await senderWallet.getKeyId(), payerId),
        algo,
      );
      const payerSig = await payerWallet.signAsPayer(
        payerRequest.ix_args as Hex,
      );
      mergedRequest = addSignature(payerRequest, payerSig);
    });

    test("no-ops when payer is ZERO_ADDRESS", () => {
      expect(() => validatePayerSignature(senderOnlyRequest)).not.toThrow();
    });

    test("no-ops when payer field is absent and serialized as ZERO_ADDRESS", () => {
      expect(() => validatePayerSignature(senderOnlyRequest)).not.toThrow();
    });

    test("passes when a matching payer signature entry is present", () => {
      expect(() => validatePayerSignature(mergedRequest)).not.toThrow();
    });

    test("throws when payer is set but only the sender signature is present", async () => {
      const algo = senderWallet.signingAlgorithms["ecdsa_secp256k1"];
      const payerOnlySenderSig = await senderWallet.signInteraction(
        buildIxObject(senderId, await senderWallet.getKeyId(), payerId),
        algo,
      );

      expect(() => validatePayerSignature(payerOnlySenderSig)).toThrow(
        "Payer signature is missing",
      );
    });

    test("throws when the signatures blob is empty", async () => {
      const algo = senderWallet.signingAlgorithms["ecdsa_secp256k1"];
      const payerRequest = await senderWallet.signInteraction(
        buildIxObject(senderId, await senderWallet.getKeyId(), payerId),
        algo,
      );

      expect(() =>
        validatePayerSignature({
          ix_args: payerRequest.ix_args,
          signatures: "0x",
        }),
      ).toThrow();
    });
  });

  describe("sendInteraction: payer enforcement", () => {
    let senderWallet: Wallet;
    let payerWallet: Wallet;
    let senderId: Hex;
    let payerId: Hex;
    let mockProvider: ReturnType<typeof makeMockProvider>;

    beforeEach(async () => {
      senderWallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
      payerWallet = Wallet.fromMnemonicSync(MNEMONIC, PAYER_PATH);
      senderId = (await senderWallet.identifier).toHex();
      payerId = (await payerWallet.identifier).toHex();
      mockProvider = makeMockProvider();
      senderWallet.connect(mockProvider as never);
    });

    const buildSendIxObject = (payer?: Hex): InteractionObject => ({
      sender: {
        id: senderId,
        key_id: 0,
        sequence: 0,
      },
      fuel_price: 1,
      fuel_limit: 200,
      ix_operations: [
        makeAssetCreateOp(senderId),
      ] as InteractionObject["ix_operations"],
      ...(payer !== undefined ? { payer } : {}),
    });

    test("sends successfully when no payer is set", async () => {
      await senderWallet.sendInteraction(buildSendIxObject());

      expect(mockProvider.sendInteraction).toHaveBeenCalledTimes(1);
    });

    test("sends successfully when payer signature is present in the signed request", async () => {
      const algo = senderWallet.signingAlgorithms["ecdsa_secp256k1"];
      const payerRequest = await senderWallet.signInteraction(
        buildIxObject(senderId, 0, payerId),
        algo,
      );
      const payerSig = await payerWallet.signAsPayer(
        payerRequest.ix_args as Hex,
      );
      const mergedRequest = addSignature(payerRequest, payerSig);

      jest
        .spyOn(senderWallet, "signInteraction")
        .mockResolvedValue(mergedRequest);

      await senderWallet.sendInteraction(buildSendIxObject(payerId));

      expect(mockProvider.sendInteraction).toHaveBeenCalledWith(mergedRequest);
    });

    test("throws before provider is called when payer signature is missing", async () => {
      await expect(
        senderWallet.sendInteraction(buildSendIxObject(payerId)),
      ).rejects.toThrow("Payer signature is missing");

      expect(mockProvider.sendInteraction).not.toHaveBeenCalled();
    });

    test("sends successfully when payer is explicitly ZERO_ADDRESS", async () => {
      await senderWallet.sendInteraction(buildSendIxObject(ZERO_ADDRESS));

      expect(mockProvider.sendInteraction).toHaveBeenCalledTimes(1);
    });
  });
});
