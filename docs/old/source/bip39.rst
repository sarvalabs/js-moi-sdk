=====
BIP39
=====

--------------------------------------------------------------------------------

The `BIP39 <https://en.bitcoin.it/wiki/BIP_0039>`_ module provides utility 
functions for working with mnemonic phrases, entropy, and seed generation. It 
includes methods for converting mnemonic phrases to seeds synchronously and 
asynchronously, converting mnemonic phrases to their corresponding entropy 
values and vice versa, generating mnemonic phrases with specified strengths, 
and validating the correctness of mnemonic phrases.

Functions
---------

.. autofunction:: mnemonicToSeed

.. code-block:: javascript

    import { mnemonicToSeed } from "js-moi-sdk";

    const mnemonic =
        "hollow appear story text start mask salt social child space aspect hurdle";
    const password = "password";
    const seed = await mnemonicToSeed(mnemonic, password);

    console.log(seed);

    >> Uint8Array(64) [ 36, 250, 169, ... ]


.. autofunction:: bip39.mnemonicToSeedSync

.. code-block:: javascript

    // Example
    const mnemonic = 'hollow appear story text start mask salt social child space aspect hurdle';
    const password = 'password';
    const seed = mnemonicToSeedSync(mnemonic, password);
    console.log(seed)

    >> Buffer

.. autofunction:: bip39.mnemonicToEntropy

.. code-block:: javascript

    // Example
    const mnemonic = 'hollow appear story text start mask salt social child space aspect hurdle';
    const entropy = mnemonicToEntropy(mnemonic);
    console.log(entropy)

    >> 6ce1535a6fdd4b10efae6f27fa0835b7

.. autofunction:: bip39.entropyToMnemonic

.. code-block:: javascript

    // Example
    const entropy = 'c1f651a1fb62bebf8db1ecacf66a6a3d';
    const mnemonic = entropyToMnemonic(entropy);
    console.log(mnemonic)

    >> sea raw half walnut cloud garlic cycle diesel provide rebuild once key

.. autofunction:: bip39.generateMnemonic

.. code-block:: javascript

    // Example
    const mnemonic = generateMnemonic();
    console.log(mnemonic)

    >> gaze hole neither spring effort fringe kit neck girl lamp smart afraid

.. autofunction:: bip39.validateMnemonic

.. code-block:: javascript

    // Example
    const mnemonic = 'invalid mnemonic';
    const isValid = validateMnemonic(mnemonic);
    console.log(isValid)

    >> false

.. autofunction:: bip39.getDefaultWordlist

.. code-block:: javascript

    // Example
    const language = getDefaultWordlist();
    console.log(language)

    >> english
