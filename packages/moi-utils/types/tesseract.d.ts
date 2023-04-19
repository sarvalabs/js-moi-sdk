import { Interactions } from "./interaction"
import { Receipts } from "./receipt";

export interface ContextLockInfo {
    context_hash: string;
    height: bigint;
    tesseract_hash: string;
}

export interface DeltaGroup {
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

export type ContextDelta = Map<string, DeltaGroup>

type Uint64Array = Array<bigint>;

interface ArrayOfBits {
    size: number;
    elements: Uint64Array;
}

interface TesseractPart {
    address: string;
    hash: string;
    height: bigint;
}
  
type TesseractParts = Array<TesseractPart>;
  
interface TesseractGridID {
    hash: string;
    total: number;
    parts: TesseractParts;
}

interface CommitData {
    round: number;
    commit_signature: Uint8Array;
    vote_set: ArrayOfBits | null;
    evidence_hash: string;
    grid_id: TesseractGridID | null;
}  

export interface TesseractHeader {
    address: string;
    prev_hash: string;
    height: bigint;
    fuel_used: bigint;
    fuel_limit: bigint;
    body_hash: string;
    grid_hash: string;
    operator: string;
    cluster_id: string;
    timestamp: bigint;
    context_lock: Map<string, ContextLockInfo>
    extra: CommitData
}

export interface TesseractBody {
    state_hash: string;
    context_hash: string;
    interaction_hash: string;
    receipt_hash: string;
    context_delta: ContextDelta;
    consensus_proof: PoXCData;
}

export interface Tesseract {
    header: TesseractHeader;
    body: TesseractBody;
    ixns: Interactions;
    receipts: Receipts;
    seal: Uint8Array;
    hash: string;
}
