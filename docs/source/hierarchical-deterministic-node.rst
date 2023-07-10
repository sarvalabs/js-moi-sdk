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

.. autofunction:: HDNode.fromExtendedKey

.. autofunction:: HDNode#derivePath

.. autofunction:: HDNode#deriveChild

.. autofunction:: HDNode#publicKey

.. autofunction:: HDNode#privateKey
