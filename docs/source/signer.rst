======
Signer
======

The Signer class serves as a base class for various signer implementations and 
defines the common interface for signing interactions and messages.

Being an abstract class, the Signer class cannot be instantiated directly but 
serves as a blueprint for derived classes that provide concrete implementations. 
These derived classes include Wallet, and others. Each derived class represents 
a different way of signing interactions or messages.

The Signer class defines methods such as ``sign``, ``signInteractions``, 
``connect`` and ``getAddress``, which derived classes must implement. These 
methods handle the signing process and address retrieval. By adhering to the 
Signer class's interface, derived classes ensure compatibility and consistency 
when working with different types of signers.

Types
~~~~~

**SigningAlgorithms**

The ``SigningAlgorithms`` interface represents signing algorithms for cryptographic operations. It has the following property:

* ``ecdsa_secp256k1`` - ``ECDSA_S256``: The ECDSA with secp256k1 signing algorithm.

Abstract Methods
~~~~~~~~~~~~~~~~

**getAddress**

This method is used to retrieve the moi account address associated with 
the signer. Concrete classes that inherit from Signer must implement this method 
to provide the functionality of retrieving the address.

**connect**

This method is responsible for creating a new instance of the signer 
with a different provider. It allows switching the underlying provider while 
keeping the same signer configuration. Concrete classes need to implement this 
method to enable the functionality of connecting the signer to a different 
provider.

**sign**

This method is responsible for signing arbitrary messages using the 
MOI signing scheme. Concrete classes need to implement this method to 
enable the functionality of signing messages.

**signInteraction**

This method is used to sign MOI interactions. Concrete classes must 
implement this method to provide the logic for signing the interactions using 
the signer's private key.

Regular Methods
~~~~~~~~~~~~~~~

.. autofunction:: getProvider

.. code-block:: javascript
    
    // Example
    const provider = signer.getProvider();

.. autofunction:: getNonce

.. code-block:: javascript

    // Example
    const nonce = await signer.getNonce();
    console.log(nonce)

    >> 5

.. autofunction:: Signer#sendInteraction

.. code-block:: javascript

    // Example 1
    const response = await signer.sendInteraction({
        fuel_price: 1,
        fuel_limit: 200,
        ix_operations: [
            {
                type: OpType.ASSET_CREATE,
                payload: {
                    standard: AssetStandard.MAS0,
                    symbol: "TOKYO",
                    supply: 1248577
                }
            }
        ]
    })

    console.log(response)

    // Output
    /*
        {
            hash: '0x3492b59462fc7b8b9ec83296c6e04f314d0c93beb1cb2bfd267874b8e17c702c',
            wait: [Function: bound waitForInteraction] AsyncFunction,
            result: [Function: bound processResult] AsyncFunction
        }
    */

    // Example 2
    const response = await signer.sendInteraction({
        fuel_price: 1,
        fuel_limit: 200,
        ix_operations: [
            {
                type: OpType.ASSET_CREATE,
                payload: {
                    standard: AssetStandard.MAS0,
                    symbol: "NOVA",
                    supply: 1248577
                }
            },
            {
                type: OpType.ASSET_MINT,
                payload: {
                    asset_id: "0x00000000b9a9d618867bec092db71c06c368a6d7f78dc01cf36f86a35991fee11303c3d9",
                    amount: 50000
                }
            },
        ]
    })

    console.log(response)

    // Output
    /*
        {
            hash: '0xcade1ded604767e847a4a116b014a09c01347742de330869cf108d5f1fe2733a',
            wait: [Function: bound waitForInteraction] AsyncFunction,
            result: [Function: bound processResult] AsyncFunction
        }
    */

.. autofunction:: Signer#verify

.. code-block:: javascript

    // Example
    const message = Buffer.from("Hello, MOI", "utf-8");
    const signature = "0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402"
    const publicKey = Buffer.from(wallet.publicKey(), 'hex')
    const isVerified = signer.verify(message, signature, publicKey)
    console.log(isVerified)

    >> true

Key Management & Wallets
~~~~~~~~~~~~~~~~~~~~~~~~

