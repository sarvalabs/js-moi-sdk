Participants
============

The ``participants`` package in the js-moi-sdk provides classes to create and manage participants and accounts within the MOI network.  
These classes handle participant creation, key management, account configuration, and inheritance setup — all through a unified and strongly typed interface.

It includes the following core classes:

- ``ParticipantCreate``
- ``AccountConfigure``
- ``AccountInherit``

Each class uses ``js-moi-providers``, ``js-moi-signer``, ``js-moi-utils``, ``js-moi-wallet``, and ``js-polo`` internally to construct and send interaction payloads to the MOI runtime.

---

ParticipantCreate
-----------------

The ``ParticipantCreate`` class allows you to create a new participant by defining their unique ID, associated keys, and asset transfer details.

**Imports**

.. code-block:: ts

    import { AssetActionPayload, InteractionResponse, KeyAddPayload } from "js-moi-providers";
    import { Signer } from "js-moi-signer";
    import { bytesToHex, hexToBytes, LockType, OpType, Hex } from "js-moi-utils";
    import { documentEncode } from "js-polo";
    import { InteractionContext } from "js-moi-wallet";

**Class Definition**

.. code-block:: ts

    export class ParticipantCreate {
        private _id?: Hex;
        private _keys: KeyAddPayload[] = [];
        private _value?: AssetActionPayload;
        private signer: Signer;

        constructor(signer: Signer) { ... }

        public id(id: Hex): ParticipantCreate { ... }

        public addKey(publicKey: Hex, weight: number, signatureAlgorithm = 0): ParticipantCreate { ... }

        public value(assetId: Hex, beneficiary: Hex, amount: number | bigint): ParticipantCreate { ... }

        public build(): InteractionContext<OpType.PARTICIPANT_CREATE> { ... }

        public async send(): Promise<InteractionResponse> { ... }
    }

**Methods**

- ``id(id: Hex)``  
  Assigns a unique participant ID.

- ``addKey(publicKey: Hex, weight: number, signatureAlgorithm = 0)``  
  Adds a public key to the participant with its weight and signature algorithm.

- ``value(assetId: Hex, beneficiary: Hex, amount: number | bigint)``  
  Creates a transfer payload with encoded data for the participant’s asset.

- ``build()``  
  Constructs and validates an ``InteractionContext`` for participant creation.

- ``send()``  
  Sends the built interaction to the network and returns an ``InteractionResponse``.

**Example Usage**

.. code-block:: ts

    const participant = new ParticipantCreate(signer)
        .id("0x1234...")
        .addKey("0xabcd...", 1)
        .value("0xasset...", "0xbeneficiary...", 100n);

    await participant.send();

---

AccountConfigure
----------------

The ``AccountConfigure`` class handles adding or revoking keys in an existing account.  
It is used to manage access control and cryptographic permissions dynamically.

**Imports**

.. code-block:: ts

    import { KeyAddPayload, KeyRevokePayload, AssetActionPayload, InteractionResponse } from "js-moi-providers";
    import { Signer } from "js-moi-signer";
    import { bytesToHex, Hex, hexToBytes, LockType, OpType } from "js-moi-utils";
    import { KMOI_ASSET_ID } from "js-moi-constants";
    import { documentEncode } from "js-polo";
    import { InteractionContext } from "js-moi-wallet";

**Class Definition**

.. code-block:: ts

    export class AccountConfigure {
        private _add: KeyAddPayload[] = [];
        private _revoke: KeyRevokePayload[] = [];
        private signer: Signer;

        constructor(signer: Signer) { ... }

        public addKey(publicKey: Hex, weight: number, signatureAlgorithm = 0): AccountConfigure { ... }

        public revokeKey(keyId: number): AccountConfigure { ... }

        public build(): InteractionContext<OpType.ACCOUNT_CONFIGURE> { ... }

        public async send(): Promise<InteractionResponse> { ... }
    }

**Methods**

- ``addKey(publicKey: Hex, weight: number, signatureAlgorithm = 0)``  
  Adds a new key to the account.

- ``revokeKey(keyId: number)``  
  Revokes an existing key from the account.

- ``build()``  
  Creates an ``InteractionContext`` for account configuration.

- ``send()``  
  Sends the interaction and returns a response from the network.

**Example Usage**

.. code-block:: ts

    const config = new AccountConfigure(signer)
        .addKey("0xabcd...", 2)
        .revokeKey(1);

    await config.send();

---

AccountInherit
--------------

The ``AccountInherit`` class sets up inheritance between accounts, transferring assets or control based on predefined conditions.

**Imports**

.. code-block:: ts

    import { KeyAddPayload, KeyRevokePayload, AssetActionPayload, InteractionResponse } from "js-moi-providers";
    import { Signer } from "js-moi-signer";
    import { bytesToHex, Hex, hexToBytes, LockType, OpType } from "js-moi-utils";
    import { KMOI_ASSET_ID } from "js-moi-constants";
    import { documentEncode } from "js-polo";
    import { InteractionContext } from "js-moi-wallet";

**Class Definition**

.. code-block:: ts

    export class AccountInherit {
        private _target?: Hex;
        private _value?: AssetActionPayload;
        private _index?: number;
        private signer: Signer;

        constructor(signer: Signer) { ... }

        public target(account: Hex): AccountInherit { ... }

        public value(assetId: Hex, beneficiary: Hex, amount: number | bigint): AccountInherit { ... }

        public index(idx: number): AccountInherit { ... }

        public build(): InteractionContext<OpType.ACCOUNT_INHERIT> { ... }

        public async send(): Promise<InteractionResponse> { ... }
    }

**Methods**

- ``target(account: Hex)``  
  Sets the target account for inheritance.

- ``value(assetId: Hex, beneficiary: Hex, amount: number | bigint)``  
  Defines the asset transfer parameters.

- ``index(idx: number)``  
  Specifies the sub-account index for inheritance.

- ``build()``  
  Constructs an ``InteractionContext`` for the inheritance operation.

- ``send()``  
  Sends the interaction to the MOI network.

**Example Usage**

.. code-block:: ts

    const inherit = new AccountInherit(signer)
        .target("0xTargetAccount...")
        .value("0xasset...", "0xbeneficiary...", 50n)
        .index(0);

    await inherit.send();

---

**Summary**

The ``participants`` module of js-moi-sdk provides essential classes to:

- Create participants with custom keys and asset payloads.  
- Configure existing accounts by adding or revoking keys.  
- Manage inheritance and asset transitions between accounts.

Each operation is abstracted into high-level builders that produce ``InteractionContext`` objects, simplifying interaction construction and submission to the MOI runtime.
