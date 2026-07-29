# Account-to-account swap via lockup + release

MOI Builders Webinar, Session 4. A trust-minimized two-party swap using **native
MAS0 `lockup` / `release`** — no custom Coco contract. Each party locks their
side as an irrevocable on-chain offer to the counterparty, then each claims the
other's lock. Needs **two funded devnet wallets** (Alice, Bob).

**What this demonstrates**
- `MAS0AssetLogic(assetId, wallet).lockup(beneficiary, amount).send()` — lock
  funds *for* a beneficiary; the locker cannot reclaim, only the beneficiary can
  pull.
- `.release(benefactor, beneficiary, amount).send()` — the beneficiary claims
  what was locked for them (signature-gated: verified on devnet that nobody else
  can move locked funds).
- `.transfer(beneficiary, amount)` — direct MAS0 transfer for comparison.
- `getAssetDriver(assetId, signer).routines.BalanceOf(address)` — asset-driver
  read; note asset-driver routines resolve the result **directly** (`{ output,
  error }`), no `.call()` chaining.
- Two wallets sharing the devnet faucet path `m/44'/6174'/7020'/0/0`.

> **Reaching past the public API:** `getLockups` below calls
> `provider.execute('moi.Lockups', …)` and `provider.processResponse(…)`. Those
> members are `protected` in the SDK and `moi.Lockups` is not a documented RPC
> method — this works at runtime on devnet but is unsupported/typed-private. Treat
> it as a devnet convenience, not a stable API.

## `logic/swap.js` — the swap primitives

```js
// Browser-safe: imported by both the CLI and the UI. Keep dotenv/process.env out.
import { MAS0AssetLogic, getAssetDriver } from 'js-moi-sdk'

async function sendIx(label, ixPromise) {
  const ix = await ixPromise.send()
  await ix.result()
  console.log(`  ✓ ${label}  hash=${ix.hash}`)
  return ix.hash
}

export async function transfer(assetId, wallet, beneficiary, amount) {
  const asset = new MAS0AssetLogic(assetId, wallet)
  return sendIx(`Transfer ${amount}`, asset.transfer(beneficiary, amount))
}

// Irrevocable offer: locker can't reclaim, only `beneficiary` can pull.
export async function lockup(assetId, wallet, beneficiary, amount) {
  const asset = new MAS0AssetLogic(assetId, wallet)
  return sendIx(`Lockup ${amount}`, asset.lockup(beneficiary, amount))
}

export async function release(assetId, wallet, benefactor, beneficiary, amount) {
  const asset = new MAS0AssetLogic(assetId, wallet)
  return sendIx(`Release ${amount}`, asset.release(benefactor, beneficiary, amount))
}

// Claim what the counterparty locked for you (must be signed by the beneficiary).
export async function claim(assetId, wallet, benefactor, selfAddress, amount) {
  const before = await getAssetBalance(assetId, selfAddress, wallet)
  await release(assetId, wallet, benefactor, selfAddress, amount)
  const after = await getAssetBalance(assetId, selfAddress, wallet)
  if (after - before < BigInt(amount)) {
    throw new Error(`Nothing to claim — counterparty hasn't locked ${amount} for you yet.`)
  }
  return after
}

const driverCache = new WeakMap()
async function cachedAssetDriver(assetId, signer) {
  let bySigner = driverCache.get(signer)
  if (!bySigner) { bySigner = new Map(); driverCache.set(signer, bySigner) }
  if (!bySigner.has(assetId)) bySigner.set(assetId, getAssetDriver(assetId, signer))
  return bySigner.get(assetId)
}

export async function getAssetBalance(assetId, address, signer) {
  const driver = await cachedAssetDriver(assetId, signer)
  const { output, error } = await driver.routines.BalanceOf(address)   // no .call()
  if (error) {
    const message = error.error ?? error.message ?? JSON.stringify(error)
    if (!/asset not found|token not found/.test(String(message))) {
      throw new Error(`BalanceOf failed: ${message}`)
    }
  }
  return BigInt(output?.balance ?? 0)
}

// Devnet convenience — reaches past the public provider API (see note above).
export async function getLockups(provider, accountId) {
  const response = await provider.execute('moi.Lockups', {
    id: accountId, options: { tesseract_number: -1 },
  })
  const result = provider.processResponse(response)
  return (result ?? []).map((entry) => ({
    beneficiary: entry.id, assetId: entry.asset_id, amount: BigInt(entry.amount),
  }))
}

