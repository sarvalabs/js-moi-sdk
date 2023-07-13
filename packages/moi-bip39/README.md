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


# moi-bip39

This is a sub-package of [moi.js](https://github.com/sarvalabs/moi.js).

The **moi-bip39** package provides functionality for generating and managing mnemonic phrases according to the BIP39 standard. The BIP39 standard defines a method for generating a mnemonic phrase, which is a human-readable set of words that can be used to derive deterministic cryptographic keys. By using moi-bip39, you can generate and manage these mnemonic phrases, which can then be used with other packages.

## Installation
Install the latest [release](https://github.com/sarvalabs/moi.js/releases) using the following command.

```sh
npm install moi-bip39
```

## Usage

```javascript
    import { generateMnemonic } from "moi-bip39";

    const mnemonic = generateMnemonic()
    console.log(mnemonic)

    // Output
    /*
        hollow appear story text start mask salt social child ...
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
