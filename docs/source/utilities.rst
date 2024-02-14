=========
Utilities
=========

--------------------------------------------------------------------------------


The utilities module offers a comprehensive set of tools and functions to 
simplify development process. This package encompasses various utility 
functions designed to enhance the overall development experience when working 
with MOI.

The utilities package offers a range of features, including address validation, 
data format conversion and cryptographic operations. These features are designed 
to ensure accuracy, security, and convenience throughout the development process.

Types
-----

**ContextDelta**

The ``ContextDelta`` interface represents a context delta object. It has the following properties:

* ``role`` - ``number``: The role of the participant.
* ``behavioural_nodes`` - ``string[] | null``: An array of behavioural nodes.
* ``random_nodes`` - ``string | null``: An array of compute nodes.
* ``replaced_nodes`` - ``string[] | null``: An array of trust nodes.

**Participant**

The ``Participant`` interface represents a participant object. It has the following properties:

* ``address`` - ``string``: The address of the participant.
* ``height`` - ``string``: The height of the participant.
* ``transitive_link`` - ``string``: The transitive link of the participant.
* ``prev_context`` - ``string``: The previous context of the participant.
* ``latest_context`` - ``string``: The latest context of the participant.
* ``context_delta`` - ``ContextDelta``: The object representing the context delta of the participant.
* ``state_delta`` - ``string``: The state delta of the participant.

**Participants**

The ``Participants`` type represents an array of participants.

**Interaction**

The ``Interaction`` interface represents an interaction object. It has the following properties:

* ``type`` - ``number``: The type of the interaction.
* ``nonce`` - ``string``: The nonce value.
* ``sender`` - ``string``: The sender of the interaction.
* ``receiver`` - ``string``: The receiver of the interaction.
* ``payer`` - ``string``: The payer of the interaction.
* ``transfer_values`` - ``Map<string, string>``: Transfer values associated with the interaction.
* ``perceived_values`` - ``Map<string, string>``: Perceived values associated with the interaction.
* ``perceived_proofs`` - ``string``: The perceived proofs for the interaction.
* ``fuel_price`` - ``string``: The fuel price for the interaction.
* ``fuel_limit`` - ``string``: The fuel limit for the interaction.
* ``payload`` - ``unknown``: The payload of the interaction.
* ``mode`` - ``string``: The mode of the interaction.
* ``compute_hash`` - ``string``: The hash of the compute.
* ``compute_nodes`` - ``string[]``: The compute nodes involved in the interaction.
* ``mtq`` - ``string``: The MTQ value for the interaction.
* ``trust_nodes`` - ``string[]``: The trust nodes associated with the interaction.
* ``hash`` - ``string``: The hash of the interaction.
* ``signature`` - ``string``: The signature of the interaction.
* ``ts_hash`` - ``string``: The hash of the tesseract.
* ``participants`` - ``Participants[]``: An array of tesseract participants associated with the interaction.
* ``ix_index`` - ``string``: The index of the interaction.

**Interactions**

The ``Interactions`` type represents an array of interactions.

**AssetCreationReceipt**

The ``AssetCreationReceipt`` interface represents a receipt for asset creation. It has the following properties:

* ``asset_id`` - ``string``: The ID of the created asset.
* ``address`` - ``string``: The address associated with the asset.

**AssetMintOrBurnReceipt**

The ``AssetMintOrBurnReceipt`` interface represents a receipt for asset minting or burning. It has the following properties:

* ``total_supply`` - ``string``: The total supply of the asset.

**LogicDeployReceipt**

The ``LogicDeployReceipt`` interface represents a receipt for logic deployment. It has the following properties:

* ``logic_id`` - ``string`` (optional): The ID of the deployed logic.
* ``error`` - ``string``: The error message associated with the deployment.

**LogicInvokeReceipt**

The ``LogicInvokeReceipt`` interface represents a receipt for logic execution. It has the following properties:

* ``outputs`` - ``string``: The outputs of the logic execution.
* ``error`` - ``string``: The error message associated with the execution.

**Receipt**

The ``Receipt`` interface represents an interaction receipt. It has the following properties:

* ``ix_type`` - ``number``: The type of the interaction.
* ``ix_hash`` - ``string``: The hash of the interaction.
* ``fuel_used`` - ``bigint``: The fuel used for the interaction.
* ``state_hashes`` - ``Map<string, string>``: State hashes associated with the interaction.
* ``context_hashes`` - ``Map<string, string>``: Context hashes associated with the interaction.
* ``extra_data`` - ``AssetCreationReceipt``, ``AssetMintOrBurnReceipt``, ``LogicDeployReceipt``, ``LogicInvokeReceipt``, or ``null``: Additional data associated with the interaction receipt.

**ConsensusInfo**

The ``ConsensusInfo`` interface represents the consensus information. It has the following properties:

* ``evidence_hash`` - ``string``: The hash of the evidence.
* ``binary_hash`` - ``string``: The hash of the binary.
* ``identity_hash`` - ``string``: The hash of the identity.
* ``ics_hash`` - ``string``: The hash representing the ICS.
* ``cluster_id`` - ``string``: The hash representing the cluster id.
* ``ics_signature`` - ``string``: The hash representing the ICS signature.
* ``ics_vote_set`` - ``string``: The hash representing the ICS vote set.
* ``round`` - ``string``: The string representing the round.
* ``commit_signature`` - ``string``: The hash representing the commit signature.
* ``bft_vote_set`` - ``string``: The string representing the BFT vote set.

**Tesseract**

