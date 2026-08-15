import { InteractionContext } from "js-moi-interactions";
import { LogicManifest } from "js-moi-manifest";
import { Signer } from "js-moi-signer";
import { OpType } from "js-moi-utils";
/**
 * Deploys a custom (MASX) asset from a caller-supplied logic manifest.
 * MASX is the only standard that takes a client-supplied manifest - the
 * native standards (MAS0/MAS1/MAS2) have their manifest built into the node
 * and are created via their own MAS0AssetLogic.create() / MAS1AssetLogic.create()
 * / MAS2AssetLogic.create() instead, not through this factory.
 */
export declare class AssetFactory {
    static create(signer: Signer, symbol: string, supply: number | bigint, manager: string, enableEvents: boolean, manifest: LogicManifest.Manifest, callsite: string, ...calldata: any[]): InteractionContext<OpType.ASSET_CREATE>;
}
//# sourceMappingURL=asset-factory.d.ts.map