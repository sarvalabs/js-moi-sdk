import type { LockType } from "../enums";
import type { Hex } from "../hex";
import type { AnyIxOperation, IxRawOperation } from "./ix-operation";

export interface RawSender {
    address: Uint8Array;
    sequence_id: number;
    key_id: number;
}

export interface Sender {
    address: Hex;
    sequence_id: number;
    key_id: number;
}

export interface IxFund {
    asset_id: Hex;
    amount: number;
}

export interface RawParticipants {
    address: Uint8Array;
    lock_type: LockType;
    notary: boolean;
}

export interface IxParticipant {
    address: Hex;
    lock_type: LockType;
    notary: boolean;
}

export interface IxConsensusPreference {
    mtq: number;
    trust_nodes: string[];
}

export interface RawPreference {
    compute: Uint8Array;
    consensus: IxConsensusPreference;
}

export interface IxPreference {
    compute: Hex;
    consensus: IxConsensusPreference;
}

export interface RawInteractionRequest {
    sender: RawSender;
    payer: Uint8Array;
    fuel_price: number;
    fuel_limit: number;
    funds?: IxFund[];
    ix_operations: IxRawOperation[];
    participants?: RawParticipants[];
    preferences?: RawPreference;
    perception?: Uint8Array;
}

export interface InteractionRequest {
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
     * Represents an array of asset id and their amount associated with the interaction.
     */
    funds?: IxFund[];
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
