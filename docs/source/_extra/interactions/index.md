# Interactions

> Create, sign, and send MOI interactions with js-moi-sdk - transfers, asset creation, logic deploy and invoke, with complete API reference and examples.

Interactions
************


Overview
========

The Interactions package provides high-level abstractions to construct
and send **participant** and **account-related interactions** in the
MOI protocol.

These interactions are essential for managing identity, access
control, and account configuration within the decentralized MOI
ecosystem.

This package offers a set of structured builder classes that help
developers create valid, signed transactions with minimal boilerplate.
Each interaction is represented by an "InteractionContext" that
defines the operation type, payload, participants, and signer.

======================================================================


Core Classes
============


Account Management
------------------


ParticipantCreate
~~~~~~~~~~~~~~~~~

The **ParticipantCreate** class is responsible for creating new
participants within the MOI network. A participant can represent a
user, organization, or entity that interacts with assets and logic
instances.

This builder helps define the participant’s unique ID, attach
cryptographic keys, and optionally include an asset payload for
initial value assignment.

**Key Responsibilities:**

* Initialize a new participant ID

* Add one or more cryptographic keys with configurable weights

* Define asset payloads (e.g: token allocations)

* Construct and send the participant creation request

**Example:**

   const participant = new ParticipantCreate(wallet);

   const response = await participant
       .id("0x000000004678e9f5bf2f66362ef5367fbc72efe7b419a5e7d851f57b00000000")
       .addKey(
           "0x00000000513b40a069905a1b05bd28d8338ad4a2eff419d7972be75900000000",
           1000,
           0
       )
       .value(
           KMOI_ASSET_ID,
           "0x00000000513b40a069905a1b05bd28d8338ad4a2eff419d7972be75900000000",
           5000
       )
       .send();

   console.log("Hash:", response.hash);

   const receipt = await response.wait();
   console.log("Receipt:", receipt);


AccountConfigure
~~~~~~~~~~~~~~~~

The **AccountConfigure** class allows you to modify the key
configuration of an existing account. It supports both **adding new
keys** and **revoking old ones**, enabling dynamic control over
account authorization and key rotation.

**Key Responsibilities:**

* Add new keys with specific weights and signature algorithms

* Revoke existing keys by their IDs

* Build and send the account configuration interaction

**Example:**

   const account = new AccountConfigure(wallet);

   const response = await account
       .addKey(
           "0x000000004678e9f5bf2f66362ef5367fbc72efe7b419a5e7d851f57b00000000",
           1000
       )
       .send();

   console.log("Hash:", response.hash);

   const receipt = await response.wait();
   console.log("Receipt:", receipt);


AccountInherit
~~~~~~~~~~~~~~

The **AccountInherit** class handles inheritance operations between
accounts on the MOI network. It enables one account to inherit
ownership or value from another through a controlled, logic-based
transfer process.

**Key Responsibilities:**

* Set the target account to inherit from

* Attach an asset payload defining transfer details

* Specify a sub-account index for hierarchical inheritance

* Construct and send the inheritance interaction

**Example:**

   const account = new AccountInherit(wallet);

   const response = await account
       .index(0)
       .target(logicId)
       .value(
           KMOI_ASSET_ID,
           "0x00000000513b40a069905a1b05bd28d8338ad4a2eff419d7972be75900000000",
           5000
       )
       .send();

   console.log("Hash:", response.hash);

   const receipt = await response.wait();
   console.log("Receipt:", receipt);

======================================================================


Asset Management
----------------

This module provides classes and utilities for creating, managing, and
interacting with on-chain assets within the MOI framework. It defines
three main components:

* "AssetFactory" – Responsible for asset creation.

* "AssetDriver" – Provides a driver abstraction for asset logic
  execution.

* "MAS0AssetLogic" – Implements the standard MAS0 asset logic and
  operations such as mint, burn, and transfer.


AssetFactory
~~~~~~~~~~~~

class AssetFactory()

   The "AssetFactory" class is responsible for **deploying custom
   (MASX) asset logic** on the MOI network - assets that ship their
   own client-supplied manifest. It defines the static "create" method
   which constructs an "InteractionContext" for asset creation
   operations.

   **Method Summary**

   AssetFactory.static create(signer, symbol, supply, manager, enableEvents, manifest, callsite, ...calldata)

      Creates a new custom (MASX) asset creation interaction context.

      Arguments:
         * **signer** (*Signer*) -- The signer instance responsible
           for authorizing the asset creation.

         * **symbol** (*str*) -- The symbol or shorthand name of the
           asset.

         * **supply** (*int | bigint*) -- The total maximum supply of
           the asset.

         * **manager** (*str*) -- The manager or owner address (in Hex
           format).

         * **enableEvents** (*bool*) -- Whether to enable event
           emission for the asset.

         * **manifest** (*LogicManifest.Manifest*) -- Logic manifest
           for the custom asset logic being deployed.

         * **callsite** (*str*) -- (Optional) Routine name in the
           manifest corresponding to the deploy logic. Required if the
           manifest defines any deploy routine at all - only omit it
           for a manifest with none.

         * **calldata** (*list*) -- (Optional) Additional
           initialization arguments for the deploy routine, optionally
           ending with a "RoutineOption".

      Returns:
         An "InteractionContext" configured for asset creation.

      Return type:
         InteractionContext<OpType.ASSET_CREATE>

      Throws:
         If "callsite" is omitted but "manifest" defines one or more
         deploy routines, if no deploy routine in "manifest" matches a
         given "callsite", or if required calldata arguments are
         missing.

      **Logic**

      1. Builds an "AssetCreatePayload" containing "symbol",
         "max_supply", "standard" (always "AssetStandard.MASX"),
         "dimension" (default 0), "enable_events", and "manager"
         (converted to Hex).

      2. **``callsite`` is only optional when the manifest has nothing
         to call.** Mirrors the blockchain's "DeployLogic": a deployer
         call is skipped entirely only if the manifest defines *no*
         deploy routine at all. If it defines one or more, "callsite"
         is required to pick one - an omitted callsite is rejected the
         same as a mismatched one. When a "callsite" is given, finds
         the matching deploy routine, validates the calldata argument
         count against it, then encodes the manifest and deploy
         calldata into "logic_payload".

      3. **Bundles a funding transfer automatically.** A brand-new
         asset account self-pays for its own creation-time storage
         cost, and a fresh account holds no KMOI. "create()" derives
         the new asset's id ("deriveAssetId()") and bundles a second
         "ASSET_INVOKE" "Transfer" op funding it, in the same
         interaction - without this the create reverts. The funded
         amount defaults to "DEFAULT_STORAGE_FUND"; override it by
         passing a "RoutineOption" with "storageFund" set as the last
         "calldata" argument.

      4. Returns an "InteractionContext" initialized for
         "ASSET_CREATE".

      **Usage Example - plain native asset (the common case)**

         // Native standard - use MAS0AssetLogic, not AssetFactory (no manifest, node uses its own built-in one).
         const ctx = MAS0AssetLogic.create(signer, "GOLD", 1000000n, managerAddress, true);
         const response = await ctx.send();

      **Usage Example - custom (MASX) asset with your own logic**

         const ctx = AssetFactory.create(
              signer,
              "GOLD",
              1000000n,
              managerAddress,
              true,
              manifest,
              callsite,
              1000, // calldata arg 1
              "JOHN" // calldata arg 2
         );

         const response = await ctx.send();

      **Usage Example - overriding the funding amount**

         import { createRoutineOption } from "js-moi-sdk";

         const ctx = AssetFactory.create(
              signer, "GOLD", 1000000n, managerAddress, true,
              manifest, callsite, 1000, "JOHN",
              createRoutineOption({ storageFund: 50000 })
         );

         const response = await ctx.send();


