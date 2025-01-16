import { ElementDescriptor, ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
export class LogicDescriptor extends ElementDescriptor {
    logicId;
    manifest;
    coder;
    constructor(manifest, logicId) {
        super(manifest.elements);
        this.manifest = manifest;
        this.logicId = logicId;
    }
    setLogicId(logicId) {
        this.logicId = logicId;
    }
    getEngine() {
        return this.manifest.engine;
    }
    getSyntax() {
        return this.manifest.syntax;
    }
    getLogicId() {
        if (this.logicId == null) {
            ErrorUtils.throwError("Logic id not found. This can happen if the logic is not deployed.", ErrorCode.NOT_INITIALIZED);
        }
        return this.logicId;
    }
    getVersion() {
        return this.getLogicId().getVersion();
    }
    getEdition() {
        return this.getLogicId().getEdition();
    }
    getLogicAddress() {
        return this.getLogicId().getAddress();
    }
    isEphemeral() {
        return this.getLogicId().isEphemeral();
    }
    isPersistent() {
        return this.getLogicId().isPersistent();
    }
    isAssetLogic() {
        return this.getLogicId().isAssetLogic();
    }
    getManifestCoder() {
        if (this.coder == null) {
            this.coder = new ManifestCoder(this.manifest);
        }
        return this.coder;
    }
    getManifest(format) {
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
//# sourceMappingURL=logic-descriptor.js.map