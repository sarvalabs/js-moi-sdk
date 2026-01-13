============
Interactions
============

Overview
--------

The Interactions package provides high-level abstractions to construct and
send **participant** and **account-related interactions** in the MOI protocol.

These interactions are essential for managing identity, access control, and
account configuration within the decentralized MOI ecosystem.

This package offers a set of structured builder classes that help developers
create valid, signed transactions with minimal boilerplate.  
Each interaction is represented by an ``InteractionContext`` that defines the
operation type, payload, participants, and signer.

-------------------------------------------------------------------------------

Core Classes
------------

Account Management
~~~~~~~~~~~~~~~~~~

ParticipantCreate
^^^^^^^^^^^^^^^^^
The **ParticipantCreate** class is responsible for creating new participants
within the MOI network.  
A participant can represent a user, organization, or entity that interacts with
assets and logic instances.

This builder helps define the participant’s unique ID, attach cryptographic keys,
and optionally include an asset payload for initial value assignment.

**Key Responsibilities:**

- Initialize a new participant ID
- Add one or more cryptographic keys with configurable weights
- Define asset payloads (e.g: token allocations)
- Construct and send the participant creation request

**Example:**

.. code-block:: javascript

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
^^^^^^^^^^^^^^^^
The **AccountConfigure** class allows you to modify the key configuration of
an existing account.  
It supports both **adding new keys** and **revoking old ones**, enabling dynamic
control over account authorization and key rotation.

**Key Responsibilities:**

- Add new keys with specific weights and signature algorithms
- Revoke existing keys by their IDs
- Build and send the account configuration interaction

**Example:**

.. code-block:: javascript

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
^^^^^^^^^^^^^^
The **AccountInherit** class handles inheritance operations between accounts
on the MOI network.  
It enables one account to inherit ownership or value from another through a
controlled, logic-based transfer process.

**Key Responsibilities:**

- Set the target account to inherit from
- Attach an asset payload defining transfer details
- Specify a sub-account index for hierarchical inheritance
- Construct and send the inheritance interaction

**Example:**

.. code-block:: javascript

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

-------------------------------------------------------------------------------

Asset Management
~~~~~~~~~~~~~~~~

This module provides classes and utilities for creating, managing, and interacting with on-chain assets
within the MOI framework. It defines three main components:

- :class:`AssetFactory` – Responsible for asset creation.
- :class:`AssetDriver` – Provides a driver abstraction for asset logic execution.
- :class:`MAS0AssetLogic` – Implements the standard MAS0 asset logic and operations such as mint, burn, and transfer.


AssetFactory
^^^^^^^^^^^^

.. class:: AssetFactory

   The ``AssetFactory`` class is responsible for **creating new assets** and deploying
   their associated custom logic on the MOI network. It defines the static 
   ``create`` method which constructs an :class:`InteractionContext`
   for asset creation operations.

   **Method Summary**

   .. method:: static create(signer, symbol, supply, manager, enableEvents, manifest, callsite, calldata)

      Creates a new asset creation interaction context.

      :param Signer signer: The signer instance responsible for authorizing the asset creation.
      :param str symbol: The symbol or shorthand name of the asset.
      :param int | bigint supply: The total maximum supply of the asset.
      :param str manager: The manager or owner address (in Hex format).
      :param bool enableEvents: Whether to enable event emission for the asset.
      :param LogicManifest.Manifest manifest: (Optional) Logic manifest if custom logic is being deployed.
      :param str callsite: (Optional) Routine name in the manifest corresponding to the deploy logic.
      :param list calldata: (Optional) Additional initialization arguments for the deploy routine.
      :returns: An :class:`InteractionContext` configured for asset creation.
      :rtype: InteractionContext<OpType.ASSET_CREATE>

      **Logic**

      1. Builds an :class:`AssetCreatePayload` containing:
         - ``symbol``
         - ``max_supply``
         - ``standard`` (set to :class:`AssetStandard.MAS0`)
         - ``dimension`` (default 0)
         - ``enable_events``
         - ``manager`` (converted to Hex)
         - ``logic_payload``

      2. If a ``manifest`` is provided:
         - Searches for a *deploy* routine matching the given ``callsite``.
         - Validates argument counts.
         - Encodes the manifest and the routine calldata (if applicable).

      3. Returns an :class:`InteractionContext` initialized for ``ASSET_CREATE``.

      **Usage Example**

      .. code-block:: javascript

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


AssetDriver
^^^^^^^^^^^

.. class:: AssetDriver

   The ``AssetDriver`` class extends :class:`LogicDriver` and represents a
   **driver interface** for interacting with a deployed custom asset logic.

   **Constructor**

   .. method:: constructor(assetId, manifest, signer)

      Initializes a new ``AssetDriver`` instance.

      :param str assetId: The unique identifier (asset ID) of the asset.
      :param LogicManifest.Manifest manifest: The logic manifest associated with the asset.
      :param Signer signer: The signer responsible for authorization.

      **Logic**

      The constructor simply calls the base ``LogicDriver`` constructor with
      the provided parameters, enabling interaction with the deployed asset logic.

      **Usage Example**

      .. code-block:: javascript

        const driver = new AssetDriver(assetId, manifest, signer);
        const response = driver.routines.mint(beneficiary, 5000).send();

