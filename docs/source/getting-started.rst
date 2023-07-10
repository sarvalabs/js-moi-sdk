===============
Getting Started
===============

--------------------------------------------------------------------------------

Kickstart your journey with moi.js by installing and importing it. Unleash its 
potential through comprehensive documentation and resources to supercharge 
your application development.

Installing
------------
Install the latest `release <https://github.com/sarvalabs/moi.js/releases>`_ 
using the following command:

.. code-block:: shell

    npm install moi.js

Importing
-----------
If you are using CommonJS or ES5, the require statement is used for 
importing `moi.js`.

.. code-block:: javascript

   const moi = require("moi.js")

If you are using ES6 or above, you can use the import statement to 
import `moi.js`.

.. code-block:: javascript

   import * as moi from "moi.js"

Key Concepts
------------
To begin, it's crucial to grasp the fundamental concepts that underpin the 
moi.js framework. Acquainting yourself with these concepts will empower you to 
utilize the moi.js package efficiently during your application development 
process.

**Tesseract**

It act as the fundamental unit of value space in MOI, Tesseract holds the 
outcome of an interaction's execution. It also holds various information like 
the latest state of the participant, interaction payloads, consensus data, 
and so on.

**Interaction**

An interaction can be created, signed, and send to the MOI network. This library 
provides a convenient interface for constructing interactions by specifying 
essential details such as the recipient address, interaction type, fule price,
fuel limit, and so on.

**Asset**

An Asset in MOI is simply an exchangeable digital asset that is managed and 
recognized natively by the MOI Protocol. Unlike other blockchain protocols, 
all Assets in MOI are directly owned and managed by participants in their 
accounts.

Retrieving the balances of a participant will return a composite object with 
all Assets held in that account indexed by their Asset ID, which is a 
unique identifier for the Asset.

**Logic**

Todo: pending has to be updated

**Manifest**

Todo: pending has to be updated

**Receipt**

After a interaction is executed on the network, a receipt is generated and 
stored on the blockchain as a record of that interaction's execution. Receipts 
contains detailed information about the interaction's execution, including 
whether it was successful, the fuel used, and other relevant data.

**Provider**

A Provider provides a convenient interface for connecting to MOI nodes and 
retrieving data from the blockchain. These providers serve as gateways to the 
MOI network, enabling users to access data like account balances, interaction 
history, logic information, and more.

**Signer**

A Signer acts as a representation of an MOI account and possesses the ability 
to sign interactions and messages. It abstracts away the low-level 
cryptographic operations required for signing and allows users to interact 
securely with the MOI network.

In addition to interaction signing, the signer module supports message signing, 
which is widely used for identity verification and authentication purposes in 
decentralized applications. Developers can utilize the signer's capabilities to 
sign and verify arbitrary messages, providing cryptographic proof of the 
message's origin and integrity.
