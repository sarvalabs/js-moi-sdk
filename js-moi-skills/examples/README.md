# Examples: which one for which task

Lived, end-to-end flows against **Voyage devnet**, in plain JavaScript. Each
pairs its Coco source (where there is one) with the SDK scripts, and pins the
devnet-specific choices the `references/` leave generic (path `7020`,
`VoyageProvider("devnet")`, JSON manifests, the 10 KMOI storage fund every
create/deploy now carries). All four were re-checked against js-moi-sdk
v0.9.0-rc2 on 13 October 2026; their last on-chain run was with 0.7.1 before the
11 September devnet reset. Read the
matching example *before* the generic 60-second flow in `SKILL.md` if you're on
devnet.

| Example | Webinar session | Use it when you need to… |
|---|---|---|
| [`nft-mint-transfer.md`](nft-mint-transfer.md) | none | Deploy a logic-backed MAS1 NFT, mint with metadata, transfer a token; learn the five devnet landmines |
| [`flipper-logic-and-actor-state.md`](flipper-logic-and-actor-state.md) | 1 (Flipper) | Deploy & drive a logic: `LogicFactory` + `getLogicDriver`, `dynamic`→`.send()` vs `static`→`.call()`, `state logic` vs `state actor`, `deploy` vs `enlist` |
| [`native-assets-and-taxtoken.md`](native-assets-and-taxtoken.md) | 2 (Assets) | Create a plain MAS0 token, or a logic-backed MASX fee-on-transfer `TaxToken` via `AssetFactory.create` |
| [`lockup-release-swap.md`](lockup-release-swap.md) | 4 (Swap) | Two-party account-to-account swap with native `lockup`/`release` (two funded wallets) |

Session 3 (Agent Registry) is not included.

## Shared conventions across all examples

- **Provider / path:** `VoyageProvider("devnet")` and `m/44'/6174'/7020'/0/0`
  (the funded faucet account index) unless overridden.
- **Language:** plain `.js`, no TypeScript scaffolding; speed over abstraction.
- **Manifests:** deploy from the compiled **`.json`**, never YAML (unquoted `0x`
  literals break `ManifestCoder`).
- **The recipient must already exist on devnet**; the faucet at
  <https://voyage.moi.technology> funds existing accounts, and transfers don't
  auto-create accounts (register one with `ParticipantCreate` from a funded
  account).
- **Every create or deploy also moves 10 KMOI** (`DEFAULT_STORAGE_FUND`) to the
  new account; a wallet needs fuel plus that.
- **Canonical API + the worst landmines also live in `references/`**, e.g. the
  storage-fund and self-executing `.routines` rules are called out in
  `references/assets.md`, and the fuel-cap rule in `references/patterns.md`. The
  examples show them in context; the references are what an agent reads first.
