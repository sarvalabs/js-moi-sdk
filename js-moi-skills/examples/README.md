# Examples — which one for which task

Lived, end-to-end flows against **Voyage devnet**, in plain JavaScript. Each
pairs its Coco source (where there is one) with the SDK scripts, and pins the
devnet-specific choices the `references/` leave generic (path `7020`,
`VoyageProvider("devnet")`, Number `max_supply`, JSON manifests). Read the
matching example *before* the generic 60-second flow in `SKILL.md` if you're on
devnet.

| Example | Webinar session | Use it when you need to… |
|---|---|---|
| [`nft-mint-transfer.md`](nft-mint-transfer.md) | — | Deploy a logic-backed MAS1 NFT, mint with metadata, transfer a token; learn the five devnet landmines |
| [`flipper-logic-and-actor-state.md`](flipper-logic-and-actor-state.md) | 1 (Flipper) | Deploy & drive a logic: `LogicFactory` + `getLogicDriver`, `dynamic`→`.send()` vs `static`→`.call()`, `state logic` vs `state actor`, `deploy` vs `enlist` |
| [`native-assets-and-taxtoken.md`](native-assets-and-taxtoken.md) | 2 (Assets) | Create a plain MAS0 token, or a logic-backed MASX fee-on-transfer `TaxToken` via `AssetFactory.create` |
| [`lockup-release-swap.md`](lockup-release-swap.md) | 4 (Swap) | Two-party account-to-account swap with native `lockup`/`release` (two funded wallets) |

Session 3 (Agent Registry) is not included.

## Shared conventions across all examples

- **Provider / path:** `VoyageProvider("devnet")` and `m/44'/6174'/7020'/0/0`
  (the funded faucet account index) unless overridden.
- **Language:** plain `.js` — no TypeScript scaffolding; speed over abstraction.
- **Manifests:** deploy from the compiled **`.json`**, never YAML (unquoted `0x`
  literals break `ManifestCoder`).
- **The recipient must already exist on devnet** — fund at
  <https://voyage.moi.technology>; transfers don't auto-create accounts.
- **Canonical API + the worst landmines also live in `references/`** — e.g. the
  Number-`max_supply` and auto-send-`.routines` rules are called out in
  `references/assets.md`, and the fuel-cap rule in `references/patterns.md`. The
  examples show them in context; the references are what an agent reads first.
