"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicBase = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_signer_1 = require("js-moi-signer");
const js_moi_utils_1 = require("js-moi-utils");
const logic_context_1 = require("./logic-context");
const logic_id_1 = require("./logic-id");
/**
 * Abstract base class for logic-related operations.
 * Extends ElementDescriptor and defines the common interface that
 * LogicDriver and LogicFactory implement.
 */
class LogicBase extends js_moi_manifest_1.ElementDescriptor {
    signer;
    provider;
    manifestCoder;
    constructor(manifest, signer) {
        super(manifest.elements);
        this.manifestCoder = new js_moi_manifest_1.ManifestCoder(manifest);
        this.connect(signer);
    }
    /**
     * Returns the logic ID associated with this instance.
     *
     * @returns {LogicId} The logic ID.
     */
    getLogicId() {
        return new logic_id_1.LogicId("");
    }
    /**
     * Returns the operation type corresponding to the given routine kind.
     *
     * @param {string} kind - The routine kind ("deploy", "invoke", or "enlist").
     * @returns {OpType} The corresponding operation type.
     */
    getTxType(kind) {
        switch (kind) {
            case "deploy":
                return js_moi_utils_1.OpType.LOGIC_DEPLOY;
            case "invoke":
                return js_moi_utils_1.OpType.LOGIC_INVOKE;
            case "enlist":
                return js_moi_utils_1.OpType.LOGIC_ENLIST;
            default:
                throw new Error("Unsupported routine kind!");
        }
    }
    /**
     * Connects a signer and updates the provider reference.
     *
     * @param {Signer} signer - The signer instance to connect.
     */
    connect(signer) {
        if (signer instanceof js_moi_signer_1.Signer) {
            this.signer = signer;
            this.provider = signer.getProvider();
            return;
        }
        this.provider = signer;
    }
    /**
     * Creates a LogicContext for the given routine and arguments.
     * The returned context exposes send(), call(), estimateFuel(), and ixData()
     * that accept an optional IxOption at execution time.
     *
     * @param {LogicManifest.Routine} routine - The routine from the logic manifest.
     * @param {any[]} args - The arguments for the routine.
     * @returns {LogicContext} The logic interaction context.
     */
    createIxObject(routine, ...args) {
        if (this.getTxType(routine.kind) !== js_moi_utils_1.OpType.LOGIC_DEPLOY && !this.getLogicId()) {
            js_moi_utils_1.ErrorUtils.throwError("This logic object doesn't have logic id assigned yet, please assign a logic id.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        const tempIxObj = { routine, arguments: args };
        const payload = this.createPayload(tempIxObj);
        const opType = this.getTxType(routine.kind);
        const ctx = {
            opType,
            payload: payload,
            participants: [],
            signer: this.signer,
        };
        return new logic_context_1.LogicContext(ctx, routine.name, this.processResult.bind(this));
    }
}
exports.LogicBase = LogicBase;
//# sourceMappingURL=logic-base.js.map