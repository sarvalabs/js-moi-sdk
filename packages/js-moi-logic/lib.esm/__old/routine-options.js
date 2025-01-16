export class RoutineOption {
    sequence;
    fuel_limit;
    fuel_price;
    constructor(options = {}) {
        const keys = Object.keys(options);
        for (const key of keys) {
            this[key] = options[key];
        }
    }
}
/**
 * Creates a new RoutineOption instance with the given option object.
 *
 * @param option - The option object used to create the RoutineOption.
 * @returns A new RoutineOption instance.
 */
export const createRoutineOption = (option) => {
    return new RoutineOption(option);
};
//# sourceMappingURL=routine-options.js.map