AssetDriver
~~~~~~~~~~~

class AssetDriver()

   The "AssetDriver" class extends "LogicDriver" and represents a
   **driver interface** for interacting with a deployed custom asset
   logic.

   **Constructor**

   AssetDriver.constructor(assetId, manifest, signer)

      Initializes a new "AssetDriver" instance.

      Arguments:
         * **assetId** (*str*) -- The unique identifier (asset ID) of
           the asset.

         * **manifest** (*LogicManifest.Manifest*) -- The logic
           manifest associated with the asset.

         * **signer** (*Signer*) -- The signer responsible for
           authorization.

      **Logic**

      The constructor simply calls the base "LogicDriver" constructor
      with the provided parameters, enabling interaction with the
      deployed asset logic.

      **Usage Example**

         const driver = new AssetDriver(assetId, manifest, signer);
         const response = driver.routines.mint(beneficiary, 5000).send();


MAS Asset Standards
~~~~~~~~~~~~~~~~~~~

The MOI Asset Standards (MAS) define a series of progressively capable
asset logic specifications on the MOI network. Each standard builds on
the previous one, enabling developers to choose the appropriate level
of functionality and complexity for their asset use case.


MAS0AssetLogic
~~~~~~~~~~~~~~

MAS0 defines the standard contract for fungible assets, where all
units belong to a single token ID and are fully interchangeable. It
supports minting, burning, transfers, approvals, lockups, and asset-
level metadata, making it suitable for currencies and utility tokens.

class MAS0AssetLogic()

   Implements the standard **MAS0 asset logic**, which provides a set
   of default routines for asset lifecycle management — including
   minting, burning, transferring, approving, locking, and querying
   balances.

   **Constructor**

   MAS0AssetLogic.constructor(assetId, signer)

      Initializes a new "MAS0AssetLogic" instance.

      Arguments:
         * **assetId** (*str*) -- The asset ID to operate on.

         * **signer** (*Signer*) -- The signer instance for
           authorization.

   **Static Methods**

   MAS0AssetLogic.static async newAsset(signer, symbol, supply, manager, enableEvents, option)

      Creates a new MAS0-standard asset on-chain, then returns an
      instance of "MAS0AssetLogic" for interacting with it.

      Arguments:
         * **option** (*RoutineOption*) -- (Optional) Override
           "storageFund" (defaults to "DEFAULT_STORAGE_FUND") to fund
           the new asset's creation-time storage cost with.

      Returns:
         An instance of "MAS0AssetLogic"

      Return type:
         MAS0AssetLogic

      **Example**

         const gold = await MAS0AssetLogic.newAsset(
             signer,
             "GOLD",
             1000000n,
             managerAddress,
             true
         );

   MAS0AssetLogic.static create(signer, symbol, supply, manager, enableEvents, option)

      Builds an "InteractionContext" for creating a MAS0-standard
      asset. Like "AssetFactory.create()", this automatically bundles
      a funding transfer to the derived new asset id (funded at
      "DEFAULT_STORAGE_FUND" by default, override via
      "option.storageFund") - a fresh asset account self-pays for its
      own creation-time storage cost and starts with no KMOI.

      Arguments:
         * **option** (*RoutineOption*) -- (Optional) Override
           "storageFund" to fund the new asset with.

      Returns:
         InteractionContext<OpType.ASSET_CREATE>

**MAS0 Operations**

The following methods correspond to MAS0-standard asset operations.
Each operation returns an "InteractionContext", which can be executed
by calling ".send()".

mint(beneficiary, amount)

   Mints new asset units to the specified beneficiary.

   Arguments:
      * **beneficiary** (*str*) -- Recipient participant id.

      * **amount** (*int | bigint*) -- Amount to mint.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.mint(beneficiary, 5000).send();

burn(amount)

   Burns a specified amount of the asset, reducing total supply.

   Arguments:
      * **amount** (*int | bigint*) -- Amount to burn.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.burn(1000).send();

transfer(beneficiary, amount)

   Transfers asset units to another account.

   Arguments:
      * **beneficiary** (*str*) -- Recipient participant id.

      * **amount** (*int | bigint*) -- Amount to transfer.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.transfer(beneficiary, 2500).send();

transferFrom(benefactor, beneficiary, amount)

   Transfers asset units from a benefactor to a beneficiary (if
   approved).

   Arguments:
      * **benefactor** (*str*) -- The participant id of the original
        holder.

      * **beneficiary** (*str*) -- The receiver participant id.

      * **amount** (*int | bigint*) -- Amount to transfer.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.transferFrom(benefactor, beneficiary, 100000).send();

approve(beneficiary, amount, expiresAt)

   Grants spending permission to another account.

   Arguments:
      * **beneficiary** (*str*) -- The spender participant id.

      * **amount** (*int | bigint*) -- Allowance amount.

      * **expiresAt** (*int*) -- Expiration timestamp (UNIX time).

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.approve(beneficiary, 100000, 1765650600).send();

revoke(beneficiary)

   Revokes a previously approved allowance.

   Arguments:
      * **beneficiary** (*str*) -- Account to revoke approval from.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.revoke(beneficiary).send();

lockup(beneficiary, amount)

   Locks up a specified amount of tokens under "SARGA_ADDRESS".

   Arguments:
      * **beneficiary** (*str*) -- Participant id of whose tokens are
        being locked.

      * **amount** (*int | bigint*) -- Amount to lock.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.lockup(beneficiary, 10000).send();

release(benefactor, beneficiary, amount)

   Releases locked-up tokens back to a beneficiary.

   Arguments:
      * **benefactor** (*str*) -- The original owner of the locked
        tokens.

      * **beneficiary** (*str*) -- The receiver of the released
        tokens.

      * **amount** (*int | bigint*) -- Amount to release.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.release(benefactor, beneficiary, 100).send();

SetStaticMetadata(key, value)

   Sets or updates a static metadata entry for the asset.

   Arguments:
      * **key** (*str*) -- The metadata key.

      * **value** (*str*) -- The metadata value.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.setStaticMetadata(key, value).send();

SetDynamicMetadata(key, value)

   Sets or updates a dynamic metadata entry for the asset.

   Arguments:
      * **key** (*str*) -- The metadata key.

      * **value** (*str*) -- The metadata value.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.setDynamicMetadata(key, value).send();

**Readonly Routines**

symbol()

   Returns an interaction context for retrieving the asset symbol.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas0.symbol().call();

balanceOf(id)

   Retrieves the balance of a given account.

   Arguments:
      * **id** (*str*) -- The participant id to query.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const balance = await mas0.balanceOf(walletAddress).call();

creator()

   Returns an interaction context for retrieving the asset creator.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas1.creator().call();

manager()

   Returns an interaction context for retrieving the asset manager.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas1.manager().call();

decimals()

   Returns an interaction context for retrieving the asset decimals.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas1.decimals().call();

maxSupply()

   Returns an interaction context for retrieving the asset max supply.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas1.maxSupply().call();

circulatingSupply()

   Returns an interaction context for retrieving the asset circulating
   supply.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas1.circulatingSupply().call();

getStaticMetadata(key, value)

   Retrieves the static metadata entry for the asset.

   Arguments:
      * **key** (*str*) -- The metadata key.

      * **value** (*str*) -- The metadata value.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.getStaticMetadata(key, value).send();

getDynamicMetadata(key, value)

   Retrieves the dynamic metadata entry for the asset.

   Arguments:
      * **key** (*str*) -- The metadata key.

      * **value** (*str*) -- The metadata value.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.getDynamicMetadata(key, value).send();


