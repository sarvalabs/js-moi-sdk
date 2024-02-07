import { Interactions, Participants } from "./interaction";

export interface ConsensusInfo {
    evidence_hash: string;
    binary_hash: string;
    identity_hash: string;
    ics_hash: string;
    cluster_id: string;
    ics_signature: string;
    ics_vote_set: string;
    round: string;
    commit_signature: string;
    bft_vote_set: string;
}

export interface Tesseract {
    participants: Participants;
    interactions_hash: string;
    receipts_hash: string;
    epoch: string;
    time_stamp: string;
    operator: string;
    fuel_used: string;
    fuel_limit: string;
    consensus_info: ConsensusInfo;
    seal: string;
    hash: string;
    address: string;
    ixns: Interactions;
}