export async function hasLockedForBeneficiary(provider, benefactor, beneficiary, assetId, amount) {
  const lockups = await getLockups(provider, benefactor)
  return lockups.some((l) =>
    l.beneficiary.toLowerCase() === beneficiary.toLowerCase() &&
    l.assetId.toLowerCase() === assetId.toLowerCase() &&
    l.amount >= BigInt(amount))
}
```

## `logic/wallets.js` — two wallets, faucet path

```js
import 'dotenv/config'
import { VoyageProvider, Wallet } from 'js-moi-sdk'

const DEFAULT_PATH = "m/44'/6174'/7020'/0/0"   // Voyage faucet path — both demo wallets

export function env(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set — copy .env.example to .env`)
  return value
}
export function optionalEnv(name, fallback = '') { return process.env[name] ?? fallback }

async function loadWallet(label, mnemonicEnv, pathEnv) {
  const provider = new VoyageProvider('devnet')
  const wallet = await Wallet.fromMnemonic(env(mnemonicEnv), optionalEnv(pathEnv, DEFAULT_PATH))
  wallet.connect(provider)
  const address = (await wallet.getIdentifier()).toHex()
  return { label, wallet, provider, address }
}

export async function loadBothWallets() {
  const [alice, bob] = await Promise.all([
    loadWallet('Alice', 'VITE_ALICE_MNEMONIC', 'VITE_ALICE_PATH'),
    loadWallet('Bob', 'VITE_BOB_MNEMONIC', 'VITE_BOB_PATH'),
  ])
  return { alice, bob }
}
```

## `logic/tokens.js` — deploy + mint helpers

```js
import { MAS0AssetLogic } from 'js-moi-sdk'

export async function deployAsset(wallet, symbol, supply, manager) {
  const ix = await MAS0AssetLogic.create(wallet, symbol, supply, manager, true).send()
  const [{ asset_id }] = await ix.result()
  console.log(`  ✓ Deployed ${symbol}  asset_id=${asset_id}  hash=${ix.hash}`)
  return asset_id
}

export async function mintAsset(assetId, wallet, beneficiary, amount) {
  const asset = new MAS0AssetLogic(assetId, wallet)
  const ix = await asset.mint(beneficiary, amount).send()
  await ix.result()
  console.log(`  ✓ Mint ${amount} → ${beneficiary.slice(0, 10)}…  hash=${ix.hash}`)
  return ix.hash
}
```

## The full swap — `extras/swap-cli.js` (core)

```js
import { env, loadBothWallets } from '../logic/wallets.js'
import { claim, getAssetBalance, lockup } from '../logic/swap.js'

const SEND_AMOUNT = 100, RECEIVE_AMOUNT = 90   // 1 TKA = 0.9 TKB (display only)
const tkaId = env('VITE_TKA_ASSET_ID')
const tkbId = env('VITE_TKB_ASSET_ID')

async function runFullSwap() {
  const { alice, bob } = await loadBothWallets()

  // 1. Alice locks 100 TKA for Bob (irrevocable offer)
  await lockup(tkaId, alice.wallet, bob.address, SEND_AMOUNT)
  // 2. Bob locks 90 TKB for Alice
  await lockup(tkbId, bob.wallet, alice.address, RECEIVE_AMOUNT)
  // 3. Alice claims her 90 TKB from Bob's lock
  await claim(tkbId, alice.wallet, bob.address, alice.address, RECEIVE_AMOUNT)
  // 4. Bob claims his 100 TKA from Alice's lock
  await claim(tkaId, bob.wallet, alice.address, bob.address, SEND_AMOUNT)

  console.log('✓ Swap complete')
}

runFullSwap().catch((err) => { console.error('Swap failed:', err.message ?? err); process.exit(1) })
```

The full CLI also exposes individual steps (`lock-alice`, `lock-bob`,
`claim-alice`, `claim-bob`, `balances`) plus a `setup.js` that deploys the TKA/TKB
test assets and an `extras/mint-tkb-to-bob.js` for funding Bob after the faucet.

## Swap flow, in one line

Alice `lockup(TKA→Bob)` · Bob `lockup(TKB→Alice)` · Alice `claim(TKB via
release)` · Bob `claim(TKA via release)`. Neither party can reclaim their own
lock; each `release` is gated to the beneficiary's signature.
