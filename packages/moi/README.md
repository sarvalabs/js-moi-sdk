![image](https://moi-polo.s3.amazonaws.com/banner.png)

[latestrelease]: https://github.com/sarvalabs/moi.js/releases/latest
[issueslink]: https://github.com/sarvalabs/moi.js/issues
[pullslink]: https://github.com/sarvalabs/moi.js/pulls
[pkgdocs]: https://docs.moi.technology/docs/build/packages/moi.js

[![docs](https://img.shields.io/badge/npm-documentation-red?style=for-the-badge)][pkgdocs]
[![npm version](https://img.shields.io/npm/v/moi.js.svg?style=for-the-badge)](https://npmjs.com/moi.js)
![license](https://img.shields.io/badge/license-MIT%2FApache--2.0-informational?style=for-the-badge)

[![latest tag](https://img.shields.io/github/v/tag/sarvalabs/moi.js?color=blue&label=latest%20tag&sort=semver&style=for-the-badge)][latestrelease]
[![issue count](https://img.shields.io/github/issues/sarvalabs/moi.js?style=for-the-badge&color=yellow)][issueslink]
[![pulls count](https://img.shields.io/github/issues-pr/sarvalabs/moi.js?style=for-the-badge&color=brightgreen)][pullslink]
![ci status](https://img.shields.io/github/actions/workflow/status/sarvalabs/moi.js/ci.yml?label=ci&style=for-the-badge)


# moi.js

**moi.js** is a Javascript/Typescript implementation of a feature-rich library designed to seamlessly interact with the MOI Protocol and its extensive ecosystem. It provides a convenient interface for interacting with the MOI protocol, allowing developers to create, sign, and send interactions, retrieve account balances, access interaction history, and more.

## Installation
Install the latest [release](https://github.com/sarvalabs/moi.js/releases) using the following command.

```sh
npm install moi.js
```

## Usage

```javascript
    import { JsonRpcProvider } from "moi.js";

    const provider = new JsonRpcProvider("http://localhost:1600");
    const address  = "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b";
    const tesseract = provider.getTesseract(address, true);
    console.log(tesseract)

    // Output:
    /*
        {
            "header": {
                "address": "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b",
                "prev_hash": "0x034e75e7d8b2910004e70d6d45157166e87fb1d47485248edf8919108179307e",
                "height": "0x1",
                "fuel_used": "0x64",
                "fuel_limit": "0x3e8",
                ...
            },
            "body": {
                "state_hash": "0x82543da922babd1c32b4856edd44a4bf5881edc3714cfe90b6d1576e00164aee",
                "context_hash": "0xa1058908a4db1594632be49790b24211cd4920a0f27b3d2b876808f910b3e320",
                "interaction_hash": "0x8aab5bc0817393d2ea163482c13ccc0f8f3e01cef0c889b8b3cffb51e4d76894",
                "receipt_hash": "0x3e35a1f481df15da518ef6821f7b6f340f74f4f9c3f3eb30b15944ffea144f75",
                ...
            },
            "ixns": [
                {
                    "type": 3,
                    "nonce": "0x0",
                    "sender": "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b",
                    "receiver": "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "payer": "0x0000000000000000000000000000000000000000000000000000000000000000",
                    ...
                    "hash": "0x7750a0f1c848e05f1e52204e464af0d9d2f06470117e9187bb3643216c4c4ee9"
                }
            ],
            "seal": "0x0460afdac7733765afa6410e58ebe0d69d484dfe021fba989438c51c69c078d6677446f179176681f005c0d755979bf81c090e02fdf8544bc618463e86c2778b7764b90c813f58a5965a47c5572bcf5784743e4c6c425e4bfa0f18b043e9aff21183",
            "hash": "0xd343a7336df38590b47e5b20cb65940f463c358a08cded7af7cd6cde63a5575f"
        }
    */
```

## Sub Packages

The **moi.js** package consists of several sub-packages, each offering independent functionality that can be utilized separately to enhance your development experience. 

- [moi-constants](https://github.com/sarvalabs/moi.js/tree/docs/main/packages/moi-constants) This package includes common constants used within the moi.js ecosystem. These constants provide predefined values for various aspects of MOI, making it easier to work with the protocol.

- [moi-providers](https://github.com/sarvalabs/moi.js/tree/docs/main/packages/moi-providers) This package enables you to connect to MOI nodes and retrieve blockchain data, such as account balances and interaction history. It provides an interface for interacting with the MOI protocol and fetching information from the network.

- [moi-signer](https://github.com/sarvalabs/moi.js/tree/docs/main/packages/moi-signer) This package represents an MOI account with the ability to sign interactions and messages for cryptographic proof. It provides the necessary tools to sign interactions securely and authenticate interactions on the MOI network.

- [moi-bip39](https://github.com/sarvalabs/moi.js/tree/docs/main/packages/moi-bip39) Provides functionality for connecting to moi nodes and retrieving blockchain data.

- [moi-hdnode](https://github.com/sarvalabs/moi.js/tree/docs/main/packages/moi-hdnode) This package represents a Hierarchical Deterministic (HD) Node for cryptographic key generation and derivation. It allows you to generate and manage keys within a hierarchical structure, providing enhanced security and flexibility.

- [moi-wallet](https://github.com/sarvalabs/moi.js/tree/docs/main/packages/moi-wallet) This package represents a Hierarchical Deterministic Wallet capable of signing interactions and managing accounts. It provides a convenient interface for managing multiple accounts, generating keys, and securely signing interactions.

- [moi-manifest](https://github.com/sarvalabs/moi.js/tree/docs/main/packages/moi-manifest) This package encodes and decodes data according to the MOI Manifest specification, facilitating interaction with logic objects. It simplifies the process of encoding and decoding data structures, making it easier to work with MOI logic objects.

- [moi-logic](https://github.com/sarvalabs/moi.js/tree/docs/main/packages/moi-logic) This package simplifies interaction with MOI logic objects by offering deployment, interaction, and querying capabilities. It provides a higher-level interface for working with MOI logic, allowing you to deploy logic objects, send interactions, and retrieve results.

- [moi-utils](https://github.com/sarvalabs/moi.js/tree/docs/main/packages/moi-utils) This package offers a comprehensive set of tools and functions to enhance development with MOI. It provides utility functions that simplify common tasks, making your development experience smoother and more efficient.

## Contributing
Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as below, without any additional terms or conditions.

## License
&copy; 2023 Sarva Labs Inc. & MOI Protocol Developers.

This project is licensed under either of
- [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0) ([`LICENSE-APACHE`](LICENSE-APACHE))
- [MIT license](https://opensource.org/licenses/MIT) ([`LICENSE-MIT`](LICENSE-MIT))

at your option.

The [SPDX](https://spdx.dev) license identifier for this project is `MIT OR Apache-2.0`.
