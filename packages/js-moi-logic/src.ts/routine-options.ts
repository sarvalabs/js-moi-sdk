import { IxParticipant, Sender } from "js-moi-providers";

interface IRoutineOption {
    sequence?: number;
    sender?: Sender;
    fuelLimit?: number;
    fuelPrice?: number;
    participants?: IxParticipant[];
    /**
     * KMOI to fund a not-yet-existing account with, bundled as a Transfer op
     * alongside a deploy/create. Logic/asset accounts now pay for their own
     * storage on creation (self-billed against their own balance), so a
     * brand-new account needs funds the moment it's created or the deploy
     * reverts. Only meaningful for LogicFactory.deploy() / AssetFactory.create().
     */
    fundNewAccount?: number | bigint;
}

export class RoutineOption implements IRoutineOption {
    public sequence?: number;
    public sender?: Sender;
    public fuelLimit?: number;
    public fuelPrice?: number;
    public participants?: IxParticipant[];
    public fundNewAccount?: number | bigint;

    constructor(options: IRoutineOption = {}) {
        const keys = Object.keys(options) as Array<keyof IRoutineOption>
        for (const key of keys) {
            this[key as keyof this] = options[key] as any
        }
    }
}

/**
 * Creates a new RoutineOption instance with the given option object.
 * 
 * @param option - The option object used to create the RoutineOption.
 * @returns A new RoutineOption instance.
 */
export const createRoutineOption = (option: IRoutineOption): RoutineOption => {
    return new RoutineOption(option)
}