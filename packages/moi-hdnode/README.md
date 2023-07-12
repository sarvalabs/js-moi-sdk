![image](https://moi-js.s3.amazonaws.com/banner.png)

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


# moi-hdnode

This is a sub-package of [moi.js](https://github.com/sarvalabs/moi.js).

The **moi-hdnode** package represents a Hierarchical Deterministic (HD) Node for cryptographic key generation and derivation. It allows you to generate and manage keys within a hierarchical structure, providing enhanced security and flexibility.

## Installation
Install the latest [release](https://github.com/sarvalabs/moi.js/releases) using the following command.

```sh
npm install moi-hdnode
```

## Usage

```javascript
    import { HDNode } from "moi-hdnode";

    const seed = ...;
    const hdNode = HDNode.fromSeed(seed);
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
