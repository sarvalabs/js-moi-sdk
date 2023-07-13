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
* ``parts`` - ``TesseractPart[]``: An array of tesseract parts associated with the interaction.
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

**ContextLockInfo**

The ``ContextLockInfo`` interface represents information about a context lock. It has the following properties:

* ``address`` - ``string``: The address associated with the context lock.
* ``context_hash`` - ``string``: The hash of the context.
* ``height`` - ``string``: The height of the context.
* ``tesseract_hash`` - ``string``: The hash of the tesseract.

**DeltaGroup**

The ``DeltaGroup`` interface represents a group of delta nodes. It has the following properties:

* ``address`` - ``string``: The address associated with the delta group.
* ``role`` - ``number``: The role of the delta group.
* ``behavioural_nodes`` - ``string[]``: An array of behavioural nodes.
* ``random_nodes`` - ``string[]``: An array of random nodes.
* ``replaced_nodes`` - ``string[]``: An array of replaced nodes.

**PoXCData**

The ``PoXCData`` interface represents PoXC data. It has the following properties:

* ``binary_hash`` - ``string``: The hash of the binary.
* ``identity_hash`` - ``string``: The hash of the identity.
* ``ics_hash`` - ``string``: The hash of the ICS.

**TesseractGridID**

The ``TesseractGridID`` interface represents the identifier for a tesseract grid. It has the following properties:

* ``hash`` - ``string``: The hash of the grid.
* ``total`` - ``string``: The total value.
* ``parts`` - ``TesseractPart[]``: An array of tesseract parts.

**CommitData**

The ``CommitData`` interface represents commit data. It has the following properties:

* ``round`` - ``string``: The round value.
* ``commit_signature`` - ``string``: The commit signature.
* ``vote_set`` - ``string``: The vote set.
* ``evidence_hash`` - ``string``: The hash of the evidence.
* ``grid_id`` - ``TesseractGridID``: The grid identifier.

**TesseractHeader**

The ``TesseractHeader`` interface represents the header of a tesseract. It has the following properties:

* ``address`` - ``string``: The address associated with the tesseract.
* ``prev_hash`` - ``string``: The hash of the previous tesseract.
* ``height`` - ``string``: The height of the tesseract.
* ``fuel_used`` - ``string``: The fuel used in the tesseract.
* ``fuel_limit`` - ``string``: The fuel limit of the tesseract.
* ``body_hash`` - ``string``: The hash of the tesseract body.
* ``grid_hash`` - ``string``: The hash of the tesseract grid.
* ``operator`` - ``string``: The operator of the tesseract.
* ``cluster_id`` - ``string``: The ID of the cluster.
* ``timestamp`` - ``string``: The timestamp of the tesseract.
* ``context_lock`` - ``ContextLockInfo[]``: An array of context lock information.
* ``extra`` - ``CommitData``: Additional commit data.

**TesseractBody**

The ``TesseractBody`` interface represents the body of a tesseract. It has the following properties:

* ``state_hash`` - ``string``: The hash of the state.
* ``context_hash`` - ``string``: The hash of the context.
* ``interaction_hash`` - ``string``: The hash of the interactions.
* ``receipt_hash`` - ``string``: The hash of the receipts.
* ``context_delta`` - ``DeltaGroup[]``: An array of delta groups for the context.
* ``consensus_proof`` - ``PoXCData``: The PoXC data for the consensus.

**Tesseract**

The ``Tesseract`` interface represents a tesseract object. It has the following properties:

* ``header`` - ``TesseractHeader``: The header of the tesseract.
* ``body`` - ``TesseractBody``: The body of the tesseract.
* ``ixns`` - ``Interactions``: The interactions associated with the tesseract.
* ``seal`` - ``string``: The seal of the tesseract.
* ``hash`` - ``string``: The hash of the tesseract.


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