MAS1AssetLogic
~~~~~~~~~~~~~~

MAS1 defines the standard contract for non-fungible assets, where each
token has a unique token ID and a supply of one. It supports per-token
ownership, transfers, approvals, lockups, and both asset-level and
token-level metadata, making it suitable for collectibles and
identity-like assets.

class MAS1AssetLogic()

   Implements the standard **MAS1 asset logic**, which provides a set
   of default routines for asset lifecycle management — including
   minting, burning, transferring, approving, locking, and querying
   balances.

   **Constructor**

   MAS1AssetLogic.constructor(assetId, signer)

      Initializes a new "MAS1AssetLogic" instance.

      Arguments:
         * **assetId** (*str*) -- The asset ID to operate on.

         * **signer** (*Signer*) -- The signer instance for
           authorization.

   **Static Methods**

   MAS1AssetLogic.static async newAsset(signer, symbol, manager, enableEvents, option)

      Creates a new MAS1-standard asset on-chain, then returns an
      instance of "MAS1AssetLogic" for interacting with it. MAS1 is
      single-unit (NFT-like) - unlike MAS0/MAS2 there is no "supply"
      parameter, "max_supply" is always 1.

      Arguments:
         * **option** (*RoutineOption*) -- (Optional) Override
           "storageFund" (defaults to "DEFAULT_STORAGE_FUND") to fund
           the new asset's creation-time storage cost with.

      Returns:
         An instance of "MAS1AssetLogic"

      Return type:
         MAS1AssetLogic

      **Example**

         const gold = await MAS1AssetLogic.newAsset(
             signer,
             "GOLD",
             managerAddress,
             true
         );

   MAS1AssetLogic.static create(signer, symbol, manager, enableEvents, option)

      Builds an "InteractionContext" for creating a MAS1-standard
      asset. Like "AssetFactory.create()", this automatically bundles
      a funding transfer to the derived new asset id (funded at
      "DEFAULT_STORAGE_FUND" by default, override via
      "option.storageFund") - a fresh asset account self-pays for its
      own creation-time storage cost and starts with no KMOI.

      Arguments:
         * **option** (*RoutineOption*) -- (Optional) Override
           "storageFund" to fund the new asset with.

      Returns:
         InteractionContext<OpType.ASSET_CREATE>

**MAS1 Operations**

The following methods correspond to MAS1-standard asset operations.
Each operation returns an "InteractionContext", which can be executed
by calling ".send()".

mint(beneficiary)

   Mints new asset units to the specified beneficiary.

   Arguments:
      * **beneficiary** (*str*) -- Recipient participant id.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.mint(beneficiary).send();

mintWithMetadata(beneficiary, staticMetadata)

   Mints new asset units to the specified beneficiary.

   Arguments:
      * **beneficiary** (*str*) -- Recipient participant id.

      * **static_metadata** (*record*) -- Static metadata to mint.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.mintWithMetadata(beneficiary, staticMetadata).send();

burn(tokenId)

   Burns a specified token, reducing total supply.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to burn.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.burn(tokenId).send();

transfer(tokenId, beneficiary)

   Transfers asset units to another account.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to transfer.

      * **beneficiary** (*str*) -- Recipient participant id.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.transfer(tokenId, beneficiary).send();

transferFrom(tokenId, benefactor, beneficiary)

   Transfers asset units from a benefactor to a beneficiary (if
   approved).

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to transfer.

      * **benefactor** (*str*) -- The participant id of the original
        holder.

      * **beneficiary** (*str*) -- The receiver participant id.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.transferFrom(tokenId, benefactor, beneficiary).send();

approve(tokenId, beneficiary, expiresAt)

   Grants spending permission to another account.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to approve.

      * **beneficiary** (*str*) -- The spender participant id.

      * **expiresAt** (*int*) -- Expiration timestamp (UNIX time).

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.approve(tokenId, beneficiary, 1765650600).send();

revoke(tokenId, beneficiary)

   Revokes a previously approved allowance.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to revoke.

      * **beneficiary** (*str*) -- Account to revoke approval from.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.revoke(tokenId, beneficiary).send();

lockup(tokenId, beneficiary)

   Locks up a specified amount of tokens under "SARGA_ADDRESS".

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to lockup.

      * **beneficiary** (*str*) -- Participant id of whose tokens are
        being locked.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.lockup(tokenId, beneficiary).send();

release(tokenId, benefactor, beneficiary)

   Releases locked-up tokens back to a beneficiary.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to release.

      * **benefactor** (*str*) -- The original owner of the locked
        tokens.

      * **beneficiary** (*str*) -- The receiver of the released
        tokens.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.release(tokenId, benefactor, beneficiary).send();

setStaticMetadata(key, value)

   Sets or updates a static metadata entry for the asset.

   Arguments:
      * **key** (*str*) -- The metadata key.

      * **value** (*str*) -- The metadata value.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.setStaticMetadata(key, value).send();

setDynamicMetadata(key, value)

   Sets or updates a dynamic metadata entry for the asset.

   Arguments:
      * **key** (*str*) -- The metadata key.

      * **value** (*str*) -- The metadata value.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.setDynamicMetadata(key, value).send();

setStaticTokenMetadata(tokenId, key, value)

   Sets or updates a static token metadata entry for the asset.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to set token
        metadata.

      * **key** (*str*) -- The metadata key.

      * **value** (*str*) -- The metadata value.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.setStaticMetadata(tokenId, key, value).send();

setDynamicTokenMetadata(tokenId, key, value)

   Sets or updates a dynamic token metadata entry for the asset.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to set token
        metadata.

      * **key** (*str*) -- The metadata key.

      * **value** (*str*) -- The metadata value.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.setDynamicMetadata(tokenId, key, value).send();

**Readonly Routines**

symbol()

   Returns an interaction context for retrieving the asset symbol.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas1.symbol().call();

isOwner(tokenId, address)

   Retrieves the balance of a given account.

   Arguments:
      * **tokenId** (*int | bigint*) -- The token id.

      * **address** (*str*) -- The participant address to query

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const balance = await mas1.isOwner(tokenId, walletAddress).call();

creator()

   Returns an interaction context for retrieving the asset creator.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas1.creator().call();

manager()

   Returns an interaction context for retrieving the asset manager.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas1.manager().call();

getStaticMetadata(key)

   Retrieves the static metadata entry for the asset.

   Arguments:
      * **key** (*str*) -- The metadata key.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas0.getStaticMetadata(key, value).send();

getDynamicMetadata(key)

   Retrieves the dynamic metadata entry for the asset.

   Arguments:
      * **key** (*str*) -- The metadata key.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas0.getDynamicMetadata(key, value).send();

getStaticTokenMetadata(tokenId, key)

   Retrieves the static token metadata entry for the asset.

   Arguments:
      * **tokenId** (*int | bigint*) -- The token id.

      * **key** (*str*) -- The metadata key.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas2.getStaticMetadata(tokenId, key).send();

getDynamicTokenMetadata(tokenId, key)

   Retrieves the dynamic token metadata entry for the asset.

   Arguments:
      * **tokenId** (*int | bigint*) -- The token id.

      * **key** (*str*) -- The metadata key.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas2.getDynamicMetadata(tokenId, key).send();


MAS2AssetLogic
~~~~~~~~~~~~~~

MAS2 defines the standard contract for multi-token (semi-fungible)
assets, where each token ID represents a distinct class with its own
variable supply. It supports partial transfers, approvals, lockups,
burns, and token-level metadata, making it suitable for batch-based,
editioned, or class-based assets.

