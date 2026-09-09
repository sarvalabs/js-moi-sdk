# Utilities

> js-moi-sdk utility functions for MOI development: encoding and decoding, address and identifier helpers, unit conversion, and byte-level tools.

Utilities
*********

The utilities module offers a comprehensive set of tools and functions
to simplify development process. This package encompasses various
utility functions designed to enhance the overall development
experience when working with MOI.

The utilities package offers a range of features, including address
validation, data format conversion and cryptographic operations. These
features are designed to ensure accuracy, security, and convenience
throughout the development process.


Types
=====

**ContextDelta**

The "ContextDelta" interface represents a context delta object. It has
the following properties:

* "role" - "number": The role of the participant.

* "behavioural_nodes" - "string[] | null": An array of behavioural
  nodes.

* "random_nodes" - "string | null": An array of compute nodes.

* "replaced_nodes" - "string[] | null": An array of trust nodes.

**Participant**

The "Participant" interface represents a participant object. It has
the following properties:

* "address" - "string": The address of the participant.

* "height" - "string": The height of the participant.

* "transitive_link" - "string": The transitive link of the
  participant.

* "prev_context" - "string": The previous context of the participant.

* "latest_context" - "string": The latest context of the participant.

* "context_delta" - "ContextDelta": The object representing the
  context delta of the participant.

* "state_delta" - "string": The state delta of the participant.

**Operation**

The "Operation" interface represents an individual operation within an
interaction. It contains the following properties:

* "type" - "number": The type of the operation.

* "payload" - "Uint8Array": The serialized payload containing the
  operation data.

**Interaction**

The "Interaction" interface represents a complete interaction, which
bundles multiple ix_operations and metadata to be processed on the MOI
network. It includes the following properties:

* "sender" - "string": The address of the participant initiating the
  interaction.

* "payer" - "string": The address of the participant responsible for
  covering the interaction's fuel costs.

* "nonce" - "string": The nonce value.

* "fuel_price" - "string": The price per unit of fuel for processing
  the interaction.

* "fuel_limit" - "string": The maximum amount of fuel allocated for
  the interaction execution.

* "ix_operations" - "string": The serialized representation of the
  ix_operations included in the interaction.

* "hash" - "string": The unique cryptographic hash of the interaction,
  used for identification and verification.

* "signature" - "string": The cryptographic signature of the
  interaction, ensuring its authenticity.

* "ts_hash" - "string": The hash of the associated tesseract,
  representing the outcome of the interaction.

* "participants" - "Participants[]": An array of participants involved
  in the interaction.

* "ix_index" - "string": The index indicating the order or position of
  the interaction in the sequence of interactions.

**Interactions**

The "Interactions" type represents an array of interactions.

**AssetCreationResult**

The "AssetCreationResult" interface represents a receipt for asset
creation. It has the following properties:

* "asset_id" - "string": The ID of the created asset.

* "address" - "string": The address associated with the asset.

**AssetSupplyResult**

The "AssetSupplyResult" interface represents a receipt for asset
minting or burning. It has the following properties:

* "total_supply" - "string": The total supply of the asset.

**LogicDeployResult**

The "LogicDeployResult" interface represents a receipt for logic
deployment. It has the following properties:

* "logic_id" - "string" (optional): The ID of the deployed logic.

* "error" - "string": The error message associated with the
  deployment.

**LogicInvokeResult**

The "LogicInvokeResult" interface represents a receipt for logic
execution. It has the following properties:

* "outputs" - "string": The outputs of the logic execution.

* "error" - "string": The error message associated with the execution.

**LogicEnlistResult**

The "LogicEnlistResult" interface represents a receipt for logic
enlist. It has the following properties:

* "outputs" - "string": The outputs of the logic enlist.

* "error" - "string": The error message associated with the enlist.

**ConsensusInfo**

The "ConsensusInfo" interface represents the consensus information. It
has the following properties:

* "evidence_hash" - "string": The hash of the evidence.

* "binary_hash" - "string": The hash of the binary.

* "identity_hash" - "string": The hash of the identity.

* "ics_hash" - "string": The hash representing the ICS.

* "cluster_id" - "string": The hash representing the cluster id.

* "ics_signature" - "string": The hash representing the ICS signature.

* "ics_vote_set" - "string": The hash representing the ICS vote set.

* "round" - "string": The string representing the round.

* "commit_signature" - "string": The hash representing the commit
  signature.

* "bft_vote_set" - "string": The string representing the BFT vote set.

**Tesseract**

The "Tesseract" interface represents a tesseract object. It has the
following properties:

* "hash" - "string": The hash of the tesseract.

* "interactions_hash" - "string": The hash of the interactions.

* "receipts_hash" - "string": The hash of the receipts.

