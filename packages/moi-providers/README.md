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


# moi-providers

This is a sub-package of [moi.js](https://github.com/sarvalabs/moi.js).

The **moi-providers** package enables you to connect to MOI nodes and retrieve blockchain data, such as account balances and interaction history. It provides an interface for interacting with the MOI protocol and fetching information from the network.

## Installation
Install the latest [release](https://github.com/sarvalabs/moi.js/releases) using the following command.

```sh
npm install moi-providers
```

## Usage

```javascript
    import { JsonRpcProvider } from "moi-providers";

    const address = "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b"
    const contextInfo = provider.getContextInfo(address)
    console.log(contextInfo)

    // Output
    /*
        {
            "behaviour_nodes": [
                "3Wywv4WykAqs6mH1YAWNHKYFw77tuF4iFkcQPxyFgzT9XEPPEkaK.16Uiu2HAkzhT4eoJoQWz9P7S65j6F6dSHEVGN925AXg5kqhisgSai",
                "3Wy3MY7saXna1ypZMYVooUPD9k3hU7vWXQvTRFdpabmSC7pr8om9.16Uiu2HAm3hy8wAw9hjuxXqGGmnpQQrU7ouZWwJuDAQJbesvg49hX"
            ],
            "random_nodes": [],
            "storage_nodes": []
        }
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
