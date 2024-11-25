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


# js-moi-providers

This is a sub-package of [js-moi-sdk](https://github.com/zenz-solutions/js-moi-sdk).

The **js-moi-providers** package enables you to connect to MOI nodes and retrieve blockchain data, such as account balances and interaction history. It provides an interface for interacting with the MOI protocol and fetching information from the network.

## Installation
Install the latest [release](https://github.com/zenz-solutions/js-moi-sdk/releases) using the following command.

```sh
npm install js-moi-providers
```

## Usage

```javascript
    import { JsonRpcProvider } from "@zenz-solutions/js-moi-providers";

    (async() => {
        const provider = new JsonRpcProvider("http://localhost:1600");
        const address = "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b";
        const contextInfo = await provider.getContextInfo(address);
        console.log(contextInfo);
    })()

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
