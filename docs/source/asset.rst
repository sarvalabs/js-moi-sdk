Asset
=====

The **Asset module** in ``js-moi-sdk`` is a powerful abstraction built on top of MOI’s **asset logic layer**.  
It provides developers with a high-level interface to **create, manage, and interact** with fungible, non-fungible, and custom assets on the MOI network.

This module encapsulates all the complexity of on-chain asset operations such as encoding, participant locking, signing, and fuel estimation — offering a clean, SDK-native way to work with MOI assets.

---

Overview
--------

In MOI, **assets** are governed by **logic standards**, similar to how Ethereum supports ERC standards:

+----------------+-------------+----------------------------------------------------+
| MOI Standard   | Equivalent  | Description                                        |
+================+=============+====================================================+
| ``MAS0``       | ERC-20      | Fungible tokens — identical units (e.g., MOI coin, |
|                |             | reward points)                                    |
+----------------+-------------+----------------------------------------------------+
| ``MAS1``       | ERC-721     | Non-fungible tokens — unique units (e.g.,         |
|                |             | collectibles, certificates)                       |
+----------------+-------------+----------------------------------------------------+
| ``Masx``       | User-defined| Developer-defined standard for special use cases  |
+----------------+-------------+----------------------------------------------------+

The SDK provides pre-built logic wrappers like ``MAS0AssetLogic`` and ``MAS1AssetLogic``,  
and also allows users to define their own asset standards by extending the ``AssetLogic`` base class.

---

Core Concepts
-------------

Asset Logic
~~~~~~~~~~~

An **Asset Logic** represents the behavior of an asset — defining how it can be created, transferred, locked, or destroyed.

The SDK exposes a base class ``AssetLogic`` and specialized subclasses for standard types like **MAS0**, **MAS1**, and **Masx**.

.. code-block:: typescript

    import { MAS0AssetLogic } from "js-moi-sdk/assets";

Asset Standards
~~~~~~~~~~~~~~~

Each asset follows a **standard** defined by the ``AssetStandard`` enum:

.. code-block:: typescript

    enum AssetStandard {
        MAS0 = 0,        // Fungible
        MAS1 = 1,        // Non-fungible
        MasX = 2         // Custom developer-defined standard
    }

Interaction Context
~~~~~~~~~~~~~~~~~~~

All asset operations — creation, minting, transfers, etc. — are executed using ``InteractionContext``,  
which wraps the full transaction payload and signing context.

---

Classes
-------

AssetLogic
~~~~~~~~~~

The ``AssetLogic`` class is an abstract base class that defines the core behavior shared by all asset types.  
It manages signer association, payload encoding, and participant locks for asset interactions.

**Methods**

- ``constructor(assetId: string, signer: Signer)``
- ``polorize(payload: object, schema: Schema): Uint8Array``  
  Encodes the given payload into the binary format using POLO document encoding.

---

MAS0AssetLogic
~~~~~~~~~~~~~~

The ``MAS0AssetLogic`` class implements fungible token logic (MAS0 standard).

It provides standard operations like ``mint``, ``burn``, ``transfer``, and ``approve``.

**Example**

.. code-block:: typescript

    import { MAS0AssetLogic } from "js-moi-sdk/assets";
    import { Wallet, JsonRpcProvider } from "js-moi-sdk";

    const provider = new JsonRpcProvider("http://localhost:1600/");
    const wallet = await Wallet.fromMnemonic("mother clarify push liquid ...");
    wallet.connect(provider);

    const asset = await MAS0AssetLogic.newAsset(wallet.signer, "MOI", 1000000n, wallet.address, true);

**Methods**

Static
^^^^^^

- ``create(signer, symbol, supply, manager, enableEvents)``  
  Returns an ``InteractionContext`` for creating a new MAS0 asset.

- ``newAsset(signer, symbol, supply, manager, enableEvents)``  
  Creates and deploys a new asset and returns a ``MAS0AssetLogic`` instance.

Instance
^^^^^^^^

- ``mint(beneficiary, amount)``  
  Mints new tokens to a beneficiary.

- ``burn(amount)``  
  Burns tokens from the caller’s balance.

- ``transfer(beneficiary, amount)``  
  Transfers tokens between addresses.

- ``approve(beneficiary, amount, expiresAt)``  
  Approves another account to spend tokens.

- ``revoke(beneficiary)``  
  Revokes an existing approval.

