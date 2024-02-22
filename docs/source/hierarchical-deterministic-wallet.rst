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
    const mnemonic = "hollow appear story text start mask salt social child ...";

    const wallet = await Wallet.fromMnemonic(mnemonic);


Creating Instances
======================

- Create a wallet instance from private key

    .. code-block:: javascript

        const privateKey = "0x...";

        const wallet = new Wallet(Buffer.from(privateKey, "hex"), CURVE.SECP256K1);
  
-  Create a wallet instance from a mnemonic

    .. code-block:: javascript

        const mnemonic = "hollow appear story text start mask salt social child ...";

        const wallet = await Wallet.fromMnemonic(mnemonic);

- Create a wallet instance from JSON keystore

    .. code-block:: javascript

        const keystore = { ... };
        const password = "YOUR_PASSWORD_HERE";

        const wallet = await Wallet.fromKeystore(keystore, password);

- Create a wallet instance from a random mnemonic

    .. code-block:: javascript

        const wallet = await Wallet.createRandom();

Properties
======================

- ``address`` - ``readonly`` ``string`` : The address of the wallet. 

- ``publicKey`` - ``readonly`` ``string``: The public key of the wallet. 

- ``privateKey`` - ``readonly`` ``string``: The private key of the wallet. 

- ``mnemonic`` - ``readonly`` ``string``: The mnemonic of the wallet. 

- ``curve`` - ``readonly`` ``string``: The curve of the wallet. 


Methods
======================

.. autofunction:: Wallet#sign


**Example**

.. code-block:: javascript

  const message = "Hello, MOI";
  const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

  const signature = wallet.sign(Buffer.from(message), algo);

.. autofunction:: Wallet#signInteraction

.. autofunction:: Wallet#generateKeystore

Static Methods
======================

.. autofunction:: Wallet.fromMnemonic

.. autofunction:: Wallet.fromMnemonicSync

.. autofunction:: Wallet.fromKeystore

.. autofunction:: Wallet.createRandom

.. autofunction:: Wallet.createRandomSync