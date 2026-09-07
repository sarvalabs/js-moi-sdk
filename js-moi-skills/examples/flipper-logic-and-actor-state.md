# Flipper: logic state vs actor state (deploy → flip → read)

MOI Builders Webinar, Session 1. A minimal boolean logic, deployed and driven on
Voyage devnet with js-moi-sdk. The **ContextFlipper** variant shows the same
program in *actor* context — per-actor isolated state — by changing three lines.

**What this demonstrates**
- `LogicFactory(manifest, wallet).deploy(callsite).send()` → deploy, read
  `logic_id` from `.result()`.
- `getLogicDriver(logicId, wallet)` → `driver.routines.X()`; **`.send()` for a
  `dynamic` endpoint, `.call()` for a `static` (read) endpoint**.
- Coco `state logic` (shared) vs `state actor` (per-sender), and
  `endpoint deploy` vs `endpoint enlist`.
- Devnet wiring: `VoyageProvider('devnet')`, path `m/44'/6174'/7020'/0/0`.

> Compile emits a **JSON** manifest (`format = "JSON"` in `coco.nut`) — import and
> deploy that, not YAML. Note `coco.nut` pins `version = "0.7.0"`; the SDK here is
> v0.7.1.

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
const ix = await factory.deploy('Init').send()
const { logic_id, error } = await ix.result()
if (error) throw new Error(error)

console.log('Interaction hash:', ix.hash)
console.log('Logic ID       :', logic_id)   // save as LOGIC_ID in .env
```

## `sdk/flip.js` — dynamic endpoint, `.send()`

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, getLogicDriver } from 'js-moi-sdk'

const logicId = process.argv[2] ?? process.env.LOGIC_ID
if (!logicId) throw new Error('Pass logic id as argv[2] or set LOGIC_ID in .env')

const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

const driver = await getLogicDriver(logicId, wallet)
const ix = await driver.routines.Flip().send()
const { error } = await ix.result()
if (error) throw new Error(error)
console.log('Flipped. hash:', ix.hash)
```

## `sdk/mode.js` — static endpoint, `.call()`

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
if (error) throw new Error(error)
console.log('value:', output?.value)
```

Run: `node sdk/deploy.js` → `node sdk/flip.js` → `node sdk/mode.js`.

## ContextFlipper — actor state (three-line diff)

Per-actor bool instead of shared logic state. Only three things change:
`state logic` → `state actor`; `endpoint deploy` → `endpoint enlist`; state reached
through `ContextFlipper.Sender` instead of `ContextFlipper.Logic`.

```coco
coco ContextFlipper

state actor:
    value Bool

endpoint enlist Init():
    mutate true -> ContextFlipper.Sender.value

endpoint dynamic Flip():
    mutate value <- ContextFlipper.Sender.value:
        value = !value

endpoint static Mode() -> (value Bool):
    observe value <- ContextFlipper.Sender.value
```

Actor logics are entered with **enlist** (per-sender), not a one-time deploy —
this is what unlocks per-actor isolation and parallel execution.
