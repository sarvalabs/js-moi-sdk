import { 
    Address, 
    AssetCreationReceipt, 
    AssetKind, 
    AssetId, 
    Hash, 
    IxType, 
    LogicDeployReceipt, 
    LogicExecuteReceipt 
} from "moi-utils";

interface Options {
    tesseract_number?: number;
    tesseract_hash?: string;
    address?: Address;
}

interface ContextInfo {
    BehaviourNodes: string[];
    RandomNodes: string[];
    StorageNodes: string[];
}

interface TDU {
    [assetId: AssetId]: number | bigint;
}

interface AccountState {
    Nonce: number | bigint;
    AccType: number;
    Balance: string;
    AssetApprovals: string;
    ContextHash: string;
    StorageRoot: string;
    LogicRoot: string;
    FileRoot: string
}

interface AccountMetaInfo {
    Type: number;
    Mode: string;
    Address: Address;
    Height: number | bigint;
    TesseractHash: string;
    LatticeExists: boolean;
    StateExists: boolean;
}

interface AssetCreationPayload {
    type: AssetKind;
    symbol: string;
    supply: string;
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
    sender: Address;
    receiver?: Address;
    payer?: Address;
    transfer_values?: Map<AssetId, string>;
    perceived_values?: Map<AssetId, string>;
    fuel_price: string;
    fuel_limit: string;
    payload: AssetCreationPayload | LogicDeployPayload | LogicInvokePayload
}

interface InteractionResponse {
    hash: string;
    wait: (interactionHash: string, timeout?: number) => Promise<InteractionReceipt>,
    result: (interactionHash: string, timeout?: number) => Promise<any>
}

interface InteractionReceipt {
    IxType: number;
    IxHash: Hash;
    FuelUsed: number;
    StateHashes: Record<Address, Hash>;
    ContextHashes: Record<Address, Hash>;
    ExtraData: AssetCreationReceipt | LogicDeployReceipt | LogicExecuteReceipt | null;
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
    from: Address,
    options?: Options 
}

interface AccountStateParams {
    address: Address,
    options?: Options 
}

interface BalanceParams extends AccountParamsBase {
    assetid: AssetId,
}

interface TesseractParams extends AccountParamsBase {
    with_interactions: boolean
}

interface AssetInfoParams {
    asset_id: AssetId 
}

interface InteractionReceiptParams {
    hash: Hash
}

interface StorageParams {
    logic_id: string;
    "storage-key": string;
    options: Options;
}

interface DBEntryParams {
    key: string;
}

// Type alias for encoding type
type Encoding = "JSON" | "POLO" | "YAML";

interface LogicManifestParams {
    logic_id: string;
    encoding: Encoding;
    options: Options;
}

interface InteractionInfo {
    Nonce: number;
    Type: number;
    Sender: string;
    Receiver: string;
    Cost: bigint;
    FuelPrice: bigint;
    FuelLimit: bigint;
    Input: string;
    Hash: string;
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
