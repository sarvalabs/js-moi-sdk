Logic
=====

The logic module in js-moi-sdk is a powerful component that simplifies the 
interaction with MOI logic objects. It provides a user-friendly interface 
for deploying, interacting with, and querying logic objects on the MOI network.

With the logic module, the logic manifests can be easily deployed using logic 
factory. This includes the ability to encode and deploy logics with builder 
arguments.

Once deployed, the module handles routine calls, interaction sending, and 
state queries, abstracting away complexities like parameter encoding, fuel and 
interaction signing.

Integration with the wallet and signer modules ensures secure interaction 
signing and authorization. Users can choose from different signers, such as 
wallet-based signers, or custom signers.

Usage
-----

Classes
-------

.. autoclass:: LogicDriver
    :members:

.. autoclass:: LogicDescriptor
    :members:

Functions
---------

.. autofunction:: getLogicDriver