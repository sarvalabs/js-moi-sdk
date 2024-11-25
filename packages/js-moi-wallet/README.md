![image](https://moi-js.s3.amazonaws.com/moi-banner.png)

[latestrelease]: https://github.com/zenz-solutions/js-moi-sdk/releases/latest
[issueslink]: https://github.com/zenz-solutions/js-moi-sdk/issues
[pullslink]: https://github.com/zenz-solutions/js-moi-sdk/pulls
[pkgdocs]: https://docs.moi.technology/docs/build/packages/js-moi-sdk

[![docs](https://img.shields.io/badge/npm-documentation-red?style=for-the-badge)][pkgdocs]
[![npm version](https://img.shields.io/npm/v/js-moi-sdk.svg?style=for-the-badge)](https://npmjs.com/js-moi-sdk)
![license](https://img.shields.io/badge/license-MIT%2FApache--2.0-informational?style=for-the-badge)

[![latest tag](https://img.shields.io/github/v/tag/sarvalabs/js-moi-sdk?color=blue&label=latest%20tag&sort=semver&style=for-the-badge)][latestrelease]
[![issue count](https://img.shields.io/github/issues/sarvalabs/js-moi-sdk?style=for-the-badge&color=yellow)][issueslink]
[![pulls count](https://img.shields.io/github/issues-pr/sarvalabs/js-moi-sdk?style=for-the-badge&color=brightgreen)][pullslink]
![test status](https://img.shields.io/github/actions/workflow/status/sarvalabs/js-moi-sdk/test.yml?label=test&style=for-the-badge)

# js-moi-wallet

This is a sub-package of [js-moi-sdk](https://github.com/zenz-solutions/js-moi-sdk).

The **js-moi-wallet** package represents a Hierarchical Deterministic Wallet capable of signing interactions and managing accounts. It provides a convenient interface for managing multiple accounts, generating keys, and securely signing interactions.

## Installation

Install the latest [release](https://github.com/zenz-solutions/js-moi-sdk/releases) using the following command.

```sh
npm install js-moi-wallet
```

## Usage

```javascript
    import { Wallet } from "@zenz-solutions/js-moi-wallet";

    const initWallet = async () => {
        const mnemonic = "mother clarify push liquid ordinary social track ...";
        const wallet = await Wallet.fromMnemonic(mnemonic);
        const provider = new JsonRpcProvider("http://localhost:1600/");

        wallet.connect(provider);

        return wallet;
    };

    const wallet = await initWallet();
```

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
