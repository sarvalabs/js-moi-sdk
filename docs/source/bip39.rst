JS-MOI-BIP39
============

The `BIP39 <https://en.bitcoin.it/wiki/BIP_0039>`_ module provides utility 
functions for working with mnemonic phrases, entropy, and seed generation. It 
includes methods for converting mnemonic phrases to seeds synchronously and 
asynchronously, converting mnemonic phrases to their corresponding entropy 
values and vice versa, generating mnemonic phrases with specified strengths, 
and validating the correctness of mnemonic phrases.

Installation
============

This package is already included in the ``js-moi-sdk`` package, if you want to install
`js-moi-bip39 <https://www.npmjs.com/package/js-moi-bip39>`_ package separately,
you can install it using the following command:

**Using npm**

.. code-block:: bash

    npm install js-moi-bip39

**Using yarn**

.. code-block:: bash

    yarn add js-moi-bip39

**Using pnpm**

.. code-block:: bash

    pnpm add js-moi-bip39

Functions
---------

.. autofunction:: mnemonicToSeed

.. code-block:: javascript

    import { mnemonicToSeed } from "js-moi-bip39";

    const mnemonic = "hollow appear ... hurdle";
    const password = "password";
    const seed = await mnemonicToSeed(mnemonic, password);

    console.log(seed);

    >> Uint8Array(64) [ 36, 250, 169, ... ]


.. autofunction:: mnemonicToSeedSync

.. code-block:: javascript

.. code-block:: javascript

    import { mnemonicToSeed } from "js-moi-bip39";

    const mnemonic = "hollow appear ... hurdle";
    const password = "password";
    const seed = await mnemonicToSeedSync(mnemonic, password);

    console.log(seed);

    >> Uint8Array(64) [ 36, 250, 169, ... ]

.. autofunction:: mnemonicToEntropy

.. code-block:: javascript

    import { mnemonicToEntropy } from "js-moi-bip39";

    const mnemonic = "hollow appear ... hurdle";
    const entropy = mnemonicToEntropy(mnemonic);

    console.log(entropy);

    >> "6ce1535a6fdd...ae6f27fa0835b7"


.. autofunction:: entropyToMnemonic

.. code-block:: javascript

    import { entropyToMnemonic } from "js-moi-bip39";

    const entropy = "6ce1535a6fdd...ae6f27fa0835b7";
    const mnemonic = entropyToMnemonic(entropy);

    console.log(mnemonic);

    >> "hollow appear ... hurdle"

.. autofunction:: generateMnemonic

.. code-block:: javascript

    import { generateMnemonic } from "js-moi-bip39";

    const mnemonic = generateMnemonic();

    console.log(mnemonic);

    >> "gaze hole ... smart afraid"

.. autofunction:: validateMnemonic

.. code-block:: javascript

    import { generateMnemonic, validateMnemonic } from "js-moi-bip39";

    const mnemonic = generateMnemonic();
    const isValid = validateMnemonic(mnemonic);

    console.log(isValid);

    >> true

.. autofunction:: getDefaultWordlist

.. code-block:: javascript

    import { getDefaultWordlist } from "js-moi-bip39";

    const wordlist = getDefaultWordlist();

    console.log(wordlist);

    >> "english"

