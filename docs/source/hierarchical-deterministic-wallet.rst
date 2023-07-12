=================================
Hierarchical Deterministic Wallet
=================================

--------------------------------------------------------------------------------

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
-----
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
------
A class representing a Hierarchical Deterministic Wallet that can sign interactions and manage accounts.

.. code-block:: javascript

    // Example
    const provider = new JsonRpcProvider("http://localhost:1600");
    const wallet = new Wallet(provider);

Methods
~~~~~~~

.. autofunction:: Wallet#load

.. code-block:: javascript

    // Example
    const privateKey = Buffer.from("...")
    wallet.load(privateKey, "secp256k1")

.. autofunction:: Wallet#isInitialized

.. code-block:: javascript

    // Example
    const isInitialized = wallet.isInitialized();
    console.log(isInitialized)

    >> true

.. autofunction:: Wallet#createRandom

.. code-block:: javascript

    // Example
    await wallet.createRandom();

.. autofunction:: Wallet#generateKeystore

.. code-block:: javascript

    // Example
    const keystore = await wallet.generateKeystore("CZ%90$DI");
    console.log(keystore);

    // Output
    /*
        {
            "cipher": "aes-128-ctr",
            "ciphertext": "...",
            "cipherparams": {
                "IV": "..."
            },
            "kdf": "scrypt",
            "kdfparams": {
                ...
            },
            "mac": "..."
        }
    */

.. autofunction:: Wallet#fromMnemonic

.. code-block:: javascript

    // Example
    const mnemonic = "hollow appear story text start mask salt social child ...";
    const path = "m/44'/7567'/0'/0/1";
    await wallet.fromMnemonic(mnemonic, path);

.. autofunction:: Wallet#fromKeystore

.. code-block:: javascript

    // Example
    const keystore = {
        "cipher": "aes-128-ctr",
        "ciphertext": "...",
        "cipherparams": {
            "IV": "..."
        },
        "kdf": "scrypt",
        "kdfparams": {
            ...
        },
        "mac": "..."
    }
    wallet.fromKeystore(keystore, "CZ%90$DI");

.. autofunction:: Wallet#mnemonic

.. code-block:: javascript

    // Example
    const mnemonic = wallet.mnemonic();
    console.log(mnemonic);

    >> hollow appear story text start mask salt social child ...

.. autofunction:: Wallet#privateKey

.. code-block:: javascript

    // Example
    const privateKey = wallet.privateKey();
    console.log(privateKey);

    >> 084384...

.. autofunction:: Wallet#publicKey

.. code-block:: javascript

    // Example
    const publicKey = wallet.publicKey();
    console.log(publicKey);

    >> 038792...

.. autofunction:: Wallet#curve

.. code-block:: javascript

    // Example
    const curve = wallet.curve();
    console.log(curve);

    >> secp256k1

.. autofunction:: Wallet#getAddress

.. code-block:: javascript

    // Example
    const address = wallet.getAddress();
    console.log(address);

    >> 0x87925...

.. autofunction:: Wallet#connect

.. code-block:: javascript

    // Example
    const provider = new VoyageProvider("babylon");
    wallet.connect(provider);

.. autofunction:: Wallet#sign

.. code-block:: javascript

    // Example
    const message = "Hello, MOI";
    const sigAlgo = wallet.signingAlgorithms["ecdsa_secp256k1"];
    const signature = wallet.sign(Buffer.from(message), sigAlgo);
    console.log(signature);

    >> 0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402

.. autofunction:: Wallet#signInteraction

.. code-block:: javascript

    // Example
    const address = "0x870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b";
    const interaction = {
        type: IxType.ASSET_CREATE,
        nonce: 0,
        sender: address,
        fuel_price: 1,
        fuel_limit: 200,
        payload: {
            standard: AssetStandard.MAS0,
            symbol: "SIG",
            supply: 1248577
        }
    }
    const sigAlgo = wallet.signingAlgorithms["ecdsa_secp256k1"];
    const signedIxn = wallet.signInteraction(interaction, sigAlgo);
    console.log(signedIxn)
    
    // Ouptut
    /*
        {
            ix_args:'0e9f0203131696049608900c900c930ca30cb60c03870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c80e7f063363636161604d4f49130d41',
            signature: '01463044022059e8e9839a02d2a0b2585e2267400826f91e575eb27cb89485d2deab697c5a34022020d71b2d3caa8c0b003849a2cb4effdbfd32028357db335549a75c82dd329f8902'
        }
    */
