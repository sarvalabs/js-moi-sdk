import { Address, AssetId, Hash, LogicId } from "moi-utils";
import { EventType, Listener } from "../types/event";
import { AccountState, AccountMetaInfo, AssetInfo, ContextInfo, Options, TDU, 
InteractionObject, InteractionResponse, InteractionReceipt } from "../types/jsonrpc";

export abstract class AbstractProvider {
    // Account Methods
    abstract getBalance(address: Address, assetId: AssetId, options?: Options): Promise<number | bigint>
    abstract getContextInfo(address: Address, options?: Options): Promise<ContextInfo>
    // TODO: replace any type
    abstract getTesseract(address: Address, with_interactions: boolean, options?: Options): Promise<any>
    abstract getTDU(address: Address, options?: Options): Promise<TDU>
    abstract getInteractionCount(address: Address, options?: Options): Promise<number | bigint>
    abstract getPendingInteractionCount(address: Address): Promise<number | bigint>
    abstract getAccountState(address: Address, options?: Options): Promise<AccountState>
    abstract getAccountMetaInfo(address: Address, options?: Options): Promise<AccountMetaInfo>
    // TODO: replace any type
    abstract getContentFrom(address: Address): Promise<any>
    abstract getWaitTime(address: Address): Promise<number|bigint>

    // Execution Methods
    // TODO: Update InteractionObject and InteractionResponse
    abstract sendInteraction(ixObject: InteractionObject): Promise<InteractionResponse>

    // Query Methods
    abstract getAssetInfoByAssetID(assetId: AssetId): Promise<AssetInfo>
    abstract getInteractionReceipt(ixHash: Hash): Promise<InteractionReceipt>
    // TODO: replace any type
    abstract getStorageAt(logicId: LogicId, storageKey: string, options: Options): Promise<any>
    abstract getLogicManifest(logicId: LogicId): Promise<string>
    // TODO: replace any type
    abstract getContent(): Promise<any>
    abstract getStatus(): Promise<any>
    abstract getInspect(): Promise<any>
    abstract getPeers(): Promise<any>
    abstract getDBEntry(key: string): Promise<any>
    abstract getAccounts(): Promise<any>

    abstract waitForInteraction(interactionHash: Hash, timeout?: number): Promise<InteractionReceipt>
    abstract waitForResult(interactionHash: Hash, timeout?: number): Promise<any>

    // Event Emitter (ish)
    abstract on(eventName: EventType, listener: Listener): AbstractProvider;
    abstract once(eventName: EventType, listener: Listener): AbstractProvider;
    abstract emit(eventName: EventType, ...args: Array<any>): boolean
    abstract listenerCount(eventName?: EventType): number;
    abstract listeners(eventName?: EventType): Array<Listener>;
    abstract off(eventName: EventType, listener?: Listener): AbstractProvider;
    abstract removeAllListeners(eventName?: EventType): AbstractProvider;

    // Alias for "on"
    addListener(eventName: EventType, listener: Listener): AbstractProvider {
        return this.on(eventName, listener);
    }

    // Alias for "off"
    removeListener(eventName: EventType, listener: Listener): AbstractProvider {
        return this.off(eventName, listener);
    }
}
