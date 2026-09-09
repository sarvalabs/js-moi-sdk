# Signer

> Sign MOI interactions and messages with js-moi-sdk: the Signer API, HD wallets and keypairs, and cryptographic proof of account authority on MOI.

Signer
******

The Signer class serves as a base class for various signer
implementations and defines the common interface for signing
interactions and messages.

Being an abstract class, the Signer class cannot be instantiated
directly but serves as a blueprint for derived classes that provide
concrete implementations. These derived classes include Wallet, and
others. Each derived class represents a different way of signing
interactions or messages.

The Signer class defines methods such as "sign", "signInteractions",
"connect" and "getAddress", which derived classes must implement.
These methods handle the signing process and address retrieval. By
adhering to the Signer class's interface, derived classes ensure
compatibility and consistency when working with different types of
signers.


Types
=====

**SigningAlgorithms**

The "SigningAlgorithms" interface represents signing algorithms for
cryptographic operations. It has the following property:

* "ecdsa_secp256k1" - "ECDSA_S256": The ECDSA with secp256k1 signing
  algorithm.


Abstract Methods
================

**getAddress**

This method is used to retrieve the moi account address associated
with the signer. Concrete classes that inherit from Signer must
implement this method to provide the functionality of retrieving the
address.

**connect**

This method is responsible for creating a new instance of the signer
with a different provider. It allows switching the underlying provider
while keeping the same signer configuration. Concrete classes need to
implement this method to enable the functionality of connecting the
signer to a different provider.

**sign**

This method is responsible for signing arbitrary messages using the
MOI signing scheme. It accepts a "keyId" parameter to specify which
registered key should be used for signing. Concrete classes need to
implement this method to enable the functionality of signing messages.

**signInteraction**

This method is used to sign MOI interactions. Concrete classes must
implement this method to provide the logic for signing the
interactions. When a wallet has multiple keys registered, all keys
contribute signatures to satisfy multisig threshold requirements.


Regular Methods
===============

getProvider()

   Retrieves the connected provider instance.

   Throws:
      **Error** -- if the provider is not initialized.

   Returns:
      The connected provider instance.

   // Example
   const provider = signer.getProvider();

getNonce(options)

   Retrieves the nonce (interaction count) for the signer's address
   from the provider.

   Arguments:
      * **options** (**Options**) -- The options for retrieving the
        nonce. (optional)

   Throws:
      **Error** -- if there is an error retrieving the nonce or the
      provider is not initialized.

   Returns:
      **Promise.<(number|bigint)>** -- A Promise that resolves to the
      nonce as a number or bigint.

   // Example
   const nonce = await signer.getNonce();
   console.log(nonce)

   >> 5

Signer.sendInteraction(ixObject)

   Sends an interaction object by signing it with the appropriate
   signature algorithm and forwarding it to the connected provider.

   Arguments:
      * **ixObject** (**InteractionObject**) -- The interaction object
        to send.

   Throws:
      **Error** -- if there is an error sending the interaction, if
      the provider is not initialized, or if the interaction object
      fails the validity checks.

   Returns:
      **Promise.<InteractionResponse>** -- A Promise that resolves to
      the interaction response.

   // Example 1
   const response = await signer.sendInteraction({
       fuel_price: 1,
       fuel_limit: 200,
       ix_operations: [
           {
               type: OpType.ASSET_CREATE,
               payload: {
                   standard: AssetStandard.MAS0,
                   symbol: "TOKYO",
                   supply: 1248577
               }
           }
       ]
   })

   console.log(response)

   // Output
   /*
       {
           hash: '0x3492b59462fc7b8b9ec83296c6e04f314d0c93beb1cb2bfd267874b8e17c702c',
           wait: [Function: bound waitForInteraction] AsyncFunction,
           result: [Function: bound processResult] AsyncFunction
       }
   */

   // Example 2
   const response = await signer.sendInteraction({
       fuel_price: 1,
       fuel_limit: 200,
       ix_operations: [
           {
               type: OpType.ASSET_CREATE,
               payload: {
                   standard: AssetStandard.MAS0,
                   symbol: "NOVA",
                   supply: 1248577
               }
           },
           {
               type: OpType.ASSET_MINT,
               payload: {
                   asset_id: "0x00000000b9a9d618867bec092db71c06c368a6d7f78dc01cf36f86a35991fee11303c3d9",
                   amount: 50000
               }
           },
       ]
   })

   console.log(response)

   // Output
   /*
       {
           hash: '0xcade1ded604767e847a4a116b014a09c01347742de330869cf108d5f1fe2733a',
           wait: [Function: bound waitForInteraction] AsyncFunction,
           result: [Function: bound processResult] AsyncFunction
       }
   */

