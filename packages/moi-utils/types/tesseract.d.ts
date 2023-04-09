import { Interactions } from "./interaction"
import { Receipts } from "./receipt";

export interface ContextLockInfo {
    ContextHash: string;
    Height: bigint;
    TesseractHash: string;
}

export interface DeltaGroup {
    Role: number;
    BehaviourNodes: string[];
    RandomNodes: string[];
    ReplacedNodes: string[];
}

export interface PoXCData {
    BinaryHash: string;
    IdentityHash: string;
    ICSHash: string;
}

export type ContextDelta = Map<string, DeltaGroup>

export interface TesseractHeader {
    Address: string;
    PrevHash: string;
    Height: bigint;
    AnuUsed: bigint;
    AnuLimit: bigint;
    BodyHash: string;
    GridHash: string;
    Operator: string;
    ClusterID: string;
    Timestamp: bigint;
    ContextLock: Map<string, ContextLockInfo>
}

export interface TesseractBody {
    StateHash: string;
    ContextHash: string;
    InteractionHash: string;
    ReceiptHash: string;
    ContextDelta: ContextDelta;
    ConsensusProof: PoXCData;
}

export interface Tesseract {
    Header: TesseractHeader;
    Body: TesseractBody;
    Ixns: Interactions;
    Receipts: Receipts;
    Seal: Uint8Array;
}