BIP39
-----

The `BIP39 <https://en.bitcoin.it/wiki/BIP_0039>`_ module provides utility 
functions for working with mnemonic phrases, entropy, and seed generation. It 
includes methods for converting mnemonic phrases to seeds synchronously and 
asynchronously, converting mnemonic phrases to their corresponding entropy 
values and vice versa, generating mnemonic phrases with specified strengths, 
and validating the correctness of mnemonic phrases.

    Functions
    =========

    .. autofunction:: bip39.mnemonicToSeed

    .. code-block:: javascript

        // Example
        const mnemonic = 'hollow appear story text start mask salt social child space aspect hurdle';
        const password = 'password';
        const seed = await mnemonicToSeed(mnemonic, password);
        console.log(seed)

        >> Buffer

    .. autofunction:: bip39.mnemonicToSeedSync

    .. code-block:: javascript

        // Example
        const mnemonic = 'hollow appear story text start mask salt social child space aspect hurdle';
        const password = 'password';
        const seed = mnemonicToSeedSync(mnemonic, password);
        console.log(seed)

        >> Buffer

    .. autofunction:: bip39.mnemonicToEntropy

    .. code-block:: javascript

        // Example
        const mnemonic = 'hollow appear story text start mask salt social child space aspect hurdle';
        const entropy = mnemonicToEntropy(mnemonic);
        console.log(entropy)

        >> 6ce1535a6fdd4b10efae6f27fa0835b7

    .. autofunction:: bip39.entropyToMnemonic

    .. code-block:: javascript

        // Example
        const entropy = 'c1f651a1fb62bebf8db1ecacf66a6a3d';
        const mnemonic = entropyToMnemonic(entropy);
        console.log(mnemonic)

        >> sea raw half walnut cloud garlic cycle diesel provide rebuild once key

    .. autofunction:: bip39.generateMnemonic

    .. code-block:: javascript

        // Example
        const mnemonic = generateMnemonic();
        console.log(mnemonic)

        >> gaze hole neither spring effort fringe kit neck girl lamp smart afraid

    .. autofunction:: bip39.validateMnemonic

    .. code-block:: javascript

        // Example
        const mnemonic = 'invalid mnemonic';
        const isValid = validateMnemonic(mnemonic);
        console.log(isValid)

        >> false

    .. autofunction:: bip39.getDefaultWordlist

    .. code-block:: javascript

        // Example
        const language = getDefaultWordlist();
        console.log(language)

        >> english

Hierarchical Deterministic Node
-------------------------------

The HDNode class in js-moi-sdk represents a Hierarchical Deterministic (HD) Node 
used for cryptographic key generation and derivation. It follows the `BIP-32 
<https://en.bitcoin.it/wiki/BIP_0032>`_ standard and allows the creation of 
hierarchical deterministic wallets. With HDNode, developers can generate and 
derive child keys, create private and public keys, derive MOI account addresses, 
and serialize/deserialize HDNode instances. It simplifies the management of 
multiple addresses and keys within a single wallet, enhancing security and 
organization.

    HDNode
    ~~~~~~
    A class representing a Hierarchical Deterministic (HD) Node used in cryptographic key generation and derivation.

    Methods
    ~~~~~~~

    .. autofunction:: HDNode.fromSeed

    .. code-block:: javascript

        // Example
        const mnemonic = "behind wish visual father ...";
        const seed = await mnemonicToSeed(mnemonic);
        const hdNode = HDNode.fromSeed(seed);
        console.log(hdNode)

        >> HDNode

    .. autofunction:: HDNode.fromExtendedKey

    .. code-block:: javascript

        // Example
        const hdNode = HDNode.fromExtendedKey(...);
        console.log(hdNode)

        >> HDNode

    .. autofunction:: HDNode#derivePath

    .. code-block:: javascript

        // Example
        const hdNode = HDNode.fromSeed(...);
        const childHDNode = hdNode.derivePath("m/44'/7567'/0'/0/1");
        console.log(childHDNode)

        >> HDNode

    .. autofunction:: HDNode#deriveChild

    .. code-block:: javascript

        // Example
        const hdNode = HDNode.fromSeed(...);
        const childHDNode = hdNode.deriveChild(1);
        console.log(childHDNode)

        >> HDNode

    .. autofunction:: HDNode#publicKey

    .. code-block:: javascript

        // Example
        const hdNode = HDNode.fromSeed(...);
        const publicKey = hdNode.publicKey();
        console.log(publicKey)

        >> Buffer

    .. autofunction:: HDNode#privateKey

    .. code-block:: javascript

        // Example
        const hdNode = HDNode.fromSeed(...);
        const privateKey = hdNode.privateKey();
        console.log(privateKey)

        >> Buffer

