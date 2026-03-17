import { ElementDescriptor, LogicManifest, ManifestCoder } from "js-moi-manifest";
import type { AbstractProvider, LogicActionPayload, LogicDeployPayload } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { OpType } from "js-moi-utils";
import { LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
import { LogicContext, LogicOps } from "./logic-context";
import { LogicId } from "./logic-id";
/**
 * Abstract base class for logic-related operations.
 * Extends ElementDescriptor and defines the common interface that
 * LogicDriver and LogicFactory implement.
 */
export declare abstract class LogicBase extends ElementDescriptor {
    protected signer?: Signer;
    protected provider: AbstractProvider;
    protected manifestCoder: ManifestCoder;
    constructor(manifest: LogicManifest.Manifest, signer: Signer);
    protected abstract createPayload(ixObject: LogicIxObject): LogicDeployPayload | LogicActionPayload;
    protected abstract processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult>;
    /**
     * Returns the logic ID associated with this instance.
     *
     * @returns {LogicId} The logic ID.
     */
    protected getLogicId(): LogicId;
    /**
     * Returns the operation type corresponding to the given routine kind.
     *
     * @param {string} kind - The routine kind ("deploy", "invoke", or "enlist").
     * @returns {OpType} The corresponding operation type.
     */
    protected getTxType(kind: string): OpType.LOGIC_DEPLOY | OpType.LOGIC_INVOKE | OpType.LOGIC_ENLIST;
    /**
     * Connects a signer and updates the provider reference.
     *
     * @param {Signer} signer - The signer instance to connect.
     */
    connect(signer: Signer): void;
    /**
     * Creates a LogicContext for the given routine and arguments.
     * The returned context exposes send(), call(), estimateFuel(), and ixData()
     * that accept an optional IxOption at execution time.
     *
     * @param {LogicManifest.Routine} routine - The routine from the logic manifest.
     * @param {any[]} args - The arguments for the routine.
     * @returns {LogicContext} The logic interaction context.
     */
    protected createIxObject(routine: LogicManifest.Routine, ...args: any[]): LogicContext<LogicOps>;
}
//# sourceMappingURL=logic-base.d.ts.map