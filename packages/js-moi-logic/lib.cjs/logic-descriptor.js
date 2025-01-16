"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicDescriptor = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
class LogicDescriptor extends js_moi_manifest_1.ElementDescriptor {
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
            js_moi_utils_1.ErrorUtils.throwError("Logic id not found. This can happen if the logic is not deployed.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
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
            this.coder = new js_moi_manifest_1.ManifestCoder(this.manifest);
        }
        return this.coder;
    }
    getManifest(format) {
        switch (format) {
            case js_moi_manifest_1.ManifestCoderFormat.JSON:
                return this.manifest;
            case js_moi_manifest_1.ManifestCoderFormat.YAML:
                return js_moi_manifest_1.ManifestCoder.toYaml(this.manifest);
            case js_moi_manifest_1.ManifestCoderFormat.POLO:
                return js_moi_manifest_1.ManifestCoder.encodeManifest(this.manifest);
        }
    }
}
exports.LogicDescriptor = LogicDescriptor;
//# sourceMappingURL=logic-descriptor.js.map