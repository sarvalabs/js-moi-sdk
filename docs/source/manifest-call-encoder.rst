=====================
Manifest Call Encoder
=====================

--------------------------------------------------------------------------------

The Manifest Call Encoder module enables the encoding and decoding of data 
according to the MOI Manifest specification. This specification defines the 
structure of routines, classes, methods, and state within logic object, allowing 
for seamless interaction with their properties.

Through this module, developers can encode data in compliance with the 
expected format specified by the logic Manifest. This is particularly valuable 
when preparing data for invoking routines on logic object. By correctly encoding 
routine parameters according to the logic Manifest, developers can generate 
accurate input data that aligns with the logic objects's expectations.

In addition, this facilitates the decoding of data received from the blockchain 
or logic objects. Developers can decode routine call results, and other Manifest-encoded 
data structures, enabling them to extract meaningful information. This 
capability greatly aids in the efficient processing and interpretation of data 
obtained from the MOI network.

Types
-----

**LogicManifest**

The ``LogicManifest`` module defines the schema for a logic manifest.

    **EngineConfig**

    The ``EngineConfig`` interface defines the configuration for the logic engine. It has two properties:

    * ``kind`` - ``string``: The type of logic engine.
    * ``flags`` - ``string[]``: A list of flags.

    **TypeField**

    The ``TypeField`` interface defines a field type. It has three properties:

    * ``slot`` - ``number``: The slot number of the field.
    * ``label`` - ``string``: The label or name of the field.
    * ``type`` - ``string``: The type of the field.

    **MethodField**

    The ``MethodField`` interface defines a method field. It has two properties:

    * ``ptr`` - ``number | bigint``: The pointer value of the field.
    * ``code`` - ``number | bigint``: The code value of the field.

    **Class**

    The ``Class`` interface defines a class within the logic manifest. It has three properties:

    * ``name`` - ``string``: The name of the class.
    * ``fields`` - ``TypeField[] | null``: An optional array of fields within the class.
    * ``methods`` - ``MethodField[] | null``: An optional array of methods within the class.

    **State**

    The ``State`` interface defines the state within the logic manifest. It has two properties:

    * ``kind`` - ``string``: The kind or type of the state.
    * ``fields`` - ``TypeField[]``: An array of fields within the state.

    **Constant**

    The ``Constant`` interface defines a constant within the logic manifest. It has two properties:

    * ``type`` - ``string``: The type of the constant.
    * ``value`` - ``string``: The value of the constant.

    **Instructions**

    The ``Instructions`` interface defines the instructions within the logic manifest. It has three optional properties:

    * ``bin`` - ``number[] | null``: An optional array of binary values.
    * ``hex`` - ``string``: A hexadecimal representation of the instructions (optional).
    * ``asm`` - ``string[] | null``: An optional array of assembly instructions.

    **Routine**

    The ``Routine`` interface defines a routine within the logic manifest. It has five properties:

    * ``name`` - ``string``: The name of the routine.
    * ``kind`` - ``string``: The kind or type of the routine.
    * ``accepts`` - ``TypeField[] | null``: An optional array of input fields that the routine accepts.
    * ``returns`` - ``TypeField[] | null``: An optional array of output fields that the routine returns.
    * ``executes`` - ``Instructions``: The instructions executed by the routine.
    * ``catches`` - ``string[] | null``: An optional array of exceptions caught by the routine.

    **Method**

    The ``Method`` interface defines a method within a class in the logic manifest. It has six properties:

    * ``name`` - ``string``: The name of the method.
    * ``class`` - ``string``: The name of the class the method belongs to.
    * ``accepts`` - ``TypeField[] | null``: An optional array of input fields that the method accepts.
    * ``returns`` - ``TypeField[] | null``: An optional array of output fields that the method returns.
    * ``executes`` - ``Instructions``: The instructions executed by the method.
    * ``catches`` - ``string[] | null``: An optional array of exceptions caught by the method.

    **TypeDef**

    The ``TypeDef`` represents a ``string`` type definition.

    **Element**

    The ``Element`` interface represents an element within the logic manifest. It has four properties:

    * ``ptr`` - ``number``: The pointer value of the element.
    * ``kind`` - ``string``: The kind or type of the element.
    * ``deps`` - ``number[] | null``: An optional array of dependencies for the element.
    * ``data`` - ``State | Constant | TypeDef | Routine | Class | Method``: The data associated with the element.

    **Manifest**

    The ``Manifest`` interface represents the overall logic manifest. It has three properties:

    * ``syntax`` - ``string``: The syntax used in the manifest.
    * ``engine`` - ``EngineConfig``: The configuration of the logic engine.
    * ``elements`` - ``Element[]``: An array of elements within the manifest.

**Exception**

The `Exception` interface defines an exception. It has three properties:

* ``class`` - ``string``: The exception class.
* ``data`` - ``string``: The exception message.
* ``trace`` - ``string[]``: The stack trace of the exception.
* ``revert`` - ``boolean``: Represents the interaction revert status.

**PoloSchema**

The `PoloSchema` interface defines a schema used by polo of serialization and 
deserialization. It has two properties:


* ``kind`` - ``string``: The type or kind of the schema.
* ``fields`` - ``Record<string, any>``: The fields within the schema. It is a dictionary-like structure where keys are strings and values are object (optional).

ManifestCoder
-------------

ManifestCoder is a class that provides encoding and decoding functionality for 
Manifest Call Encoder. It allows encoding manifests and arguments, as 
well as decoding output, exceptions and logic states based on both predefined 
and runtime schema.

.. code-block:: javascript

    // Example
    import { ManifestCoder } from "@zenz-solutions/js-moi-sdk";

    const manifest = { ... }
    const manifestCoder = new ManifestCoder(manifest);

Methods
~~~~~~~

.. autofunction:: encodeManifest

.. code-block:: javascript

    // Example
    const encodedManifest = ManifestCoder.encodeManifest(manifest)
    console.log(encodedManifest)

    >> "0x0e4f065...50000"

.. autofunction:: decodeManifest

.. code-block:: javascript

    // Example
    const decodedManifest = ManifestCoder.decodeManifest(encodedManifest, ManifestFormat.JSON);
    console.log(decodedManifest)

    >> { syntax: 1, engine: { kind: "PISA", flags: [] }, elements: [...] }

.. autofunction:: encodeArguments

.. code-block:: javascript

    // Example
    const calldata = manifestCoder.encodeArguments("Seeder", "MOI", 100_000_000);

    console.log(calldata)

    >> "0x0d6f0665...d4f49"

.. autofunction:: decodeArguments

.. autofunction:: decodeOutput

.. code-block:: javascript

    // Example
    const callsite = "BalanceOf";
    const output = "0x0e1f0305f5e100";
    const args = manifestCoder.decodeOutput(callsite, output);

    console.log(decodedOutput);

    >> { balance: 100000000 }

.. autofunction:: decodeException

.. code-block:: javascript

    // Example
    const error = "0x0e6f0666d104de04737472696e67696e73756666696369656e742062616c616e636520666f722073656e6465723f06e60172756e74696d652e726f6f742829726f7574696e652e5472616e736665722829205b3078635d202e2e2e205b307831623a205448524f57203078355d";

    const exception = ManifestCoder.decodeException(error);

    console.log(exception)

    >> {
            class: "string",
            error: "insufficient balance for sender",
            revert: false,
            trace: [
                "runtime.root()", 
                "routine.Transfer() [0xc] ... [0x1b: THROW 0x5]"
            ],
        }

.. autofunction:: decodeEventOutput

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