MAS Asset Standards
^^^^^^^^^^^^^^^^^^^

The MOI Asset Standards (MAS) define a series of progressively capable asset logic specifications on the MOI network.
Each standard builds on the previous one, enabling developers to choose the appropriate level of functionality and complexity for their asset use case.

MAS0AssetLogic
^^^^^^^^^^^^^^
MAS0 defines the standard contract for fungible assets, where all units belong to a single token ID and are fully interchangeable. It supports minting, burning, transfers, approvals, lockups, and asset-level metadata, making it suitable for currencies and utility tokens.

.. class:: MAS0AssetLogic

   Implements the standard **MAS0 asset logic**, which provides a set of default
   routines for asset lifecycle management — including minting, burning, transferring,
   approving, locking, and querying balances.

   **Constructor**

   .. method:: constructor(assetId, signer)

      Initializes a new ``MAS0AssetLogic`` instance.

      :param str assetId: The asset ID to operate on.
      :param Signer signer: The signer instance for authorization.

   **Static Methods**

   .. method:: static async newAsset(signer, symbol, supply, manager, enableEvents)

      Creates a new MAS0-standard asset on-chain, then returns an instance
      of :class:`MAS0AssetLogic` for interacting with it.

      :returns: An instance of :class:`MAS0AssetLogic`
      :rtype: MAS0AssetLogic

      **Example**

      .. code-block:: javascript

         const gold = await MAS0AssetLogic.newAsset(
             signer,
             "GOLD",
             1000000n,
             managerAddress,
             true
         );

   .. method:: static create(signer, symbol, supply, manager, enableEvents)

      Builds an :class:`InteractionContext` for creating a MAS0-standard asset.

      :returns: InteractionContext<OpType.ASSET_CREATE>


**MAS0 Operations**

The following methods correspond to MAS0-standard asset operations.
Each operation returns an :class:`InteractionContext`, which can be executed by calling ``.send()``.

.. method:: mint(beneficiary, amount)

   Mints new asset units to the specified beneficiary.

   :param str beneficiary: Recipient participant id.
   :param int | bigint amount: Amount to mint.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.mint(beneficiary, 5000).send();


.. method:: burn(amount)

   Burns a specified amount of the asset, reducing total supply.

   :param int | bigint amount: Amount to burn.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.burn(1000).send();


.. method:: transfer(beneficiary, amount)

   Transfers asset units to another account.

   :param str beneficiary: Recipient participant id.
   :param int | bigint amount: Amount to transfer.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.transfer(beneficiary, 2500).send();


.. method:: transferFrom(benefactor, beneficiary, amount)

   Transfers asset units from a benefactor to a beneficiary (if approved).

   :param str benefactor: The participant id of the original holder.
   :param str beneficiary: The receiver participant id.
   :param int | bigint amount: Amount to transfer.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.transferFrom(benefactor, beneficiary, 100000).send();


.. method:: approve(beneficiary, amount, expiresAt)

   Grants spending permission to another account.

   :param str beneficiary: The spender participant id.
   :param int | bigint amount: Allowance amount.
   :param int expiresAt: Expiration timestamp (UNIX time).
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.approve(beneficiary, 100000, 1765650600).send();


.. method:: revoke(beneficiary)

   Revokes a previously approved allowance.

   :param str beneficiary: Account to revoke approval from.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.revoke(beneficiary).send();


.. method:: lockup(beneficiary, amount)

   Locks up a specified amount of tokens under ``SARGA_ADDRESS``.

   :param str beneficiary: Participant id of whose tokens are being locked.
   :param int | bigint amount: Amount to lock.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.lockup(beneficiary, 10000).send();


.. method:: release(benefactor, beneficiary, amount)

   Releases locked-up tokens back to a beneficiary.

   :param str benefactor: The original owner of the locked tokens.
   :param str beneficiary: The receiver of the released tokens.
   :param int | bigint amount: Amount to release.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.release(benefactor, beneficiary, 100).send();

.. method:: SetStaticMetadata(key, value)

   Sets or updates a static metadata entry for the asset.

   :param str key: The metadata key.
   :param str value: The metadata value.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.setStaticMetadata(key, value).send();

.. method:: SetDynamicMetadata(key, value)

   Sets or updates a dynamic metadata entry for the asset.

   :param str key: The metadata key.
   :param str value: The metadata value.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.setDynamicMetadata(key, value).send();

**Readonly Routines**


.. method:: symbol()

   Returns an interaction context for retrieving the asset symbol.

   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas0.symbol().call();


.. method:: balanceOf(id)

   Retrieves the balance of a given account.

   :param str id: The participant id to query.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const balance = await mas0.balanceOf(walletAddress).call();

.. method:: creator()

   Returns an interaction context for retrieving the asset creator.

   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas1.creator().call();

.. method:: manager()

   Returns an interaction context for retrieving the asset manager.

   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas1.manager().call();

.. method:: decimals()

   Returns an interaction context for retrieving the asset decimals.

   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas1.decimals().call();