Signer.verify(message, signature, publicKey)

   Verifies the authenticity of a signature by performing signature
   verification using the provided parameters.

   Arguments:
      * **message** (**Uint8Array**) -- The message that was signed.

      * **signature** (**string|Uint8Array**) -- The signature to
        verify, as a string or Buffer.

      * **publicKey** (**string|Uint8Array**) -- The public key used
        for verification, as a string or Buffer.

   Throws:
      **Error** -- if the signature is invalid or the signature byte
      is not recognized.

   Returns:
      **boolean** -- A boolean indicating whether the signature is
      valid or not.

   // Example
   const message = Buffer.from("Hello, MOI", "utf-8");
   const signature = "0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402"
   const publicKey = Buffer.from(wallet.publicKey(), 'hex')
   const isVerified = signer.verify(message, signature, publicKey)
   console.log(isVerified)

   >> true


Key Management & Wallets
========================


BIP39
-----

The BIP39 module provides utility functions for working with mnemonic
phrases, entropy, and seed generation. It includes methods for
converting mnemonic phrases to seeds synchronously and asynchronously,
converting mnemonic phrases to their corresponding entropy values and
vice versa, generating mnemonic phrases with specified strengths, and
validating the correctness of mnemonic phrases.

   bip39.mnemonicToSeed(mnemonic, password)

      Asynchronously convert a mnemonic to a seed.

      Arguments:
         * **mnemonic** (**string**) -- The mnemonic phrase.

         * **password** (**string**) -- The optional password.

      Throws:
         **Error** -- If an error occurs during the conversion.

      Returns:
         **Promise.<Buffer>** -- The generated seed.

      // Example
      const mnemonic = 'hollow appear story text start mask salt social child space aspect hurdle';
      const password = 'password';
      const seed = await mnemonicToSeed(mnemonic, password);
      console.log(seed)

      >> Buffer

   bip39.mnemonicToSeedSync(mnemonic, password)

      Synchronously convert a mnemonic to a seed.

      Arguments:
         * **mnemonic** (**string**) -- The mnemonic phrase.

         * **password** (**string**) -- The optional password.

      Returns:
         **Buffer** -- The generated seed.

      // Example
      const mnemonic = 'hollow appear story text start mask salt social child space aspect hurdle';
      const password = 'password';
      const seed = mnemonicToSeedSync(mnemonic, password);
      console.log(seed)

      >> Buffer

   bip39.mnemonicToEntropy(mnemonic, wordlist)

      Convert a mnemonic to its corresponding entropy value.

      Arguments:
         * **mnemonic** (**string**) -- The mnemonic phrase.

         * **wordlist** (**Array.<string>**) -- The optional wordlist.

      Throws:
         **Error** -- If the mnemonic is invalid or a wordlist is
         required but not found.

      Returns:
         **string** -- The corresponding entropy.

      // Example
      const mnemonic = 'hollow appear story text start mask salt social child space aspect hurdle';
      const entropy = mnemonicToEntropy(mnemonic);
      console.log(entropy)

      >> 6ce1535a6fdd4b10efae6f27fa0835b7

   bip39.entropyToMnemonic(entropy, wordlist)

      Convert entropy to its corresponding mnemonic.

      Arguments:
         * **entropy** (**Buffer|string**) -- The entropy value or
           buffer.

         * **wordlist** (**Array.<string>**) -- The optional wordlist.

      Throws:
         **Error** -- If the entropy is invalid or a wordlist is
         required but not found.

      Returns:
         **string** -- The corresponding mnemonic phrase.

      // Example
      const entropy = 'c1f651a1fb62bebf8db1ecacf66a6a3d';
      const mnemonic = entropyToMnemonic(entropy);
      console.log(mnemonic)

      >> sea raw half walnut cloud garlic cycle diesel provide rebuild once key

   bip39.generateMnemonic(strength, rng, wordlist)

      Generate a mnemonic phrase with the specified strength (in
      bits).

      Arguments:
         * **strength** (**number**) -- The strength of the mnemonic
           in bits.

         * **rng** (**function**) -- The random number generator
           function.

         * **wordlist** (**Array.<string>**) -- The optional wordlist.

      Throws:
         **TypeError** -- If the strength is not divisible by 32.

      Returns:
         **string** -- The generated mnemonic phrase.

      // Example
      const mnemonic = generateMnemonic();
      console.log(mnemonic)

      >> gaze hole neither spring effort fringe kit neck girl lamp smart afraid

   bip39.validateMnemonic(mnemonic, wordlist)

      Validate a mnemonic phrase.

      Arguments:
         * **mnemonic** (**string**) -- The mnemonic phrase to
           validate.

         * **wordlist** (**Array.<string>**) -- The optional wordlist.

      Returns:
         **boolean** -- True if the mnemonic is valid, false
         otherwise.

      // Example
      const mnemonic = 'invalid mnemonic';
      const isValid = validateMnemonic(mnemonic);
      console.log(isValid)

      >> false

   bip39.getDefaultWordlist()

      Get the currently set default wordlist.

      Throws:
         **Error** -- If the default wordlist is not set.

      Returns:
         **string** -- The language code of the default wordlist.

      // Example
      const language = getDefaultWordlist();
      console.log(language)

      >> english


