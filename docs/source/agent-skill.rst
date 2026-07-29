============
Agent Skill
============

--------------------------------------------------------------------------------

The **js-moi-sdk agent skill** teaches AI coding agents (Claude Code, Cursor, and
any tool that supports the ``SKILL.md`` format) the API surface of js-moi-sdk
|version| — plus practical examples covering fuel reservation, nonce
serialization, event decoding, keystore round-trips, MAS1/MAS2 differences, and
Voyage devnet flows.

--------------------------------------------------------------------------------

Download
--------

`js-moi-sdk-skills.zip <https://cdn.moi.technology/js-moi-sdk-skills/js-moi-sdk-0.7.1-skills.zip>`_

The archive contains:

- ``SKILL.md`` — entry point: the 60-second flow, cross-cutting gotchas, and a
  map of which reference to read for which task.
- ``references/`` — ten deep-dive references (providers, wallet/signer, logic,
  manifest, assets, interactions, identifiers, utils/constants, MOI concepts, and
  battle-tested patterns).
- ``examples/`` — lived, end-to-end flows in plain JavaScript against Voyage
  devnet (NFT mint/transfer, Flipper, native assets + TaxToken, lockup swap).

--------------------------------------------------------------------------------

Using the skill
---------------

**1. Unzip it into your agent's skills directory.**

.. code-block:: shell

    unzip js-moi-sdk-skills.zip -d js-moi-sdk-skills

Then place the ``js-moi-sdk-skills/`` folder where your agent looks for skills:

- **Claude Code / Cursor** — put it under your project's or user's skills
  directory (any tool that reads the ``SKILL.md`` format will pick it up).
- **OpenClaw** — install directly:

  .. code-block:: shell

      openclaw skills install js-moi-sdk

**2. Let the agent read it on demand.** The agent loads ``SKILL.md`` first (the
map), then opens only the reference or example it needs for the task at hand — you
do not need to paste anything manually.

--------------------------------------------------------------------------------

.. note::

    The skill targets js-moi-sdk |version|.
