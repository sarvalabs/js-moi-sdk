import { ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { Signer } from "js-moi-signer";
import { ElementType, ErrorCode, ErrorUtils, LogicId, OpType, defineReadOnly, type ElementData, type Hex, type IxOperation, type LogicManifest } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";
import { RoutineOption } from "./routine-options";
import { EphemeralState, PersistentState } from "./state";
import type { Routine } from "./types/logic";

/**
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
export class LogicDriver extends LogicDescriptor {
    public routines: Record<string, Routine>;
    public readonly persistentState?: PersistentState;
    public readonly ephemeralState?: EphemeralState;

    constructor(logicId: Hex | LogicId, manifest: LogicManifest, arg: Signer) {
        super(logicId, manifest, arg);
        const states = this.createState();

        this.routines = this.createRoutines();
        this.persistentState = states.persistentState;
        this.ephemeralState = states.ephemeralState;

        Object.defineProperty(this, "routines", { writable: false });
        Object.defineProperty(this, "persistentState", { writable: false });
        Object.defineProperty(this, "ephemeralState", { writable: false });
    }

    protected createOperationPayload(callsite: string, args: unknown[]): IxOperation<OpType.LogicInvoke> {
        const calldata = this.manifestCoder.encodeArguments(callsite, ...args);
        const { value } = this.getLogicId();

        return {
            type: OpType.LogicInvoke,
            payload: { callsite, calldata, logic_id: value },
        };
    }

    /**
     * Creates the persistent and ephemeral states for the logic driver, 
     if available in logic manifest.
     */
    private createState() {
        const hasPersistance = this.stateMatrix.persistent();
        const hasEphemeral = this.stateMatrix.ephemeral();

        let persistentState: PersistentState | undefined;
        let ephemeralState: EphemeralState | undefined;

        if (hasPersistance) {
            persistentState = new PersistentState(this, this.signer.getProvider());
        }

        if (hasEphemeral) {
            ephemeralState = new EphemeralState(this, this.signer.getProvider());
        }

        return { persistentState, ephemeralState };
    }

    private newRoutine(data: ElementData<ElementType.Routine>): Routine {
        const metadata = {
            kind: data.kind,
            mode: data.mode,
            accepts: data.accepts,
            returns: data.returns,
            catches: data.catches,
        };

        const callback = async (...params: [...args: any[], options: RoutineOption | undefined]): Promise<unknown> => {
            const hasOption = params.at(-1) instanceof RoutineOption;
            const args = hasOption ? params.slice(0, -1) : params;
            const option = hasOption ? params.at(-1) : undefined;

            if (args.length !== metadata.accepts.length) {
                const sign = `${data.name}(${metadata.accepts.map((arg) => arg.label + ": " + arg.type).join(", ")})`;
                ErrorUtils.throwArgumentError(`Invalid number of arguments for routine: ${sign}`, "args", ErrorCode.INVALID_ARGUMENT);
            }

            return await this.triggerCallsite(data.name, args, option);
        };

        return Object.freeze(Object.assign(callback, metadata));
    }

    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    private createRoutines() {
        const routines: Record<string, Routine> = {};

        for (const element of this.getElements().values()) {
            if (element.kind !== ElementType.Routine) {
                continue;
            }

            defineReadOnly(routines, element.data.name, this.newRoutine(element.data));
        }

        return routines;
    }
}

/**
 * Returns a logic driver instance based on the given logic id.
 *
 * @param {string} logicId - The logic id of the logic.
 * @param {Signer} signer - The signer instance for the logic driver.
 *
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
export const getLogicDriver = async (logicId: Hex | LogicId, signer: Signer): Promise<LogicDriver> => {
    const id = logicId instanceof LogicId ? logicId : new LogicId(logicId);
    const { manifest: blob } = await signer.getProvider().getLogic(id, {
        modifier: { include: ["manifest"] },
    });
    const manifest = ManifestCoder.decodeManifest(blob, ManifestCoderFormat.JSON);
    return new LogicDriver(id, manifest, signer);
};
