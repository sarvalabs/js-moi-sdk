# Native assets: MAS0 token + logic-backed TaxToken (MASX)

MOI Builders Webinar, Session 2. Two ways to create a fungible asset on Voyage
devnet: a plain **MAS0** token (protocol-only bookkeeping), and a **MASX**
logic-backed token whose `Transfer` runs custom Coco (fee-on-transfer).

**What this demonstrates**
- `MAS0AssetLogic.create(signer, symbol, supply, manager, enableEvents).send()`
  → create; `.result()` yields `[{ asset_id }]`. Verified sig:
  `mas0-asset.ts:37` (standard MAS0).
- `new MAS0AssetLogic(asset_id, wallet).mint(beneficiary, amount).send()`.
- `AssetFactory.create(signer, symbol, supply, manager, enableEvents, manifest,
  callsite, ...calldata).send()` → **MASX** logic-backed asset, running the Coco
  `Init` deploy routine with calldata. Verified sig: `asset-factory.ts:9`.
- Coco `coco asset` with `state logic`, `asset.Mint` / `asset.Transfer` builtins,
  and `endpoint deploy Init(...)` receiving the factory calldata.

> `AssetFactory.create` calldata is positional and must match the Coco `Init`
> params in order — here `(treasury Identifier, bps U64, initial_supply U256)`, so
> JS passes `identifier.toBytes(), TAX_BPS, INITIAL_SUPPLY`.

## Plain MAS0 — `sdk/asset.js`

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, MAS0AssetLogic } from 'js-moi-sdk'

const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

const address = (await wallet.getIdentifier()).toString()

const ix = await MAS0AssetLogic.create(wallet, 'WEBINAR', 1_000_000, address, true).send()
const [{ asset_id }] = await ix.result()
console.log('Asset ID:', asset_id, ' hash:', ix.hash)

const asset = new MAS0AssetLogic(asset_id, wallet)
const mintIx = await asset.mint(address, 100_000).send()
await mintIx.result()
console.log('Minted 100,000 WEBINAR  hash:', mintIx.hash)
```

## TaxToken Coco — `coco/taxtoken.coco`

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

## Logic-backed deploy — `sdk/tax-deploy.js`

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, AssetFactory } from 'js-moi-sdk'
import manifest from '../coco/taxtoken.json' with { type: 'json' }

const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

const identifier = await wallet.getIdentifier()
const address = identifier.toString()
const TAX_BPS = 500              // 5%
const INITIAL_SUPPLY = 1_000_000 // Number — U256 param, but create-time supply is a plain Number here

const ix = await AssetFactory.create(
  wallet, 'TaxToken', INITIAL_SUPPLY, address, true, manifest, 'Init',
  identifier.toBytes(), TAX_BPS, INITIAL_SUPPLY,   // Init(treasury, bps, initial_supply) — positional
).send()
const [{ asset_id }] = await ix.result()
console.log('TaxToken asset ID:', asset_id, ' hash:', ix.hash)   // save as TAX_ASSET_ID
```

Run: `node sdk/asset.js` (plain MAS0) then `node sdk/tax-deploy.js` (TaxToken).
