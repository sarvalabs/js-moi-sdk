import { OpType } from "js-moi-utils";
import { Signer } from "js-moi-signer";
import { InteractionContext } from "js-moi-interactions";
export declare class MAS0AssetLogic {
    assetId: string;
    signer: Signer;
    constructor(assetId: string, signer: Signer);
    private polorize;
    static newAsset(signer: Signer, symbol: string, supply: number | bigint, manager: string, enableEvents: boolean): Promise<MAS0AssetLogic>;
    static create(signer: Signer, symbol: string, supply: number | bigint, manager: string, enableEvents: boolean): InteractionContext<OpType.ASSET_CREATE>;
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
    GetStaticMetadata(): InteractionContext<OpType.ASSET_INVOKE>;
    GetDynamicMetadata(): InteractionContext<OpType.ASSET_INVOKE>;
}
//# sourceMappingURL=mas0-asset.d.ts.map