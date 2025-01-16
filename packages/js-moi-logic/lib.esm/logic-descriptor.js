import { ElementDescriptor } from "js-moi-manifest";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
export class LogicDescriptor extends ElementDescriptor {
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
            ErrorUtils.throwError("Logic ID is not set. This can happen if the logic is not deployed.", ErrorCode.NOT_INITIALIZED);
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
//# sourceMappingURL=logic-descriptor.js.map