Hierarchical Deterministic Node
-------------------------------

The HDNode class in js-moi-sdk represents a Hierarchical Deterministic
(HD) Node used for cryptographic key generation and derivation. It
follows the BIP-32 standard and allows the creation of hierarchical
deterministic wallets. With HDNode, developers can generate and derive
child keys, create private and public keys, derive MOI account
addresses, and serialize/deserialize HDNode instances. It simplifies
the management of multiple addresses and keys within a single wallet,
enhancing security and organization.

   A class representing a Hierarchical Deterministic (HD) Node used in
   cryptographic key generation and derivation.

   static HDNode.fromSeed(seed)

      Generates an HDNode from a seed buffer.

      Arguments:
         * **seed** (**Buffer**) -- The seed buffer.

      Throws:
         **Error** -- If an error occurs during the HDNode generation.

      // Example
      const mnemonic = "behind wish visual father ...";
      const seed = await mnemonicToSeed(mnemonic);
      const hdNode = HDNode.fromSeed(seed);
      console.log(hdNode)

      >> HDNode

   static HDNode.fromExtendedKey(extendedKey)

      Generates an HDNode from an extended key.

      Arguments:
         * **extendedKey** (**string**) -- The extended key.

      Throws:
         **Error** -- If an error occurs during the HDNode generation.

      // Example
      const hdNode = HDNode.fromExtendedKey(...);
      console.log(hdNode)

      >> HDNode

   HDNode.derivePath(path)

      Derives a child HDNode from the current HDNode using the
      specified path.

      Arguments:
         * **path** (**string**) -- The derivation path for the child
           HDNode.

      Throws:
         **Error** -- If the HDNode is not initialized.

      Returns:
         **HDNode** -- The derived child HDNode.

      // Example
      const hdNode = HDNode.fromSeed(...);
      const childHDNode = hdNode.derivePath("m/44'/7567'/0'/0/1");
      console.log(childHDNode)

      >> HDNode

   HDNode.deriveChild(index)

      Derives a child HDNode from the current HDNode using the
      specified index.

      Arguments:
         * **index** (**number**) -- The child index.

      Throws:
         **Error** -- If the HDNode is not initialized.

      Returns:
         **HDNode** -- The derived child HDNode.

      // Example
      const hdNode = HDNode.fromSeed(...);
      const childHDNode = hdNode.deriveChild(1);
      console.log(childHDNode)

      >> HDNode

   HDNode.publicKey()

      Retrieves the public key associated with the HDNode.

      Throws:
         **Error** -- If the HDNode is not initialized.

      Returns:
         **Buffer** -- The public key.

      // Example
      const hdNode = HDNode.fromSeed(...);
      const publicKey = hdNode.publicKey();
      console.log(publicKey)

      >> Buffer

   HDNode.privateKey()

      Retrieves the private key associated with the HDNode.

      Throws:
         **Error** -- If the HDNode is not initialized or private key
         is not available.

      Returns:
         **Buffer** -- The private key.

      // Example
      const hdNode = HDNode.fromSeed(...);
      const privateKey = hdNode.privateKey();
      console.log(privateKey)

      >> Buffer


