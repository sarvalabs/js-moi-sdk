============================
Application Binary Interface
============================

--------------------------------------------------------------------------------

The abi module enables the encoding and decoding of data according to the 
MOI ABI specification. This specification defines the structure of data and 
routine signatures within logic object, allowing for seamless interaction 
with their properties and routines.

Through the abi module, developers can encode data in compliance with the 
expected format specified by the ABI. This is particularly valuable when 
preparing data for invoking routines on logic object. By correctly encoding 
routine parameters according to the logic's ABI, developers can generate accurate 
input data that aligns with the logic objects's expectations.

In addition, the abi module facilitates the decoding of data received from the 
blockchain or logic objects. Users can decode routine call results, and 
other ABI-encoded data structures, enabling them to extract meaningful 
information. This capability greatly aids in the efficient processing and 
interpretation of data obtained from the MOI network.

ABICoder
--------

ABICoder is a class that provides encoding and decoding functionality for ABI 
(Application Binary Interface). It allows encoding manifests or ABI and 
arguments, as well as decoding output, exceptions and logic states based on 
both predefined and runtime schema.

.. code-block:: javascript

    // Example
    const abi = { ... }
    const elements = new Map();
    const classDefs = new Map();

    abi.elements.forEach(element => {
        elements.set(element.ptr, element);

        if(element.kind === "class") {
            classDefs.set(element.data.name, element.ptr);
        }
    })

    const abiCoder = new ABICoder(elements, classDefs);

Methods
~~~~~~~

.. autofunction:: encodeABI

.. code-block:: javascript

    // Example
    const abi = { ... }
    const encodedABI = ABICoder.encodeABI(abi)
    console.log(encodedABI)

    >> 0x0e4f065 ... 50000

.. autofunction:: encodeArguments

.. code-block:: javascript

    // Example
    const abi = { ... }
    const routine = abi.elements.find(element => 
        // Seeder! is the name of a routine which is available in the abi
        element.data.name === "Seeder!"
    )

    const fields = routine.data.accepts ? routine.data.accepts : [];

    const args = [
        "MOI-Token", 
        "MOI", 
        100000000, 
        "ffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34"
    ];

    const calldata = abiCoder.encodeArguments(fields, args);

    console.log(calldata)

    >> 0x0def01 ... d4f49

.. autofunction:: decodeOutput

.. code-block:: javascript

    // Example
    const abi = { ... }
    const routine = abi.elements.find(element => 
        // BalanceOf is the name of a routine which is available in the abi
        element.data.name === "BalanceOf"
    )

    const output = "0x0e1f0305f5e100";

    const fields = routine.data.returns ? routine.data.returns : [];

    const decodedOutput = abiCoder.decodeOutput(output, fields);

    console.log(decodedOutput);

    >> { balance: 100000000 }

.. autofunction:: decodeException

.. code-block:: javascript

    // Example
    const error= "0x0e4f0666ae03737472696e67536f6d657468696e672077656e742077726f6e673f06b60166756e6374696f6e31282966756e6374696f6e322829";

    const exception = ABICoder.decodeException(error);

    console.log(exception)

    >> { class: 'string', data: 'Something went wrong', trace: [ 'function1()', 'function2()' ] }

.. autofunction:: decodeState

.. code-block:: javascript

    // Example


Schema
------

Schema is a class that provides schema parsing functionality for encoding and
decoding manifest, arguments, logic states and other data based on 
a predefined schema. It supports parsing fields and generating a schema for 
decoding purposes.

.. code-block:: javascript

    // Example
    const abi = { ... }
    const elements = new Map();
    const classDefs = new Map();

    abi.elements.forEach(element => {
        elements.set(element.ptr, element);

        if(element.kind === "class") {
            classDefs.set(element.data.name, element.ptr);
        }
    })

    const schema = new Schema(elements, classDefs);

Methods
~~~~~~~

.. autofunction:: parseFields

.. code-block:: javascript

    // Example
    const abi = { ... }
    const routine = abi.elements.find(element => 
        // BalanceOf is the name of a routine which is available in the abi
        element.data.name === "BalanceOf"
    )
    const fields = routine.data.accepts ? routine.data.accepts : [];
    const routineSchema = schema.parseFields()
    
    console.log(routineSchema)

    >> { kind: "struct", fields: { addr: { kind: "bytes" } } }
