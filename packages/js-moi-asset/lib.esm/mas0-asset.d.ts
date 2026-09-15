import { Hex, OpType } from "js-moi-utils";
import { MAS0 } from "./mas0";
import { Exception } from "js-moi-manifest";
import { Signer } from "js-moi-signer";
import { InteractionContext } from "js-moi-interactions";
import { RoutineOption } from "js-moi-logic";
export declare class MAS0AssetLogic {
    assetId: string;
    signer: Signer;
    constructor(assetId: string, signer: Signer);
    private polorize;
    /**
     * Decodes a read-only (static) callsite's raw `.call()` result - the
     * `{ outputs, error }` entry a `.result()` call returns for an
     * ASSET_INVOKE op - into a real value, the same way `js-moi-logic`'s
     * routine `.call()` already does via `ManifestCoder`. Without this,
     * `outputs` is undecoded POLO-encoded bytes.
     *
     * @param {MAS0.Endpoint} callsite - The read-only callsite that
     * produced this result (e.g. `MAS0.Endpoint.BALANCEOF`).
     * @param {{ outputs: Hex; error: Hex }} result - One entry of the array
     * `InteractionCallResponse.result()` resolves to.
     * @returns {{ output: T; error: Exception | null }} The decoded output
     * and, if the call reverted, the decoded exception.
     */
    decodeResult<T = unknown>(callsite: MAS0.Endpoint, result: {
        outputs: Hex;
        error: Hex;
    }): {
        output: T;
        error: Exception | null;
    };
    static newAsset(signer: Signer, symbol: string, supply: number | bigint, manager: string, enableEvents: boolean, decimals?: number, option?: RoutineOption): Promise<MAS0AssetLogic>;
    static create(signer: Signer, symbol: string, supply: number | bigint, manager: string, enableEvents: boolean, decimals?: number, option?: RoutineOption): InteractionContext<OpType.ASSET_CREATE>;
    mint(beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    mintWithMetadata(beneficiary: string, amount: number | bigint, staticMetadata: Record<string, Uint8Array>): InteractionContext<OpType.ASSET_INVOKE>;
    burn(amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    transfer(beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    transferFrom(benefactor: string, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    approve(beneficiary: string, amount: number | bigint, expiresAt: number): InteractionContext<OpType.ASSET_INVOKE>;
    revoke(beneficiary: string): InteractionContext<OpType.ASSET_INVOKE>;
    lockup(beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    release(benefactor: string, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    SetStaticMetadata(key: string, value: Uint8Array): InteractionContext<OpType.ASSET_INVOKE>;
    SetDynamicMetadata(key: string, value: Uint8Array): InteractionContext<OpType.ASSET_INVOKE>;
    symbol(): InteractionContext<OpType.ASSET_INVOKE>;
    balanceOf(id: string): InteractionContext<OpType.ASSET_INVOKE>;
    creator(): InteractionContext<OpType.ASSET_INVOKE>;
    manager(): InteractionContext<OpType.ASSET_INVOKE>;
    Decimals(): InteractionContext<OpType.ASSET_INVOKE>;
    MaxSupply(): InteractionContext<OpType.ASSET_INVOKE>;
    CirculatingSupply(): InteractionContext<OpType.ASSET_INVOKE>;
    GetStaticMetadata(key: string): InteractionContext<OpType.ASSET_INVOKE>;
    GetDynamicMetadata(key: string): InteractionContext<OpType.ASSET_INVOKE>;
}
//# sourceMappingURL=mas0-asset.d.ts.map