- ``lockup(beneficiary, amount)``  
  Locks tokens under the SARGA logic.

- ``release(benefactor, beneficiary, amount)``  
  Releases previously locked tokens.

**Example**

.. code-block:: typescript

    const mintIx = asset.mint("0x996a...", 500);
    const result = await mintIx.send();
    console.log(await result.result());

---

MAS1AssetLogic
~~~~~~~~~~~~~~

The ``MAS1AssetLogic`` class represents **non-fungible tokens (NFTs)** under the MAS1 standard.  
Each token has a unique ``tokenId`` and optional metadata.

**Example**

.. code-block:: typescript

    const nft = await MAS1AssetLogic.newAsset(wallet.signer, "ART", wallet.address, true);

    const mintIx = nft.mint(1n, "ipfs://bafy...");
    await mintIx.send();

**Methods**

- ``mint(tokenId, metadata)`` — Creates a unique token.  
- ``transfer(from, to, tokenId)`` — Transfers ownership of a token.  
- ``burn(tokenId)`` — Destroys a token.

---

MasXAssetLogic
~~~~~~~~~~~~~~

The ``MasXAssetLogic`` class allows developers to define **custom asset standards** based on their own logic requirements.  
It extends the ``AssetLogic`` base class and uses the ``Masx`` standard for flexibility and extensibility.

**Example**

.. code-block:: typescript

    export class MasXAssetLogic extends AssetLogic {
        static create(signer, symbol, supply, manager, enableEvents) {
            const payload = {
                symbol,
                max_supply: supply,
                standard: AssetStandard.Masx,
                dimension: 2,
                enable_events: enableEvents,
                manager,
            };
            return new InteractionContext({
                opType: OpType.ASSET_CREATE,
                payload,
                participants: [],
                signer,
            });
        }

        customAction(arg1, arg2) {
            const payload = { arg1, arg2 };
            const raw = this.polorize(payload, CUSTOM_SCHEMA);
            return new InteractionContext({
                opType: OpType.ASSET_INVOKE,
                payload: {
                    asset_id: this.assetId,
                    callsite: "CustomAction",
                    calldata: bytesToHex(raw),
                },
                participants: [],
                signer: this.signer,
            });
        }
    }

---

Asset Factory
-------------

The **Asset Factory** simplifies the process of creating multiple asset types dynamically.  
It identifies the asset standard and returns the appropriate logic handler (``MAS0AssetLogic``, ``MAS1AssetLogic``, or ``MasXAssetLogic``).

**Example**

.. code-block:: typescript

    import { AssetFactory } from "js-moi-sdk/assets";

    const asset = await AssetFactory.connect(assetId, signer);

    if (asset.standard === AssetStandard.MAS0) {
        await asset.transfer(to, 100);
    } else if (asset.standard === AssetStandard.MAS1) {
        await asset.transfer(from, to, 1n);
    } else if (asset.standard === AssetStandard.Masx) {
        await asset.customAction(...);
    }

---

State Access
------------

Assets can expose their **persistent** and **ephemeral** states via the ``LogicDriver`` API.  
You can query balances, metadata, or ownership directly from the asset logic.

**Example**

.. code-block:: typescript

    import { getLogicDriver, hexToBytes } from "js-moi-sdk";

    const logic = await getLogicDriver(assetId, wallet);

    // Get symbol
    const symbol = await logic.persistentState.get(a => a.entity("symbol"));

    // Get balance
    const balance = await logic.persistentState.get(a => 
        a.entity("Balances").property(hexToBytes(address))
    );

---

Summary
-------

+----------------------+------------------------------------------------------------+
| **Concept**          | **Description**                                           |
+======================+============================================================+
| ``MAS0AssetLogic``   | Fungible asset logic                                      |
+----------------------+------------------------------------------------------------+
| ``MAS1AssetLogic``   | Non-fungible asset logic                                  |
+----------------------+------------------------------------------------------------+
| ``MasXAssetLogic``   | Developer-defined custom asset standard                   |
+----------------------+------------------------------------------------------------+
| ``AssetLogic``       | Base abstract class for all asset types                   |
+----------------------+------------------------------------------------------------+
| **Schemas**          | Define data structure for asset operations                |
+----------------------+------------------------------------------------------------+
| **InteractionContext** | Core structure for executing on-chain interactions      |
+----------------------+------------------------------------------------------------+

---
