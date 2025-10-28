import { LogicDriver } from "js-moi-logic";
import { LogicManifest } from "js-moi-manifest";
import { Signer } from "js-moi-signer";

export class AssetDriver extends LogicDriver{
    constructor(assetId: string, manifest: LogicManifest.Manifest, arg: Signer) {
        super(assetId, manifest, arg)
    }
}
