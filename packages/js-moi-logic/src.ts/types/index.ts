import type { Signer } from "js-moi-signer";
import type { Hex, LogicId, LogicManifest } from "js-moi-utils";

export interface LogicDriverOption {
    manifest: LogicManifest;
    signer?: Signer;
    logicId?: Hex | LogicId;
}
