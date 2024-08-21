import {
    AssetCreationReceipt,
    AssetMintOrBurnReceipt,
    AssetStandard,
    TxType,
    LogicDeployReceipt,
    LogicInvokeReceipt,
    LogicEnlistReceipt,
    Participants
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
    asset_registry: string;
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

export type ExecutionResult = AssetCreationReceipt | AssetMintOrBurnReceipt | 
LogicDeployReceipt | LogicInvokeReceipt | LogicEnlistReceipt | null;

export interface TransactionResult {
    tx_type: string;
    status: number;
    data: ExecutionResult
}

export interface InteractionReceipt {
    ix_hash: string;
    status: number;
    fuel_used: string;
    transactions: TransactionResult[];
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
    address?: string
}

export interface StorageParams {
    address?: string;
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

export interface AssetCreatePayload {
    symbol: string;
    supply: number | bigint;
    standard?: AssetStandard;
    dimension?: number;
    is_stateful?: boolean;
    is_logical?: boolean;
    logic_payload?: LogicPayload;
}

export interface AssetSupplyPayload {
    asset_id: string;
    amount: number | bigint;
}

export interface AssetActionPayload {
    benefactor: string;
    beneficiary: string;
    asset_id: string;
    amount: number | bigint;
}
export interface LogicPayload {
    logic_id?: string;
    callsite: string;
    calldata: Uint8Array;
    manifest?: Uint8Array;
}

export type TransactionPayload = AssetCreatePayload | AssetSupplyPayload | AssetActionPayload | LogicPayload | any;

interface IxAssetFund {
    asset_id: string;
    amount: number | bigint;
}

interface IxTransaction {
    type: TxType;
    payload?: TransactionPayload;
}

interface IxParticipant {
    address: string;
    lock_type: number;
}

interface IxPreferences {
    compute: Uint8Array;
    consensus: Uint8Array;
}

interface InteractionObject {
    nonce?: number | bigint;

    sender?: string;
    payer?: string;

    fuel_price?: number | bigint;
    fuel_limit?: number | bigint;
    
    asset_funds?: IxAssetFund[]
    transactions?: IxTransaction[]
    participants?: IxParticipant[]

    perception?: Uint8Array

    preferences?: IxPreferences
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
