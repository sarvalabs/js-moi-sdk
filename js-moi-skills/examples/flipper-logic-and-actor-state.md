# Flipper: logic state vs actor state (deploy → flip → read)

MOI Builders Webinar, Session 1. A minimal boolean logic, deployed and driven on
Voyage devnet with js-moi-sdk (APIs checked against v0.9.0-rc2). The
**ContextFlipper** variant shows the same program in *actor* context (per-actor
isolated state) by changing two lines.

**What this demonstrates**
- `LogicFactory(manifest, wallet).deploy(callsite).send()` → deploy, read
  `logic_id` from `.result()`. The callsite is **required** (0.8.0) because the
  manifest has a deploy routine, and the deploy interaction carries a second op:
  a 10 KMOI storage-funding transfer to the new logic (`DEFAULT_STORAGE_FUND`),
  so the wallet needs fuel plus 10 KMOI.
- `getLogicDriver(logicId, wallet)` → `driver.routines.X()`; **`.send()` for a
  `dynamic` endpoint, `.call()` for a `static` (read) endpoint**.
- Coco `state logic` (shared; `driver.logicState` in the SDK) vs `state actor`
  (per-sender; `driver.actorState`).
- Devnet wiring: `VoyageProvider('devnet')`, path `m/44'/6174'/7020'/0/0`.

> Compile emits a **JSON** manifest (`format = "JSON"` under `[target.moi]` in
> `coco.nut`); import and deploy that, not YAML. With Coco 0.9.3 (`coco nut
> init` writes `version = "0.9.3"` and `[target.pisa] version = "0.8.2"`) the
> manifest still reports `engine.version: 0.8.0`; the SDK here is v0.9.0-rc2.

## `flipper/flipper.coco`

```coco
coco Flipper

state logic:
    value Bool

endpoint deploy Init():
    mutate false -> Flipper.Logic.value

endpoint dynamic Flip():
    mutate v <- Flipper.Logic.value:
        v = !v

endpoint static Get() -> (value Bool):
    observe value <- Flipper.Logic.value
```

Compile: `cd session-1/flipper && coco compile` → `flipper.json`.

## `sdk/deploy.js`

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, LogicFactory } from 'js-moi-sdk'
import manifest from '../flipper/flipper.json' with { type: 'json' }

const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

const factory = new LogicFactory(manifest, wallet)
const ix = await factory.deploy('Init').send()        // fuel auto-estimated; + 10 KMOI storage fund
const receipt = await ix.wait(120)
if (receipt.status !== 0) throw new Error(`deploy failed, status ${receipt.status}`)
const { logic_id, error } = await ix.result()          // op 0 of 2 (deploy, funding transfer)
if (error) throw new Error(error.error ?? JSON.stringify(error))
if (!logic_id) throw new Error('deploy committed but returned no logic_id')

console.log('Interaction hash:', ix.hash)
console.log('Logic ID       :', logic_id)   // save as LOGIC_ID in .env
```

## `sdk/flip.js` ; dynamic endpoint, `.send()`

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, getLogicDriver } from 'js-moi-sdk'

const logicId = process.argv[2] ?? process.env.LOGIC_ID
if (!logicId) throw new Error('Pass logic id as argv[2] or set LOGIC_ID in .env')

const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

const driver = await getLogicDriver(logicId, wallet)
const ix = await driver.routines.Flip().send()        // dynamic ⇒ .send(); fuel auto-estimated, price 50
const receipt = await ix.wait(60)
if (receipt.status !== 0) throw new Error(`flip failed, status ${receipt.status}`)
const { error } = await ix.result()
if (error) throw new Error(error.error ?? JSON.stringify(error))
console.log('Flipped. hash:', ix.hash)
```

## `sdk/mode.js` ; static endpoint, `.call()`

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, getLogicDriver } from 'js-moi-sdk'

const logicId = process.argv[2] ?? process.env.LOGIC_ID
const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

const driver = await getLogicDriver(logicId, wallet)
const response = await driver.routines.Get().call()      // read-only ⇒ .call()
const { output, error } = await response.result()
if (error) throw new Error(error.error ?? JSON.stringify(error))
console.log('value:', output?.value)

// the same value straight from storage, no routine involved:
console.log('logicState value:', await driver.logicState.get((b) => b.entity('value')))
```

Run: `node sdk/deploy.js` → `node sdk/flip.js` → `node sdk/mode.js`.

## ContextFlipper: actor state (two-line diff)

Per-actor bool instead of shared logic state. Only two things change:
`state logic` → `state actor`, and state is reached through
`ContextFlipper.Sender` instead of `ContextFlipper.Logic`. The 0.7.1 version of
this example used `endpoint enlist Init()`; **Coco 0.9.2 and later reject
`enlist` endpoints** ("enlist endpoints are not supported") and actors need no
registration step, because unset actor state reads as its zero value (`false`).

```coco
coco ContextFlipper

state actor:
    value Bool

endpoint deploy Init():
    pass

endpoint dynamic Flip():
    mutate value <- ContextFlipper.Sender.value:
        value = !value

endpoint static Mode() -> (value Bool):
    observe value <- ContextFlipper.Sender.value
```

Each sender's `Flip()` toggles only their own slot. Read it from the SDK with
`driver.actorState.get(senderAddress, (b) => b.entity('value'))` or the `Mode()`
static call. If a logic needs per-caller state for an *inherited* sub-account,
see `references/concepts.md` and `AccountInherit` in `references/assets.md`.
