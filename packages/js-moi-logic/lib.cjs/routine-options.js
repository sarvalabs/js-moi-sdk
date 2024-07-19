"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutineOption = exports.RoutineOption = void 0;
class RoutineOption {
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
exports.RoutineOption = RoutineOption;
/**
 * Creates a new RoutineOption instance.
 *
 * @param option - The option object used to create the RoutineOption.
 * @returns A new RoutineOption instance.
 */
const createRoutineOption = (option) => {
    return new RoutineOption(option);
};
exports.createRoutineOption = createRoutineOption;
//# sourceMappingURL=routine-options.js.map