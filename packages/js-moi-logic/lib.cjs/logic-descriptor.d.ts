import { ElementDescriptor, ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { ElementType, LogicState, type Address, type Element, type Hex, type LogicId, type LogicManifest } from "js-moi-utils";
export declare class LogicDescriptor extends ElementDescriptor {
    protected logicId?: LogicId;
    private readonly manifest;
    private coder?;
    private state;
    constructor(manifest: LogicManifest, logicId?: LogicId);
    protected setLogicId(logicId: LogicId): void;
    getEngine(): LogicManifest["engine"];
    getSyntax(): LogicManifest["syntax"];
    getLogicId(): Promise<LogicId>;
    getVersion(): Promise<number>;
    getEdition(): Promise<number>;
    getLogicAddress(): Promise<Address>;
    isEphemeral(): Promise<boolean>;
    isPersistent(): Promise<boolean>;
    isAssetLogic(): Promise<boolean>;
    getManifestCoder(): ManifestCoder;
    getManifest(format: ManifestCoderFormat.JSON): LogicManifest;
    getManifest(format: ManifestCoderFormat.YAML): string;
    getManifest(format: ManifestCoderFormat.POLO): Hex;
    getStateElement(state: LogicState): Element<ElementType.State>;
}
//# sourceMappingURL=logic-descriptor.d.ts.map