.. method:: maxSupply()

   Returns an interaction context for retrieving the asset max supply.

   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas1.maxSupply().call();

.. method:: circulatingSupply()

   Returns an interaction context for retrieving the asset circulating supply.

   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas1.circulatingSupply().call();

.. method:: getStaticMetadata(key, value)

   Retrieves the static metadata entry for the asset.

   :param str key: The metadata key.
   :param str value: The metadata value.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.getStaticMetadata(key, value).send();

.. method:: getDynamicMetadata(key, value)

   Retrieves the dynamic metadata entry for the asset.

   :param str key: The metadata key.
   :param str value: The metadata value.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas0 = new MAS0AssetLogic(assetId, wallet);
      const response = await mas0.getDynamicMetadata(key, value).send();

MAS1AssetLogic
^^^^^^^^^^^^^^
MAS1 defines the standard contract for non-fungible assets, where each token has a unique token ID and a supply of one. It supports per-token ownership, transfers, approvals, lockups, and both asset-level and token-level metadata, making it suitable for collectibles and identity-like assets.

.. class:: MAS1AssetLogic

   Implements the standard **MAS1 asset logic**, which provides a set of default
   routines for asset lifecycle management — including minting, burning, transferring,
   approving, locking, and querying balances.

   **Constructor**

   .. method:: constructor(assetId, signer)

      Initializes a new ``MAS1AssetLogic`` instance.

      :param str assetId: The asset ID to operate on.
      :param Signer signer: The signer instance for authorization.

   **Static Methods**

   .. method:: static async newAsset(signer, symbol, supply, manager, enableEvents)

      Creates a new MAS1-standard asset on-chain, then returns an instance
      of :class:`MAS1AssetLogic` for interacting with it.

      :returns: An instance of :class:`MAS1AssetLogic`
      :rtype: MAS1AssetLogic

      **Example**

      .. code-block:: javascript

         const gold = await MAS1AssetLogic.newAsset(
             signer,
             "GOLD",
             1000000n,
             managerAddress,
             true
         );

   .. method:: static create(signer, symbol, supply, manager, enableEvents)

      Builds an :class:`InteractionContext` for creating a MAS0-standard asset.

      :returns: InteractionContext<OpType.ASSET_CREATE>


**MAS1 Operations**

The following methods correspond to MAS1-standard asset operations.
Each operation returns an :class:`InteractionContext`, which can be executed by calling ``.send()``.

.. method:: mint(beneficiary)

   Mints new asset units to the specified beneficiary.

   :param str beneficiary: Recipient participant id.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.mint(beneficiary).send();

.. method:: mintWithMetadata(beneficiary)

   Mints new asset units to the specified beneficiary.

   :param str beneficiary: Recipient participant id.
   :param record static_metadata: Static metadata to mint.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.mintWithMetadata(beneficiary).send();

.. method:: burn(tokenId)

   Burns a specified token, reducing total supply.

   :param int | bigint tokenId: Token id to burn.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.burn(tokenId).send();


.. method:: transfer(tokenId, beneficiary)

   Transfers asset units to another account.

   :param int | bigint tokenId: Token id to transfer.
   :param str beneficiary: Recipient participant id.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.transfer(tokenId, beneficiary).send();


.. method:: transferFrom(tokenId, benefactor, beneficiary)

   Transfers asset units from a benefactor to a beneficiary (if approved).

   :param int | bigint tokenId: Token id to transfer.
   :param str benefactor: The participant id of the original holder.
   :param str beneficiary: The receiver participant id.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.transferFrom(tokenId, benefactor, beneficiary).send();


.. method:: approve(tokenId, beneficiary, expiresAt)

   Grants spending permission to another account.

   :param int | bigint tokenId: Token id to approve.
   :param str beneficiary: The spender participant id.
   :param int expiresAt: Expiration timestamp (UNIX time).
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.approve(tokenId, beneficiary, 1765650600).send();


.. method:: revoke(tokenId, beneficiary)

   Revokes a previously approved allowance.

   :param int | bigint tokenId: Token id to revoke.
   :param str beneficiary: Account to revoke approval from.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.revoke(tokenId, beneficiary).send();


.. method:: lockup(tokenId, beneficiary)

   Locks up a specified amount of tokens under ``SARGA_ADDRESS``.

   :param int | bigint tokenId: Token id to lockup.
   :param str beneficiary: Participant id of whose tokens are being locked.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.lockup(tokenId, beneficiary).send();


.. method:: release(tokenId, benefactor, beneficiary)

   Releases locked-up tokens back to a beneficiary.

   :param int | bigint tokenId: Token id to release.
   :param str benefactor: The original owner of the locked tokens.
   :param str beneficiary: The receiver of the released tokens.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.release(tokenId, benefactor, beneficiary).send();

.. method:: setStaticMetadata(key, value)

   Sets or updates a static metadata entry for the asset.

   :param str key: The metadata key.
   :param str value: The metadata value.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.setStaticMetadata(key, value).send();

.. method:: setDynamicMetadata(key, value)

   Sets or updates a dynamic metadata entry for the asset.

   :param str key: The metadata key.
   :param str value: The metadata value.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.setDynamicMetadata(key, value).send();

