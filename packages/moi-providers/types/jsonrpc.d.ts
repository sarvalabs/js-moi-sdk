import { 
    AssetKind,
    AssetCreationReceipt,
    AssetMintOrBurnReceipt, 
    LogicDeployReceipt, 
    LogicExecuteReceipt 
} from "moi-utils";

export interface Options {
    tesseract_number?: number;
    tesseract_hash?: string;
    address?: string;
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
    extra_data: AssetCreationReceipt | AssetMintOrBurnReceipt | LogicDeployReceipt | LogicExecuteReceipt | null;
    from: string;
    to: string;
    ix_index: string;
    parts: string;
}

export interface AssetInfo {
    type: AssetKind;
    symbol: string;
    owner: string;
    supply: string;
    dimension: string
    standard: string
    is_logical: boolean
    is_stateful: boolean
    logic_id?: string
}

export interface Registry {
    asset_id: string;
    asset_info: AssetInfo;
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
    asset_id: string 
}

export interface InteractionParams {
    hash: string
}

export interface InteractionByTesseractParams extends AccountParamsBase {
    ix_index: string
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
