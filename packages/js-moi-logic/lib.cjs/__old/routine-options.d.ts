interface IRoutineOption {
    sequence?: number;
    fuel_limit?: number;
    fuel_price?: number;
}
export declare class RoutineOption implements IRoutineOption {
    readonly sequence?: number;
    readonly fuel_limit?: number;
    readonly fuel_price?: number;
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