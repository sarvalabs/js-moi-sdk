import { OpType } from "js-moi-utils";
import { Signer } from "js-moi-signer";
import { InteractionContext } from "js-moi-interactions";
export declare class MAS2AssetLogic {
    assetId: string;
    signer: Signer;
    constructor(assetId: string, signer: Signer);
    private polorize;
    static newAsset(signer: Signer, symbol: string, supply: number | bigint, manager: string, enableEvents: boolean): Promise<MAS2AssetLogic>;
    static create(signer: Signer, symbol: string, supply: number | bigint, manager: string, enableEvents: boolean): InteractionContext<OpType.ASSET_CREATE>;
    transfer(tokenId: number | bigint, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    transferFrom(tokenId: number | bigint, benefactor: string, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    mint(beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    mintWithMetadata(beneficiary: string, amount: number | bigint, staticMetadata: Record<string, Uint8Array>): InteractionContext<OpType.ASSET_INVOKE>;
    burn(tokenId: number | bigint, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    approve(tokenId: number | bigint, beneficiary: string, amount: number | bigint, expiresAt: number): InteractionContext<OpType.ASSET_INVOKE>;
    revoke(tokenId: number | bigint, beneficiary: string): InteractionContext<OpType.ASSET_INVOKE>;
    lockup(tokenId: number | bigint, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    release(tokenId: number | bigint, benefactor: string, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    SetStaticMetadata(key: string, value: Uint8Array): InteractionContext<OpType.ASSET_INVOKE>;
    SetDynamicMetadata(key: string, value: Uint8Array): InteractionContext<OpType.ASSET_INVOKE>;
    symbol(): InteractionContext<OpType.ASSET_INVOKE>;
    balanceOf(tokenId: number | bigint, address: string): InteractionContext<OpType.ASSET_INVOKE>;
    creator(): InteractionContext<OpType.ASSET_INVOKE>;
    manager(): InteractionContext<OpType.ASSET_INVOKE>;
    GetStaticMetadata(): InteractionContext<OpType.ASSET_INVOKE>;
    GetDynamicMetadata(): InteractionContext<OpType.ASSET_INVOKE>;
}
//# sourceMappingURL=mas2-asset.d.ts.map