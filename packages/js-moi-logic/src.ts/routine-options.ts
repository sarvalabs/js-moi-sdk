
interface IRoutineOption {
    nonce?: number;
    sender?: string;
    fuelLimit?: number;
    fuelPrice?: number;
}

export class RoutineOption implements IRoutineOption {
    public nonce?: number;
    public sender?: string;
    public fuelLimit?: number;
    public fuelPrice?: number;
    constructor(options: IRoutineOption = {}) {
        for (const key of Object.keys(options)) {
            this[key] = options[key]
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