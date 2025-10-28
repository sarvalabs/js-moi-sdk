Asset Module
=============

This module provides classes and utilities for creating, managing, and interacting with on-chain assets
within the MOI framework. It defines three main components:

- :class:`AssetFactory` – Responsible for asset creation.
- :class:`AssetDriver` – Provides a driver abstraction for asset logic execution.
- :class:`MAS0AssetLogic` – Implements the standard MAS0 asset logic and operations such as mint, burn, and transfer.


AssetFactory
------------

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

      2. If a ``manifest`` is provided:
         - Searches for a *deploy* routine matching the given ``callsite``.
         - Validates argument counts.
         - Encodes the manifest and the routine call data (if applicable).

      3. Returns an :class:`InteractionContext` initialized for ``ASSET_CREATE``.

      **Usage Example**

      .. code-block:: javascript

        const ctx = AssetFactory.create(
             signer,
             "GOLD",
             1000000n,
             managerAddress,
             true
        );

        const response = await ctx.send();


AssetDriver
-----------

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


MAS0AssetLogic
--------------

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


MAS0 Operations
---------------

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


Readonly Routines
-----------------

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


Summary
-------

- **AssetFactory** → Builds creation interactions for any asset type.
- **AssetDriver** → Provides a generic interface for logic interaction.
- **MAS0AssetLogic** → Implements MAS0-standard logic, offering full asset lifecycle control.

Together, these classes provide a complete system for defining, deploying, and interacting with MOI assets in JavaScript.
