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


# js-moi-constants

This is a sub-package of [js-moi-sdk](https://github.com/zenz-solutions/js-moi-sdk).

The **js-moi-constants** package includes common constants used within the js-moi-sdk ecosystem. These constants provide predefined values for various aspects of MOI, making it easier to work with the protocol.

## Installation
Install the latest [release](https://github.com/zenz-solutions/js-moi-sdk/releases) using the following command.

```sh
npm install js-moi-constants
```

## Usage

```javascript
    import { MOI_DERIVATION_PATH } from "@zenz-solutions/js-moi-constants";

    console.log(MOI_DERIVATION_PATH)

    // Output
    /*
        m/44'/6174'/0'/0/0
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
