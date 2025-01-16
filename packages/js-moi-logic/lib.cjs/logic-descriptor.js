"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicDescriptor = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
class LogicDescriptor extends js_moi_manifest_1.ElementDescriptor {
    logicId;
    syntax;
    engine;
    constructor(manifest, logicId) {
        super(manifest.elements);
        this.syntax = manifest.syntax;
        this.engine = manifest.engine;
        this.logicId = logicId;
    }
    setLogicId(logicId) {
        this.logicId = logicId;
    }
    getEngine() {
        return this.engine;
    }
    getSyntax() {
        return this.syntax;
    }
    getLogicId() {
        if (this.logicId == null) {
            js_moi_utils_1.ErrorUtils.throwError("Logic ID is not set. This can happen if the logic is not deployed.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
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
}
exports.LogicDescriptor = LogicDescriptor;
//# sourceMappingURL=logic-descriptor.js.map