.. method:: setStaticTokenMetadata(tokenId, key, value)

   Sets or updates a static token metadata entry for the asset.

   :param int | bigint tokenId: Token id to set token metadata.
   :param str key: The metadata key.
   :param str value: The metadata value.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.setStaticMetadata(tokenId, key, value).send();

.. method:: setDynamicTokenMetadata(tokenId, key, value)

   Sets or updates a dynamic token metadata entry for the asset.

   :param int | bigint tokenId: Token id to set token metadata.
   :param str key: The metadata key.
   :param str value: The metadata value.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas1 = new MAS1AssetLogic(assetId, wallet);
      const response = await mas1.setDynamicMetadata(tokenId, key, value).send();

**Readonly Routines**

.. method:: symbol()

   Returns an interaction context for retrieving the asset symbol.

   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas1.symbol().call();


.. method:: isOwner(tokenId, address)

   Retrieves the balance of a given account.

   :param int | bigint tokenId: The token id.
   :param str address: The participant address to query
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const balance = await mas1.isOwner(tokenId, walletAddress).call();

.. method:: creator()

   Returns an interaction context for retrieving the asset creator.

   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas1.creator().call();

.. method:: manager()

   Returns an interaction context for retrieving the asset manager.

   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas1.manager().call();

.. method:: getStaticMetadata(key)

   Retrieves the static metadata entry for the asset.

   :param str key: The metadata key.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas0.getStaticMetadata(key, value).send();

.. method:: getDynamicMetadata(key)

   Retrieves the dynamic metadata entry for the asset.

   :param str key: The metadata key.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas0.getDynamicMetadata(key, value).send();

.. method:: getStaticTokenMetadata(tokenId, key)

   Retrieves the static token metadata entry for the asset.

   :param int | bigint tokenId: The token id.
   :param str key: The metadata key.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas2.getStaticMetadata(tokenId, key).send();

.. method:: getDynamicTokenMetadata(tokenId, key)

   Retrieves the dynamic token metadata entry for the asset.

   :param int | bigint tokenId: The token id.
   :param str key: The metadata key.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas2.getDynamicMetadata(tokenId, key).send();

MAS2AssetLogic
^^^^^^^^^^^^^^
MAS2 defines the standard contract for multi-token (semi-fungible) assets, where each token ID represents a distinct class with its own variable supply. It supports partial transfers, approvals, lockups, burns, and token-level metadata, making it suitable for batch-based, editioned, or class-based assets.

.. class:: MAS2AssetLogic

   Implements the standard **MAS2 asset logic**, which provides a set of default
   routines for asset lifecycle management — including minting, burning, transferring,
   approving, locking, and querying balances.

   **Constructor**

   .. method:: constructor(assetId, signer)

      Initializes a new ``MAS2AssetLogic`` instance.

      :param str assetId: The asset ID to operate on.
      :param Signer signer: The signer instance for authorization.

   **Static Methods**

   .. method:: static async newAsset(signer, symbol, supply, manager, enableEvents)

      Creates a new MAS2-standard asset on-chain, then returns an instance
      of :class:`MAS2AssetLogic` for interacting with it.

      :returns: An instance of :class:`MAS2AssetLogic`
      :rtype: MAS2AssetLogic

      **Example**

      .. code-block:: javascript

         const gold = await MAS2AssetLogic.newAsset(
             signer,
             "GOLD",
             1000000n,
             managerAddress,
             true
         );

   .. method:: static create(signer, symbol, supply, manager, enableEvents)

      Builds an :class:`InteractionContext` for creating a MAS2-standard asset.

      :returns: InteractionContext<OpType.ASSET_CREATE>


**MAS2 Operations**

The following methods correspond to MAS2-standard asset operations.
Each operation returns an :class:`InteractionContext`, which can be executed by calling ``.send()``.

.. method:: mint(beneficiary)

   Mints new asset units to the specified beneficiary.

   :param str beneficiary: Recipient participant id.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.mint(beneficiary).send();

.. method:: mintWithMetadata(beneficiary, staticMetadata)

   Mints new asset units to the specified beneficiary.

   :param str beneficiary: Recipient participant id.
   :param record staticMetadata: Static metadata to mint.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.mintWithMetadata(beneficiary, staticMetadata).send();

.. method:: burn(tokenId)

   Burns a specified token, reducing total supply.

   :param int | bigint tokenId: Token id to burn.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.burn(tokenId).send();


.. method:: transfer(tokenId, beneficiary)

   Transfers asset units to another account.

   :param int | bigint tokenId: Token id to transfer.
   :param str beneficiary: Recipient participant id.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.transfer(tokenId, beneficiary).send();


.. method:: transferFrom(tokenId, benefactor, beneficiary)

   Transfers asset units from a benefactor to a beneficiary (if approved).

   :param int | bigint tokenId: Token id to transfer.
   :param str benefactor: The participant id of the original holder.
   :param str beneficiary: The receiver participant id.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.transferFrom(tokenId, benefactor, beneficiary).send();


