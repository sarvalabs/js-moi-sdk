# AGENTS.md: maintaining this skill

Instructions for an agent (or human) **editing this repository**. This is the
contributor-facing counterpart to `SKILL.md`, which is the consumer-facing
reference an agent reads when *using* js-moi-sdk. Do not confuse the two:

- `SKILL.md` + `references/` + `examples/`: the product. Read by agents building
  against the SDK.
- `AGENTS.md` (this file): the process. Read by agents changing the product.

## Golden rule: the SDK source is the only authority

Every claim in `references/*.md` must be verifiable against a specific
`js-moi-sdk` source file. **Never edit a reference from memory or from npm
docs**; npm docs sometimes describe a different version. Before changing or
adding a claim:

1. `grep` the symbol in the SDK checkout under `packages/<pkg>/src.ts/`.
2. Cite the file (path, and file:line where it helps a reader jump).
3. Prefer the exact casing/signature/return type from the source over what
   "reads well."

The reference SDK checkout for this repo is `js-moi-sdk` at the **git tag**
named in the stamps (currently **v0.9.0-rc2**, `git checkout v0.9.0-rc2`), with
`npm install` run so the umbrella package builds. Release notes on GitHub are a
map of what to look at, not a source: 0.8.0's notes say `predictAssetId`, the
code says `deriveAssetId`.

## Before every commit

1. **Re-check any changed claim against the SDK source.** For every reference you
   touched, `grep` the symbol in `packages/<pkg>/src.ts/` and confirm the casing,
   signature, return type, and enum values still match.
2. **Keep version stamps in sync.** Every file in `references/` carries a
   greppable "verified against … (vX.Y.Z)" line, and `SKILL.md` repeats the
   version. If you revalidate against a new SDK release, bump **all** of them
   together ; mismatched stamps are how drift hides. Quick check:
   ```sh
   grep -ril "verified against" references/*.md | wc -l   # must equal file count (10)
   grep -rhoE "v0\.[0-9]+\.[0-9]+(-rc[0-9]+)?" SKILL.md references/*.md | sort | uniq -c   # the stamp version must dominate; older versions may appear only in "was/now" history lines
   ```
3. **Update `CHANGELOG.md`** with what changed and, if the SDK version moved, the
   new "verified against" version.
3b. **No em dashes** in prose (house style); use a colon, semicolon or comma.
4. **No junk files.** Editor artifacts must never ship. `.gitignore` covers
   `.DS_Store`, `node_modules/`, and `*.code-workspace`; if you introduce a new
   artifact class, ignore it too. Check `git status --porcelain --ignored`.

## Revalidating after an SDK release

```sh
cd /path/to/js-moi-sdk && git fetch --tags && git checkout vX.Y.Z && npm install
git diff --stat vPREV vX.Y.Z -- packages | grep -vE '/lib\.|package-lock'   # what moved
```

Then walk the references against that tag's `src.ts/` sources, in this order
(it is the dependency order of the packages):

1. `js-moi-constants/src.ts/*` and `js-moi-utils/src.ts/{enums,index,units}.ts`
   → `references/utils-constants.md` (every constant value, every enum member).
2. `js-moi-identifiers/src.ts/index.ts` → `references/identifiers.md`.
3. `js-moi-providers/src.ts/{base-provider,interaction}.ts` + `types/*.d.ts` →
   `references/providers.md` and `references/interactions.md` (RPC method list,
   payload types, `processParticipants`, validators).
4. `js-moi-interactions/src.ts/*` + `types/context.d.ts` → `interactions.md`
   (builders, `IxOption`).
5. `js-moi-signer/src.ts/signer.ts`, `js-moi-wallet/src.ts/wallet.ts` →
   `references/wallet-signer.md`.
6. `js-moi-manifest/src.ts/*` → `references/manifest.md`.
7. `js-moi-logic/src.ts/*` → `references/logic.md`.
8. `js-moi-asset/src.ts/*` (every `mas*-asset.ts`, `asset-factory.ts`,
   `asset-driver.ts`) → `references/assets.md`.
9. `references/concepts.md` and `references/patterns.md`: re-read against the
   above; update numbers (fuel defaults, storage fund) and narrative.
10. `SKILL.md`: the import list, the migration table, the 60-second flow, the
    gotchas list, and the stamp.

For every example, install the matching npm package in a scratch project
(`npm install js-moi-sdk@X.Y.Z`), run the scripts against devnet with a funded
account, and record the interaction hashes in the changelog entry. Compile the
embedded Coco snippets with the matching compiler. If devnet cannot be used,
say so in the changelog and in each example's status note instead of implying a
run. For any claim that drifted, read the source, correct the reference, bump
the stamps, and note it in `CHANGELOG.md`. APIs have shifted **between release
candidates** (rc1 reordered `decimals`/`option`, rc3 renamed `payer`), so treat
every tag as a possible drift point, not just majors.

## Conventions

- **Examples are plain JavaScript**, not TypeScript; `examples/` targets live
  demos where speed beats abstraction. References may use `ts` blocks for type
  clarity, but runnable snippets should work as `.js`.
- **Deploy from JSON manifests, not YAML**; unquoted `0x` hex literals break
  `ManifestCoder` when parsed from YAML. Any manifest-deploy example uses `.json`.
- **Document gotchas where they bite.** A landmine that surfaces as an SDK error
  (e.g. a fuel-limit or receipt-status failure) belongs in `references/patterns.md`
  or an `examples/` file, phrased as "looks like X, is actually Y."

## Repo map

| Path | What it is |
|---|---|
| `SKILL.md` | Entry point: 60-second flow, cross-cutting gotchas, reference map |
| `references/*.md` | Deep-dive API references, one per SDK area, each source-verified |
| `examples/*.md` | Lived, end-to-end flows (e.g. Voyage devnet NFT mint→transfer) |
| `README.md` | Human-facing overview, install, revalidation |
| `AGENTS.md` | This file: maintenance process |
| `CHANGELOG.md` | Version history and SDK-version stamps |