The ``Tesseract`` interface represents a tesseract object. It has the following properties:

* ``hash`` - ``string``: The hash of the tesseract.
* ``interactions_hash`` - ``string``: The hash of the interactions.
* ``receipts_hash`` - ``string``: The hash of the receipts.
* ``epoch`` - ``string``: The hex value represents the fixed time slot.
* ``time_stamp`` - ``string``: The hex value represents the ICS request time.
* ``operator`` - ``string``: The Krama ID of the operator.
* ``fuel_used`` - ``string``: The hex value representing fuel used to process the interaction.
* ``fuel_limit`` - ``string``: The hex value representing fuel limit of the interaction.
* ``consensus_info`` - ``ConsensusInfo``: The object representing the consensus information.
* ``seal`` - ``string``: The hex value representing the The signature of node which executed the tesseract.
* ``ixns`` - ``Interaction[]``: An array of interactions.
* ``participants`` - ``Participant[]``: An array of participants.


Address
-------

.. autofunction:: isValidAddress

.. code-block:: javascript

    // Example
    const isValid = isValidAddress("0xd210e094cd2432ef7d488d4310759b6bd81a0cda35a5fcce3dab87c0a841bdba")
    console.log(isValid)

    >> true

Base64
------

.. autofunction:: encodeBase64

.. code-block:: javascript

    // Example
    const uint8Array = new Uint8Array([72, 101, 108, 108, 111]);
    const encoded = encodeBase64(uint8Array);
    console.log(encoded)

    >> SGVsbG8=

.. autofunction:: decodeBase64

.. code-block:: javascript

    // Example
    const uint8Array = new Uint8Array([72, 101, 108, 108, 111]);
    const encoded = encodeBase64(uint8Array);
    console.log(encoded)

    >> [ 72, 101, 108, 108, 111 ]

Hex
---

.. autofunction:: numToHex

.. code-block:: javascript

    // Example
    console.log(numToHex(123))

    >> 7B

.. autofunction:: toQuantity

.. code-block:: javascript

    // Example
    console.log(toQuantity(123))

    >> 0x7B

.. autofunction:: encodeToString

.. code-block:: javascript

    // Example
    const data = new Uint8Array([1, 2, 3, 4])
    console.log(encodeToString(data))

    >> 0x01020304

.. autofunction:: hexToBytes

.. code-block:: javascript

    // Example
    console.log(hexToBytes("0x01020304"))

    >> [1, 2, 3, 4]

.. autofunction:: hexToBN

.. code-block:: javascript

    // Example
    console.log(hexToBN("0x123"))

    >> 291

.. autofunction:: bytesToHex

.. code-block:: javascript

    // Example
    const data = new Uint8Array([1, 2, 3, 4]);
    console.log(bytesToHex(data))

    >> 01020304

.. autofunction:: isHex

.. code-block:: javascript

    // Example
    console.log(isHex("0x1234ABCD"))

    >> true

.. autofunction:: trimHexPrefix

.. code-block:: javascript

    // Example
    console.log(trimHexPrefix("0xABCDEF"))

    >> ABCDEF

Bytes
-----

.. autofunction:: isInteger

.. code-block:: javascript

    // Example
    console.log(isInteger(42))

    >> true

.. autofunction:: isBytes

.. code-block:: javascript

    // Example
    console.log(isBytes([0, 255, 128]))

    >> true

.. autofunction:: hexDataLength

.. code-block:: javascript

    // Example
    console.log(hexDataLength('0xabcdef'))

    >> true

.. autofunction:: isHexString

.. code-block:: javascript

    // Example
    console.log(isHexString('0x1234', 3))

    >> false

.. autofunction:: bufferToUint8

.. code-block:: javascript

    // Example
    const buffer = Buffer.from([1, 2, 3]);
    const uint8Array = bufferToUint8(buffer);
    console.log(uint8Array)

    >> [1, 2, 3]

Json
----

.. autofunction:: marshal

.. code-block:: javascript

    // Example
    const data = { name: "John", age: 30 }
    console.log(marshal(data))

    // Output

    /*
        [
            123, 34, 110,  97, 109, 101, 34,
            58, 34,  74, 111, 104, 110, 34,
            44, 34,  97, 103, 101,  34, 58,
            51, 48, 125
        ]
    */

.. autofunction:: unmarshal

.. code-block:: javascript

    // Example
    const bytes = Buffer.from([
      123, 34, 110,  97, 109, 101, 34,
       58, 34,  74, 111, 104, 110, 34,
       44, 34,  97, 103, 101,  34, 58,
       51, 48, 125
    ]);
    console.log(unmarshal(bytes))

    >> { name: "John", age: 30 }

Properties
----------

.. autofunction:: defineReadOnly

.. code-block:: javascript

    // Example
    const data = {}
    defineReadOnly(data, "foo", true)

Errors
------

CustomError
-----------
The CustomError class extends the Error class and provides additional utility 
methods.

.. code-block:: javascript

    // Example
    const error = new CustomError("Invalid argument provided")

.. autofunction:: toString

.. code-block:: javascript

    // Example
    const error = error.toString();

ErrorUtils
----------
The ErrorUtils class contains static helper methods for handling errors.

.. autofunction:: throwError

.. code-block:: javascript

    // Example
    ErrorUtils.throwError("Invalid argument provided", ErrorCode.INVALID_ARGUMENT)

.. autofunction:: throwArgumentError

.. code-block:: javascript

    // Example
    ErrorUtils.throwArgumentError("Invalid argument provided", "nonce", "2")