Hierarchical Deterministic Wallet
---------------------------------

The Wallet module extends the functionality of the Signer class,
enhancing the management and interaction with MOI accounts. By
extending the signer class, the wallet module inherits and adds
additional features that simplify the process of handling
cryptographic signing operations. Moreover, the wallet module supports
Hierarchical Deterministic (HD) wallets, allowing users to generate
master seeds, derive child keys, and organize multiple accounts within
a single wallet. With the extended functionality of the signer class
in the wallet module, users can seamlessly manage tasks such as
checking nonce, sending interactions, and interacting with logic
objects, providing a streamlined experience for MOI applications.


Types
~~~~~

**Keystore**

The "Keystore" interface represents a keystore object. It has the
following properties:

* "cipher" - "string": The cipher used for encryption.

* "ciphertext" - "string": The encrypted ciphertext.

* "cipherparams" - "object": Parameters for the cipher, containing the
  following property:

  * "IV" - "string": The initialization vector used for encryption.

* "kdf" - "string": The key derivation function used.

* "kdfparams" - "object": Parameters for the key derivation function,
  containing the following properties:

  * "dklen" - "number": The length of the derived key.

  * "n" - "number": The iteration count.

  * "p" - "number": The parallelization factor.

  * "r" - "number": The block size.

  * "salt" - "string": The salt value.

* "mac" - "string": The message authentication code.


