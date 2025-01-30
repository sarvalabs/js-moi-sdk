JS-MOI-HDNODE
=============

The ``HDNode`` class in js-moi-sdk represents a Hierarchical Deterministic (HD) Node 
used for cryptographic key generation and derivation. It follows the `BIP-32 
<https://en.bitcoin.it/wiki/BIP_0032>`_ standard and allows the creation of 
hierarchical deterministic wallets. With HDNode, developers can generate and 
derive child keys, create private and public keys, derive MOI account addresses, 
and serialize/deserialize HDNode instances. It simplifies the management of 
multiple addresses and keys within a single wallet, enhancing security and 
organization.

Installation
------------

This package is already included in the ``js-moi-sdk`` package, if you want to install
`js-moi-hdnode <https://www.npmjs.com/package/js-moi-hdnode>`_ package separately,
you can install it using the following command:

**Using npm**

.. code-block:: bash

    npm install js-moi-hdnode

**Using yarn**

.. code-block:: bash

    yarn add js-moi-hdnode

**Using pnpm**

.. code-block:: bash

    pnpm add js-moi-hdnode

HDNode
------
A class representing a Hierarchical Deterministic (HD) Node used in cryptographic key generation and derivation.

Methods
~~~~~~~

.. autofunction:: HDNode.fromSeed

.. code-block:: javascript

    import { HDNode, hexToBytes, mnemonicToEntropy } from "js-moi-sdk";

    const mnemonic =
        "hollow appear ... hurdle";
    const seed = mnemonicToEntropy(mnemonic);
    const hdNode = HDNode.fromSeed(hexToBytes(seed));

    console.log(hdNode);

    >> HDNode

.. autofunction:: HDNode.fromExtendedKey

.. code-block:: javascript

    import { HDNode } from "js-moi-sdk";

    const hdNode = HDNode.fromExtendedKey("...");

    console.log(hdNode);

    >> HDNode

.. autofunction:: HDNode#derivePath

.. code-block:: javascript

    import { HDNode, hexToBytes, mnemonicToEntropy } from "js-moi-sdk";

    const mnemonic = "hollow appear ... hurdle";
    const seed = mnemonicToEntropy(mnemonic);
    const hdNode = HDNode.fromSeed(hexToBytes(seed));
    const hdPath = "m/44'/6174'/0'/0/0";
    const childHdNode = hdNode.derivePath(hdPath);

    console.log(childHdNode);

    >> HDNode

.. autofunction:: HDNode#deriveChild

.. code-block:: javascript

    import { HDNode, hexToBytes, mnemonicToEntropy } from "js-moi-sdk";

    const mnemonic = "hollow appear ... hurdle";
    const seed = mnemonicToEntropy(mnemonic);
    const hdNode = HDNode.fromSeed(hexToBytes(seed));
    const childHdNode = hdNode.deriveChild(1);

    console.log(childHdNode);

    >> HDNode

.. autofunction:: HDNode#publicKey

.. code-block:: javascript

    import { HDNode, hexToBytes, mnemonicToEntropy } from "js-moi-sdk";

    const mnemonic = "hollow appear ... hurdle";
    const seed = mnemonicToEntropy(mnemonic);
    const hdNode = HDNode.fromSeed(hexToBytes(seed));
    const pubKey = hdNode.publicKey();

    console.log(pubKey);

    >> Uint8Array(33) [ 3, 166, 96, ... , 183 ]


.. autofunction:: HDNode#privateKey

.. code-block:: javascript

    import { HDNode, hexToBytes, mnemonicToEntropy } from "js-moi-sdk";

    const mnemonic = "hollow appear ... hurdle";
    const seed = mnemonicToEntropy(mnemonic);
    const hdNode = HDNode.fromSeed(hexToBytes(seed));
    const pKey = hdNode.publicKey();

    console.log(pKey);

    >> Uint8Array(32) [ 138, 147, 200, ..., 196 ]

.. autofunction:: HDNode#getExtendedPublicKey

.. code-block:: javascript

    import { HDNode, hexToBytes, mnemonicToEntropy } from "js-moi-sdk";

    const mnemonic = "hollow appear ... hurdle";
    const seed = mnemonicToEntropy(mnemonic);
    const hdNode = HDNode.fromSeed(hexToBytes(seed));
    const extPubKey = hdNode.getExtendedPublicKey();

    console.log(extPubKey);

    >> "xpub6D5J1Q..."

.. autofunction:: HDNode#getExtendedPrivateKey

.. code-block:: javascript

    import { HDNode, hexToBytes, mnemonicToEntropy } from "js-moi-sdk";

    const mnemonic = "hollow appear ... hurdle";
    const seed = mnemonicToEntropy(mnemonic);
    const hdNode = HDNode.fromSeed(hexToBytes(seed));
    const extPrivKey = hdNode.getExtendedPrivateKey();

    console.log(extPrivKey);

    >> "xprv9s21ZrQH143K2..."