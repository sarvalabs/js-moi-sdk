# Changelog

All notable changes to this skill are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/); the **SDK version** each release
was verified against is called out explicitly, since that is the thing most
likely to drift.

## [Unreleased]

Verified against **js-moi-sdk v0.9.0-rc2** (git tag `v0.9.0-rc2`, npm `latest`
on 13 October 2026). Rebuilt by reading every `packages/*/src.ts` file at that
tag; nothing was taken from the npm docs or from memory. The one-commit rc3
hotfix (`v0.9.0-rc3`, GitHub only) is described inline wherever it differs.

### Changed (SDK drift, 0.7.1 → 0.9.0-rc2)
- `references/utils-constants.md`: new constant values `KMOI_ASSET_ID`
  (`0x1080fffe…`), `DEFAULT_FUEL_PRICE` 50, `DEFAULT_FUEL_LIMIT` 100000,
  `VERSION`; new `KMOI_DECIMALS`, `KMOI_SCALE`, `MAX_DECIMALS`, `UINT256_MAX`,
  `DEFAULT_STORAGE_FUND`, `MIN_STORAGE_DEPOSIT_AMOUNT`; new `OpType` members
  16 to 20, `AssetStandard.MASN`, `ResourceType`, `AccessAction`, `CallerKind`;
  removed `LogicState`/`RoutineKind` enums; new `units.ts` helpers
  (`formatAmount`, `parseAmount`, `formatKmoi`, `parseKmoi`, `validateDecimals`);
  new POLO schemas; `AccountInheritResult`; rc3 notes (`MIN_KEY_WEIGHT`,
  `formatFuelFee`).
- `references/identifiers.md`: `deriveAssetId`, `deriveLogicId`,
  `newAccountFingerprint`, `AccountIdSender`; `AssetId.validate` now enforces
  the flag mask (`0b01111100`); KMOI id worked example; the release-note names
  `predictAssetId`/`predictLogicId` flagged as non-existent.
- `references/interactions.md`: new ops and payloads (storage, access),
  client-side validators, the 0.9.0-rc1 participant rule (sender and plain fee
  payer no longer listed; notary payer rules), `IxOption.payer` /
  `participantSignatures`, `InteractionContext.payer()`, `fundingOperations`,
  `StorageDeposit`/`StorageWithdraw`/`Access` builders, `buildTransferPayload`,
  the fee-payer flow, `checkSignature`, rc3 `fee_payer` rename.
- `references/logic.md`: `logicState`/`actorState` and `hasLogicState()`/
  `hasActorState()` (renamed from persistent/ephemeral); builder name required
  on `deploy` when the manifest has a deploy routine; bundled storage-funding
  transfer and `RoutineOption.storageFund`; fuel price default 50; sender not a
  participant; `payer` option.
- `references/assets.md`: `MAS0AssetLogic.create(..., decimals?, option?)`,
  `MAS1AssetLogic.create(signer, symbol, manager, enableEvents, option?)`,
  `MAS2AssetLogic.create(..., decimals?, option?)` + `getAssetInfo()`,
  `MASNAssetLogic`, `AssetFactory.create` with required `manifest` and
  `callsite`, the storage fund on every create, `AssetDriver.logicState`/
  `actorState`, driver routines that execute themselves (dynamic → send,
  static → unwrap) and honour a trailing `RoutineOption`, raw POLO outputs on
  `.call()` with the rc3 `decodeResult` fix, KMOI reserved callsites.
- `references/providers.md`: `getStorageMetric`, `getStoragePricing`,
  `getAccessPolicy`, `getAccessPolicies`, `getAssetInfoByAssetID(id, options?)`,
  `AccountState` storage/access roots, receipt decoding for the new ops (two
  results for creates/deploys), the rc2 WebSocket reconnect fix, the devnet
  version observed (0.13.0).
- `references/wallet-signer.md`: `signInteraction(ix, algo,
  participantSignatures?)` with the payer check, `signRawInteractionObject`,
  `Signer.sendInteraction(ix, participantSignatures?)` and "Payer signature is
  missing.", exported `serializeIxObject`/`serializeIxSignatures`, fee-payer
  recipe.
- `references/manifest.md`: `ContextStateKind.LogicState/ActorState` and
  `.logic()`/`.actor()`; `LogicManifest.StateMode.LOGIC/ACTOR`; Coco 0.9.2+
  drops `enlist` routines.
- `references/concepts.md`: MASN and anu, storage funding, storage deposits and
  access policies, fee payer, the participant rule, fuel defaults, logic/actor
  state terminology, post-reset account facts.
- `references/patterns.md`: §1 fuel cap now divides by `fuel_price` and leaves
  the storage fund aside; §3/§4 two-op receipts and the required builder name;
  §10 `formatAmount`; new §15 storage fund, §16 fee payer, §17 id prediction,
  §18 KMOI rules, §19 rc2 vs rc3.
- `SKILL.md`: new import list, a 0.7.x → 0.9.0 migration table, fuel/storage
  numbers in the 60-second flow, updated gotchas, stamp.
- `examples/*`: fuel numbers and explicit receipt checks; storage-fund budget
  notes; `AssetFactory.create` with required manifest/callsite; MAS0 create
  with `decimals`; `bigint` supply (the 0.7.1 "Number only" landmine is kept as
  history); ContextFlipper rewritten without `endpoint enlist` (Coco 0.9.2+
  rejects it; verified by compiling with coco 0.9.3); each page states that its
  on-chain run predates the 11 September 2026 devnet reset.
