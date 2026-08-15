import { ElementDescriptor, ManifestCoder } from "js-moi-manifest";
import { buildTransferPayload } from "js-moi-interactions";
import { deriveLogicId } from "js-moi-identifiers";
import { Signer } from "js-moi-signer";
import { DEFAULT_STORAGE_FUND, KMOI_ASSET_ID } from "js-moi-constants";
import { ErrorCode, ErrorUtils, OpType } from "js-moi-utils";
import { LogicContext } from "./logic-context";
import { LogicId } from "./logic-id";
import { RoutineOption } from "./routine-options";
/**
 * Abstract base class for logic-related operations.
 * Extends ElementDescriptor and defines the common interface that
 * LogicDriver and LogicFactory implement.
 */
export class LogicBase extends ElementDescriptor {
    signer;
    provider;
    manifestCoder;
    constructor(manifest, signer) {
        super(manifest.elements);
        this.manifestCoder = new ManifestCoder(manifest);
        this.connect(signer);
    }
    /**
     * Returns the logic ID associated with this instance.
     *
     * @returns {LogicId} The logic ID.
     */
    getLogicId() {
        return new LogicId("");
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
                return OpType.LOGIC_DEPLOY;
            case "invoke":
                return OpType.LOGIC_INVOKE;
            case "enlist":
                return OpType.LOGIC_ENLIST;
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
        if (signer instanceof Signer) {
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
        if (this.getTxType(routine.kind) !== OpType.LOGIC_DEPLOY && !this.getLogicId()) {
            ErrorUtils.throwError("This logic object doesn't have logic id assigned yet, please assign a logic id.", ErrorCode.NOT_INITIALIZED);
        }
        const option = args.at(-1) instanceof RoutineOption ? args.pop() : new RoutineOption();
        const tempIxObj = { routine, arguments: args };
        const payload = this.createPayload(tempIxObj);
        const opType = this.getTxType(routine.kind);
        const ctx = {
            opType,
            payload: payload,
            participants: [],
            signer: this.signer,
        };
        if (opType === OpType.LOGIC_DEPLOY) {
            // A newly deployed logic self-pays for its own account-creation storage cost
            // (billed against its own, currently-zero balance) the moment it's created,
            // so it needs funds bundled into the same interaction or the deploy reverts.
            // See deriveLogicId's docs for why this must mirror the blockchain's id derivation
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
            ctx.fundingOperations = (sender) => {
                const logicId = deriveLogicId(sender);
                const transfer = buildTransferPayload(KMOI_ASSET_ID, logicId.toHex(), option.storageFund ?? DEFAULT_STORAGE_FUND);
                return [{ type: OpType.ASSET_INVOKE, payload: transfer }];
            };
        }
        return new LogicContext(ctx, routine.name, this.processResult.bind(this));
    }
}
//# sourceMappingURL=logic-base.js.map