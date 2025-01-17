"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicDescriptor = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
class LogicDescriptor extends js_moi_manifest_1.ElementDescriptor {
    logicId;
    manifest;
    coder;
    state = new Map();
    constructor(manifest, logicId) {
        super(manifest.elements);
        this.manifest = manifest;
        this.logicId = logicId;
        for (const element of this.manifest.elements) {
            if (element.kind === js_moi_utils_1.ElementType.State) {
                this.state.set(element.data.mode, element.ptr);
            }
        }
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
    async getLogicId() {
        if (this.logicId == null) {
            js_moi_utils_1.ErrorUtils.throwError("Logic id not found. This can happen if the logic is not deployed.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        return this.logicId;
    }
    async getVersion() {
        const id = await this.getLogicId();
        return id.getVersion();
    }
    async getEdition() {
        const id = await this.getLogicId();
        return id.getEdition();
    }
    async getLogicAddress() {
        const id = await this.getLogicId();
        return id.getAddress();
    }
    async isEphemeral() {
        const id = await this.getLogicId();
        return id.isEphemeral();
    }
    async isPersistent() {
        const id = await this.getLogicId();
        return id.isPersistent();
    }
    async isAssetLogic() {
        const id = await this.getLogicId();
        return id.isAssetLogic();
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
    getStateElement(state) {
        const ptr = this.state.get(state);
        if (ptr == null) {
            js_moi_utils_1.ErrorUtils.throwError(`State "${state}" not found in logic.`, js_moi_utils_1.ErrorCode.NOT_FOUND);
        }
        const element = this.getElement(ptr);
        if (element.kind !== js_moi_utils_1.ElementType.State) {
            js_moi_utils_1.ErrorUtils.throwError(`Element is not a state: ${state}`, js_moi_utils_1.ErrorCode.UNKNOWN_ERROR);
        }
        return element;
    }
}
exports.LogicDescriptor = LogicDescriptor;
//# sourceMappingURL=logic-descriptor.js.map