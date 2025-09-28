import { Signer } from "js-moi-signer";
import { InteractionResponse } from "js-moi-providers";
export declare class MAS0AssetLogic {
    assetId: string;
    signer: Signer;
    constructor(assetId: string, signer: Signer);
    private send;
    private polorize;
    static create(signer: Signer, symbol: string, supply: number | bigint, manager: string, enableEvents: boolean): Promise<MAS0AssetLogic>;
    mint(beneficiary: string, amount: number | bigint): Promise<InteractionResponse>;
    burn(amount: number | bigint): Promise<InteractionResponse>;
    transfer(beneficiary: string, amount: number | bigint): Promise<InteractionResponse>;
    approve(beneficiary: string, amount: number | bigint, expiresAt: number): Promise<InteractionResponse>;
    revoke(beneficiary: string): Promise<InteractionResponse>;
    lockup(beneficiary: string, amount: number | bigint): Promise<InteractionResponse>;
    release(benefactor: string, beneficiary: string, amount: number | bigint): Promise<InteractionResponse>;
}
//# sourceMappingURL=mas0-asset.d.ts.map