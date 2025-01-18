import { ElementDescriptor, ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { ElementType, ErrorCode, ErrorUtils, LogicState, type Address, type Element, type Hex, type LogicId, type LogicManifest } from "js-moi-utils";
import { stringify as toYaml } from "yaml";

export class LogicDescriptor extends ElementDescriptor {
    protected logicId?: LogicId;

    private readonly manifest: LogicManifest;

    private coder?: ManifestCoder;

    private state: Map<LogicState, number> = new Map();

    constructor(manifest: LogicManifest, logicId?: LogicId) {
        super(manifest.elements);

        this.manifest = manifest;
        this.logicId = logicId;

        for (const element of this.manifest.elements) {
            if (element.kind === ElementType.State) {
                this.state.set(element.data.mode, element.ptr);
            }
        }
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

    public isEphemeral(): boolean {
        return this.state.has(LogicState.Ephemeral);
    }

    public isPersistent(): boolean {
        return this.state.has(LogicState.Persistent);
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
                return toYaml(this.manifest);
            case ManifestCoderFormat.POLO:
                return ManifestCoder.encodeManifest(this.manifest);
        }
    }

    public getStateElement(state: LogicState): Element<ElementType.State> {
        const ptr = this.state.get(state);

        if (ptr == null) {
            ErrorUtils.throwError(`State "${state}" not found in logic.`, ErrorCode.NOT_FOUND);
        }

        const element = this.getElement(ptr);

        if (element.kind !== ElementType.State) {
            ErrorUtils.throwError(`Element is not a state: ${state}`, ErrorCode.UNKNOWN_ERROR);
        }

        return element;
    }
}
