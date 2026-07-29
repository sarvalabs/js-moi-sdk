# Wallets, signers, keys (js-moi-wallet / signer / hdnode / bip39)

Verified against `src.ts/` of each package (v0.7.1). Signing curve is
**secp256k1**; message pre-hash is **blake2b (32-byte digest)**; default MOI
derivation path is **`m/44'/6174'/0'/0/0`** (`MOI_DERIVATION_PATH` in
js-moi-constants).

## Wallet (the account you sign with)

`class Wallet extends Signer`. Construct it from a mnemonic (or, since 0.7.1, a
keystore), connect a provider, sign & send. Advanced: `new Wallet(hdNode,
curve, options?: WalletOption)` for direct construction.

```js
const wallet = await Wallet.fromMnemonic(mnemonic);        // async! default path
const wallet = await Wallet.fromMnemonic(mnemonic, "m/44'/6174'/0'/0/3"); // custom path
const wallet = Wallet.fromMnemonicSync(mnemonic, path?);   // sync variant
const wallet = await Wallet.createRandom();                // 16 random bytes → mnemonic
const wallet = Wallet.createRandomSync();
wallet.connect(provider);
const address = String(await wallet.getIdentifier());      // 0x… 32-byte id
```

| Static | Signature | Notes |
|---|---|---|
| `fromMnemonic` | `async (mnemonic, path?, wordlist?) → Wallet` | **async** |
| `fromMnemonicSync` | `(mnemonic, path?, wordlist?) → Wallet` | sync |
| `createRandom` | `async () → Wallet` | async |
| `createRandomSync` | `() → Wallet` | sync |
| `fromKeystore` | `(keystore: string \| Keystore, password, options?: WalletOption) → Wallet` | sync; **new in 0.7.1** (see Keystores below) |
| `deriveKeys` | `(key: Buffer, curve?) → { privKey, pubKey }` | hex; pubKey compressed |
| `deriveAccountKey` | `async (mnemonic, path?, wordlist?) → { privKey, pubKey }` | keypair without a Wallet |

> **`Wallet.fromPrivateKey` does NOT exist** (in any 0.7.x). To load a raw key,
> go through `HDNode.fromPrivateKey(buf)` + `new Wallet(hdNode, CURVE.SECP256K1,
> options?)`. The `CURVE` enum (`{ SECP256K1: "secp256k1" }`) is exported.

Getters: `privateKey` (hex), `publicKey` (hex, compressed), `mnemonic`, `curve`
throw `NOT_INITIALIZED` if the key vault is empty; `subAccountId` (number) does
NOT check initialization; `identifier` (`Promise<Identifier>`) fails with a
`TypeError` (private-field access), not `NOT_INITIALIZED`, on an uninitialized
wallet, while `keyId` (`Promise<number>`) never touches the vault and simply
resolves `undefined`. (In practice the uninitialized state is unreachable via
the public API — the constructor either fully initializes or throws.)

## Keystores (new in 0.7.1)

```js
const keystore = wallet.generateKeystore("my-password");        // sync → Keystore
fs.writeFileSync("wallet.json", JSON.stringify(keystore));
// …later…
const restored = Wallet.fromKeystore(fs.readFileSync("wallet.json", "utf8"), "my-password");
```

- **`generateKeystore(password) → Keystore`** encrypts the wallet's **primary
  key** (the one the `Identifier` derives from, regardless of `setKeyId`) with
  scrypt + aes-128-ctr, and embeds the participant `Identifier` **in plaintext**
  as `keystore.id` (Web3 Secret Storage style).
- **`Wallet.fromKeystore(keystore, password, options?)`** decrypts and, when
  `keystore.id` is present, verifies the identifier derived from the decrypted
  key (using `options?.subAccountId ?? 0`) matches it — wrong password or
  tampering throws; keystores without an `id` (external tools) skip the check.
  **`options.subAccountId` must match the value in effect at export time** or
  verification fails.
- **Only the primary key survives the round-trip:** no mnemonic (the `mnemonic`
  getter returns `undefined` on a keystore-restored wallet), no derivation
  path, and multisig keys added via `addKey` must be re-added.
- `Keystore` type: `{ id?, cipher: "aes-128-ctr", ciphertext, cipherparams:
  { IV }, kdf: "scrypt", kdfparams: { dklen, n, p, r, salt }, mac }`.
  `WalletOption` = `{ keyId?: number; subAccountId?: number; provider? }`.
  The low-level `encryptKeystoreData`/`decryptKeystoreData` helpers remain
  unexported.

Instance methods:

| Method | Signature | Behavior |
|---|---|---|
| `connect(provider)` | `→ void` | attach a provider |
| `getIdentifier()` | `async → Identifier` | fingerprint = `pubkey.slice(1,25)`; identifier variant = `sub_account_index` |
| `getKeyId()` | `async → number` | current key index |
| `getSubAccountId()` / `setSubAccountId(id)` | `→ number` / `→ void` | the identifier **variant**; changing it changes the derived address |
| `getPublicKey()` | `→ Hex` | current key's pubkey |
| `sign(message, keyId, sigAlgo)` | `async → string` | ECDSA sign; returns hex `Signature.serialize()` |
| `signInteraction(ixObject, _sigAlgo)` | `async → InteractionRequest` | POLO-serializes + signs; returns `{ ix_args, signatures }`. The `_sigAlgo` param is **ignored** — always ecdsa_secp256k1. Throws if `ixObject.sender.key_id` isn't a registered key |
| Multisig | `addKey(keyId, publicKey, privateKey)`, `setKeyId(keyId)`, `getKeys()`, `removeKey(keyId)` | multiple keys per participant; `signInteraction` signs with every registered key |

