import { OpType } from "js-moi-utils";
import { Signer } from "js-moi-signer";
import { InteractionContext } from "js-moi-interactions";
export declare class MASNAssetLogic {
    signer: Signer;
    constructor(signer: Signer);
    private polorize;
    transfer(beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    transferFrom(benefactor: string, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    approve(beneficiary: string, amount: number | bigint, expiresAt: number): InteractionContext<OpType.ASSET_INVOKE>;
    revoke(beneficiary: string): InteractionContext<OpType.ASSET_INVOKE>;
    lockup(beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    release(benefactor: string, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
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
//# sourceMappingURL=masn-asset.d.ts.map