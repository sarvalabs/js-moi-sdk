import { InteractionContext } from "js-moi-interactions";
import { LogicManifest } from "js-moi-manifest";
import { Signer } from "js-moi-signer";
import { OpType } from "js-moi-utils";
export declare class AssetFactory {
    static create(signer: Signer, symbol: string, supply: number | bigint, manager: string, enableEvents: boolean, manifest?: LogicManifest.Manifest, callsite?: string, ...calldata: any[]): InteractionContext<OpType.ASSET_CREATE>;
}
//# sourceMappingURL=asset-factory.d.ts.map