Wallet
~~~~~~

   A class representing a Hierarchical Deterministic Wallet that can
   sign interactions and manage accounts.

   A wallet is always initialized for a specific account. Additional
   keys belonging to the same account can be registered via "addKey".
   All registered keys contribute signatures when "signInteraction" is
   called, enabling multisig interactions.

      // Example
      const mnemonic = "hollow appear story text start mask salt social child ...";

      const wallet = await Wallet.fromMnemonic(mnemonic);

   * Create a wallet instance from private key

           const privateKey = "0x...";

           const wallet = new Wallet(privateKey, CURVE.SECP256K1);

   * Create a wallet instance from a mnemonic

           const mnemonic = "hollow appear story text start mask salt social child ...";

           const wallet = await Wallet.fromMnemonic(mnemonic);

   * Create a wallet instance from JSON keystore

           const keystore = `{
               "cipher": "aes-128-ctr",
               "ciphertext": "...",
               "cipherparams": {
                   "IV": "..."
               },
               "kdf": "scrypt",
               "kdfparams": {
                   "n": 4096,
                   "r": 8,
                   "p": 1,
                   "dklen": 32,
                   "salt": "..."
               },
               "mac": "..."
           }`;
           const password = "YOUR_PASSWORD_HERE";

           const wallet = await Wallet.fromKeystore(keystore, password);

   * Create a wallet instance from a random mnemonic

           const wallet = await Wallet.createRandom();

   * "address" - "readonly" "string" : The address of the wallet.

      console.log(wallet.address);
      >> "0x87925..."

   * "publicKey" - "readonly" "string": The public key of the sender
     key (key at "key_index").

      console.log(wallet.publicKey);
      >> "038792..."

   * "privateKey" - "readonly" "string": The private key of the sender
     key (key at "key_index").

      console.log(wallet.privateKey);
      >> "0x87925..."

   * "mnemonic" - "readonly" "string": The mnemonic of the wallet.

      console.log(wallet.mnemonic);
      >> "hollow appear story text start mask salt social child ..."

   * "curve" - "readonly" "string": The curve of the wallet.

      console.log(wallet.curve);
      >> "secp256k1"

   Wallet.sign(message, sigAlgo)

      Signs a message using the sender key's private key and the
      specified signature algorithm.

      Arguments:
         * **message** (**Uint8Array**) -- The message to sign as a
           Uint8Array.

         * **sigAlgo** (**SigType**) -- The signature algorithm to
           use.

      Throws:
         **Error** -- if the signature type is unsupported or
         undefined, or if there is an error during signing.

      Returns:
         **string** -- The signature as a string.

   Signs a message using the specified key. The "keyId" must be
   registered on the wallet via "addKey".

   **Example**

      const message = "Hello, MOI";
      const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];
      const keyId = await wallet.getKeyId();

      const signature = await wallet.sign(Buffer.from(message), keyId, algo);
      >>"0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee..."

   Wallet.signInteraction(ixObject)

      Signs an interaction object using all registered keys on this
      wallet. Each key produces its own signature entry, enabling
      multisig interactions. The interaction object is serialized into
      POLO bytes before signing.

      Arguments:
         * **ixObject** (**InteractionObject**) -- The interaction
           object to sign.

      Throws:
         **Error** -- if there is an error during signing or
         serialization.

      Returns:
         **InteractionRequest** -- The signed interaction request
         containing the serialized interaction object and all
         signatures.

   Signs an interaction using all registered keys. Each key produces
   its own signature entry in the response. The sender key
   ("key_index") must be registered or an error is thrown before
   signing.

      const address = "0x870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b";
      const interaction = {
          sender: { id: address, key_id: 0, sequence: 0 },
          fuel_price: 1,
          fuel_limit: 200,
          ix_operations: [
              {
                  type: OpType.ASSET_CREATE,
                  payload: {
                      standard: AssetStandard.MAS0,
                      symbol: "SIG",
                      supply: 1248577
                  }
              }
          ]
      }
      const sigAlgo = wallet.signingAlgorithms["ecdsa_secp256k1"];
      const signedIxn = await wallet.signInteraction(interaction, sigAlgo);
      console.log(signedIxn)

      // Output
      /*
          {
              ix_args: '0e9f02...',
              signatures: '...'   // POLO-encoded array, one entry per registered key
          }
      */

   Wallet.addKey(keyId, publicKey, privateKey)

      Adds a key to the wallet. All keys registered on this wallet
      belong to the same participant and will each contribute a
      signature when *signInteraction* is called, satisfying multisig
      threshold requirements.

      Arguments:
         * **keyId** (**number**) -- The key's position in the
           participant's key list.

         * **publicKey** (**string**) -- The public key as a hex
           string.

         * **privateKey** (**string**) -- The private key as a hex
           string.

      Returns:
         **Wallet** -- The current wallet instance for chaining.

   Registers an additional key for this participant. All registered
   keys will sign the interaction when "signInteraction" is called.

      // Single key (default)
      const wallet = await Wallet.fromMnemonic(mnemonic);

      // Add more keys for multisig
      wallet.addKey(1, pubKey1, privKey1)
            .addKey(2, pubKey2, privKey2);

   Wallet.setKeyId(keyId)

      Updates the sender key. The key must already be registered via
      *addKey*. The sender key is used as *sender.key_id* in
      interactions and must always be present in the signatures.

      Arguments:
         * **keyId** (**number**) -- The key ID to set as the sender
           key.

      Throws:
         **Error** -- if the key is not registered on this wallet.

   Updates which key is the sender key. The key must already be
   registered via "addKey".

      wallet.addKey(1, pubKey1, privKey1);
      wallet.setKeyId(1); // interactions will now use key 1 as sender

   Wallet.getKeys()

      Returns the list of keys currently registered on this wallet.

      Returns:
   Returns the list of key IDs currently registered on the wallet.

      wallet.addKey(1, pubKey1, privKey1).addKey(2, pubKey2, privKey2);
      console.log(wallet.getKeys());
      >> [0, 1, 2]

   Wallet.removeKey(keyId)

      Removes a key from the wallet.

      Arguments:
         * **keyId** (**number**) -- The key ID to remove.

      Throws:
         **Error** -- if attempting to remove the sender key
         (*key_index*), as it is required for signing.

      Returns:
         **Wallet** -- The current wallet instance for chaining.

   Removes a key from the wallet. Throws if the key is the current
   sender key.

      wallet.removeKey(2); // removes key 2

      // To remove the sender key, switch to another key first
      wallet.setKeyId(1);
      wallet.removeKey(0);

   static Wallet.fromMnemonic(mnemonic, path, wordlist)

      Initializes the wallet from a provided mnemonic.

      Arguments:
         * **mnemonic** (**string**) -- The mnemonic to initialize the
           wallet with.

         * **path** (**string|undefined**) -- The derivation path to
           use for key generation. (optional)

         * **wordlist** (**Array.<string>|undefined**) -- The wordlist
           to use for mnemonic generation. (optional)

      Throws:
         **Error** -- if there is an error during initialization.

      Returns:
         **Promise.<Wallet>** -- a promise that resolves to a *Wallet*
         instance.

      Example:

         // Initializing a wallet from mnemonic
         const mnemonic = "hollow appear story text start mask salt social child ..."
         const wallet = await Wallet.fromMnemonic(mnemonic);

      Example:

         // Initializing a wallet from mnemonic with custom path
         const mnemonic = "hollow appear story text start mask salt social child ...";
         const path = "m/44'/60'/0'/0/0";
         const wallet = await Wallet.fromMnemonic(mnemonic, path);

   static Wallet.fromMnemonicSync(mnemonic, path, wordlist)

      Initializes the wallet from a provided mnemonic synchronously.

      Arguments:
         * **mnemonic** (**string**) -- The mnemonic to initialize the
           wallet with.

         * **path** (**string|undefined**) -- The derivation path to
           use for key generation. (optional)

         * **wordlist** (**Array.<string>|undefined**) -- The wordlist
           to use for mnemonic generation. (optional)

      Throws:
         **Error** -- if there is an error during initialization.

      Returns:
         **Promise.<Wallet>** -- a promise that resolves to a *Wallet*
         instance.

      Example:

         // Initializing a wallet from mnemonic
         const mnemonic = "hollow appear story text start mask salt social child ..."
         const wallet = Wallet.fromMnemonicSync();

      Example:

         // Initializing a wallet from mnemonic with custom path
         const mnemonic = "hollow appear story text start mask salt social child ...";
         const path = "m/44'/60'/0'/0/0";
         const wallet = Wallet.fromMnemonicSync(mnemonic, path);

   static Wallet.createRandom()

      Generates a random mnemonic and initializes the wallet from it.

      Throws:
         **Error** -- if there is an error generating the random
         mnemonic.

      Returns:
         **Promise.<Wallet>** -- a promise that resolves to a *Wallet*
         instance.

   static Wallet.createRandomSync()

      Generates a random mnemonic and initializes the wallet from it.

      Throws:
         **Error** -- if there is an error generating the random
         mnemonic.

      Returns:
         **Wallet** -- a instance of *Wallet*.


