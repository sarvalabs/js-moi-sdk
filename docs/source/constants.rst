=========
Constants
=========

--------------------------------------------------------------------------------

The constants module contains the following constant variables.

Version
-------
The ``VERSION`` constant represents the version number of the 
js-moi-sdk package.

.. code-block:: javascript

    // Example
    import * as moi from "@zenz-solutions/js-moi-sdk";

    console.log(moi.VERSION)

    >> 0.5.0

MOI Derivation Path
-------------------
The ``MOI_DERIVATION_PATH`` constant is the path used to derive MOI account 
addresses. It specifies the sequence of steps and indices involved in the 
derivation process.

.. code-block:: javascript

    // Example
    import * as moi from "@zenz-solutions/js-moi-sdk";

    console.log(moi.MOI_DERIVATION_PATH)

    >> "m/44'/6174'/0'/0/0"

MOI Derivation Base Path
------------------------
The ``MOI_DERIVATION_BASE_PATH`` constant represents the foundational path for 
generating MOI account addresses. It serves as the initial part of the 
derivation path, with additional indices appended to create unique MOI account 
addresses.

.. code-block:: javascript

    // Example
    import * as moi from "@zenz-solutions/js-moi-sdk";

    console.log(moi.MOI_DERIVATION_BASE_PATH)

    >> "m/44'/6174'/0'/0"
