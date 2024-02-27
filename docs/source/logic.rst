=====
Logic
=====

--------------------------------------------------------------------------------

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

Types
-----
**LogicIxRequest**

The ``LogicIxRequest`` interface represents a request to deploy or execute a logic. It has the following properties:

* ``call`` - ``function``: A function that facilitates the execution of an logic interaction request, while maintaining the integrity of the current state. It returns a promise that resolves to an ``InteractionCallResponse``.
* ``send`` - ``function``: A function that sends the logic interaction request and returns a promise that resolves to an ``InteractionResponse``.
* ``estimateFuel`` - ``function``: A function that estimates the fuel required for the interaction request and returns a promise.

**Routine**

The ``Routine`` interface represents a routine function. It has the following properties:

* A function that can be called with an optional array of arguments and returns a value.
* ``isMutable`` - ``function``: A function that returns a boolean indicating whether the routine is mutable.
* ``accepts`` - ``function``: A function that returns an array of ``TypeField`` representing the types of arguments accepted by the routine, or ``null`` if no arguments are accepted.
* ``returns`` - ``function``: A function that returns an array of ``TypeField`` representing the types of values returned by the routine, or ``null`` if no values are returned.

**Routines**

The ``Routines`` interface represents a collection of routines. It is an object with named properties where the property name is the routine name and the property value is a ``Routine``.

**CallSite**

The ``CallSite`` interface represents a callsite. It has the following properties:

* ``ptr`` - ``number``: The pointer to the callsite.
* ``kind`` - ``string``: The kind of the callsite.

**MethodDef**

The ``MethodDef`` interface represents a method definition. It has the following properties:

* ``ptr`` - ``number``: The pointer to the method.
* ``class`` - ``string``: The name of the class.

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

.. code-block:: javascript

    // Example
    const initWallet = async () => {
        const mnemonic = "mother clarify push liquid ordinary social track ...";
        const provider = new JsonRpcProvider("http://localhost:1600/");
        const wallet = new Wallet(provider);
        await wallet.fromMnemonic(mnemonic);
        return wallet;
    }

    const manifest = { ... }
    const wallet = await initWallet(manifest);
    const logicFactory = new LogicFactory(manifest, wallet);

Methods
~~~~~~~

.. autofunction:: LogicFactory#getEncodedManifest

.. code-block:: javascript

    const encodedManifest = logicFactory.getEncodedManifest();
    console.log(encodedManifest);

    >> 0x56b34f...

.. autofunction:: LogicFactory#deploy

.. code-block:: javascript

    import { LogicFactory } from "js-moi-sdk";
    import { wallet } from "./wallet";

    const factory = new LogicFactory(manifest, wallet);
    
    const symbol = "MOI";
    const supply = 1000000;
    
    const ix = await factory.deploy("Seed!", symbol, supply);
    const result = await ix.result();

    console.log(result.logic_id); // 0x0800007d70c34ed6e...

If you wish to externally pass `fuelLimit` or `fuelPrice`, pass the options as
the last argument in the deploy call.

.. code-block:: javascript

    import { LogicFactory } from "js-moi-sdk";
    import { wallet } from "./wallet";

    const factory = new LogicFactory(manifest, wallet);
    
    const symbol = "MOI";
    const supply = 1000000;
    const option = {
        fuelPrice: 1,
        fuelLimit: 6420,
    }
    
    const ix = await factory.deploy("Seed!", symbol, supply, option);
    const result = await ix.result();

    console.log(result.logic_id); // 0x010000423d3233...

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

.. code-block:: javascript

    // Example
    const initWallet = async () => {
        const mnemonic = "mother clarify push liquid ordinary social track ...";
        const provider = new JsonRpcProvider("http://localhost:1600/");
        const wallet = new Wallet(provider);
        await wallet.fromMnemonic(mnemonic);
        return wallet;
    }

    const logicId = "0x0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a";
    const wallet = await initWallet();
    const logicDriver = await getLogicDriver(logicId, wallet);

.. warning::
    When the logic driver is initialized with a provider,
    any attempt to execute a mutating routine will trigger the SDK to
    raise an exception. The error message associated with this exception
    will state: **"Mutating routine calls require a signer to be initialized"**.
    Developers should ensure they should pass signer instance while
    doing mutating routine calls to avoid encountering this exception.


Usage
~~~~~

**Example 1**: Calling a routine using the logic driver

.. code-block:: javascript

    import { getLogicDriver } from "js-moi-sdk";
    import { wallet } from "./wallet";

    const logicId = "0x0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a";
    const address = "0x996ab2197faa069202f83d7993f174e7a3635f3278d3745d6a9fe89d75b854df";

    // Get logic driver
    const logic = await getLogicDriver(logicId, wallet);

    // Call the logic routine
    const { balance } = await logic.routines.BalanceOf(address);

    console.log(balance); // 1000000

**Example 2**: Retrieving from the persistent state of a logic

.. code-block:: javascript

    import { getLogicDriver } from "js-moi-sdk";
    import { wallet } from "./wallet";

    const logicId = "0x0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a";
    const address = "0x996ab2197faa069202f83d7993f174e7a3635f3278d3745d6a9fe89d75b854df";

    // Get logic driver
    const logic = await getLogicDriver(logicId, wallet);

    // Get the persistent state
    const symbol = await logic.persistentState.get("symbol");

    console.log(symbol); // MOI

**Example 3**: Executing a mutating routine call

.. code-block:: javascript

    import { getLogicDriver } from "js-moi-sdk";
    import { wallet } from "./wallet";

    const logicId = "0x0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a";
    const address = "0x996ab2197faa069202f83d7993f174e7a3635f3278d3745d6a9fe89d75b854df";

    // Get logic driver
    const logic = await getLogicDriver(logicId, wallet);

    // Execute a mutating routine call
    const ix = await logic.routines.Transfer(address, 1000);
    console.log(ix.hash); //  0x010000423d3233...

    const receipt = await ix.wait();
    console.log(receipt); // { ... }

    // if you want to view the result of the logic interaction
    // you can use the result() method

    // for example
    // const result = await ix.result(); // { ... }


If you wish to externally pass `fuelLimit` or `fuelPrice`, pass the options as
the last argument in the deploy call.

.. code-block:: javascript

    import { getLogicDriver } from "js-moi-sdk";
    import { wallet } from "./wallet";

    const logicId = "0x0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a";
    const address = "0x996ab2197faa069202f83d7993f174e7a3635f3278d3745d6a9fe89d75b854df";

    // Get logic driver
    const logic = await getLogicDriver(logicId, wallet);

    // Execute a mutating routine call
    const option = {
        fuelPrice: 1,
        fuelLimit: 6420,
    }
    const ix = await logic.routines.Transfer(address, 1000, option);
    console.log(ix.hash); //  0x010000423d3233...

    const receipt = await ix.wait();
    console.log(receipt); // { ... }