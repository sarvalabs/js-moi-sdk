# js-moi-sdk agent skill

An [agent skill](https://docs.openclaw.ai/tools/creating-skills) that teaches
coding agents the real, verified API surface of
[js-moi-sdk](https://github.com/sarvalabs/js-moi-sdk) — the JavaScript/TypeScript
SDK for the MOI Protocol blockchain — plus the gotchas that cost hours when
learned the hard way (fuel reservation, nonce serialization, event decoding,
keystore round-trips, MAS1/MAS2 signature differences, and more).

**Currently verified against js-moi-sdk v0.7.1.**

## Layout

- `SKILL.md` — entry point: the 60-second flow, cross-cutting gotchas, and a
  map of which reference to read for which task.
- `references/` — ten deep-dive references (providers, wallet/signer, logic,
  manifest, assets, interactions, identifiers, utils/constants, MOI concepts,
  and battle-tested patterns), each stating the SDK sources it was verified
  against (some also carry file:line citations).
- `examples/` — lived, end-to-end flows in plain JS (e.g. Voyage devnet NFT
  mint→transfer) that pin the network-specific choices the references leave open.
- `AGENTS.md` — maintenance process for anyone (agent or human) editing this
  skill; `CHANGELOG.md` — version history and SDK-version stamps.

## Install

With [OpenClaw](https://openclaw.ai):

```bash
openclaw skills install js-moi-sdk
```

Or copy the folder into your agent's skills directory (any agent that supports
the `SKILL.md` format).

## Revalidating after an SDK release

```bash
cd /path/to/js-moi-sdk && git pull && npm install
```

Then re-check the reference claims against the updated `src.ts/` sources and bump
the "verified against" stamps.

Fix any reference claim that drifted, bump the "verified against" stamps in
`SKILL.md` and `references/*.md`, and publish with a changelog noting the new SDK
version.

## License

MIT. The js-moi-sdk itself is Apache-2.0/MIT dual-licensed by Sarva Labs; this
skill documents it but contains no SDK code.
