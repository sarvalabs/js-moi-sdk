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

Mnemonics
---------

.. autofunction:: mnemonicToSeed

.. autofunction:: isValidSeed

Properties
----------

.. autofunction:: defineReadOnly

Errors
------

CustomError
-----------
The CustomError class extends the Error class and provides additional utility 
methods.

.. autofunction:: toString

ErrorUtils
----------
The ErrorUtils class contains static helper methods for handling errors.

.. autofunction:: throwError

.. autofunction:: throwArgumentError

