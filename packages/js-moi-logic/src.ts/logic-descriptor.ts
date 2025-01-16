import { ElementDescriptor } from "js-moi-manifest";
import { ErrorCode, ErrorUtils, type Hex, type LogicId, type LogicManifest } from "js-moi-utils";

export class LogicDescriptor extends ElementDescriptor {
    private logicId?: LogicId;

    private readonly syntax: LogicManifest["syntax"];

    private readonly engine: LogicManifest["engine"];

    constructor(manifest: LogicManifest, logicId?: LogicId) {
        super(manifest.elements);

        this.syntax = manifest.syntax;
        this.engine = manifest.engine;
        this.logicId = logicId;
    }

    protected setLogicId(logicId: LogicId) {
        this.logicId = logicId;
    }

    public getEngine(): LogicManifest["engine"] {
        return this.engine;
    }

    public getSyntax(): LogicManifest["syntax"] {
        return this.syntax;
    }

    public getLogicId(): LogicId {
        if (this.logicId == null) {
            ErrorUtils.throwError("Logic ID is not set. This can happen if the logic is not deployed.", ErrorCode.NOT_INITIALIZED);
        }

        return this.logicId;
    }

    public getVersion(): number {
        return this.getLogicId().getVersion();
    }

    public getEdition(): number {
        return this.getLogicId().getEdition();
    }

    public getLogicAddress(): Hex {
        return this.getLogicId().getAddress();
    }

    public isEphemeral(): boolean {
        return this.getLogicId().isEphemeral();
    }

    public isPersistent(): boolean {
        return this.getLogicId().isPersistent();
    }

    public isAssetLogic(): boolean {
        return this.getLogicId().isAssetLogic();
    }
}
