===============================
Hierarchical Deterministic Node
===============================

--------------------------------------------------------------------------------

The HDNode class in moi.js represents a Hierarchical Deterministic (HD) Node 
used for cryptographic key generation and derivation. It follows the BIP-32 
standard and allows the creation of hierarchical deterministic wallets. With 
HDNode, developers can generate and derive child keys, create private and 
public keys, derive MOI account addresses, and serialize/deserialize HDNode 
instances. It simplifies the management of multiple addresses and keys within 
a single wallet, enhancing security and organization.

Methods
-------

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