class MAS2AssetLogic()

   Implements the standard **MAS2 asset logic**, which provides a set
   of default routines for asset lifecycle management — including
   minting, burning, transferring, approving, locking, and querying
   balances.

   **Constructor**

   MAS2AssetLogic.constructor(assetId, signer)

      Initializes a new "MAS2AssetLogic" instance.

      Arguments:
         * **assetId** (*str*) -- The asset ID to operate on.

         * **signer** (*Signer*) -- The signer instance for
           authorization.

   **Static Methods**

   MAS2AssetLogic.static async newAsset(signer, symbol, supply, manager, enableEvents, option)

      Creates a new MAS2-standard asset on-chain, then returns an
      instance of "MAS2AssetLogic" for interacting with it.

      Arguments:
         * **option** (*RoutineOption*) -- (Optional) Override
           "storageFund" (defaults to "DEFAULT_STORAGE_FUND") to fund
           the new asset's creation-time storage cost with.

      Returns:
         An instance of "MAS2AssetLogic"

      Return type:
         MAS2AssetLogic

      **Example**

         const gold = await MAS2AssetLogic.newAsset(
             signer,
             "GOLD",
             1000000n,
             managerAddress,
             true
         );

   MAS2AssetLogic.static create(signer, symbol, supply, manager, enableEvents, option)

      Builds an "InteractionContext" for creating a MAS2-standard
      asset. Like "AssetFactory.create()", this automatically bundles
      a funding transfer to the derived new asset id (funded at
      "DEFAULT_STORAGE_FUND" by default, override via
      "option.storageFund") - a fresh asset account self-pays for its
      own creation-time storage cost and starts with no KMOI.

      Arguments:
         * **option** (*RoutineOption*) -- (Optional) Override
           "storageFund" to fund the new asset with.

      Returns:
         InteractionContext<OpType.ASSET_CREATE>

**MAS2 Operations**

The following methods correspond to MAS2-standard asset operations.
Each operation returns an "InteractionContext", which can be executed
by calling ".send()".

mint(beneficiary)

   Mints new asset units to the specified beneficiary.

   Arguments:
      * **beneficiary** (*str*) -- Recipient participant id.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.mint(beneficiary).send();

mintWithMetadata(beneficiary, staticMetadata)

   Mints new asset units to the specified beneficiary.

   Arguments:
      * **beneficiary** (*str*) -- Recipient participant id.

      * **staticMetadata** (*record*) -- Static metadata to mint.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.mintWithMetadata(beneficiary, staticMetadata).send();

burn(tokenId)

   Burns a specified token, reducing total supply.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to burn.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.burn(tokenId).send();

transfer(tokenId, beneficiary)

   Transfers asset units to another account.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to transfer.

      * **beneficiary** (*str*) -- Recipient participant id.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.transfer(tokenId, beneficiary).send();

transferFrom(tokenId, benefactor, beneficiary)

   Transfers asset units from a benefactor to a beneficiary (if
   approved).

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to transfer.

      * **benefactor** (*str*) -- The participant id of the original
        holder.

      * **beneficiary** (*str*) -- The receiver participant id.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.transferFrom(tokenId, benefactor, beneficiary).send();

approve(tokenId, beneficiary, expiresAt)

   Grants spending permission to another account.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to approve.

      * **beneficiary** (*str*) -- The spender participant id.

      * **expiresAt** (*int*) -- Expiration timestamp (UNIX time).

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.approve(tokenId, beneficiary, 1765650600).send();

revoke(tokenId, beneficiary)

   Revokes a previously approved allowance.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to revoke.

      * **beneficiary** (*str*) -- Account to revoke approval from.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.revoke(tokenId, beneficiary).send();

lockup(tokenId, beneficiary)

   Locks up a specified amount of tokens under "SARGA_ADDRESS".

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to lockup.

      * **beneficiary** (*str*) -- Participant id of whose tokens are
        being locked.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.lockup(tokenId, beneficiary).send();

release(tokenId, benefactor, beneficiary)

   Releases locked-up tokens back to a beneficiary.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to release.

      * **benefactor** (*str*) -- The original owner of the locked
        tokens.

      * **beneficiary** (*str*) -- The receiver of the released
        tokens.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.release(tokenId, benefactor, beneficiary).send();

setStaticMetadata(key, value)

   Sets or updates a static metadata entry for the asset.

   Arguments:
      * **key** (*str*) -- The metadata key.

      * **value** (*str*) -- The metadata value.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.setStaticMetadata(key, value).send();

setDynamicMetadata(key, value)

   Sets or updates a dynamic metadata entry for the asset.

   Arguments:
      * **key** (*str*) -- The metadata key.

      * **value** (*str*) -- The metadata value.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.setDynamicMetadata(key, value).send();

setStaticTokenMetadata(tokenId, key, value)

   Sets or updates a static token metadata entry for the asset.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to set token
        metadata.

      * **key** (*str*) -- The metadata key.

      * **value** (*str*) -- The metadata value.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.setStaticMetadata(tokenId, key, value).send();

setDynamicTokenMetadata(tokenId, key, value)

   Sets or updates a dynamic token metadata entry for the asset.

   Arguments:
      * **tokenId** (*int | bigint*) -- Token id to set token
        metadata.

      * **key** (*str*) -- The metadata key.

      * **value** (*str*) -- The metadata value.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.setDynamicMetadata(tokenId, key, value).send();

**Readonly Routines**

symbol()

   Returns an interaction context for retrieving the asset symbol.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas2.symbol().call();

isOwner(tokenId, address)

   Retrieves the balance of a given account.

   Arguments:
      * **tokenId** (*int | bigint*) -- The token id.

      * **address** (*str*) -- The participant address to query

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const balance = await mas2.isOwner(tokenId, walletAddress).call();

creator()

   Returns an interaction context for retrieving the asset creator.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas2.creator().call();

manager()

   Returns an interaction context for retrieving the asset manager.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas2.manager().call();

getStaticMetadata(tokenId, key)

   Retrieves the static metadata entry for the asset.

   Arguments:
      * **key** (*str*) -- The metadata key.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas2.getStaticMetadata(key).send();

getDynamicMetadata(tokenId, key)

   Retrieves the dynamic metadata entry for the asset.

   Arguments:
      * **key** (*str*) -- The metadata key.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas2.getDynamicMetadata(key).send();

getStaticTokenMetadata(tokenId, key)

   Retrieves the static token metadata entry for the asset.

   Arguments:
      * **tokenId** (*int | bigint*) -- The token id.

      * **key** (*str*) -- The metadata key.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas2.getStaticMetadata(tokenId, key).send();

getDynamicTokenMetadata(tokenId, key)

   Retrieves the dynamic token metadata entry for the asset.

   Arguments:
      * **tokenId** (*int | bigint*) -- The token id.

      * **key** (*str*) -- The metadata key.

   Returns:
      InteractionContext<OpType.ASSET_INVOKE>

   **Example**

      const response = await mas2.getDynamicMetadata(tokenId, key).send();

======================================================================


Logic Management
----------------

The logic module in js-moi-sdk is a powerful component that simplifies
the interaction with MOI logic objects. It provides a user-friendly
interface for deploying, interacting with, and querying logic objects
on the MOI network.

With the logic module, the logic manifests can be easily deployed
using logic factory. This includes the ability to encode and deploy
logics with builder arguments.

Once deployed, the module handles routine calls, interaction sending,
and state queries, abstracting away complexities like parameter
encoding, fuel and interaction signing.

Integration with the wallet and signer modules ensures secure
interaction signing and authorization. Users can choose from different
signers, such as wallet-based signers, or custom signers.


Types
~~~~~

**LogicIxRequest**

The "LogicIxRequest" interface represents a request to deploy or
execute a logic. It has the following properties:

