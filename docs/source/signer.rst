======
Signer
======

--------------------------------------------------------------------------------

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

.. autofunction:: getNonce

.. autofunction:: Signer#sendInteraction

.. autofunction:: Signer#verify
