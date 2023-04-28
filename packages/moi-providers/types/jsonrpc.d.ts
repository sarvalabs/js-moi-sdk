import { 
    AssetCreationReceipt, 
    AssetKind, 
    Hex,
    IxType, 
    LogicDeployReceipt, 
    LogicExecuteReceipt 
} from "moi-utils";

interface Options {
    tesseract_number?: number;
    tesseract_hash?: string;
    address?: string;
}

interface ContextInfo {
    behaviour_nodes: string[];
    random_nodes: string[];
    storage_nodes: string[];
}

interface TDU {
    [assetId: string]: number | bigint;
}

interface AccountState {
    nonce: number | bigint;
    acc_type: number;
    balance: string;
    asset_approvals: string;
    context_hash: string;
    storage_root: string;
    logic_root: string;
    file_root: string
}

interface AccountMetaInfo {
    type: number;
    mode: string;
    address: string;
    height: number | bigint;
    tesseract_hash: string;
    lattice_exists: boolean;
    state_exists: boolean;
}

interface AssetCreationPayload {
    type: AssetKind;
    symbol: string;
    supply: Hex;
    dimension?: number;
    decimals?: number;
    is_fungible?: boolean;
    is_mintable?: boolean;
    is_transferable?: boolean;
    logic_id?: string;
}

interface LogicDeployPayload {
    manifest: string;
    callsite: string;
    calldata: string
}

interface LogicInvokePayload {
    logic_id: string;
    callsite: string;
    calldata: string;
}

interface InteractionObject {
    type: IxType;
    nonce?: number | bigint;
    sender: string;
    receiver?: string;
    payer?: string;
    transfer_values?: Map<string, Hex>;
    perceived_values?: Map<string, Hex>;
    fuel_price: Hex;
    fuel_limit: Hex;
    payload: AssetCreationPayload | LogicDeployPayload | LogicInvokePayload
}

interface InteractionResponse {
    hash: string;
    wait: (interactionHash: string, timeout?: number) => Promise<InteractionReceipt>,
    result: (interactionHash: string, timeout?: number) => Promise<any>
}

interface InteractionReceipt {
    ix_type: number;
    ix_hash: string;
    fuel_used: number;
    state_hashes: Record<string, string>;
    context_hashes: Record<string, string>;
    extra_data: AssetCreationReceipt | LogicDeployReceipt | LogicExecuteReceipt | null;
}

interface AssetInfo {
    type: number;
    symbol: string;
    owner: string;
    total_supply: number | bigint
    dimension: number
    decimals: number
    is_fungible: boolean
    is_mintable: boolean
    is_transferable: boolean
    logic_id: string
}

interface AccountParamsBase {
    address: string,
    options?: Options 
}

interface AccountStateParams {
    address: string,
    options?: Options 
}

interface BalanceParams extends AccountParamsBase {
    asset_id: string,
}

interface TesseractParams extends AccountParamsBase {
    with_interactions: boolean
}

interface AssetInfoParams {
    asset_id: string 
}

interface InteractionReceiptParams {
    hash: string
}

interface StorageParams {
    logic_id: string;
    storage_key: string;
    options: Options;
}

interface DBEntryParams {
    key: string;
}

// Type alias for encoding type
type Encoding = "JSON" | "POLO";

interface LogicManifestParams {
    logic_id: string;
    encoding: Encoding;
    options: Options;
}

interface InteractionInfo {
    nonce: number;
    type: number;
    sender: string;
    receiver: string;
    cost: bigint;
    fuel_price: bigint;
    fuel_limit: bigint;
    input: string;
    hash: string;
}

interface Content {
    pending: Map<string, Map<bigint, InteractionInfo>>;
    queued: Map<string, Map<bigint, InteractionInfo>>;
}

interface ContentFrom {
    pending: Map<bigint, InteractionInfo>;
    queued: Map<bigint, InteractionInfo>;
}

interface Status {
    pending: number | bigint;
    queued: number | bigint;
}

interface Inspect {
    pending: Map<string, Map<string, string>>;
    queued: Map<string, Map<string, string>>;
    wait_time: Map<string, number | bigint>;
}

interface RpcErrorResponse {
    code: number;
    message: string;
}

interface RpcResult {
    data?: any
    error?: RpcErrorResponse
}

interface RpcError {
    code: number,
    message: string,
    data: any
}

interface RpcResponse {
    jsonrpc: string;
    result: RpcResult;
    error?: RpcError,
    id: 1;
}
