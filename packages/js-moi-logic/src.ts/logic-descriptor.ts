import { ElementDescriptor, ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { ErrorCode, ErrorUtils, type Hex, type LogicId, type LogicManifest } from "js-moi-utils";

export class LogicDescriptor extends ElementDescriptor {
    private logicId?: LogicId;

    private readonly manifest: LogicManifest;

    private coder?: ManifestCoder;

    constructor(manifest: LogicManifest, logicId?: LogicId) {
        super(manifest.elements);

        this.manifest = manifest;
        this.logicId = logicId;
    }

    protected setLogicId(logicId: LogicId) {
        this.logicId = logicId;
    }

    public getEngine(): LogicManifest["engine"] {
        return this.manifest.engine;
    }

    public getSyntax(): LogicManifest["syntax"] {
        return this.manifest.syntax;
    }

    public getLogicId(): LogicId {
        if (this.logicId == null) {
            ErrorUtils.throwError("Logic id not found. This can happen if the logic is not deployed.", ErrorCode.NOT_INITIALIZED);
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

    public getManifestCoder(): ManifestCoder {
        if (this.coder == null) {
            this.coder = new ManifestCoder(this.manifest);
        }

        return this.coder;
    }

    public getManifest(format: ManifestCoderFormat.JSON): LogicManifest;
    public getManifest(format: ManifestCoderFormat.YAML): string;
    public getManifest(format: ManifestCoderFormat.POLO): Hex;
    public getManifest(format: ManifestCoderFormat) {
        switch (format) {
            case ManifestCoderFormat.JSON:
                return this.manifest;
            case ManifestCoderFormat.YAML:
                return ManifestCoder.toYaml(this.manifest);
            case ManifestCoderFormat.POLO:
                return ManifestCoder.encodeManifest(this.manifest);
        }
    }
}
