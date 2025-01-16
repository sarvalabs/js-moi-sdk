import { ElementDescriptor } from "js-moi-manifest";
import { type Hex, type LogicId, type LogicManifest } from "js-moi-utils";
export declare class LogicDescriptor extends ElementDescriptor {
    private logicId?;
    private readonly syntax;
    private readonly engine;
    constructor(manifest: LogicManifest, logicId?: LogicId);
    protected setLogicId(logicId: LogicId): void;
    getEngine(): LogicManifest["engine"];
    getSyntax(): LogicManifest["syntax"];
    getLogicId(): LogicId;
    getVersion(): number;
    getEdition(): number;
    getLogicAddress(): Hex;
    isEphemeral(): boolean;
    isPersistent(): boolean;
    isAssetLogic(): boolean;
}
//# sourceMappingURL=logic-descriptor.d.ts.map