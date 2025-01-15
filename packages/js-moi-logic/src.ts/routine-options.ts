interface IRoutineOption {
    sequence?: number;
    fuel_limit?: number;
    fuel_price?: number;
}

export class RoutineOption implements IRoutineOption {
    public readonly sequence?: number;
    public readonly fuel_limit?: number;
    public readonly fuel_price?: number;

    constructor(options: IRoutineOption = {}) {
        const keys = Object.keys(options) as Array<keyof IRoutineOption>;

        for (const key of keys) {
            this[key as keyof this] = options[key] as any;
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
    return new RoutineOption(option);
};
