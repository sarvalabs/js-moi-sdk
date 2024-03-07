export interface ContextDelta {
    role: number;
    behavioural_nodes: string[] | null;
    random_nodes: string[] | null;
    replaced_nodes: string[] | null;
}
export interface Participant {
    address: string;
    height: string;
    transitive_link: string;
    prev_context: string;
    latest_context: string;
    context_delta: ContextDelta;
    state_hash: string;
}
export type Participants = Participant[];
export interface Interaction {
    type: IxType;
    nonce: string;
    sender: string;
    receiver: string;
    payer: string;
    transfer_values: Map<string, string>;
    perceived_values: Map<string, string>;
    perceived_proofs: string;
    fuel_price: string;
    fuel_limit: string;
    payload: unknown;
    mode: string;
    compute_hash: string;
    compute_nodes: string[];
    mtq: string;
    trust_nodes: string[];
    hash: string;
    signature: string;
    ts_hash: string;
    participants: Participants;
    ix_index: string;
}
export type Interactions = Interaction[];
/**
 * Enumerates the types of Interactions in the system.
 */
export declare enum IxType {
    INVALID_IX = 0,
    VALUE_TRANSFER = 1,
    FUEL_SUPPLY = 2,
    ASSET_CREATE = 3,
    ASSET_APPROVE = 4,
    ASSET_REVOKE = 5,
    ASSET_MINT = 6,
    ASSET_BURN = 7,
    LOGIC_DEPLOY = 8,
    LOGIC_INVOKE = 9,
    LOGIC_ENLIST = 10,
    LOGIC_INTERACT = 11,
    LOGIC_UPGRADE = 12,
    FILE_CREATE = 13,
    FILE_UPDATE = 14,
    PARTICIPANT_REGISTER = 15,
    VALIDATOR_REGISTER = 16,
    VALIDATOR_UNREGISTER = 17,
    STAKE_BOND = 18,
    STAKE_UNBOND = 19,
    STAKE_TRANSFER = 20
}
//# sourceMappingURL=interaction.d.ts.map