.. method:: approve(tokenId, beneficiary, expiresAt)

   Grants spending permission to another account.

   :param int | bigint tokenId: Token id to approve.
   :param str beneficiary: The spender participant id.
   :param int expiresAt: Expiration timestamp (UNIX time).
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.approve(tokenId, beneficiary, 1765650600).send();


.. method:: revoke(tokenId, beneficiary)

   Revokes a previously approved allowance.

   :param int | bigint tokenId: Token id to revoke.
   :param str beneficiary: Account to revoke approval from.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.revoke(tokenId, beneficiary).send();


.. method:: lockup(tokenId, beneficiary)

   Locks up a specified amount of tokens under ``SARGA_ADDRESS``.

   :param int | bigint tokenId: Token id to lockup.
   :param str beneficiary: Participant id of whose tokens are being locked.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.lockup(tokenId, beneficiary).send();


.. method:: release(tokenId, benefactor, beneficiary)

   Releases locked-up tokens back to a beneficiary.

   :param int | bigint tokenId: Token id to release.
   :param str benefactor: The original owner of the locked tokens.
   :param str beneficiary: The receiver of the released tokens.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.release(tokenId, benefactor, beneficiary).send();

.. method:: setStaticMetadata(key, value)

   Sets or updates a static metadata entry for the asset.

   :param str key: The metadata key.
   :param str value: The metadata value.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.setStaticMetadata(key, value).send();

.. method:: setDynamicMetadata(key, value)

   Sets or updates a dynamic metadata entry for the asset.

   :param str key: The metadata key.
   :param str value: The metadata value.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.setDynamicMetadata(key, value).send();

.. method:: setStaticTokenMetadata(tokenId, key, value)

   Sets or updates a static token metadata entry for the asset.

   :param int | bigint tokenId: Token id to set token metadata.
   :param str key: The metadata key.
   :param str value: The metadata value.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.setStaticMetadata(tokenId, key, value).send();

.. method:: setDynamicTokenMetadata(tokenId, key, value)

   Sets or updates a dynamic token metadata entry for the asset.

   :param int | bigint tokenId: Token id to set token metadata.
   :param str key: The metadata key.
   :param str value: The metadata value.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const mas2 = new MAS2AssetLogic(assetId, wallet);
      const response = await mas2.setDynamicMetadata(tokenId, key, value).send();

**Readonly Routines**

.. method:: symbol()

   Returns an interaction context for retrieving the asset symbol.

   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas2.symbol().call();

.. method:: isOwner(tokenId, address)

   Retrieves the balance of a given account.

   :param int | bigint tokenId: The token id.
   :param str address: The participant address to query
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const balance = await mas2.isOwner(tokenId, walletAddress).call();

.. method:: creator()

   Returns an interaction context for retrieving the asset creator.

   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas2.creator().call();

.. method:: manager()

   Returns an interaction context for retrieving the asset manager.

   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas2.manager().call();

.. method:: getStaticMetadata(tokenId, key)

   Retrieves the static metadata entry for the asset.

   :param str key: The metadata key.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas2.getStaticMetadata(key).send();

.. method:: getDynamicMetadata(tokenId, key)

   Retrieves the dynamic metadata entry for the asset.

   :param str key: The metadata key.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas2.getDynamicMetadata(key).send();

.. method:: getStaticTokenMetadata(tokenId, key)

   Retrieves the static token metadata entry for the asset.

   :param int | bigint tokenId: The token id.
   :param str key: The metadata key.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas2.getStaticMetadata(tokenId, key).send();

.. method:: getDynamicTokenMetadata(tokenId, key)

   Retrieves the dynamic token metadata entry for the asset.

   :param int | bigint tokenId: The token id.
   :param str key: The metadata key.
   :returns: InteractionContext<OpType.ASSET_INVOKE>

   **Example**

   .. code-block:: javascript

      const response = await mas2.getDynamicMetadata(tokenId, key).send();

-------------------------------------------------------------------------------

Logic Management
~~~~~~~~~~~~~~~~

The logic module in js-moi-sdk is a powerful component that simplifies the 
interaction with MOI logic objects. It provides a user-friendly interface 
for deploying, interacting with, and querying logic objects on the MOI network.

With the logic module, the logic manifests can be easily deployed using logic 
factory. This includes the ability to encode and deploy logics with builder 
arguments.

Once deployed, the module handles routine calls, interaction sending, and 
state queries, abstracting away complexities like parameter encoding, fuel and 
interaction signing.

Integration with the wallet and signer modules ensures secure interaction 
signing and authorization. Users can choose from different signers, such as 
wallet-based signers, or custom signers.

Types
^^^^^

**LogicIxRequest**

The ``LogicIxRequest`` interface represents a request to deploy or execute a logic. It has the following properties:

* ``call`` - ``function``: A function that facilitates the execution of an logic interaction request, while maintaining the integrity of the current state. It returns a promise that resolves to an ``InteractionCallResponse``.
* ``send`` - ``function``: A function that sends the logic interaction request and returns a promise that resolves to an ``InteractionResponse``.
* ``estimateFuel`` - ``function``: A function that estimates the fuel required for the interaction request and returns a promise.

**Routine**

The ``Routine`` interface represents a routine function. It has the following properties:

