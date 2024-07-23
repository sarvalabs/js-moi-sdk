export class RoutineOption {
    nonce;
    sender;
    fuelLimit;
    fuelPrice;
    constructor(options = {}) {
        for (const key of Object.keys(options)) {
            this[key] = options[key];
        }
    }
}
/**
 * Creates a new RoutineOption instance.
 *
 * @param option - The option object used to create the RoutineOption.
 * @returns A new RoutineOption instance.
 */
export const createRoutineOption = (option) => {
    return new RoutineOption(option);
};
//# sourceMappingURL=routine-options.js.map