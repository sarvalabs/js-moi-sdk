"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicBase = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_interactions_1 = require("js-moi-interactions");
const js_moi_identifiers_1 = require("js-moi-identifiers");
const js_moi_signer_1 = require("js-moi-signer");
const js_moi_constants_1 = require("js-moi-constants");
const js_moi_utils_1 = require("js-moi-utils");
const logic_context_1 = require("./logic-context");
const logic_id_1 = require("./logic-id");
const routine_options_1 = require("./routine-options");
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
        const option = args.at(-1) instanceof routine_options_1.RoutineOption ? args.pop() : new routine_options_1.RoutineOption();
        const tempIxObj = { routine, arguments: args };
        const payload = this.createPayload(tempIxObj);
        const opType = this.getTxType(routine.kind);
        const ctx = {
            opType,
            payload: payload,
            participants: [],
            signer: this.signer,
        };
        if (opType === js_moi_utils_1.OpType.LOGIC_DEPLOY) {
            // A newly deployed logic self-pays for its own account-creation storage cost
            // (billed against its own, currently-zero balance) the moment it's created,
            // so it needs funds bundled into the same interaction or the deploy reverts.
            // See predictLogicId's docs for why this must mirror go-moi's id derivation
            // exactly - a wrong prediction sends funds to the wrong account.
            //
            // Note: this covers self-pay account-creation cost only. If the manifest's
            // deploy routine also writes persistent state without a `payer Logic`
            // clause, that write is billed to the SENDER against the new logic's
            // storage registry (the "granted storage" mechanism), which requires a
            // pre-existing IxStorageDeposit grant - and that can't be bundled into this
            // same interaction, because the target account doesn't exist yet when
            // participants are resolved. Manifests intended to be deployable standalone
            // should declare `payer Logic` on any state their deploy routine writes.
            ctx.extraOperations = (sender) => {
                const logicId = (0, js_moi_identifiers_1.predictLogicId)(sender);
                const transfer = (0, js_moi_interactions_1.buildTransferPayload)(js_moi_constants_1.KMOI_ASSET_ID, logicId.toHex(), option.fundNewAccount ?? js_moi_constants_1.DEFAULT_NEW_ACCOUNT_FUNDING);
                return [{ type: js_moi_utils_1.OpType.ASSET_INVOKE, payload: transfer }];
            };
        }
        return new logic_context_1.LogicContext(ctx, routine.name, this.processResult.bind(this));
    }
}
exports.LogicBase = LogicBase;
//# sourceMappingURL=logic-base.js.map