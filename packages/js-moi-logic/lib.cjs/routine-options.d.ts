interface IRoutineOption {
    nonce?: number;
    sender?: string;
    fuelLimit?: number;
    fuelPrice?: number;
}
export declare class RoutineOption implements IRoutineOption {
    nonce?: number;
    sender?: string;
    fuelLimit?: number;
    fuelPrice?: number;
    constructor(options?: IRoutineOption);
}
/**
 * Creates a new RoutineOption instance with the given option object.
 *
 * @param option - The option object used to create the RoutineOption.
 * @returns A new RoutineOption instance.
 */
export declare const createRoutineOption: (option: IRoutineOption) => RoutineOption;
export {};
//# sourceMappingURL=routine-options.d.ts.map