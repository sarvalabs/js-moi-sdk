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

    // Example
    const response = await factory.deploy("InitOwner!", "LOG-FAC", "LOG", 100000000, "0xffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34");

    // In-case you want to pass externally fuelLimit or fuelPrice. Pass the deploy options
    // as the last argument in deploy call
    // For example:
    // const response = await factory.deploy("InitOwner!", "LOG-FAC", "LOG", 100000000, "0xffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34", {
    //      fuelPrice: 1,
    //      fuelLimit: 1000,
    // });

    // interaction response
    console.log("--------");
    console.log("Response");
    console.log("--------");
    console.log(response)

    // interaction receipt
    const receipt = await response.wait();
    console.log("-------");
    console.log("Receipt");
    console.log("-------");
    console.log(receipt);

    // interaction result containes the logic id or decoded output/error
    const result = await response.result();
    console.log("-------");
    console.log("Result");
    console.log("-------");
    console.log(result);

    // Output
    /*

        --------
        response
        --------
        {
            hash: '0x778d37c13d3081742837176af9f2b8070c72c4c29e536751e8f846335744de2a',
            wait: [Function: bound waitForInteraction] AsyncFunction,
            result: [Function: bound processResult] AsyncFunction
        }

        -------
        receipt
        -------

        {
            "ix_type": "0x8",
            "ix_hash": "0x778d37c13d3081742837176af9f2b8070c72c4c29e536751e8f846335744de2a",
            "status": 0,
            "fuel_used": "0x2b2",
            "hashes": [
                ...
            ],
            "extra_data": {
                "logic_id": "0x080000e383d6d11848abf0bb741c4bcbbf6c70679442b5d5072d1578b1b6e31c564599",
                "error": "0x"
            },
            "from": "0xd210e094cd2432ef7d488d4310759b6bd81a0cda35a5fcce3dab87c0a841bdba",
            "to": "0xe383d6d11848abf0bb741c4bcbbf6c70679442b5d5072d1578b1b6e31c564599",
            "ix_index": "0x0",
            "parts": [
                ...
            ]
        }

        ------
        result
        ------

        {
            logic_id: "0x080000e383d6d11848abf0bb741c4bcbbf6c70679442b5d5072d1578b1b6e31c564599",
            error: null
        }
    */

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

Usage
~~~~~

.. code-block:: javascript

    const sender = "0x377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084";
    const seeder = "0xffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34"
    const name = await logicDriver.persistentState.get("name")
    console.log('name - ' + name)

    // Invoking a routine
    const response = await logicDriver.routines.GetTodos();

    // If you want to pass externally fuelLimit or fuelPrice. Pass the routine options 
    // as the last argument in routine call
    // For example:
    // const response = await logicDriver.routines.GetTodos({
    //      fuelPrice: 1,
    //      fuelLimit: 1000,
    // });
    */
