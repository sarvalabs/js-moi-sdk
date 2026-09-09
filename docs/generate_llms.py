#!/usr/bin/env python3
"""Regenerate source/_extra/llms.txt and llms-full.txt from the rendered docs.

llms-full.txt is built from Sphinx's *text* builder output, so autodoc
(sphinx_js) API blocks are fully expanded — never from the raw .rst sources,
which would drop nearly all API reference content.

Run from docs/:  make llms   (or: python3 generate_llms.py)
Requires the same toolchain as the HTML build (sphinx, sphinx_rtd_theme,
sphinx_js + jsdoc).
"""

import os
import subprocess
import sys
import tempfile

BASE = "https://js-moi-sdk.docs.moi.technology/"

# Page order + descriptions mirror the ".. meta:: :description:" values in the
# .rst sources. When adding a page: add its .rst meta description AND a row
# here (the health of this table is checked by eye in PR review).
PAGES = {
    "index": ("js-moi-sdk documentation", "js-moi-sdk is a feature-rich JavaScript/TypeScript library for interacting with the MOI Protocol - providers, signers, wallets, logic, and utilities in one SDK."),
    "getting-started": ("Getting Started", "Install js-moi-sdk with npm and make your first calls to the MOI network - providers, wallet setup, and a first interaction in JavaScript or TypeScript."),
    "constants": ("Constants", "Protocol constants exposed by js-moi-sdk for the MOI network."),
    "providers": ("Providers", "Connect to MOI nodes with js-moi-sdk providers - JSON-RPC and WebSocket providers for reading state, balances, tesseracts, and submitting interactions."),
    "signer": ("Signer", "Sign MOI interactions and messages with js-moi-sdk - the Signer API, wallets, and cryptographic proof of account authority."),
    "interactions": ("Interactions", "Create, sign, and send MOI interactions with js-moi-sdk - transfers, asset creation, logic deploy and invoke, with complete API reference and examples."),
    "utilities": ("Utilities", "js-moi-sdk utility functions - encoding, address and identifier helpers, unit conversion, and other tools for MOI development."),
    "agent-skill": ("Agent Skill", "A downloadable SKILL.md package that teaches AI coding agents (Claude Code, Cursor) the js-moi-sdk API surface, including Voyage devnet flows."),
    "contributions": ("Contributions", "How to contribute to js-moi-sdk - repository layout, development setup, and pull request guidelines."),
    "license-and-copyright": ("License and Copyright", "License and copyright terms for js-moi-sdk."),
}


def url(name: str) -> str:
    return BASE + (name if name != "index" else "")


def main() -> int:
    here = os.path.dirname(os.path.abspath(__file__))
    os.chdir(here)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            [sys.executable, "-m", "sphinx", "-q", "-b", "text", "source", tmp],
            check=True,
        )
        index = [
            "# js-moi-sdk",
            "",
            "> js-moi-sdk is a feature-rich JavaScript/TypeScript library for interacting with the MOI Protocol - the participant layer for AI agents. It provides providers, signers, wallets, logic bindings, and utilities. Install: npm install js-moi-sdk. Built by Sarva Labs.",
            "",
            "## Documentation",
            "",
        ]
        full = [
            "# js-moi-sdk documentation - full text",
            "",
            "> Full rendered text of js-moi-sdk.docs.moi.technology (Sphinx text build, autodoc expanded). See /llms.txt for the index.",
            "",
        ]
        for name, (title, desc) in PAGES.items():
            index.append(f"- [{title}]({url(name)}): {desc}")
            with open(os.path.join(tmp, f"{name}.txt"), encoding="utf-8") as f:
                text = f.read().strip()
            full += ["---", f"# {title}", f"URL: {url(name)}", f"Description: {desc}", "", text, ""]
        index += [
            "",
            "## For AI coding agents",
            "",
            f"- [Agent Skill]({BASE}agent-skill): download the SKILL.md package that teaches AI coding agents the js-moi-sdk API surface",
            "",
            "## MOI ecosystem",
            "",
            "- [MOI](https://moi.technology/): the participant layer for AI agents",
            "- [MOI protocol docs](https://docs.moi.technology/): concepts, tutorials, APIs",
            "- [Coco language docs](https://cocolang.dev/): the language for writing MOI logics",
            "- [GitHub](https://github.com/sarvalabs/js-moi-sdk)",
        ]
        with open("source/_extra/llms.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(index) + "\n")
        with open("source/_extra/llms-full.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(full) + "\n")
        # Markdown negotiation: emit each page's rendered text at both
        # fallback forms agents probe - /<page>.md and /<page>/index.md
        # (html_extra_path copies _extra/ to the site root).
        for name, (title, desc) in PAGES.items():
            with open(os.path.join(tmp, f"{name}.txt"), encoding="utf-8") as f:
                text = f.read().strip()
            md = f"# {title}\n\n> {desc}\n\n{text}\n"
            base = "index" if name == "index" else name
            for out in (f"source/_extra/{base}.md", f"source/_extra/{name}/index.md" if name != "index" else None):
                if out is None:
                    continue
                os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
                with open(out, "w", encoding="utf-8") as f:
                    f.write(md)
    size = os.path.getsize("source/_extra/llms-full.txt")
    print(f"generated source/_extra/llms.txt and llms-full.txt ({size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