Hierarchical Deterministic Wallet
---------------------------------

The Wallet module extends the functionality of the Signer class, enhancing the 
management and interaction with MOI accounts. By extending the signer class, the 
wallet module inherits and adds additional features that simplify the process 
of handling cryptographic signing operations. Moreover, the wallet module 
supports Hierarchical Deterministic (HD) wallets, allowing users to generate 
master seeds, derive child keys, and organize multiple accounts within a single 
wallet. With the extended functionality of the signer class in the wallet 
module, users can seamlessly manage tasks such as checking nonce, sending 
interactions, and interacting with logic objects, providing a streamlined 
experience for MOI applications.

Types
^^^^^
**Keystore**

The ``Keystore`` interface represents a keystore object. It has the following properties:

* ``cipher`` - ``string``: The cipher used for encryption.
* ``ciphertext`` - ``string``: The encrypted ciphertext.
* ``cipherparams`` - ``object``: Parameters for the cipher, containing the following property:
 
  - ``IV`` - ``string``: The initialization vector used for encryption.

* ``kdf`` - ``string``: The key derivation function used.
* ``kdfparams`` - ``object``: Parameters for the key derivation function, containing the following properties:
  
  - ``dklen`` - ``number``: The length of the derived key.

  - ``n`` - ``number``: The iteration count.

  - ``p`` - ``number``: The parallelization factor.

  - ``r`` - ``number``: The block size.

  - ``salt`` - ``string``: The salt value.

* ``mac`` - ``string``: The message authentication code.