**Sub-accounts:** to act as inherited sub-account *n*, `wallet.setSubAccountId(n)`
before deriving the identifier / sending. Index 0 (or unset) = the primary.

```js
// act as the primary to detect / create sub-accounts …
const primaryId = String(await wallet.getIdentifier());
// … then act as an inherited sub-account
wallet.setSubAccountId(1);
const subId = String(await wallet.getIdentifier());  // primary[0..28) + 0x00000001
```

## Signer (the base class)

`abstract class Signer` — `Wallet` implements it. You interact with a `Signer`
anywhere the SDK takes one (`getLogicDriver(id, signer)`,
`new MAS0AssetLogic(id, signer)`, builders). Constructor: `(provider?)`.

Abstract (implemented by Wallet): `connect(provider)`, `getKeyId()`,
`getIdentifier()`, `sign(message, keyId, sigAlgo)`, `isInitialized()`,
`signInteraction(ixObject, sigAlgo)`. Also public on the base:
`signer.provider` (optional field), `signer.signingAlgorithms`
(`{ ecdsa_secp256k1 }`), and `prepareInteraction(method, ixObject)` (fills
sender/nonce and validates before a call/send).

Concrete on the base:

| Method | Signature | Notes |
|---|---|---|
| `getProvider()` | `→ AbstractProvider` | throws `NOT_INITIALIZED` if none |
| `getNonce(options?)` | `async → number\|bigint` | no options → `getPendingInteractionCount`; with options → `getInteractionCount` |
| `call(ixObject)` | `async → InteractionCallResponse` | read-only via provider |
| `estimateFuel(ixObject)` | `async → number\|bigint` | |
| `sendInteraction(ixObject)` | `async → InteractionResponse` | prepares sender/sequence, signs (ecdsa_secp256k1), broadcasts — the main "sign & send" entry |
| `verify(message, signature, publicKey)` | `→ boolean` | ECDSA verify |

> There is **no `getAddress()`** — use `getIdentifier()` (returns an
> `Identifier`; `String(...)` for the hex).

Signature scheme classes (`ECDSA_S256`, `Signature`) are internal (not
re-exported); you rarely touch them. Wire layout of a signature:
`[prefix=1][len][DER r/s][pubkey-parity-byte]`.

## HDNode (js-moi-hdnode)

Thin wrapper over `@scure/bip32`'s `HDKey`. Wallet uses it internally; reach for
it only for custom derivation.

```js
const master = HDNode.fromSeed(seedBuffer);        // does NOT auto-derive a path
const node   = master.derivePath("m/44'/6174'/0'/0/0");
const child  = node.deriveChild(index);
const pub  = node.publicKey();   // Buffer — METHOD, not a property
const priv = node.privateKey();  // Buffer — throws PROPERTY_NOT_DEFINED if absent
node.getExtendedPrivateKey(); node.getExtendedPublicKey();
HDNode.fromExtendedKey(xprv/xpub);
HDNode.fromPrivateKey(privKeyBuffer);  // new in 0.7.1 — raw 32-byte key, zero
                                       // chain code: can sign, can't derive children
```

> Gotcha: `publicKey()` / `privateKey()` are **method calls** returning
> **`Buffer`**, not fields. The default path constant lives in js-moi-constants,
> not here — `fromSeed` returns the master node.

## bip39 (js-moi-bip39)

```js
const mnemonic = generateMnemonic();                    // strength 128 → 12 words
// full: generateMnemonic(strength?, rng?, wordlist?)
validateMnemonic(mnemonic, wordlist?);                  // boolean
const seed = await mnemonicToSeed(mnemonic, password?); // 64-byte Buffer (async)
const seed = mnemonicToSeedSync(mnemonic, password?);   // sync
const ent  = mnemonicToEntropy(mnemonic, wordlist?);    // hex string
const mn   = entropyToMnemonic(entropyHexOrBuffer, wordlist?);
getDefaultWordlist();                                   // "english"
```

Also exports `wordlists` (`english, japanese, korean, french, italian, spanish,
portuguese, czech, chinese_simplified, chinese_traditional` + aliases `EN`,
`JA`) and `_default` (english). Gotchas: `mnemonicToSeed`/`Sync` take **no**
wordlist (only mnemonic + password); wordlist defaults to English; there is
**no `setDefaultWordlist`**.

## Typical setup helper

```js
export const makeWallet = async (provider, { mnemonic, derivationPath, subAccount }) => {
  const wallet = await Wallet.fromMnemonic(mnemonic, derivationPath);
  if (Number.isFinite(subAccount)) wallet.setSubAccountId(subAccount); // else primary
  wallet.connect(provider);
  return wallet;
};
```