Identifier
----------

Identifiers are unique values used to reference and interact with
different types of accounts on the MOI network. Every account—whether
it represents a participant, asset, or logic—is uniquely identified
and addressable using its corresponding identifier.


Participant ID
~~~~~~~~~~~~~~

A Participant ID uniquely identifies a participant account on the MOI
network. It represents an externally owned account (EOA) that can hold
assets, initiate interactions, pay fuel costs, and sign messages or
interactions using a signer.

Participant IDs are typically derived from public keys and are
controlled by private keys managed through wallets and signers.

**Example**

   0x000000001ec28dabfc3e4ac4dfc2084b45785b5e9cf1287b63a4f46900000000


Asset ID
~~~~~~~~

An Asset ID uniquely identifies an asset account in the MOI network.
Each asset exists as its own account with independent state and logic
defined by the MOI protocol.

Asset IDs are used to reference assets during operations such as
creation, transfer, minting, and burning, and to query balances held
by participant accounts.

**Example**

   0x108000004cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000


Logic ID
~~~~~~~~

A Logic ID uniquely identifies a logic account deployed on the MOI
network. Logic accounts store executable programs along with their
state and exposed routines.

Logic IDs are used when invoking logic methods, querying logic state,
or interacting with decentralized applications built on MOI.

**Example**

   0x1003ffffb9b7c1b6a7c13ba64db5c93c5135f2ba3cfc70ec7575a52f00000000


Account Keys
~~~~~~~~~~~~

Account keys are cryptographic keys associated with MOI accounts and
are used to establish ownership, authorization, and identity. These
keys enable secure signing of interactions and messages and ensure
that only authorized entities can mutate account state.

In the js-moi-sdk, account keys are typically derived and managed
using wallets and exposed through signers, abstracting low-level
cryptographic operations from application developers.