- `README.md`, `AGENTS.md`: stamp, tag-based checkout, a package-by-package
  revalidation order, the "no em dashes" rule, case-insensitive stamp check.

### Testing (13 October 2026)
- Installed `js-moi-sdk@0.9.0-rc2` from npm in a scratch project and exercised
  every example's SDK calls offline (context construction, `ixData` with a
  pinned sender, signing, payload and participant shapes, id derivation,
  validator rejections); read-only devnet calls (`net.Version`, KMOI asset info,
  SARGA account) succeeded. **No write interaction was sent:** the devnet
  account available to the maintainer no longer exists after the 11 September
  reset, so no new interaction hashes are recorded in this entry. Re-run the
  examples with a funded post-reset account and add the hashes here.
- The three Coco snippets embedded in `examples/` compile with coco 0.9.3 at
  PISA target 0.8.2.

## [0.1.1] (unpublished, 13 July 2026)

Verified against **js-moi-sdk v0.7.1**.

### Removed
- `scripts/verify-sdk.cjs` ; the runtime smoke test is no longer bundled;
  revalidation is done by re-checking reference claims against the SDK `src.ts/`
  sources.

### Added
- `AGENTS.md` ; contributor-facing maintenance process (source-grep-before-edit,
  keep stamps in sync, no junk files).
- `CHANGELOG.md` ; this file.
- MOI Builders Webinar examples (all devnet-verified, plain JS), each with its
  Coco source and SDK scripts, headline APIs source-checked against v0.7.1:
  - `examples/flipper-logic-and-actor-state.md` ; `LogicFactory.deploy` +
    `getLogicDriver`; `dynamic`→`.send()` vs `static`→`.call()`; `state logic`
    vs `state actor`, `deploy` vs `enlist`.
  - `examples/native-assets-and-taxtoken.md` ; `MAS0AssetLogic.create`/`mint`;
    `AssetFactory.create` for a logic-backed MASX fee-on-transfer token.
  - `examples/lockup-release-swap.md` ; native `lockup`/`release` two-party swap;
    flags where the helper reaches past the public provider API (`moi.Lockups`).
- `examples/README.md` ; index of which example fits which task/webinar session,
  plus the conventions shared across all examples.
- `references/providers.md` ; a Voyage devnet quick-start (§0) before the class
  table, so the hosted-devnet setup isn't buried in a row.
- `references/assets.md` ; promoted the worst devnet landmines into the canonical
  reference: Number-`max_supply` on `AssetFactory.create`, dynamic `.routines`
  auto-send (no `.send()`) vs the wrapper `.send()` path, and the pure-Coco-endpoint
  revert that surfaces as receipt `status: 1`.

### Changed
- `examples/nft-mint-transfer.md` ; completed the flow into a copy-pasteable
  script (real `Mint(beneficiary, name, image_uri)` calldata, `AssetFactory.create`,
  `deployment.json` persistence, `getTDU` ownership pre-check); added a one-line
  explanation of why path `7020` (funded faucet index); added operational notes
  (recipient must exist, re-mint before re-transfer, save `asset_id`); linked the
  pure-endpoint revert to the Coco skill.
- `SKILL.md` ; the 60-second flow now shows the devnet provider/path inline so it
  no longer contradicts the Voyage callout above it.
- `examples/nft-mint-transfer.md` ; added recipient registration via
  `PARTICIPANT_CREATE` (one-mnemonic/two-path owner+recipient pattern) with the
  **Babylon landmine** that a `Transfer` callsite in `PARTICIPANT_CREATE.value`
  fails, so `"Symbol"` (a no-op) is used to register; added `IsOwner`+`getTDU`
  ownership verification and a note that dynamic-routine output shapes vary
  (bigint / array / object) and must be extracted defensively. Reconciled against
  the real working `mint.js`/`transfer.js`/`recipient.js`.
- `getTDU` return shape corrected to `[{asset_id, token_id, amount}]` in
  `SKILL.md`, `references/patterns.md`, and `references/concepts.md` (it omitted
  `token_id`, which per-token NFT flows key on).
- `examples/nft-mint-transfer.md` ; lived Voyage devnet NFT mint→transfer flow
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
- `references/identifiers.md` ; corrected `hasFlag` semantics (it does not test
  the flags bit alone); fixed `AssetId` import in the example.
- `references/concepts.md` ; clarified the `AccountInherit` builder needs
  `.build()` before `.send()`.
- `references/manifest.md` ; corrected the `address` type-resolution note.
- `references/interactions.md` ; `LOGIC_DEPLOY` payload includes `interfaces?`;
  accurate serializer throw messages.
- `references/providers.md` ; `getWaitTime` returns `number | bigint`.
- `references/wallet-signer.md` ; `keyId` resolves `undefined`, not a `TypeError`.
- `references/assets.md` ; accurate camelCase/PascalCase method-casing note.
- `references/patterns.md` ; dual CJS/ESM builds; `js-polo` is a regular
  dependency of `js-moi-manifest`, not a peer dependency.
- `README.md` / `SKILL.md` ; accurate citation wording; corrected the
  revalidation snippet to run from the skill root.

## [0.1.0] ; 2026-07-08

Verified against **js-moi-sdk v0.7.1**.

### Added
- Initial js-moi-sdk agent skill: `SKILL.md` and ten `references/*.md`
  deep-dives.
