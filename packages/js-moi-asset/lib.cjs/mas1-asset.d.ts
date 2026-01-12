import { OpType } from "js-moi-utils";
import { Signer } from "js-moi-signer";
import { InteractionContext } from "js-moi-interactions";
export declare class MAS1AssetLogic {
    assetId: string;
    signer: Signer;
    constructor(assetId: string, signer: Signer);
    private polorize;
    static newAsset(signer: Signer, symbol: string, supply: number | bigint, manager: string, enableEvents: boolean): Promise<MAS1AssetLogic>;
    static create(signer: Signer, symbol: string, supply: number | bigint, manager: string, enableEvents: boolean): InteractionContext<OpType.ASSET_CREATE>;
    mint(beneficiary: string): InteractionContext<OpType.ASSET_INVOKE>;
    mintWithMetadata(beneficiary: string, staticMetadata: Record<string, Uint8Array>): InteractionContext<OpType.ASSET_INVOKE>;
    burn(tokenId: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    transfer(tokenId: number | bigint, beneficiary: string): InteractionContext<OpType.ASSET_INVOKE>;
    transferFrom(tokenId: number | bigint, benefactor: string, beneficiary: string): InteractionContext<OpType.ASSET_INVOKE>;
    approve(tokenId: number | bigint, beneficiary: string, expiresAt: number): InteractionContext<OpType.ASSET_INVOKE>;
    revoke(tokenId: number | bigint, beneficiary: string): InteractionContext<OpType.ASSET_INVOKE>;
    lockup(tokenId: number | bigint, beneficiary: string): InteractionContext<OpType.ASSET_INVOKE>;
    release(tokenId: number | bigint, benefactor: string, beneficiary: string): InteractionContext<OpType.ASSET_INVOKE>;
    SetStaticMetadata(key: string, value: Uint8Array): InteractionContext<OpType.ASSET_INVOKE>;
    SetDynamicMetadata(key: string, value: Uint8Array): InteractionContext<OpType.ASSET_INVOKE>;
    SetStaticTokenMetadata(tokenId: number | bigint, key: string, value: Uint8Array): InteractionContext<OpType.ASSET_INVOKE>;
    SetDynamicTokenMetadata(tokenId: number | bigint, key: string, value: Uint8Array): InteractionContext<OpType.ASSET_INVOKE>;
    symbol(): InteractionContext<OpType.ASSET_INVOKE>;
    isOwner(tokenId: number | bigint, address: Uint8Array): InteractionContext<OpType.ASSET_INVOKE>;
    creator(): InteractionContext<OpType.ASSET_INVOKE>;
    manager(): InteractionContext<OpType.ASSET_INVOKE>;
    GetStaticMetadata(key: string): InteractionContext<OpType.ASSET_INVOKE>;
    GetDynamicMetadata(key: string): InteractionContext<OpType.ASSET_INVOKE>;
    GetStaticTokenMetadata(tokenId: number | bigint, key: string, value: Uint8Array): InteractionContext<OpType.ASSET_INVOKE>;
    GetDynamicTokenMetadata(tokenId: number | bigint, key: string, value: Uint8Array): InteractionContext<OpType.ASSET_INVOKE>;
}
//# sourceMappingURL=mas1-asset.d.ts.map