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

ParticipantCreate
~~~~~~~~~~~~~~~~~
The **ParticipantCreate** class is responsible for creating new participants
within the MOI network.  
A participant can represent a user, organization, or entity that interacts with
assets and logic instances.

This builder helps define the participant’s unique ID, attach cryptographic keys,
and optionally include an asset payload for initial value assignment.

**Key Responsibilities:**

- Initialize a new participant ID
- Add one or more cryptographic keys with configurable weights
- Define asset payloads (e.g., token allocations)
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

-------------------------------------------------------------------------------

AccountConfigure
~~~~~~~~~~~~~~~~
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

-------------------------------------------------------------------------------

AccountInherit
~~~~~~~~~~~~~~
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
