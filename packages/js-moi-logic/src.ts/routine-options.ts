import { Sender } from "js-moi-providers";

interface IRoutineOption {
    nonce?: number;
    sender?: Sender;
    fuelLimit?: number;
    fuelPrice?: number;
}

export class RoutineOption implements IRoutineOption {
    public nonce?: number;
    public sender?: Sender;
    public fuelLimit?: number;
    public fuelPrice?: number;

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