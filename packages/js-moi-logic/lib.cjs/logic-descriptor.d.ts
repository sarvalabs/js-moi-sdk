import { ElementDescriptor, ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { type Hex, type LogicId, type LogicManifest } from "js-moi-utils";
export declare class LogicDescriptor extends ElementDescriptor {
    protected logicId?: LogicId;
    private readonly manifest;
    private coder?;
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
    getManifestCoder(): ManifestCoder;
    getManifest(format: ManifestCoderFormat.JSON): LogicManifest;
    getManifest(format: ManifestCoderFormat.YAML): string;
    getManifest(format: ManifestCoderFormat.POLO): Hex;
}
//# sourceMappingURL=logic-descriptor.d.ts.map