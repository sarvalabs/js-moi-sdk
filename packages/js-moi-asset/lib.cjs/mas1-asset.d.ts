import { OpType } from "js-moi-utils";
import { Signer } from "js-moi-signer";
import { InteractionContext } from "js-moi-wallet";
export declare class MAS1AssetLogic {
    assetId: string;
    signer: Signer;
    constructor(assetId: string, signer: Signer);
    private polorize;
    static newAsset(signer: Signer, symbol: string, maxTokens: number | bigint, manager: string, enableEvents: boolean): Promise<MAS1AssetLogic>;
    static create(signer: Signer, symbol: string, maxTokens: number | bigint, manager: string, enableEvents: boolean): InteractionContext<OpType.ASSET_CREATE>;
    /**
     * Mint a new NFT with a specific token_id to beneficiary.
     * tokenId should be unique (number | bigint).
     */
    mint(beneficiary: string, tokenId: number | bigint, metadata?: Uint8Array): InteractionContext<OpType.ASSET_INVOKE>;
    /**
     * Burn (destroy) a single NFT by token id.
     */
    burn(tokenId: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    /**
     * Transfer a token from `from` to `to`. For convenience this method assumes caller has rights.
     */
    transfer(from: string, to: string, tokenId: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    /**
     * Approve a single address to manage the given tokenId.
     */
    approve(approved: string, tokenId: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
    /**
     * Set or unset operator approval (approve all) for an operator address.
     */
    setApprovalForAll(operator: string, approved: boolean): InteractionContext<OpType.ASSET_INVOKE>;
    /**
     * Convenience: revoke approval for a specific token (set approved to zero / null).
     */
    revokeApproval(tokenId: number | bigint): InteractionContext<OpType.ASSET_INVOKE>;
}
//# sourceMappingURL=mas1-asset.d.ts.map