* "epoch" - "string": The hex value represents the fixed time slot.

* "time_stamp" - "string": The hex value represents the ICS request
  time.

* "operator" - "string": The Krama ID of the operator.

* "fuel_used" - "string": The hex value representing fuel used to
  process the interaction.

* "fuel_limit" - "string": The hex value representing fuel limit of
  the interaction.

* "consensus_info" - "ConsensusInfo": The object representing the
  consensus information.

* "seal" - "string": The hex value representing the The signature of
  node which executed the tesseract.

* "ixns" - "Interaction[]": An array of interactions.

* "participants" - "Participant[]": An array of participants.


Address
=======

isValidAddress(address)

   Checks if the given address is a valid address.

   Arguments:
      * **address** (**string**) -- The address to validate.

   Returns:
      **boolean** -- Returns true if the address is valid, otherwise
      false.

   // Example
   const isValid = isValidAddress("0xd210e094cd2432ef7d488d4310759b6bd81a0cda35a5fcce3dab87c0a841bdba")
   console.log(isValid)

   >> true


Base64
======

encodeBase64(uint8Array)

   encodeBase64

   Encodes a Uint8Array into a base64 string.

   Arguments:
      * **uint8Array** (**Uint8Array**) -- The Uint8Array to encode.

   Returns:
      **string** -- The base64 encoded string.

   // Example
   const uint8Array = new Uint8Array([72, 101, 108, 108, 111]);
   const encoded = encodeBase64(uint8Array);
   console.log(encoded)

   >> SGVsbG8=

decodeBase64(base64String)

   Decodes a base64 string into a Uint8Array.

   Arguments:
      * **base64String** (**string**) -- The base64 string to decode.

   Returns:
      **Uint8Array** -- The decoded Uint8Array.

   // Example
   const uint8Array = new Uint8Array([72, 101, 108, 108, 111]);
   const encoded = encodeBase64(uint8Array);
   console.log(encoded)

   >> [ 72, 101, 108, 108, 111 ]


Hex
===

numToHex(value)

   Converts a number, bigint, or BN instance to a hexadecimal string
   representation. If the input value is not already a BN instance, it
   is converted to one. Throws an error if the input value is a
   negative number.

   Arguments:
      * **value** (**NumberLike**) -- The value to convert to a
        hexadecimal string.

   Throws:
      **Error** -- If the input value is a negative number.

   Returns:
      **string** -- - The hexadecimal string representation of the
      value.

   // Example
   console.log(numToHex(123))

   >> 7B

toQuantity(value)

   Converts a number, bigint, or BN instance to a quantity string
   representation. The quantity string is prefixed with "0x" and is
   obtained by calling *numToHex* function.

   Arguments:
      * **value** (**NumberLike**) -- The value to convert to a
        quantity string.

   Throws:
      **Error** -- If an error occurs during the conversion.

   Returns:
      **string** -- - The quantity string representation of the value.

   // Example
   console.log(toQuantity(123))

   >> 0x7B

encodeToString(data)

   Converts a Uint8Array to a hexadecimal string representation.

   Arguments:
      * **data** (**Uint8Array**) -- The Uint8Array to encode as a
        hexadecimal string.

   Returns:
      **string** -- The hexadecimal string representation of the
      Uint8Array.

   // Example
   const data = new Uint8Array([1, 2, 3, 4])
   console.log(encodeToString(data))

   >> 0x01020304

hexToBytes(str)

   Converts a hexadecimal string to a Uint8Array.

   Arguments:
      * **str** (**string**) -- The hexadecimal string to convert to a
        Uint8Array.

   Throws:
      **Error** -- If the input string is not a valid hexadecimal
      string.

   Returns:
      **Uint8Array** -- - The Uint8Array representation of the
      hexadecimal string.

   // Example
   console.log(hexToBytes("0x01020304"))

   >> [1, 2, 3, 4]

hexToBN(hex)

   Converts a hexadecimal string to a bigint or number. If the
   resulting value is too large to fit in a number, it is returned as
   a BigInt. Otherwise, it is returned as a number.

   Arguments:
      * **hex** (**string**) -- The hexadecimal string to convert.

   Returns:
      **bigint|number** -- The resulting value as a bigint or number.

   // Example
   console.log(hexToBN("0x123"))

   >> 291

bytesToHex(data)

   Converts a Uint8Array to a hexadecimal string representation.

   Arguments:
      * **data** (**Uint8Array**) -- The Uint8Array to convert to a
        hexadecimal string.

   Returns:
      **string** -- The hexadecimal string representation of the
      Uint8Array.

   // Example
   const data = new Uint8Array([1, 2, 3, 4]);
   console.log(bytesToHex(data))

   >> 01020304

