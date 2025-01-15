"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutineOption = exports.RoutineOption = void 0;
class RoutineOption {
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
exports.RoutineOption = RoutineOption;
/**
 * Creates a new RoutineOption instance with the given option object.
 *
 * @param option - The option object used to create the RoutineOption.
 * @returns A new RoutineOption instance.
 */
const createRoutineOption = (option) => {
    return new RoutineOption(option);
};
exports.createRoutineOption = createRoutineOption;
//# sourceMappingURL=routine-options.js.map