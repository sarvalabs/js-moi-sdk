import { IxParticipant, Sender } from "js-moi-providers";
interface IRoutineOption {
    sequence?: number;
    sender?: Sender;
    fuelLimit?: number;
    fuelPrice?: number;
    participants?: IxParticipant[];
}
export declare class RoutineOption implements IRoutineOption {
    sequence?: number;
    sender?: Sender;
    fuelLimit?: number;
    fuelPrice?: number;
    participants?: IxParticipant[];
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