isHex(data)

   Checks if a given string is a valid hexadecimal value.

   Arguments:
      * **data** (**string**) -- The input string.

   Returns:
      **boolean** -- True if the input is a valid hexadecimal string,
      false otherwise.

   // Example
   console.log(isHex("0x1234ABCD"))

   >> true

trimHexPrefix(data)

   Removes the '0x' prefix from a hexadecimal string if present.

   Arguments:
      * **data** (**string**) -- The input string.

   Returns:
      **string** -- The trimmed hexadecimal string.

   // Example
   console.log(trimHexPrefix("0xABCDEF"))

   >> ABCDEF


Bytes
=====

isInteger(value)

   Checks if the given value is an integer.

   Arguments:
      * **value** (**number**) -- The value to check.

   Returns:
      **boolean** -- - Returns true if the value is an integer,
      otherwise false.

   // Example
   console.log(isInteger(42))

   >> true

isBytes(value)

   Checks if the given value is a valid byte array.

   Arguments:
      * **value** (**any**) -- The value to check.

   Returns:
      **boolean** -- - Returns true if the value is a valid byte
      array, otherwise false.

   // Example
   console.log(isBytes([0, 255, 128]))

   >> true

hexDataLength(data)

   Calculates the length of the data represented by a hexadecimal
   string.

   Arguments:
      * **data** (**string**) -- The hexadecimal string.

   Returns:
      **number|null** -- - The length of the data, or null if the
      input is not a valid hexadecimal string.

   // Example
   console.log(hexDataLength('0xabcdef'))

   >> true

isHexString(value, length)

   Checks if the given value is a valid hexadecimal string.

   Arguments:
      * **value** (**any**) -- The value to check.

      * **length** (**number**) -- Optional. The expected length of
        the hexadecimal string.

   Returns:
      **boolean** -- Returns true if the value is a valid hexadecimal
      string, otherwise false.

   // Example
   console.log(isHexString('0x1234', 3))

   >> false

bufferToUint8(target)

   Converts a Buffer to a Uint8Array.

   Arguments:
      * **target** (**Buffer**) -- The Buffer to convert.

   Returns:
      **Uint8Array** -- The Uint8Array representation of the Buffer.

   // Example
   const buffer = Buffer.from([1, 2, 3]);
   const uint8Array = bufferToUint8(buffer);
   console.log(uint8Array)

   >> [1, 2, 3]


Json
====

marshal(data)

   Marshals the given json object into a Uint8Array by converting it
   to JSON string and encoding as UTF-8.

   Arguments:
      * **data** (**object**) -- The data object to marshal.

   Returns:
      **Uint8Array** -- The marshaled data as a Uint8Array.

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

unmarshal(bytes)

   Unmarshals the given Uint8Array into its original json object by
   decoding it as UTF-8 and parsing the JSON string.

   Arguments:
      * **bytes** (**Uint8Array**) -- The bytes to unmarshal.

   Throws:
      **Error** -- If there is an error while deserializing the data.

   Returns:
      **any** -- The unmarshaled data object.

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
==========

defineReadOnly(object, name, value)

   Defines a read-only property on an object with the specified name
   and value.

   Arguments:
      * **object** (**object**) -- The object on which to define the
        property.

      * **name** (**string|symbol**) -- The name of the property.

      * **value** (**any**) -- The value of the property.

   // Example
   const data = {}
   defineReadOnly(data, "foo", true)


Errors
======


CustomError
===========

The CustomError class extends the Error class and provides additional
utility methods.

   // Example
   const error = new CustomError("Invalid argument provided")

toString()

   Overrides the toString() method to provide a string representation
   of the error.

   Returns:
      **string** -- - The string representation of the error.

   // Example
   const error = error.toString();


ErrorUtils
==========

The ErrorUtils class contains static helper methods for handling
errors.

static throwError(message, code, params)

   Throws a CustomError with the specified message, error code, and
   parameters.

   Arguments:
      * **message** (**string**) -- The error message.

      * **code** (**ErrorCode**) -- The error code.

      * **params** (**ErrorParams**) -- The parameters of the error.

   Throws:
      **CustomError** --

      * Throws a CustomError.

   // Example
   ErrorUtils.throwError("Invalid argument provided", ErrorCode.INVALID_ARGUMENT)

static throwArgumentError(message, name, value)

   Throws a CustomError with the specified argument-related error
   message, argument name, and value.

   Arguments:
      * **message** (**string**) -- The error message.

      * **name** (**string**) -- The name of the argument.

      * **value** (**any**) -- The value of the argument.

   Throws:
      **CustomError** --

      * Throws a CustomError.

   // Example
   ErrorUtils.throwArgumentError("Invalid argument provided", "nonce", "2")
