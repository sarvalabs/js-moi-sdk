import { Address, AssetId, Hash } from "moi-utils";

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

interface InteractionPayload {
    type: number;
    symbol: string
    supply: string
}

interface LogicIxPayload {
    manifest: string;
    callsite: string;
    calldata: string
}

interface InteractionObject {
    sender: Address;
    type: number;
    fuel_price: string;
    fuel_limit: string;
    payload: InteractionPayload | LogicIxPayload
}

interface InteractionResponse {
    hash: string;
    wait: (interactionHash: string, timeout?: number) => Promise<InteractionReceipt>
}

interface InteractionReceipt {
    IxType: number;
    IxHash: Hash;
    FuelUsed: number;
    StateHashes: Record<Address, Hash>;
    ContextHashes: Record<Address, Hash>;
    ExtraData: string; 
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

interface LogicManifestParams {
    logic_id: string;
    options: Options;
}

interface ContentObject {
    [address: Address]: {
        [nonce: string]: {
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
    };
}

interface Content {
    pending: ContentObject;
    queued: ContentObject;
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