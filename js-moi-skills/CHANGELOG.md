# Changelog

All notable changes to this skill are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/); the **SDK version** each release
was verified against is called out explicitly, since that is the thing most
likely to drift.

## [Unreleased]

Verified against **js-moi-sdk v0.7.1**.

### Removed
- `scripts/verify-sdk.cjs` — the runtime smoke test is no longer bundled;
  revalidation is done by re-checking reference claims against the SDK `src.ts/`
  sources.

### Added
- `AGENTS.md` — contributor-facing maintenance process (source-grep-before-edit,
  keep stamps in sync, no junk files).
- `CHANGELOG.md` — this file.
- MOI Builders Webinar examples (all devnet-verified, plain JS), each with its
  Coco source and SDK scripts, headline APIs source-checked against v0.7.1:
  - `examples/flipper-logic-and-actor-state.md` — `LogicFactory.deploy` +
    `getLogicDriver`; `dynamic`→`.send()` vs `static`→`.call()`; `state logic`
    vs `state actor`, `deploy` vs `enlist`.
  - `examples/native-assets-and-taxtoken.md` — `MAS0AssetLogic.create`/`mint`;
    `AssetFactory.create` for a logic-backed MASX fee-on-transfer token.
  - `examples/lockup-release-swap.md` — native `lockup`/`release` two-party swap;
    flags where the helper reaches past the public provider API (`moi.Lockups`).
- `examples/README.md` — index of which example fits which task/webinar session,
  plus the conventions shared across all examples.
- `references/providers.md` — a Voyage devnet quick-start (§0) before the class
  table, so the hosted-devnet setup isn't buried in a row.
- `references/assets.md` — promoted the worst devnet landmines into the canonical
  reference: Number-`max_supply` on `AssetFactory.create`, dynamic `.routines`
  auto-send (no `.send()`) vs the wrapper `.send()` path, and the pure-Coco-endpoint
  revert that surfaces as receipt `status: 1`.

### Changed
- `examples/nft-mint-transfer.md` — completed the flow into a copy-pasteable
  script (real `Mint(beneficiary, name, image_uri)` calldata, `AssetFactory.create`,
  `deployment.json` persistence, `getTDU` ownership pre-check); added a one-line
  explanation of why path `7020` (funded faucet index); added operational notes
  (recipient must exist, re-mint before re-transfer, save `asset_id`); linked the
  pure-endpoint revert to the Coco skill.
- `SKILL.md` — the 60-second flow now shows the devnet provider/path inline so it
  no longer contradicts the Voyage callout above it.
- `examples/nft-mint-transfer.md` — added recipient registration via
  `PARTICIPANT_CREATE` (one-mnemonic/two-path owner+recipient pattern) with the
  **Babylon landmine** that a `Transfer` callsite in `PARTICIPANT_CREATE.value`
  fails, so `"Symbol"` (a no-op) is used to register; added `IsOwner`+`getTDU`
  ownership verification and a note that dynamic-routine output shapes vary
  (bigint / array / object) and must be extracted defensively. Reconciled against
  the real working `mint.js`/`transfer.js`/`recipient.js`.
- `getTDU` return shape corrected to `[{asset_id, token_id, amount}]` in
  `SKILL.md`, `references/patterns.md`, and `references/concepts.md` (it omitted
  `token_id`, which per-token NFT flows key on).
- `examples/nft-mint-transfer.md` — lived Voyage devnet NFT mint→transfer flow
  (plain JS), pinning the devnet-specific choices the generic reference leaves
  open: derivation path account index `7020`, `VoyageProvider("devnet")`, Number
  `max_supply` on `ASSET_CREATE`, fuel capped to KMOI, JSON (not YAML) manifest,
  and the driver-routine vs `MAS1AssetLogic` transfer paths.
- Voyage-first warning + reference-table row in `SKILL.md` pointing to the
  example before the generic localhost/path-0/bigint defaults.

### Fixed
- Removed stray VS Code `*.code-workspace` artifacts from `references/`; added
  `*.code-workspace` to `.gitignore`.
- Normalized "verified against v0.7.1" stamps across all ten references.
- `references/identifiers.md` — corrected `hasFlag` semantics (it does not test
  the flags bit alone); fixed `AssetId` import in the example.
- `references/concepts.md` — clarified the `AccountInherit` builder needs
  `.build()` before `.send()`.
- `references/manifest.md` — corrected the `address` type-resolution note.
- `references/interactions.md` — `LOGIC_DEPLOY` payload includes `interfaces?`;
  accurate serializer throw messages.
- `references/providers.md` — `getWaitTime` returns `number | bigint`.
- `references/wallet-signer.md` — `keyId` resolves `undefined`, not a `TypeError`.
- `references/assets.md` — accurate camelCase/PascalCase method-casing note.
- `references/patterns.md` — dual CJS/ESM builds; `js-polo` is a regular
  dependency of `js-moi-manifest`, not a peer dependency.
- `README.md` / `SKILL.md` — accurate citation wording; corrected the
  revalidation snippet to run from the skill root.

## [0.1.0] — 2026-07-08

Verified against **js-moi-sdk v0.7.1**.

### Added
- Initial js-moi-sdk agent skill: `SKILL.md` and ten `references/*.md`
  deep-dives.
