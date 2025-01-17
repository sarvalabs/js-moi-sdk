import { ElementDescriptor, ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { ErrorCode, ErrorUtils, type Address, type Hex, type LogicId, type LogicManifest } from "js-moi-utils";

export class LogicDescriptor extends ElementDescriptor {
    protected logicId?: LogicId;

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

    public async getLogicId(): Promise<LogicId> {
        if (this.logicId == null) {
            ErrorUtils.throwError("Logic id not found. This can happen if the logic is not deployed.", ErrorCode.NOT_INITIALIZED);
        }

        return this.logicId;
    }

    public async getVersion(): Promise<number> {
        const id = await this.getLogicId();
        return id.getVersion();
    }

    public async getEdition(): Promise<number> {
        const id = await this.getLogicId();
        return id.getEdition();
    }

    public async getLogicAddress(): Promise<Address> {
        const id = await this.getLogicId();
        return id.getAddress();
    }

    public async isEphemeral(): Promise<boolean> {
        const id = await this.getLogicId();
        return id.isEphemeral();
    }

    public async isPersistent(): Promise<boolean> {
        const id = await this.getLogicId();
        return id.isPersistent();
    }

    public async isAssetLogic(): Promise<boolean> {
        const id = await this.getLogicId();
        return id.isAssetLogic();
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
