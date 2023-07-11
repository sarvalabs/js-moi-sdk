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

Base64
------

.. autofunction:: encodeBase64

.. autofunction:: decodeBase64

Hex
---

.. autofunction:: numToHex

.. autofunction:: toQuantity

.. autofunction:: encodeToString

.. autofunction:: hexToBytes

.. autofunction:: hexToBN

.. autofunction:: bytesToHex

.. autofunction:: isHex

.. autofunction:: trimHexPrefix

Bytes
-----

.. autofunction:: isInteger

.. autofunction:: isBytes

.. autofunction:: hexDataLength

.. autofunction:: isHexString

.. autofunction:: bufferToUint8

HexToUint8
----------

.. autofunction:: hexToUint8

Json
----

.. autofunction:: marshal

.. autofunction:: unmarshal

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

