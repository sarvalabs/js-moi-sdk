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

Methods
~~~~~~~

.. autofunction:: Wallet#load

.. autofunction:: Wallet#isInitialized

.. autofunction:: Wallet#createRandom

.. autofunction:: Wallet#generateKeystore

.. autofunction:: Wallet#fromMnemonic

.. autofunction:: Wallet#fromKeystore

.. autofunction:: Wallet#mnemonic

.. autofunction:: Wallet#privateKey

.. autofunction:: Wallet#publicKey

.. autofunction:: Wallet#curve

.. autofunction:: Wallet#getAddress

.. autofunction:: Wallet#connect

.. autofunction:: Wallet#sign

.. autofunction:: Wallet#signInteraction
