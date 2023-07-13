import { TesseractPart } from "./common";
import { Interactions } from "./interaction";

export interface ContextLockInfo {
    address: string;
    context_hash: string;
    height: string;
    tesseract_hash: string;
}

export interface DeltaGroup {
    address: string;
    role: number;
    behavioural_nodes: string[];
    random_nodes: string[];
    replaced_nodes: string[];
}

export interface PoXCData {
    binary_hash: string;
    identity_hash: string;
    ics_hash: string;
}
  
interface TesseractGridID {
    hash: string;
    total: string;
    parts: TesseractPart[];
}

interface CommitData {
    round: string;
    commit_signature: string;
    vote_set: string;
    evidence_hash: string;
    grid_id: TesseractGridID;
}  

export interface TesseractHeader {
    address: string;
    prev_hash: string;
    height: string;
    fuel_used: string;
    fuel_limit: string;
    body_hash: string;
    grid_hash: string;
    operator: string;
    cluster_id: string;
    timestamp: string;
    context_lock: ContextLockInfo[]
    extra: CommitData
}

export interface TesseractBody {
    state_hash: string;
    context_hash: string;
    interaction_hash: string;
    receipt_hash: string;
    context_delta: DeltaGroup[];
    consensus_proof: PoXCData;
}

export interface Tesseract {
    header: TesseractHeader;
    body: TesseractBody;
    ixns: Interactions;
    seal: string;
    hash: string;
}
