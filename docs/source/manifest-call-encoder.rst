=====================
Manifest Call Encoder
=====================

--------------------------------------------------------------------------------

The Manifest Call Encoder module enables the encoding and decoding of data 
according to the MOI Manifest specification. This specification defines the 
structure of data and routine signatures within logic object, allowing for 
seamless interaction with their properties and routines.

Through this module, developers can encode data in compliance with the 
expected format specified by the Manifest. This is particularly valuable when 
preparing data for invoking routines on logic object. By correctly encoding 
routine parameters according to the logic Manifest, developers can generate 
accurate input data that aligns with the logic objects's expectations.

In addition, this facilitates the decoding of data received from the blockchain 
or logic objects. Users can decode routine call results, and other Manifest-encoded 
data structures, enabling them to extract meaningful information. This 
capability greatly aids in the efficient processing and interpretation of data 
obtained from the MOI network.

ManifestCoder
-------------

ManifestCoder is a class that provides encoding and decoding functionality for 
Manifest Call Encoder. It allows encoding manifests and arguments, as 
well as decoding output, exceptions and logic states based on both predefined 
and runtime schema.

.. code-block:: javascript

    // Example
    const manifest = { ... }
    const elements = new Map();
    const classDefs = new Map();

    manifest.elements.forEach(element => {
        elements.set(element.ptr, element);

        if(element.kind === "class") {
            classDefs.set(element.data.name, element.ptr);
        }
    })

    const manifestCoder = new ManifestCoder(elements, classDefs);

Methods
~~~~~~~

.. autofunction:: encodeManifest

.. code-block:: javascript

    // Example
    const encodedManifest = ManifestCoder.encodeManifest(manifest)
    console.log(encodedManifest)

    >> 0x0e4f065 ... 50000

.. autofunction:: encodeArguments

.. code-block:: javascript

    // Example
    const routine = manifest.elements.find(element => 
        // Seeder! is the name of a routine which is available in the manifest
        element.data.name === "Seeder!"
    )

    const fields = routine.data.accepts ? routine.data.accepts : [];

    const args = [
        "MOI-Token", 
        "MOI", 
        100000000, 
        "ffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34"
    ];

    const calldata = manifestCoder.encodeArguments(fields, args);

    console.log(calldata)

    >> 0x0def01 ... d4f49

.. autofunction:: decodeOutput

.. code-block:: javascript

    // Example
    const routine = manifest.elements.find(element => 
        // BalanceOf is the name of a routine which is available in the manifest
        element.data.name === "BalanceOf"
    )

    const output = "0x0e1f0305f5e100";

    const fields = routine.data.returns ? routine.data.returns : [];

    const decodedOutput = manifestCoder.decodeOutput(output, fields);

    console.log(decodedOutput);

    >> { balance: 100000000 }

.. autofunction:: decodeException

.. code-block:: javascript

    // Example
    const error = "0x0e4f0666ae03737472696e67536f6d657468696e672077656e742077726f6e673f06b60166756e6374696f6e31282966756e6374696f6e322829";

    const exception = ManifestCoder.decodeException(error);

    console.log(exception)

    >> { class: 'string', data: 'Something went wrong', trace: [ 'function1()', 'function2()' ] }

.. autofunction:: decodeState

.. code-block:: javascript

    // Example
    const data = "0x064c4f4749432d546f6b656e";

    const state = manifest.elements.find(element =>
        element.kind === "state"
    )

    const output = manifestCoder.decodeState(data, "name", state.data.fields)
    console.log(output)

    >> RIO

Schema
------

Schema is a class that provides schema parsing functionality for encoding and
decoding manifest, arguments, logic states and other data based on a predefined 
schema. It supports parsing fields and generating a schema for decoding 
purposes.

.. code-block:: javascript

    // Example
    const manifest = { ... }
    const elements = new Map();
    const classDefs = new Map();

    manifest.elements.forEach(element => {
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
    const routine = manifest.elements.find(element => 
        // BalanceOf is the name of a routine which is available in the manifest
        element.data.name === "BalanceOf"
    )
    const fields = routine.data.accepts ? routine.data.accepts : [];
    const routineSchema = schema.parseFields(fields)
    
    console.log(routineSchema)

    >> { kind: "struct", fields: { addr: { kind: "bytes" } } }