* "call" - "function": A function that facilitates the execution of an
  logic interaction request, while maintaining the integrity of the
  current state. It returns a promise that resolves to an
  "InteractionCallResponse".

* "send" - "function": A function that sends the logic interaction
  request and returns a promise that resolves to an
  "InteractionResponse".

* "estimateFuel" - "function": A function that estimates the fuel
  required for the interaction request and returns a promise.

**Routine**

The "Routine" interface represents a routine function. It has the
following properties:

* A function that can be called with an optional array of arguments
  and returns a value.

* "isMutable" - "function": A function that returns a boolean
  indicating whether the routine is mutable.

* "accepts" - "function": A function that returns an array of
  "TypeField" representing the types of arguments accepted by the
  routine, or "null" if no arguments are accepted.

* "returns" - "function": A function that returns an array of
  "TypeField" representing the types of values returned by the
  routine, or "null" if no values are returned.

**Routines**

The "Routines" interface represents a collection of routines. It is an
object with named properties where the property name is the routine
name and the property value is a "Routine".

**CallSite**

The "CallSite" interface represents a callsite. It has the following
properties:

* "ptr" - "number": The pointer to the callsite.

* "kind" - "string": The kind of the callsite.

**MethodDef**

The "MethodDef" interface represents a method definition. It has the
following properties:

* "ptr" - "number": The pointer to the method.

* "class" - "string": The name of the class.


Manifest Encoder
~~~~~~~~~~~~~~~~

The Manifest Encoder module enables the encoding and decoding of data
according to the MOI Manifest specification. This specification
defines the structure of routines, classes, methods, and state within
logic object, allowing for seamless interaction with their properties.

Through this module, developers can encode data in compliance with the
expected format specified by the logic Manifest. This is particularly
valuable when preparing data for invoking routines on logic object. By
correctly encoding routine parameters according to the logic Manifest,
developers can generate accurate input data that aligns with the logic
objects's expectations.

In addition, this facilitates the decoding of data received from the
blockchain or logic objects. Developers can decode routine call
results, and other Manifest-encoded data structures, enabling them to
extract meaningful information. This capability greatly aids in the
efficient processing and interpretation of data obtained from the MOI
network.

**Types**

**LogicManifest**

The "LogicManifest" module defines the schema for a logic manifest.

   **EngineConfig**

   The "EngineConfig" interface defines the configuration for the
   logic engine. It has two properties:

   * "kind" - "string": The type of logic engine.

   * "flags" - "string[]": A list of flags.

   **TypeField**

   The "TypeField" interface defines a field type. It has three
   properties:

   * "slot" - "number": The slot number of the field.

   * "label" - "string": The label or name of the field.

   * "type" - "string": The type of the field.

   **MethodField**

   The "MethodField" interface defines a method field. It has two
   properties:

   * "ptr" - "number | bigint": The pointer value of the field.

   * "code" - "number | bigint": The code value of the field.

   **Class**

   The "Class" interface defines a class within the logic manifest. It
   has three properties:

   * "name" - "string": The name of the class.

   * "fields" - "TypeField[] | null": An optional array of fields
     within the class.

   * "methods" - "MethodField[] | null": An optional array of methods
     within the class.

   **State**

   The "State" interface defines the state within the logic manifest.
   It has two properties:

   * "kind" - "string": The kind or type of the state.

   * "fields" - "TypeField[]": An array of fields within the state.

   **Constant**

   The "Constant" interface defines a constant within the logic
   manifest. It has two properties:

   * "type" - "string": The type of the constant.

   * "value" - "string": The value of the constant.

   **Instructions**

   The "Instructions" interface defines the instructions within the
   logic manifest. It has three optional properties:

   * "bin" - "number[] | null": An optional array of binary values.

   * "hex" - "string": A hexadecimal representation of the
     instructions (optional).

   * "asm" - "string[] | null": An optional array of assembly
     instructions.

   **Routine**

   The "Routine" interface defines a routine within the logic
   manifest. It has five properties:

   * "name" - "string": The name of the routine.

   * "kind" - "string": The kind or type of the routine.

   * "accepts" - "TypeField[] | null": An optional array of input
     fields that the routine accepts.

   * "returns" - "TypeField[] | null": An optional array of output
     fields that the routine returns.

   * "executes" - "Instructions": The instructions executed by the
     routine.

   * "catches" - "string[] | null": An optional array of exceptions
     caught by the routine.

   **Method**

   The "Method" interface defines a method within a class in the logic
   manifest. It has six properties:

   * "name" - "string": The name of the method.

   * "class" - "string": The name of the class the method belongs to.

   * "accepts" - "TypeField[] | null": An optional array of input
     fields that the method accepts.

   * "returns" - "TypeField[] | null": An optional array of output
     fields that the method returns.

   * "executes" - "Instructions": The instructions executed by the
     method.

   * "catches" - "string[] | null": An optional array of exceptions
     caught by the method.

   **TypeDef**

   The "TypeDef" represents a "string" type definition.

   **Element**

   The "Element" interface represents an element within the logic
   manifest. It has four properties:

   * "ptr" - "number": The pointer value of the element.

   * "kind" - "string": The kind or type of the element.

   * "deps" - "number[] | null": An optional array of dependencies for
     the element.

   * "data" - "State | Constant | TypeDef | Routine | Class | Method":
     The data associated with the element.

   **Manifest**

   The "Manifest" interface represents the overall logic manifest. It
   has three properties:

   * "syntax" - "string": The syntax used in the manifest.

   * "engine" - "EngineConfig": The configuration of the logic engine.

   * "elements" - "Element[]": An array of elements within the
     manifest.

**Exception**

The *Exception* interface defines an exception. It has three
properties:

* "class" - "string": The exception class.

* "data" - "string": The exception message.

* "trace" - "string[]": The stack trace of the exception.

* "revert" - "boolean": Represents the interaction revert status.

**PoloSchema**

The *PoloSchema* interface defines a schema used by polo of
serialization and deserialization. It has two properties:

* "kind" - "string": The type or kind of the schema.

* "fields" - "Record<string, any>": The fields within the schema. It
  is a dictionary-like structure where keys are strings and values are
  object (optional).

**ManifestCoder**

ManifestCoder is a class that provides encoding and decoding
functionality for Manifest Call Encoder. It allows encoding manifests
and arguments, as well as decoding output, exceptions and logic states
based on both predefined and runtime schema.

   // Example
   import { ManifestCoder } from "js-moi-sdk";

   const manifest = { ... }
   const manifestCoder = new ManifestCoder(manifest);

**Methods**

static encodeManifest(manifest)

   Encodes a manifest into a hexadecimal string.

   This function supports encoding both JSON and YAML manifest
   formats. If the input manifest is an object, it is assumed to be a
   JSON manifest and is encoded using the *JsonManifestCoder*. If the
   input manifest is a string, it is assumed to be a YAML manifest and
   is encoded using the *YamlManifestCoder*.

   Arguments:
      * **manifest** -- The manifest to encode. It can be either a
        string (YAML) or an object (JSON).

   Throws:
      Will throw an error if the manifest type is unsupported.

   Returns:
      The encoded manifest as a hexadecimal string prefixed with "0x".

   // Example
   const encodedManifest = ManifestCoder.encodeManifest(manifest)
   console.log(encodedManifest)

   >> "0x0e4f065...50000"

