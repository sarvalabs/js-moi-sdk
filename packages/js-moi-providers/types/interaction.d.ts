import type { Hex, LockType } from "js-moi-utils";
import type { AnyIxOperation, RawIxOperation } from "./ix-operation";

export interface RawSender {
    id: Uint8Array;
    sequence: number;
    key_id: number;
}

export interface Sender {
    id: Hex;
    sequence: number;
    key_id: number;
}

export interface RawIxParticipants {
    id: Uint8Array;
    lock_type: LockType;
    notary: boolean;
}

export interface IxParticipant {
    id: Hex;
    lock_type: LockType;
    notary: boolean;
}

export interface IxConsensusPreference {
    mtq: number;
    trust_nodes: string[];
}

export interface RawIxPreference {
    compute: Uint8Array;
    consensus: IxConsensusPreference;
}

export interface IxPreference {
    compute: Hex;
    consensus: IxConsensusPreference;
}

export interface RawIxFund {
    asset_id: Uint8Array;
    amount: number;
}

export interface IxFund {
    asset_id: string;
    amount: number;
}

export interface RawInteractionObject {
    sender: RawSender;
    payer?: Uint8Array;
    fuel_price: number;
    fuel_limit: number;
    funds: RawIxFund[];
    ix_operations: RawIxOperation[];
    participants?: RawIxParticipants[];
    preferences?: RawIxPreference;
    perception?: Uint8Array;
}

export interface InteractionObject {
    /**
     * The entity initiating the interaction.
     */
    sender: Sender;
    /**
     * The entity responsible for paying for the interaction.
     */
    payer?: Hex;
    /**
     * The price multiplier for fuel for the interaction.
     */
    fuel_price: number;
    /**
     * The maximum amount of fuel that can be used for the interaction.
     */
    fuel_limit: number;
    /**
     * The funds involved in the interaction.
     */
    funds: IxFund[];
    /**
     * Represents an array of raw operations to be executed in the interaction
     */
    operations: AnyIxOperation[];
    /**
     * It represents a participant with an addresses and their lock type.
     */
    participants?: IxParticipant[];
    /**
     * It represents compute and consensus preferences for the interaction.
     */
    preferences?: IxPreference;
    /**
     * The perception data for the interaction.
     */
    perception?: Hex;
}
