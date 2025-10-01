import {
    AssetCreationResult,
    AssetSupplyResult,
    AssetStandard,
    OpType,
    LogicDeployResult,
    LogicInvokeResult,
    LogicEnlistResult,
    Participants
} from "js-moi-utils";
import type { NestedArray } from "./util";
import { InteractionObject, RawInteractionObject } from "./interaction";

export interface Options {
    tesseract_number?: number;
    tesseract_hash?: string;
}

export interface ContextInfo {
    behaviour_nodes: string[];
    random_nodes: string[];
    storage_nodes: string[];
}

interface TDUBase {
    asset_id: string;
}

export interface TDU extends TDUBase {
    amount: number | bigint; 
}

export interface TDUResponse extends TDUBase {
    amount: string; 
}

export interface AccountState {
    nonce: string;
    acc_type: number;
    balance: string;
    asset_approvals: string;
    context_hash: string;
    storage_root: string;
    logic_root: string;
    file_root: string
    asset_registry: string;
}

export interface AccountMetaInfo {
    type: number;
    id: string;
    height: string;
    tesseract_hash: string;
    lattice_exists: boolean;
    state_exists: boolean;
}

export interface InteractionRequest {
    ix_args: string;
    signatures: string;
}

export interface InteractionResponse {
    hash: string;
    wait: (timeout?: number) => Promise<InteractionReceipt>,
    result: (timeout?: number) => Promise<any>
}

export interface InteractionCallResponse {
    receipt: InteractionReceipt,
    result: () => any
}

export interface StateHash {
    id: string;
    hash: string;
}

export interface ContextHash {
    id: string;
    hash: string;
}

export type ExecutionResult = AssetCreationResult | AssetSupplyResult | 
LogicDeployResult | LogicInvokeResult | LogicEnlistResult | null;

export interface OperationResult {
    tx_type: string;
    status: number;
    data: ExecutionResult
}

export interface InteractionReceipt {
    ix_hash: string;
    status: number;
    fuel_used: string;
    ix_operations: OperationResult[];
    from: string;
    ix_index: string;
    ts_hash: string;
    participants: Participants;
}

export interface AssetInfo {
    symbol: string;
    operator: string;
    supply: string;
    dimension: string;
    standard: string;
    is_logical: boolean;
    is_stateful: boolean;
    logic_id?: string;
}

export interface Registry {
    asset_id: string;
    asset_info: AssetInfo;
}

interface AccSyncStatus {
    current_height: string; 
    expected_height: string;
    is_primary_sync_done: boolean;
}

interface NodeSyncStatus {
    total_pending_accounts: string; 
    is_principal_sync_done: boolean;
    principal_sync_done_time: string; 
    is_initial_sync_done: boolean;
}

interface SyncStatus {
    acc_sync_status: AccSyncStatus;
    node_sync_status: NodeSyncStatus | null;
}

export interface AccountParamsBase {
    id: string,
    key_id?: number,
    options?: Options 
}

export interface AccountStateParams {
    id: string,
    options?: Options 
}

export interface AccountMetaInfoParams {
    id: string
}

export interface BalanceParams extends AccountParamsBase {
    asset_id: string,
}

export interface TesseractParams extends AccountParamsBase {
    with_interactions: boolean
}

export interface AssetInfoParams {
    asset_id: string;
    options: Options;
}

export interface InteractionParams {
    hash: string
}

export interface InteractionByTesseractParams extends AccountParamsBase {
    ix_index: string
}

export interface SyncStatusParams {
    id?: string
}

export interface StorageParams {
    id?: string;
    logic_id: string;
    storage_key: string;
    options: Options;
}

// Type alias for encoding type
type Encoding = "JSON" | "POLO";

export interface LogicManifestParams {
    logic_id: string;
    encoding: Encoding;
    options: Options;
}

export interface InteractionInfo {
    nonce: string;
    type: string;
    sender: string;
    receiver: string;
    cost: string;
    fuel_price: string;
    fuel_limit: string;
    input: string;
    hash: string;
}

interface ContentResponse {
    pending: Record<string, Map<number | bigint, InteractionInfo>>
    queued: Record<string, Map<number | bigint, InteractionInfo>>
}

export interface Content {
    pending: Map<string, Map<number | bigint, InteractionInfo>>;
    queued: Map<string, Map<number | bigint, InteractionInfo>>;
}

interface ContentFromResponse {
    pending: Record<string, InteractionInfo>;
    queued: Record<string, InteractionInfo>;
}

export interface ContentFrom {
    pending: Map<number | bigint, InteractionInfo>;
    queued: Map<number | bigint, InteractionInfo>;
}

export interface Filter {
    id: string;
}

export interface FilterDeletionResult {
    status: boolean;
}

interface StatusResponse {
    pending: string;
    queued: string;
}

export interface Status {
    pending: number | bigint;
    queued: number | bigint;
}

export interface WaitTime {
    expired: boolean,
    time: number | bigint
}

interface InspectResponse {
    pending: Record<string, Map<string, string>>;
    queued: Record<string, Map<string, string>>;
    wait_time: Record<string, WaitTime>;
}

export interface Inspect {
    pending: Map<string, Map<string, string>>;
    queued: Map<string, Map<string, string>>;
    wait_time: Map<string, WaitTime>;
}

export interface NodeInfo {
    krama_id: string;
}

interface Stream {
    protocol: string;
    direction: number;
}

export interface CallorEstimateIxObject {
    ix_args: InteractionObject,
}

interface ProcessedCallorEstimateIxObject {
    ix_args: RawInteractionObject
}

export type CallorEstimateOptions = Record<string, Options>

export interface RpcErrorResponse {
    code: number;
    message: string;
}

export interface RpcError {
    code: number,
    message: string,
    data: any
}

export interface RpcResponse<T> {
    jsonrpc: string;
    result?: T;
    error?: RpcError;
    id: 1;
}

export interface Log {
    id: string;
    topics: string[];
    data: string;
    ix_hash: string;
    ts_hash: string;
    participants: Participants;
}

export interface LogFilter {
    id: string;
    height: [start: number, end: number];
    topics?: NestedArray<string>;
}


export interface Log {
    id: string;
    topics: string[];
    data: string;
    ix_hash: string;
    ts_hash: string;
    participants: Participants;
}

export interface LogFilter {
    id: string;
    height: [start: number, end: number];
    topics?: NestedArray<string>;
}