* A function that can be called with an optional array of arguments and returns a value.
* ``isMutable`` - ``function``: A function that returns a boolean indicating whether the routine is mutable.
* ``accepts`` - ``function``: A function that returns an array of ``TypeField`` representing the types of arguments accepted by the routine, or ``null`` if no arguments are accepted.
* ``returns`` - ``function``: A function that returns an array of ``TypeField`` representing the types of values returned by the routine, or ``null`` if no values are returned.

**Routines**

The ``Routines`` interface represents a collection of routines. It is an object with named properties where the property name is the routine name and the property value is a ``Routine``.

**CallSite**

The ``CallSite`` interface represents a callsite. It has the following properties:

* ``ptr`` - ``number``: The pointer to the callsite.
* ``kind`` - ``string``: The kind of the callsite.

**MethodDef**

The ``MethodDef`` interface represents a method definition. It has the following properties:

* ``ptr`` - ``number``: The pointer to the method.
* ``class`` - ``string``: The name of the class.

Manifest Encoder
^^^^^^^^^^^^^^^^

The Manifest Encoder module enables the encoding and decoding of data 
according to the MOI Manifest specification. This specification defines the 
structure of routines, classes, methods, and state within logic object, allowing 
for seamless interaction with their properties.

Through this module, developers can encode data in compliance with the 
expected format specified by the logic Manifest. This is particularly valuable 
when preparing data for invoking routines on logic object. By correctly encoding 
routine parameters according to the logic Manifest, developers can generate 
accurate input data that aligns with the logic objects's expectations.

In addition, this facilitates the decoding of data received from the blockchain 
or logic objects. Developers can decode routine call results, and other Manifest-encoded 
data structures, enabling them to extract meaningful information. This 
capability greatly aids in the efficient processing and interpretation of data 
obtained from the MOI network.

**Types**

**LogicManifest**

The ``LogicManifest`` module defines the schema for a logic manifest.

    **EngineConfig**

    The ``EngineConfig`` interface defines the configuration for the logic engine. It has two properties:

    * ``kind`` - ``string``: The type of logic engine.
    * ``flags`` - ``string[]``: A list of flags.

    **TypeField**

    The ``TypeField`` interface defines a field type. It has three properties:

    * ``slot`` - ``number``: The slot number of the field.
    * ``label`` - ``string``: The label or name of the field.
    * ``type`` - ``string``: The type of the field.

    **MethodField**

    The ``MethodField`` interface defines a method field. It has two properties:

    * ``ptr`` - ``number | bigint``: The pointer value of the field.
    * ``code`` - ``number | bigint``: The code value of the field.

    **Class**

    The ``Class`` interface defines a class within the logic manifest. It has three properties:

    * ``name`` - ``string``: The name of the class.
    * ``fields`` - ``TypeField[] | null``: An optional array of fields within the class.
    * ``methods`` - ``MethodField[] | null``: An optional array of methods within the class.

    **State**

    The ``State`` interface defines the state within the logic manifest. It has two properties:

    * ``kind`` - ``string``: The kind or type of the state.
    * ``fields`` - ``TypeField[]``: An array of fields within the state.

    **Constant**

    The ``Constant`` interface defines a constant within the logic manifest. It has two properties:

    * ``type`` - ``string``: The type of the constant.
    * ``value`` - ``string``: The value of the constant.

    **Instructions**

    The ``Instructions`` interface defines the instructions within the logic manifest. It has three optional properties:

    * ``bin`` - ``number[] | null``: An optional array of binary values.
    * ``hex`` - ``string``: A hexadecimal representation of the instructions (optional).
    * ``asm`` - ``string[] | null``: An optional array of assembly instructions.

    **Routine**

    The ``Routine`` interface defines a routine within the logic manifest. It has five properties:

    * ``name`` - ``string``: The name of the routine.
    * ``kind`` - ``string``: The kind or type of the routine.
    * ``accepts`` - ``TypeField[] | null``: An optional array of input fields that the routine accepts.
    * ``returns`` - ``TypeField[] | null``: An optional array of output fields that the routine returns.
    * ``executes`` - ``Instructions``: The instructions executed by the routine.
    * ``catches`` - ``string[] | null``: An optional array of exceptions caught by the routine.

    **Method**

    The ``Method`` interface defines a method within a class in the logic manifest. It has six properties:

    * ``name`` - ``string``: The name of the method.
    * ``class`` - ``string``: The name of the class the method belongs to.
    * ``accepts`` - ``TypeField[] | null``: An optional array of input fields that the method accepts.
    * ``returns`` - ``TypeField[] | null``: An optional array of output fields that the method returns.
    * ``executes`` - ``Instructions``: The instructions executed by the method.
    * ``catches`` - ``string[] | null``: An optional array of exceptions caught by the method.

    **TypeDef**

    The ``TypeDef`` represents a ``string`` type definition.

    **Element**

    The ``Element`` interface represents an element within the logic manifest. It has four properties:

    * ``ptr`` - ``number``: The pointer value of the element.
    * ``kind`` - ``string``: The kind or type of the element.
    * ``deps`` - ``number[] | null``: An optional array of dependencies for the element.
    * ``data`` - ``State | Constant | TypeDef | Routine | Class | Method``: The data associated with the element.

    **Manifest**

    The ``Manifest`` interface represents the overall logic manifest. It has three properties:

    * ``syntax`` - ``string``: The syntax used in the manifest.
    * ``engine`` - ``EngineConfig``: The configuration of the logic engine.
    * ``elements`` - ``Element[]``: An array of elements within the manifest.

