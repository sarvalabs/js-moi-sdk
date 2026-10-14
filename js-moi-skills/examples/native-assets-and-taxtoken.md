# Native assets: MAS0 token + logic-backed TaxToken (MASX)

MOI Builders Webinar, Session 2. Two ways to create a fungible asset on Voyage
devnet: a plain **MAS0** token (protocol-only bookkeeping), and a **MASX**
logic-backed token whose `Transfer` runs custom Coco (fee-on-transfer). APIs
checked against js-moi-sdk v0.9.0-rc2.

**What this demonstrates**
- `MAS0AssetLogic.create(signer, symbol, supply, manager, enableEvents, decimals?, option?).send()`
  → create; `.result()` yields `[{ asset_id }, fundingResult]`. Verified sig:
  `mas0-asset.ts:41` (standard MAS0). `decimals` is new in 0.9.0 and sits
  **before** `option`.
- `new MAS0AssetLogic(asset_id, wallet).mint(beneficiary, amount).send()`.
- `AssetFactory.create(signer, symbol, supply, manager, enableEvents, manifest,
  callsite, ...calldata).send()` → **MASX** logic-backed asset, running the Coco
  `Init` deploy routine with calldata. Verified sig: `asset-factory.ts:18`.
  Since 0.8.0 `manifest` is required and `callsite` is required because the
  manifest defines a deploy routine.
- Both creates bundle a second operation: a **10 KMOI storage-funding transfer**
  (`DEFAULT_STORAGE_FUND`) to the predicted asset id. Budget fuel plus 10 KMOI
  per create; raise the fund with a trailing `new RoutineOption({ storageFund })`.
- Coco `coco asset` with `state logic`, `asset.Mint` / `asset.Transfer` builtins,
  and `endpoint deploy Init(...)` receiving the factory calldata.

> `AssetFactory.create` calldata is positional and must match the Coco `Init`
> params in order ; here `(treasury Identifier, bps U64, initial_supply U256)`, so
> JS passes `identifier.toBytes(), TAX_BPS, INITIAL_SUPPLY`.

## Plain MAS0 ; `sdk/asset.js`

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, MAS0AssetLogic } from 'js-moi-sdk'

const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

const address = (await wallet.getIdentifier()).toString()

// create: (signer, symbol, max_supply, manager, enableEvents, decimals?) + bundled 10 KMOI storage fund
const ix = await MAS0AssetLogic.create(wallet, 'WEBINAR', 1_000_000n, address, true, 0).send({ fuel_limit: 200_000 })
const receipt = await ix.wait(120)
if (receipt.status !== 0) throw new Error(`create failed, status ${receipt.status}`)
const [{ asset_id }] = await ix.result()               // op 0 = ASSET_CREATE, op 1 = funding transfer
console.log('Asset ID:', asset_id, ' hash:', ix.hash)

const asset = new MAS0AssetLogic(asset_id, wallet)
const mintIx = await asset.mint(address, 100_000n).send({ fuel_limit: 100_000 })
if ((await mintIx.wait(60)).status !== 0) throw new Error('mint failed')
console.log('Minted 100,000 WEBINAR  hash:', mintIx.hash)
console.log('balance:', String(await provider.getBalance(address, asset_id)))
```

## TaxToken Coco ; `coco/taxtoken.coco`

Fee-on-transfer: route `tax_bps` of every `Transfer` to the treasury, remainder
to the beneficiary.

```coco
coco asset TaxToken

state logic:
    treasury Identifier
    tax_bps U64

endpoint deploy Init(treasury_addr Identifier, bps U64, initial_supply U256):
    mutate treasury_addr -> TaxToken.Logic.treasury
    mutate bps           -> TaxToken.Logic.tax_bps
    asset.Mint(token_id: 0, beneficiary: treasury_addr, amount: initial_supply)

endpoint dynamic Transfer(beneficiary Identifier, amount U256):
    memory treasury Identifier
    memory bps U64
    observe treasury <- TaxToken.Logic.treasury
    observe bps      <- TaxToken.Logic.tax_bps

    memory tax = (amount * U256(bps)) / U256(10000)
    memory net = amount - tax

    asset.Transfer(token_id: 0, beneficiary: treasury,    amount: tax)
    asset.Transfer(token_id: 0, beneficiary: beneficiary, amount: net)
```

Compile → `taxtoken.json`.

## Logic-backed deploy ; `sdk/tax-deploy.js`

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, AssetFactory } from 'js-moi-sdk'
import manifest from '../coco/taxtoken.json' with { type: 'json' }

const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

const identifier = await wallet.getIdentifier()
const address = identifier.toString()
const TAX_BPS = 500n               // 5%  (U64)
const INITIAL_SUPPLY = 1_000_000n  // U256; number or bigint both accepted since 0.8.0

const ix = await AssetFactory.create(
  wallet, 'TaxToken', INITIAL_SUPPLY, address, true, manifest, 'Init',   // manifest + callsite required
  identifier.toBytes(), TAX_BPS, INITIAL_SUPPLY,   // Init(treasury, bps, initial_supply): positional calldata
).send({ fuel_limit: 2_000_000 })                  // + bundled 10 KMOI storage fund
const receipt = await ix.wait(120)
if (receipt.status !== 0) throw new Error(`create failed, status ${receipt.status}`)
const [{ asset_id }] = await ix.result()
console.log('TaxToken asset ID:', asset_id, ' hash:', ix.hash)   // save as TAX_ASSET_ID
```

Run: `node sdk/asset.js` (plain MAS0) then `node sdk/tax-deploy.js` (TaxToken).

> The 0.7.1 version of this page said create-time `supply` had to be a plain
> `Number`. The 0.8.0 release notes list "Fixed BigInt asset supply handling",
> and the rc2 validator accepts `number | bigint` (> 0). This page now uses
> `bigint`; if a node still rejects it at sign time, fall back to `Number`.