static decodeManifest(manifest, format)

   Decodes a given manifest in either JSON or YAML format.

   Arguments:
      * **manifest** (**string|Uint8Array**) -- The manifest data to
        decode, provided as a string or Uint8Array.

      * **format** (**ManifestCoderFormat**) -- The format of the
        manifest, either JSON or YAML.

   Throws:
      **Error** --

      * Throws an error if the format is unsupported.

   Returns:
      **LogicManifest.Manifest|string** -- - Returns a
      *LogicManifest.Manifest* object if JSON format is used or a
      string representation if YAML format is used.

   // Example
   const decodedManifest = ManifestCoder.decodeManifest(encodedManifest, ManifestFormat.JSON);
   console.log(decodedManifest)

   >> { syntax: 1, engine: { kind: "PISA", flags: [] }, elements: [...] }

encodeArguments(routine, ...args)

   Encodes the arguments for a specified routine into a hexadecimal
   string.

   Arguments:
      * **routine** -- The name of the routine for which the arguments
        are being encoded.

      * **args** -- The arguments to be encoded, passed as a variadic
        parameter.

   Returns:
      A hexadecimal string representing the encoded arguments.

   // Example
   const calldata = manifestCoder.encodeArguments("Seeder", "MOI", 100_000_000);

   console.log(calldata)

   >> "0x0d6f0665...d4f49"

decodeArguments(routine, calldata)

   Decodes the provided calldata into the expected arguments for a
   given routine.

   Arguments:
      * **routine** (**string**) -- The name of the routine whose
        arguments are to be decoded.

      * **calldata** (**string**) -- The calldata to decode.

   Returns:
      **T|null** -- - The decoded arguments as an object of type T, or
      null if the routine accepts no arguments.

decodeOutput(routine, output)

   Decodes the output of a routine.

   Arguments:
      * **routine** (**string**) -- The name of the routine whose
        output is to be decoded.

      * **output** (**string**) -- The output string to decode.

   Returns:
      **T|null** -- - The decoded output as type T, or null if the
      output is invalid or the routine has no return schema.

   // Example
   const callsite = "BalanceOf";
   const output = "0x0e1f0305f5e100";
   const args = manifestCoder.decodeOutput(callsite, output);

   console.log(decodedOutput);

   >> { balance: 100000000 }

static decodeException(error)

   Decodes an exception thrown by a logic routine call. The exception
   data is decoded using the predefined exception schema. Returns the
   decoded exception object, or null if the error is empty.

   Arguments:
      * **error** (**string**) -- The error data to decode,
        represented as a hexadecimal string prefixed with "0x".

   Returns:
      **Exception|null** -- The decoded exception object, or null if
      the error is empty.

   // Example
   const error = "0x0e6f0666d104de04737472696e67696e73756666696369656e742062616c616e636520666f722073656e6465723f06e60172756e74696d652e726f6f742829726f7574696e652e5472616e736665722829205b3078635d202e2e2e205b307831623a205448524f57203078355d";

   const exception = ManifestCoder.decodeException(error);

   console.log(exception)

   >> {
           class: "string",
           error: "insufficient balance for sender",
           revert: false,
           trace: [
               "runtime.root()",
               "routine.Transfer() [0xc] ... [0x1b: THROW 0x5]"
           ],
       }

decodeEventOutput(event, logData)

   Decodes a log data from an event emitted in a logic.

   Arguments:
      * **event** (**string**) -- The name of the event.

      * **logData** (**string**) -- The POLO encoded log data to be
        decoded.

   Returns:
      **T|null** -- The decoded event log data, or null if the log
      data is empty.

**Schema**

Schema is a class that provides schema parsing functionality for
encoding and decoding manifest, arguments, logic states and other data
based on a predefined schema. It supports parsing fields and
generating a schema for decoding purposes.

   // Example
   const manifest = { ... }
   const elements = new Map();
   const classDefs = new Map();

   manifest.elements.forEach(element => {
       elements.set(element.ptr, element);

       if(element.kind === "class") {
           classDefs.set(element.data.name, element.ptr);
       }
   })

   const schema = new Schema(elements, classDefs);

**Methods**

parseFields(fields)

   Parses an array of fields and generates the schema based on the
   fields.

   Arguments:
      * **fields** (**Array.<LogicManifest.TypeField>**) -- The array
        of fields.

   Throws:
      **Error** -- If the fields are invalid or contain unsupported
      data types.

   Returns:
      **PoloSchema** -- The generated schema based on the fields.

   // Example
   const routine = manifest.elements.find(element =>
       // BalanceOf is the name of a routine which is available in the manifest
       element.data.name === "BalanceOf"
   )
   const fields = routine.data.accepts ? routine.data.accepts : [];
   const routineSchema = schema.parseFields(fields)

   console.log(routineSchema)

   >> { kind: "struct", fields: { addr: { kind: "bytes" } } }


Element Descriptor
~~~~~~~~~~~~~~~~~~

The ElementDescriptor class represents a descriptor for elements in
the logic manifest.

getStateMatrix()

   Retrieves the state matrix associated with the ElementDescriptor.

   Returns:
      **ContextStateMatrix** -- The state matrix.

getElements()

   Retrieves the map of elements associated with the
   ElementDescriptor.

   Returns:
      **Map.<number, LogicManifest.Element>** -- The elements map.

getCallsites()

   Retrieves the map of call sites associated with the
   ElementDescriptor.

   Returns:
      **Map.<string, CallSite>** -- The call sites map.

getClassDefs()

   Retrieves the map of class definitions associated with the
   ElementDescriptor.

   Returns:
      **Map.<string, number>** -- The class definitions map.

getMethodDefs()

   Retrieves the map of method definitions associated with the
   ElementDescriptor.

   Returns:
      **Map.<string, MethodDef>** -- The method definitions map.

getClassMethods(className)

   Retrieves the methods of a class based on the given class name.

   Arguments:
      * **className** (**string**) -- The name of the class.

   Throws:
      **Error** -- if the class name is invalid.

   Returns:
      **Map.<string, LogicManifest.Method>** -- The methods of the
      class.

getRoutineElement(routineName)

   Retrieves the element from the logic manifest based on the given
   routine name.

   Arguments:
      * **routineName** (**string**) -- The name of the routine.

   Throws:
      **Error** -- if the routine name is invalid.

   Returns:
      **LogicManifest.Element** -- The routine element.

getClassElement(className)

   Retrieves the element from the logic manifest based on the given
   class name.

   Throws:
      **Error** -- if the class name is invalid.

   Returns:
      **LogicManifest.Element** -- The class element.

getMethodElement(methodName)

   Retrieves the element from the logic manifest based on the given
   method name.

   Arguments:
      * **methodName** (**string**) -- The name of the method.

   Throws:
      **Error** -- if the method name is invalid.

   Returns:
      **LogicManifest.Element** -- The method element.


Logic Base
~~~~~~~~~~

The LogicBase is a abstract class extends the ElementDescriptor class
and serves as a base class for logic-related operations. It defines
common properties and abstract methods that subclasses should
implement.

LogicBase.connect(signer)

   Connects a signer and updates the provider reference.

   Arguments:
      * **signer** (**Signer**) -- The signer instance to connect.


Logic Descriptor
~~~~~~~~~~~~~~~~

The **LogicDescriptor** is a abstract class extends the **LogicBase**
class and provides information about a logic.

**Methods**

LogicDescriptor.getLogicId()

   Returns the logic id of the logic.

   Returns:
      **string** -- The logic id.

LogicDescriptor.getEngine()

   Returns the logic execution engine type.

   Returns:
      **EngineKind** -- The engine type.

LogicDescriptor.getManifest()

   Returns the logic manifest.

   Returns:
      **LogicManifest.Manifest** -- The logic manifest.

LogicDescriptor.getEncodedManifest()

   Returns the POLO encoded logic manifest.

   Returns:
      **string** -- The POLO encoded logic manifest.

LogicDescriptor.isSealed()

   Checks if the logic is sealed.

   Returns:
      **boolean** -- True if the logic is sealed, false otherwise.

