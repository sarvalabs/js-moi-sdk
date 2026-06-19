import { ElementDescriptor, LogicManifest, ManifestCoder } from "js-moi-manifest";
import type { AbstractProvider, LogicActionPayload, LogicDeployPayload, LogicPayload } from "js-moi-providers";
import { IxContext } from "js-moi-interactions";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, OpType } from "js-moi-utils";
import { LogicIxCallResponse, LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
import { LogicContext, LogicOps } from "./logic-context";
import { LogicId } from "./logic-id";

/**
 * Abstract base class for logic-related operations.
 * Extends ElementDescriptor and defines the common interface that
 * LogicDriver and LogicFactory implement.
 */
export abstract class LogicBase extends ElementDescriptor {
    protected signer?: Signer;
    protected provider!: AbstractProvider;
    protected manifestCoder: ManifestCoder;

    constructor(manifest: LogicManifest.Manifest, signer: Signer) {
        super(manifest.elements);
        this.manifestCoder = new ManifestCoder(manifest);
        this.connect(signer);
    }

    protected abstract createPayload(ixObject: LogicIxObject): LogicDeployPayload | LogicActionPayload;

    protected abstract processResult(response: LogicIxResponse | LogicIxCallResponse, timeout?: number): Promise<LogicIxResult>;

    /**
     * Returns the logic ID associated with this instance.
     *
     * @returns {LogicId} The logic ID.
     */
    protected getLogicId(): LogicId {
        return new LogicId("");
    }

    /**
     * Returns the operation type corresponding to the given routine kind.
     *
     * @param {string} kind - The routine kind ("deploy", "invoke", or "enlist").
     * @returns {OpType} The corresponding operation type.
     */
    protected getTxType(kind: string): OpType.LOGIC_DEPLOY | OpType.LOGIC_INVOKE | OpType.LOGIC_ENLIST {
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
    public connect(signer: Signer): void {
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
    protected createIxObject(routine: LogicManifest.Routine, ...args: any[]): LogicContext<LogicOps> {
        if (this.getTxType(routine.kind) !== OpType.LOGIC_DEPLOY && !this.getLogicId()) {
            ErrorUtils.throwError(
                "This logic object doesn't have logic id assigned yet, please assign a logic id.",
                ErrorCode.NOT_INITIALIZED
            );
        }

        const tempIxObj = { routine, arguments: args } as LogicIxObject;
        const payload = this.createPayload(tempIxObj) as LogicPayload;
        const opType = this.getTxType(routine.kind) as LogicOps;

        const ctx: IxContext<typeof opType> = {
            opType,
            payload: payload as any,
            participants: [],
            signer: this.signer!,
        };

        return new LogicContext(ctx, routine.name, this.processResult.bind(this));
    }
}