**Exception**

The `Exception` interface defines an exception. It has three properties:

* ``class`` - ``string``: The exception class.
* ``data`` - ``string``: The exception message.
* ``trace`` - ``string[]``: The stack trace of the exception.
* ``revert`` - ``boolean``: Represents the interaction revert status.

**PoloSchema**

The `PoloSchema` interface defines a schema used by polo of serialization and 
deserialization. It has two properties:


* ``kind`` - ``string``: The type or kind of the schema.
* ``fields`` - ``Record<string, any>``: The fields within the schema. It is a dictionary-like structure where keys are strings and values are object (optional).

**ManifestCoder**

ManifestCoder is a class that provides encoding and decoding functionality for 
Manifest Call Encoder. It allows encoding manifests and arguments, as 
well as decoding output, exceptions and logic states based on both predefined 
and runtime schema.

.. code-block:: javascript

    // Example
    import { ManifestCoder } from "js-moi-sdk";

    const manifest = { ... }
    const manifestCoder = new ManifestCoder(manifest);

**Methods**

.. autofunction:: encodeManifest

.. code-block:: javascript

    // Example
    const encodedManifest = ManifestCoder.encodeManifest(manifest)
    console.log(encodedManifest)

    >> "0x0e4f065...50000"

.. autofunction:: decodeManifest

.. code-block:: javascript

    // Example
    const decodedManifest = ManifestCoder.decodeManifest(encodedManifest, ManifestFormat.JSON);
    console.log(decodedManifest)

    >> { syntax: 1, engine: { kind: "PISA", flags: [] }, elements: [...] }

.. autofunction:: encodeArguments

.. code-block:: javascript

    // Example
    const calldata = manifestCoder.encodeArguments("Seeder", "MOI", 100_000_000);

    console.log(calldata)

    >> "0x0d6f0665...d4f49"

.. autofunction:: decodeArguments

.. autofunction:: decodeOutput

.. code-block:: javascript

    // Example
    const callsite = "BalanceOf";
    const output = "0x0e1f0305f5e100";
    const args = manifestCoder.decodeOutput(callsite, output);

    console.log(decodedOutput);

    >> { balance: 100000000 }

.. autofunction:: decodeException

.. code-block:: javascript

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

.. autofunction:: decodeEventOutput

**Schema**

Schema is a class that provides schema parsing functionality for encoding and
decoding manifest, arguments, logic states and other data based on a predefined 
schema. It supports parsing fields and generating a schema for decoding 
purposes.

.. code-block:: javascript

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

.. autofunction:: parseFields

.. code-block:: javascript

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
^^^^^^^^^^^^^^^^^^
The ElementDescriptor class represents a descriptor for elements in the 
logic manifest.

.. autofunction:: getStateMatrix

.. autofunction:: getElements

.. autofunction:: getCallsites

.. autofunction:: getClassDefs

.. autofunction:: getMethodDefs

.. autofunction:: getClassMethods

.. autofunction:: getRoutineElement

.. autofunction:: getClassElement

.. autofunction:: getMethodElement

Logic Base
^^^^^^^^^^
The LogicBase is a abstract class extends the ElementDescriptor class and 
serves as a base class for logic-related operations. It defines common 
properties and abstract methods that subclasses should implement.

.. autofunction:: LogicBase#connect

Logic Descriptor
^^^^^^^^^^^^^^^^
The **LogicDescriptor** is a abstract class extends the **LogicBase** class and 
provides information about a logic.

**Methods**

.. autofunction:: LogicDescriptor#getLogicId

.. autofunction:: LogicDescriptor#getEngine

.. autofunction:: LogicDescriptor#getManifest

.. autofunction:: LogicDescriptor#getEncodedManifest

.. autofunction:: LogicDescriptor#isSealed

.. autofunction:: LogicDescriptor#isAssetLogic

.. autofunction:: LogicDescriptor#allowsInteractions

.. autofunction:: LogicDescriptor#isStateful

.. autofunction:: LogicDescriptor#hasPersistentState

.. autofunction:: LogicDescriptor#hasEphemeralState

Logic Factory
^^^^^^^^^^^^^
The **LogicFactory** class provides a convenient way to deploy multiple 
instances of logic. This feature simplifies the deployment process, enhances 
code reusability, and supports the scalability and maintenance of decentralized 
applications on the MOI network.

.. code-block:: javascript

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

.. autofunction:: LogicFactory#getEncodedManifest

.. code-block:: javascript

    const encodedManifest = logicFactory.getEncodedManifest();
    console.log(encodedManifest);

    >> 0x56b34f...

.. autofunction:: LogicFactory#deploy