LogicDescriptor.isAssetLogic()

   Checks if the logic represents an asset logic.

   Returns:
      **boolean** -- True if the logic is an representation of asset
      logic, false otherwise.

LogicDescriptor.allowsInteractions()

   Checks if the logic allows interactions.

   Returns:
      **boolean** -- True if the logic allows interactions, false
      otherwise.

LogicDescriptor.isStateful()

   Checks if the logic is stateful.

   Returns:
      **boolean** -- True if the logic is stateful, false otherwise.

LogicDescriptor.hasLogicState()

   Checks if the logic has logic state (*state logic:* in the
   manifest).

   Returns:
      A tuple containing the pointer to the logic state and a flag
      indicating if it exists.

   Example:

      const [ptr, exists] = logic.hasLogicState();

LogicDescriptor.hasActorState()

   Checks if the logic has actor state (*state actor:* in the
   manifest).

   Returns:
      A tuple containing the pointer to the actor state and a flag
      indicating if it exists.

   Example:

      const [ptr, exists] = logic.hasActorState();


Logic Factory
~~~~~~~~~~~~~

The **LogicFactory** class provides a convenient way to deploy
multiple instances of logic. This feature simplifies the deployment
process, enhances code reusability, and supports the scalability and
maintenance of decentralized applications on the MOI network.

   // Example
   const initWallet = async () => {
       const mnemonic = "mother clarify push liquid ordinary social track ...";
       const wallet = await Wallet.fromMnemonic(mnemonic);
       const provider = new JsonRpcProvider("http://localhost:1600/");
       wallet.connect(provider);

       return wallet;
   }

   const manifest = { ... }
   const wallet = await initWallet(manifest);
   const logicFactory = new LogicFactory(manifest, wallet);

**Methods**

LogicFactory.getEncodedManifest()

   Returns the POLO encoded manifest in hexadecimal format.

   Returns:
      **string** -- The encoded manifest.

   const encodedManifest = logicFactory.getEncodedManifest();
   console.log(encodedManifest);

   >> 0x56b34f...

LogicFactory.deploy(builderName, ...args)

   Deploys a logic.

   Arguments:
      * **builderName** (**string**) -- The name of the builder
        routine. Optional only if the manifest defines no deploy
        routine at all - required to pick one otherwise.

      * **args** (**Array.<any>**) -- Arguments for the builder
        routine. (optional)

   Throws:
      **Error** -- If a builder name is required but omitted, the
      builder routine is not found, or required arguments are missing.

   Returns:
      **LogicContext.<LogicOps>** -- The logic interaction context.

"deploy()" returns a "LogicContext" (an "InteractionContext" for
"OpType.LOGIC_DEPLOY") - call ".send()" on it to actually sign and
broadcast.

   import { LogicFactory } from "js-moi-sdk";
   import { wallet } from "./wallet";

   const factory = new LogicFactory(manifest, wallet);

   const symbol = "MOI";
   const supply = 1000000;

   const response = await factory.deploy("Seed!", symbol, supply).send();
   const receipt = await response.wait();
   const result = await response.result();

   console.log(result.logic_id); // 0x0800007d70c34ed6e...

**Deploying automatically funds the new logic account.** A brand-new
logic self-pays for its own creation-time storage cost, and a fresh
account holds no KMOI - so "deploy()" predicts the logic's id
("deriveLogicId()") and bundles a second "ASSET_INVOKE" "Transfer" op
funding it, in the same interaction. This is unconditional and needs
no setup on your part; the funded amount defaults to
"DEFAULT_STORAGE_FUND" (from "js-moi-constants") and only needs
overriding for a manifest whose deploy routine writes more than that
default covers.

If you wish to pass "fuelLimit", "fuelPrice", or override the funding
amount, pass a "RoutineOption" (built with "createRoutineOption") as
the last argument in the deploy call - a plain object here is silently
treated as just another deploy argument, not options, since only a
real "RoutineOption" instance is recognized.

   import { LogicFactory, createRoutineOption } from "js-moi-sdk";
   import { wallet } from "./wallet";

   const factory = new LogicFactory(manifest, wallet);

   const symbol = "MOI";
   const supply = 1000000;
   const option = createRoutineOption({
       fuelPrice: 1,
       fuelLimit: 6420,
       storageFund: 50000, // override the default new-account funding amount
   });

   const response = await factory.deploy("Seed!", symbol, supply, option).send();
   const receipt = await response.wait();
   const result = await response.result();

   console.log(result.logic_id); // 0x010000423d3233...


Logic Driver
~~~~~~~~~~~~

The **LogicDriver** enables seamless interaction with MOI Logic by
providing a user-friendly and intuitive interface. It allows
developers to  easily interact with deployed logics, execute their
routines, and retrieve their states. The interface abstracts away the
complexities of encoding parameters, decoding response and making
logic interaction more straightforward.

**Variables**

"routines" - This variable represents the set of routines defined
within the logic manifest. Developers can easily invoke and execute
these routines, which encapsulate specific functionalities and
operations provided by the logic.

Each mutating routine call returns an interaction context - call
".send()" (or ".call()" for a read-only dry run) on it, same as
"LogicFactory"'s "deploy()":

   const logic = await getLogicDriver(logicId, wallet);

   const response = await logic.routines.Transfer(amount, receiver).send();
   const receipt = await response.wait();