Wallet
^^^^^^

    A class representing a Hierarchical Deterministic Wallet that can sign interactions and manage accounts.

    .. code-block:: javascript

        // Example
        const mnemonic = "hollow appear story text start mask salt social child ...";

        const wallet = await Wallet.fromMnemonic(mnemonic);


    Creating Instances
    ======================

    - Create a wallet instance from private key

        .. code-block:: javascript

            const privateKey = "0x...";

            const wallet = new Wallet(privateKey, CURVE.SECP256K1);
    
    -  Create a wallet instance from a mnemonic

        .. code-block:: javascript

            const mnemonic = "hollow appear story text start mask salt social child ...";

            const wallet = await Wallet.fromMnemonic(mnemonic);

    - Create a wallet instance from JSON keystore

        .. code-block:: javascript

            const keystore = `{
                "cipher": "aes-128-ctr",
                "ciphertext": "...",
                "cipherparams": {
                    "IV": "..."
                },
                "kdf": "scrypt",
                "kdfparams": {
                    "n": 4096,
                    "r": 8,
                    "p": 1,
                    "dklen": 32,
                    "salt": "..."
                },
                "mac": "..."
            }`;
            const password = "YOUR_PASSWORD_HERE";

            const wallet = await Wallet.fromKeystore(keystore, password);

    - Create a wallet instance from a random mnemonic

        .. code-block:: javascript

            const wallet = await Wallet.createRandom();

    Properties
    ==========

    - ``address`` - ``readonly`` ``string`` : The address of the wallet.

    .. code-block:: javascript

        console.log(wallet.address);
        >> "0x87925..."

    - ``publicKey`` - ``readonly`` ``string``: The public key of the wallet.

    .. code-block:: javascript

        console.log(wallet.publicKey);
        >> "038792..."

    - ``privateKey`` - ``readonly`` ``string``: The private key of the wallet. 

    .. code-block:: javascript

        console.log(wallet.privateKey);
        >> "0x87925..."

    - ``mnemonic`` - ``readonly`` ``string``: The mnemonic of the wallet.

    .. code-block:: javascript

        console.log(wallet.mnemonic);
        >> "hollow appear story text start mask salt social child ..."

    - ``curve`` - ``readonly`` ``string``: The curve of the wallet.

    .. code-block:: javascript

        console.log(wallet.curve);
        >> "secp256k1"


    Methods
    ========

    .. autofunction:: Wallet#sign


    **Example**

    .. code-block:: javascript

        const message = "Hello, MOI";
        const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

        const signature = wallet.sign(Buffer.from(message), algo);
        >>"0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee..."

    .. autofunction:: Wallet#signInteraction

    .. code-block:: javascript

        const address = "0x870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b";
        const interaction = {
            nonce: 0,
            sender: address,
            fuel_price: 1,
            fuel_limit: 200,
            ix_operations: [
                {
                    type: OpType.ASSET_CREATE,
                    payload: {
                        standard: AssetStandard.MAS0,
                        symbol: "SIG",
                        supply: 1248577
                    }
                }
            ]
        }
        const sigAlgo = wallet.signingAlgorithms["ecdsa_secp256k1"];
        const signedIxn = wallet.signInteraction(interaction, sigAlgo);
        console.log(signedIxn)
        
        // Output
        /*
            {
                ix_args:'0e9f0203131696049608900c900c930ca30cb60c03870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c80e7f063363636161604d4f49130d41',
                signature: '01463044022059e8e9839a02d2a0b2585e2267400826f91e575eb27cb89485d2deab697c5a34022020d71b2d3caa8c0b003849a2cb4effdbfd32028357db335549a75c82dd329f8902'
            }
        */

    .. autofunction:: Wallet#generateKeystore

    .. autofunction:: Wallet.fromMnemonic

    .. autofunction:: Wallet.fromMnemonicSync

    .. autofunction:: Wallet.fromKeystore

    .. autofunction:: Wallet.createRandom

    .. autofunction:: Wallet.createRandomSync

Identifier
----------

Identifiers are unique values used to reference and interact with different
types of accounts on the MOI network. Every account—whether it represents a
participant, asset, or logic—is uniquely identified and addressable using its
corresponding identifier.

Participant ID
^^^^^^^^^^^^^^

A Participant ID uniquely identifies a participant account on the MOI network.
It represents an externally owned account (EOA) that can hold assets, initiate
interactions, pay fuel costs, and sign messages or interactions using a signer.

Participant IDs are typically derived from public keys and are controlled by
private keys managed through wallets and signers.

**Example**

.. code-block:: text

   0x000000001ec28dabfc3e4ac4dfc2084b45785b5e9cf1287b63a4f46900000000

Asset ID
^^^^^^^^

An Asset ID uniquely identifies an asset account in the MOI network. Each asset
exists as its own account with independent state and logic defined by the MOI
protocol.

Asset IDs are used to reference assets during operations such as creation,
transfer, minting, and burning, and to query balances held by participant
accounts.

**Example**

.. code-block:: text

   0x108000004cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000

Logic ID
^^^^^^^^

A Logic ID uniquely identifies a logic account deployed on the MOI network.
Logic accounts store executable programs along with their state and exposed
routines.

Logic IDs are used when invoking logic methods, querying logic state, or
interacting with decentralized applications built on MOI.

**Example**

.. code-block:: text

   0x1003ffffb9b7c1b6a7c13ba64db5c93c5135f2ba3cfc70ec7575a52f00000000

Account Keys
^^^^^^^^^^^^

Account keys are cryptographic keys associated with MOI accounts and are used to
establish ownership, authorization, and identity. These keys enable secure
signing of interactions and messages and ensure that only authorized entities
can mutate account state.

In the js-moi-sdk, account keys are typically derived and managed using wallets
and exposed through signers, abstracting low-level cryptographic operations from
application developers.