.. code-block:: javascript

    import { LogicFactory } from "js-moi-sdk";
    import { wallet } from "./wallet";

    const factory = new LogicFactory(manifest, wallet);
    
    const symbol = "MOI";
    const supply = 1000000;
    
    const ix = await factory.deploy("Seed!", symbol, supply);
    const result = await ix.result();

    console.log(result.logic_id); // 0x0800007d70c34ed6e...

If you wish to externally pass `fuelLimit` or `fuelPrice`, pass the options as
the last argument in the deploy call.

.. code-block:: javascript

    import { LogicFactory } from "js-moi-sdk";
    import { wallet } from "./wallet";

    const factory = new LogicFactory(manifest, wallet);
    
    const symbol = "MOI";
    const supply = 1000000;
    const option = {
        fuelPrice: 1,
        fuelLimit: 6420,
    }
    
    const ix = await factory.deploy("Seed!", symbol, supply, option);
    const result = await ix.result();

    console.log(result.logic_id); // 0x010000423d3233...

Logic Driver
^^^^^^^^^^^^
The **LogicDriver** enables seamless interaction with MOI Logic by providing a 
user-friendly and intuitive interface. It allows developers to  easily interact 
with deployed logics, execute their routines, and retrieve their states. 
The interface abstracts away the complexities of encoding parameters, decoding 
response and making logic interaction more straightforward.

**Variables**

``routines`` - This variable represents the set of routines defined within the 
logic manifest. Developers can easily invoke and execute these routines, which 
encapsulate specific functionalities and operations provided by the logic.

``persistentState`` - The persistent state variable provides access to enduring 
state associated with the logic. This state persists across different 
invocations and interactions, defining core attributes and long-term data.

 It contains the following method:

* ``get`` 
    This method retrieves a value from persistent state using the storage key. 
    A builder object is passed to a callback to generate the storage key. The 
    builder object offers the following methods:

    * ``entity`` - This method used to select the member of the state persistent.
    * ``length`` - This method used to access length/size of `Array`, `Varray` and, `Map`.
    * ``property`` - This method used to access the property of map using the passed key.
    * ``at`` - This method used to access the element of `Array` and `Varray` using the passed index.
    * ``field`` - This method used to access the field of `Class` using the passed field name.

.. code-block:: javascript

    // Example
    const logic = await getLogicDriver(logicId, wallet);

    const symbol = await logic.persistentState.get(access => access.entity("symbol"));
    console.log(symbol);

    >> MOI

.. code-block:: javascript

    // Example: if you want to access size of the array/map
    const logic = await getLogicDriver(logicId, wallet);

    const length = await logic.persistentState.get(access => access.entity("persons").length());
    console.log(length);

    >> 10

.. code-block:: javascript

    // Example: if you want to access the balance of the address from the map
    const logic = await getLogicDriver(logicId, wallet);
    const address = "0x035dcdaa46f9b8984803b1105d8f327aef97de58481a5d3fea447735cee28fdc";

    const balance = await logic.persistentState.get(access => access.entity("Balances").property(hexToBytes(address)));
    console.log(balance);

    >> 10000

.. code-block:: javascript

    // Example: if you want to field of the class
    const logic = await getLogicDriver(logicId, wallet);

    const name = await logic.persistentState.get(access => access.entity("persons").field("name"));
    console.log(name);

    >> Alice

.. code-block:: javascript

    // Example: if you want to access the element of the array
    const logic = await getLogicDriver(logicId, wallet);

    const product = await logic.persistentState.get(access => access.entity("Products").at(0));
    console.log(name);

    >> Chocolate

``ephemeralState`` - The ephemeral state variable provides access to transient 
state associated directly with a participant. This state reflects the state of 
a participant and can change frequently as interactions occur.

 It contains the following method:

* ``get`` 
    This method retrieves a value from ephemeral state using the storage key 
    and participant address.

    **Usage**: Similar to persistent state, the get method takes a callback function.
    In addition to that, it also requires a participant address. The builder 
    object within the callback defines how to access the state, similar to 
    persistent state.

.. code-block:: javascript

    // Example
    const address = "0x996ab2197faa069202f83d7993f174e7a3635f3278d3745d6a9fe89d75b854df"
    const logic = await getLogicDriver(logicId, wallet);

    const spendable = await logic.ephemeralState.get(address, (access) => 
        access.entity("Spendable")
    );
    console.log(spendable);

    >> 10000

**Functions**

.. autofunction:: getLogicDriver

.. code-block:: javascript

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

.. autofunction:: createRoutineOption

**Usage**

**Example 1**: Calling a routine using the logic driver

.. code-block:: javascript

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

.. code-block:: javascript

    import { getLogicDriver } from "js-moi-sdk";
    import { wallet } from "./wallet";

    const logicId = "0x0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a";
    const address = "0x996ab2197faa069202f83d7993f174e7a3635f3278d3745d6a9fe89d75b854df";

    // Get logic driver
    const logic = await getLogicDriver(logicId, wallet);

    // Get the persistent state
    const symbol = await logic.persistentState.get(access => access.entity("symbol"));

    console.log(symbol); // MOI

**Example 3**: Executing a mutating routine call

.. code-block:: javascript

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


If you wish to externally pass `fuelLimit` or `fuelPrice`, pass the options as
the last argument in the deploy call.

.. code-block:: javascript

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
