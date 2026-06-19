import type { Hex, LockType } from "js-moi-utils";
import type { AnyIxOperation, IxOperation, RawIxOperation } from "./operation";

export interface Sender {
    id: Hex;
    sequence: number;
    key_id: number;
}

export type RawSender = Omit<Sender, "id"> & {
  id: Uint8Array;
};

export interface IxParticipant {
    id: Hex;
    lock_type: LockType;
    notary?: boolean;
}

export type RawIxParticipant = Omit<IxParticipant, "id"> & {
  id: Uint8Array;
};

export interface IxConsensusPreference {
    mtq: number;
    trust_nodes: string[];
}

export interface IxPreference {
    compute: Hex;
    consensus: IxConsensusPreference;
}

export type RawIxPreference = Omit<IxPreference, "compute"> & {
  compute: Uint8Array;
};

export interface IxFund {
    asset_id: Hex;
    amount: number | bigint;
}

export type RawIxFund = Omit<IxFund, "asset_id"> & {
    asset_id: Uint8Array;
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
    fuel_price: number | bigint;
    /**
     * The maximum amount of fuel that can be used for the interaction.
     */
    fuel_limit: number;
    /**
     * The funds involved in the interaction.
     */
    funds?: IxFund[];
    /**
     * Represents an array of raw operations to be executed in the interaction
     */
    ix_operations: AnyIxOperation[];
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

export interface RawInteractionObject {
    sender: RawSender;
    payer?: Uint8Array;
    fuel_price: number | bigint;
    fuel_limit: number | bigint;
    funds?: RawIxFund[];
    ix_operations: RawIxOperation[];
    participants?: RawIxParticipant[];
    preferences?: RawIxPreference;
    perception?: Uint8Array;
}

export interface Signature {
    id: Hex;
    key_id: number;
    signature: Hex;
}

export type RawSignature = Omit<Signature, "id" | "signature"> & {
    id: Uint8Array;
    signature: Uint8Array;
}

export type IxSenderArgs = Sender

export type IxFundArgs = Omit<IxFund, "amount"> & {
    amount: Hex;
}

export type IxOperationArgs = Omit<RawIxOperation, "payload"> & {
    payload: Hex;
}

export type IxParticipantArgs = IxParticipant

export type IxPreferenceArgs = Omit<IxPreference, "consensus"> & {
    consensus: Omit<IxConsensusPreference, "mtq"> & {
        mtq: Hex;
    }
}

export interface InteractionArgs {
    sender: IxSenderArgs;
    payer?: Hex;
    fuel_price: Hex;
    fuel_limit: Hex;
    funds?: IxFundArgs[];
    ix_operations: IxOperationArgs[];
    participants?: IxParticipantArgs[];
    preferences?: IxPreferenceArgs;
    perception?: Hex;
}
