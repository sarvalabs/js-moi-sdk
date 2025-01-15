import { ElementDescriptor, ManifestCoder } from "js-moi-manifest";
import { Signer } from "js-moi-signer";
import { OpType, type IxOperation, type LogicManifest } from "js-moi-utils";
import type { RoutineOption } from "./routine-options";

/**
 * The default fuel price used for logic interactions.
 */
const DEFAULT_FUEL_PRICE = 1;

/**
 * This abstract class extends the ElementDescriptor class and serves as a base
 * class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
export abstract class LogicBase extends ElementDescriptor {
    protected signer: Signer;
    protected readonly manifestCoder: ManifestCoder;

    constructor(manifest: LogicManifest, signer: Signer) {
        super(manifest.elements);

        this.manifestCoder = new ManifestCoder(manifest);
        this.signer = signer;
    }

    protected abstract createOperationPayload(
        callsite: string,
        args: unknown[]
    ): IxOperation<OpType.LogicInvoke> | IxOperation<OpType.LogicDeploy> | IxOperation<OpType.LogicInvoke>;

    // protected isMutableCallsite(callsite: string): boolean {}

    protected async triggerCallsite(callsite: string, args: unknown[], option?: RoutineOption) {
        const routine = this.getRoutineElement(callsite);

        if (routine.data.mode === )


        const ix = await this.signer.execute({
            fuel_price: option?.fuel_price ?? DEFAULT_FUEL_PRICE,
            fuel_limit: option?.fuel_limit ?? 10000, // TODO: remove a hard-coded default value
            operations: [this.createOperationPayload(callsite, args)],
        });

        return ix;
    }

    // abstract methods to be implemented by subclasses
}
