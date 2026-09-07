# AGENTS.md — maintaining this skill

Instructions for an agent (or human) **editing this repository**. This is the
contributor-facing counterpart to `SKILL.md`, which is the consumer-facing
reference an agent reads when *using* js-moi-sdk. Do not confuse the two:

- `SKILL.md` + `references/` + `examples/` — the product. Read by agents building
  against the SDK.
- `AGENTS.md` (this file) — the process. Read by agents changing the product.

## Golden rule: the SDK source is the only authority

Every claim in `references/*.md` must be verifiable against a specific
`js-moi-sdk` source file. **Never edit a reference from memory or from npm docs**
— npm docs sometimes describe a different version. Before changing or adding a
claim:

1. `grep` the symbol in the SDK checkout under `packages/<pkg>/src.ts/`.
2. Cite the file (path, and file:line where it helps a reader jump).
3. Prefer the exact casing/signature/return type from the source over what
   "reads well."

The reference SDK checkout for this repo is `js-moi-sdk` at the version named in
the stamps (currently **v0.7.1**), with `npm install` run so the umbrella package
builds.

## Before every commit

1. **Re-check any changed claim against the SDK source.** For every reference you
   touched, `grep` the symbol in `packages/<pkg>/src.ts/` and confirm the casing,
   signature, return type, and enum values still match.
2. **Keep version stamps in sync.** Every file in `references/` carries a
   greppable "verified against … (vX.Y.Z)" line, and `SKILL.md` repeats the
   version. If you revalidate against a new SDK release, bump **all** of them
   together — mismatched stamps are how drift hides. Quick check:
   ```sh
   grep -rl "verified against" references/*.md | wc -l   # must equal file count
   grep -ro "v0\.7\.[0-9]" SKILL.md references/*.md | sort -u   # must be one version
   ```
3. **Update `CHANGELOG.md`** with what changed and, if the SDK version moved, the
   new "verified against" version.
4. **No junk files.** Editor artifacts must never ship. `.gitignore` covers
   `.DS_Store`, `node_modules/`, and `*.code-workspace`; if you introduce a new
   artifact class, ignore it too. Check `git status --porcelain --ignored`.

## Revalidating after an SDK release

```sh
cd /path/to/js-moi-sdk && git pull && npm install   # update + build the SDK
```

Then walk the references against the updated `src.ts/` sources: for any claim
that drifted, read the source, correct the reference, bump the stamps, and note
it in `CHANGELOG.md`. APIs have shifted **within** the 0.7.x series (keystores
appeared in 0.7.1), so treat every patch release as a possible drift point, not
just majors.

## Conventions

- **Examples are plain JavaScript**, not TypeScript — `examples/` targets live
  demos where speed beats abstraction. References may use `ts` blocks for type
  clarity, but runnable snippets should work as `.js`.
- **Deploy from JSON manifests, not YAML** — unquoted `0x` hex literals break
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
| `AGENTS.md` | This file — maintenance process |
| `CHANGELOG.md` | Version history and SDK-version stamps |
