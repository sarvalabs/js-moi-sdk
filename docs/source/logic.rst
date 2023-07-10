=====
Logic
=====

--------------------------------------------------------------------------------

The logic module in moi.js is a powerful component that simplifies the 
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

Element Descriptor
------------------
The ElementDescriptor class represents a descriptor for elements in the 
logic manifest.

.. autofunction:: getStateMatrix

.. autofunction:: getElements

.. autofunction:: getCallsites

.. autofunction:: getClassDefs

.. autofunction:: getMethodDefs

.. autofunction:: getClassMethods

.. autofunction:: getRoutineElement

.. autofunction:: getClassElement

.. autofunction:: getMethodElement

Logic Base
----------
The LogicBase is a abstract class extends the ElementDescriptor class and 
serves as a base class for logic-related operations. It defines common 
properties and abstract methods that subclasses should implement.

.. autofunction:: LogicBase#connect

Logic Descriptor
----------------
The **LogicDescriptor** is a abstract class extends the **LogicBase** class and 
provides information about a logic.

Methods
~~~~~~~

.. autofunction:: LogicDescriptor#getLogicId

.. autofunction:: LogicDescriptor#getEngine

.. autofunction:: LogicDescriptor#getManifest

.. autofunction:: LogicDescriptor#getEncodedManifest

.. autofunction:: LogicDescriptor#isSealed

.. autofunction:: LogicDescriptor#isAssetLogic

.. autofunction:: LogicDescriptor#allowsInteractions

.. autofunction:: LogicDescriptor#isStateful

.. autofunction:: LogicDescriptor#hasPersistentState

.. autofunction:: LogicDescriptor#hasEphemeralState

Logic Factory
-------------
The **LogicFactory** class provides a convenient way to deploy multiple 
instances of logic. This feature simplifies the deployment process, enhances 
code reusability, and supports the scalability and maintenance of decentralized 
applications on the MOI network.

Methods
~~~~~~~

.. autofunction:: LogicFactory#getEncodedManifest

.. autofunction:: LogicFactory#deploy

Logic Driver
------------
The **LogicDriver** enables seamless interaction with MOI Logic by providing a 
user-friendly and intuitive interface. It allows developers to  easily interact 
with deployed logics, execute their routines, and retrieve their states. 
The interface abstracts away the complexities of encoding parameters, decoding 
response and making logic interaction more straightforward.

Variables
~~~~~~~~~
``routines`` - This variable represents the set of routines defined within the 
logic manifest. Developers can easily invoke and execute these routines, which 
encapsulate specific functionalities and operations provided by the logic.

``persistentState`` - The persistent state is accessible via this variable. It 
allows developers to retrieve state of the logic, which persists across 
different invocations and interactions.

``ephemeralState`` - The ephemeral state, accessible via this variable, 
represents the short-term or temporary state of the logic.

Functions
~~~~~~~~~

.. autofunction:: getLogicDriver

