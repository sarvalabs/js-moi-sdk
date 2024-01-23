import {
    AssetCreationReceipt,
    AssetMintOrBurnReceipt,
    AssetStandard,
    IxType,
    LogicDeployReceipt,
    LogicInvokeReceipt
} from "js-moi-utils";

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
}

export interface AccountMetaInfo {
    type: number;
    address: string;
    height: string;
    tesseract_hash: string;
    lattice_exists: boolean;
    state_exists: boolean;
}

export interface InteractionRequest {
    ix_args: string;
    signature: string;
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
    address: string;
    hash: string;
}

export interface ContextHash {
    address: string;
    hash: string;
}

export interface InteractionReceipt {
    ix_type: string;
    ix_hash: string;
    status: number;
    fuel_used: string;
    state_hashes: StateHash[];
    context_hashes: ContextHash[];
    extra_data: AssetCreationReceipt | AssetMintOrBurnReceipt | LogicDeployReceipt | LogicInvokeReceipt | null;
    from: string;
    to: string;
    ix_index: string;
    parts: string;
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
    address: string,
    options?: Options 
}

export interface AccountStateParams {
    address: string,
    options?: Options 
}

export interface AccountMetaInfoParams {
    address: string
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
    address: string
}

export interface StorageParams {
    logic_id: string;
    storage_key: string;
    options: Options;
}

export interface DBEntryParams {
    key: string;
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

export interface Content {
    pending: Map<string, Map<number | bigint, InteractionInfo>>;
    queued: Map<string, Map<number | bigint, InteractionInfo>>;
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

export interface Status {
    pending: number | bigint;
    queued: number | bigint;
}

export interface WaitTime {
    expired: boolean,
    time: number | bigint
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

interface Connection {
    peer_id: string;
    streams: Stream[];
}

export interface ConnectionsInfo {
    connections: Connection[];
    inbound_conn_count: number;
    outbound_conn_count: number;
    active_pub_sub_topics: { [topic: string]: number };
}

export interface AssetCreatePayload {
    symbol: string;
    supply: number | bigint;
    standard?: AssetStandard;
    dimension?: number;
    is_stateful?: boolean;
    is_logical?: boolean;
    logic_payload?: LogicPayload;
}

export interface AssetMintOrBurnPayload {
    asset_id: string;
    amount: number | bigint;
}

export interface LogicPayload {
    logic_id?: string;
    callsite: string;
    calldata: Uint8Array;
    manifest?: Uint8Array;
}

export type InteractionPayload = AssetCreatePayload | AssetMintOrBurnPayload | LogicPayload;

interface InteractionObject {
    type: IxType;
    nonce?: number | bigint;

    sender?: string;
    receiver?: string;
    payer?: string;

    transfer_values?: Map<string, number | bigint>;
    perceived_values?: Map<string, number | bigint>;

    fuel_price?: number | bigint;
    fuel_limit?: number | bigint;
    
    payload?: InteractionPayload;
}

export interface CallorEstimateIxObject extends InteractionObject {
    nonce: number | bigint;
    sender: string
}

export type CallorEstimateOptions = Record<string, Options>

export interface RpcErrorResponse {
    code: number;
    message: string;
}

export interface RpcResult {
    data?: any
    error?: RpcErrorResponse
}

export interface RpcError {
    code: number,
    message: string,
    data: any
}

export interface RpcResponse {
    jsonrpc: string;
    result: RpcResult;
    error?: RpcError,
    id: 1;
}