**Calling a routine that touches ANOTHER participant's storage needs
that participant added as an explicit extra participant.** A routine
like "TickAny(participant)" that mutates "participant"'s own
ephemeral/actor storage (as opposed to the logic's own persistent
state, or the caller's own storage) can't be resolved automatically -
the SDK only knows to lock the logic account itself for a
"LOGIC_INVOKE", since it has no way to see which other identifiers a
routine's opaque calldata references. Without the extra participant,
the call fails with "builtin.ReferenceNotFound: actor ... not found" -
which looks like an access-policy denial, but isn't one; it's a
locking problem, and it happens whether or not an access policy is
even involved.

   import { LockType } from "js-moi-sdk";

   const logic = await getLogicDriver(logicId, invokerWallet);

   // TickAny(participant) mutates `participant`'s own storage through this logic,
   // so `participant` must be locked explicitly - the logic account alone isn't enough.
   const response = await logic.routines.TickAny(participant).send({
       participants: [{ id: participant, lock_type: LockType.MUTATE_LOCK }],
   });

The same applies to a read-only ".call()" against another
participant's storage.

"logicState" - The logic state variable provides access to state
declared "state logic:" in the manifest - shared/global to the logic
itself (not the caller). This state persists across different
invocations and interactions, defining core attributes and long-term
data.

   It contains the following method:

* "get"
     This method retrieves a value from logic state using the storage
     key. A builder object is passed to a callback to generate the
     storage key. The builder object offers the following methods:

     * "entity" - This method used to select the member of the logic
       state.

     * "length" - This method used to access length/size of *Array*,
       *Varray* and, *Map*.

     * "property" - This method used to access the property of map
       using the passed key.

     * "at" - This method used to access the element of *Array* and
       *Varray* using the passed index.

     * "field" - This method used to access the field of *Class* using
       the passed field name.

   // Example
   const logic = await getLogicDriver(logicId, wallet);

   const symbol = await logic.logicState.get(access => access.entity("symbol"));
   console.log(symbol);

   >> MOI

   // Example: if you want to access size of the array/map
   const logic = await getLogicDriver(logicId, wallet);

   const length = await logic.logicState.get(access => access.entity("persons").length());
   console.log(length);

   >> 10

   // Example: if you want to access the balance of the address from the map
   const logic = await getLogicDriver(logicId, wallet);
   const address = "0x035dcdaa46f9b8984803b1105d8f327aef97de58481a5d3fea447735cee28fdc";

   const balance = await logic.logicState.get(access => access.entity("Balances").property(hexToBytes(address)));
   console.log(balance);

   >> 10000

   // Example: if you want to field of the class
   const logic = await getLogicDriver(logicId, wallet);

   const name = await logic.logicState.get(access => access.entity("persons").field("name"));
   console.log(name);

   >> Alice

   // Example: if you want to access the element of the array
   const logic = await getLogicDriver(logicId, wallet);

   const product = await logic.logicState.get(access => access.entity("Products").at(0));
   console.log(name);

   >> Chocolate

"actorState" - The actor state variable provides access to state
declared "state actor:" in the manifest - scoped per calling
participant (not shared/global). This state reflects the calling
participant's own state and can change frequently as interactions
occur.

   It contains the following method:

* "get"
     This method retrieves a value from actor state using the storage
     key and participant address.

     **Usage**: Similar to logic state, the get method takes a
     callback function. In addition to that, it also requires a
     participant address. The builder object within the callback
     defines how to access the state, similar to logic state.

   // Example
   const address = "0x996ab2197faa069202f83d7993f174e7a3635f3278d3745d6a9fe89d75b854df"
   const logic = await getLogicDriver(logicId, wallet);

   const spendable = await logic.actorState.get(address, (access) =>
       access.entity("Spendable")
   );
   console.log(spendable);

   >> 10000

**Functions**

getLogicDriver(logicId, signer, options)

   Returns a logic driver instance based on the given logic id.

   Arguments:
      * **logicId** (**string**) -- The logic id of the logic.

      * **signer** (**Signer**) -- The signer instance for the logic
        driver.

      * **options** (**Options**) -- The custom tesseract options for
        retrieving

   Returns:
      **Promise.<LogicDriver>** -- A promise that resolves to a
      LogicDriver instance.

   // Example
   const initWallet = async () => {
       const mnemonic = "mother clarify push liquid ordinary social track ...";
       const wallet = await Wallet.fromMnemonic(mnemonic);
       const provider = new JsonRpcProvider("http://localhost:1600/");

       wallet.connect(provider);

       return wallet;
   }

   const logicId = "0x0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a";
   const wallet = await initWallet();
   const logicDriver = await getLogicDriver(logicId, wallet);

createRoutineOption(option)

   Creates a new RoutineOption instance with the given option object.

   Arguments:
      * **option** -- The option object used to create the
        RoutineOption.

   Returns:
      A new RoutineOption instance.

**Usage**

**Example 1**: Calling a routine using the logic driver

   import { getLogicDriver } from "js-moi-sdk";
   import { wallet } from "./wallet";

   const logicId = "0x0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a";
   const address = "0x996ab2197faa069202f83d7993f174e7a3635f3278d3745d6a9fe89d75b854df";

   // Get logic driver
   const logic = await getLogicDriver(logicId, wallet);

   // Call the logic routine
   const { balance } = await logic.routines.BalanceOf(address);

   console.log(balance); // 1000000

**Example 2**: Retrieving from the persistent state of a logic

   import { getLogicDriver } from "js-moi-sdk";
   import { wallet } from "./wallet";

   const logicId = "0x0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a";
   const address = "0x996ab2197faa069202f83d7993f174e7a3635f3278d3745d6a9fe89d75b854df";

   // Get logic driver
   const logic = await getLogicDriver(logicId, wallet);

   // Get the persistent state
   const symbol = await logic.logicState.get(access => access.entity("symbol"));

   console.log(symbol); // MOI

**Example 3**: Executing a mutating routine call

   import { getLogicDriver } from "js-moi-sdk";
   import { wallet } from "./wallet";

   const logicId = "0x0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a";
   const address = "0x996ab2197faa069202f83d7993f174e7a3635f3278d3745d6a9fe89d75b854df";

   // Get logic driver
   const logic = await getLogicDriver(logicId, wallet);

   // Execute a mutating routine call
   const ix = await logic.routines.Transfer(address, 1000);
   console.log(ix.hash); //  0x010000423d3233...

   const receipt = await ix.wait();
   console.log(receipt); // { ... }

   // if you want to view the result of the logic interaction
   // you can use the result() method

   // for example
   // const result = await ix.result(); // { ... }

If you wish to externally pass *fuelLimit* or *fuelPrice*, pass the
options as the last argument in the deploy call.

   import { getLogicDriver } from "js-moi-sdk";
   import { wallet } from "./wallet";

   const logicId = "0x0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a";
   const address = "0x996ab2197faa069202f83d7993f174e7a3635f3278d3745d6a9fe89d75b854df";

   // Get logic driver
   const logic = await getLogicDriver(logicId, wallet);

   // Execute a mutating routine call
   const option = createRoutineOption({
       fuelPrice: 1,
       fuelLimit: 6420,
   });

   const ix = await logic.routines.Transfer(address, 1000, option);
   console.log(ix.hash); //  0x010000423d3233...

   const receipt = await ix.wait();
   console.log(receipt); // { ... }

======================================================================


Storage & Access Management
---------------------------

Logic and asset accounts pay per-byte rent for their on-chain storage.
This module covers depositing/withdrawing that rent, and managing
access policies that govern who may perform which actions on a
resource you own.


StorageDeposit
~~~~~~~~~~~~~~

The **StorageDeposit** class funds a logic or asset account's storage
rent. Storage on MOI costs KMOI per byte; depositing converts KMOI
into a byte allowance credited to a participant's account on that
target.

**Key Responsibilities:**

* Set the target logic/asset account whose storage is being funded

* Optionally credit a different participant (defaults to the signer)

* Set the KMOI amount to spend

* Build and send the deposit interaction

**Example:**

   const deposit = new StorageDeposit(wallet);

   const response = await deposit
       .target(logicId)
       .amount(50000)
       .send();

   console.log("Hash:", response.hash);

   const receipt = await response.wait();
   console.log("Receipt:", receipt);


StorageWithdraw
~~~~~~~~~~~~~~~

The **StorageWithdraw** class releases previously deposited, unused
storage allowance on a logic/asset account back into KMOI.

**Key Responsibilities:**

* Set the target logic/asset account to withdraw from

* Optionally specify how many bytes to release (omit to release
  everything currently available)

* Build and send the withdraw interaction

**Example:**

   const withdraw = new StorageWithdraw(wallet);

   const response = await withdraw
       .target(logicId)
       .send();

   console.log("Hash:", response.hash);

   const receipt = await response.wait();
   console.log("Receipt:", receipt);


Access
~~~~~~

The **Access** class manages access policies — rules that govern who
may perform which actions on a resource you own. A single builder
handles creating, updating, and deleting policies, since a policy is
always managed on the signer's own account.

Only the "storage" resource kind is implemented on the network today.

**Key Responsibilities:**

* Name the resource a policy governs (".storage(resourceId)")

* Set which actions the policy permits (".allow(...)")

* Optionally restrict which callers/origins may invoke, and narrow the
  policy to specific key prefixes

* Create, update, or delete the policy

**Example:**

   const response = await new Access(wallet)
       .storage(logicId)
       .allow(AccessAction.STORAGE_MUTATE)
       .caller(access.callers("0x00000000513b40a069905a1b05bd28d8338ad4a2eff419d7972be75900000000"))
       .create()
       .send();

   console.log("Hash:", response.hash);

   const receipt = await response.wait();
   console.log("Receipt:", receipt);

Deleting a policy only requires naming the resource:

   const response = await new Access(wallet)
       .storage(logicId)
       .delete()
       .send();

   console.log("Hash:", response.hash);
