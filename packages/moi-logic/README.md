![image](https://moi-js.s3.amazonaws.com/moi-banner.png)

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
![test status](https://img.shields.io/github/actions/workflow/status/sarvalabs/moi.js/test.yml?label=test&style=for-the-badge)


# moi-wallet

This is a sub-package of [moi.js](https://github.com/sarvalabs/moi.js).

The **moi-wallet** package represents a Hierarchical Deterministic Wallet capable of signing interactions and managing accounts. It provides a convenient interface for managing multiple accounts, generating keys, and securely signing interactions.

## Installation
Install the latest [release](https://github.com/sarvalabs/moi.js/releases) using the following command.

```sh
npm install moi-wallet
```

## Usage

```javascript
    import { Wallet } from "moi-wallet";
    import { getLogicDriver } from "moi-logic";

    const initWallet = async () => {
        const mnemonic = "mother clarify push liquid ordinary social track ...";
        const provider = new JsonRpcProvider("http://localhost:1600/");
        const wallet = new Wallet(provider);
        await wallet.fromMnemonic(mnemonic);
    }

    (async () => {
        const logicId = "0x0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a";
        const wallet = await initWallet();
        const logicDriver = await getLogicDriver(logicId, wallet);
        const name = await logicDriver.persistentState.get("name");
        console.log(name)
    })()

    // Output
    /*
        TOKYO
    */
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
