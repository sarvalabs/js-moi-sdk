import { IxParticipant, Sender } from "js-moi-providers";
interface IRoutineOption {
    sequence?: number;
    sender?: Sender;
    fuelLimit?: number;
    fuelPrice?: number;
    participants?: IxParticipant[];
    /**
     * KMOI to fund a not-yet-existing account with, bundled as a Transfer op
     * alongside a deploy/create. Logic/asset accounts now pay for their own
     * storage on creation (self-billed against their own balance), so a
     * brand-new account needs funds the moment it's created or the deploy
     * reverts. Only meaningful for LogicFactory.deploy() / AssetFactory.create().
     */
    storageFund?: number | bigint;
}
export declare class RoutineOption implements IRoutineOption {
    sequence?: number;
    sender?: Sender;
    fuelLimit?: number;
    fuelPrice?: number;
    participants?: IxParticipant[];
    storageFund?: number | bigint;
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