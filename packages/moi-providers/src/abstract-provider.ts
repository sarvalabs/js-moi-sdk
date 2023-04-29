import { Tesseract, LogicManifest, Interaction } from "moi-utils";
import { EventType, Listener } from "../types/event";
import { AccountState, AccountMetaInfo, AssetInfo, ContextInfo, Options, TDU, 
InteractionObject, InteractionResponse, InteractionReceipt, Content, Status, 
Inspect, ContentFrom, Encoding } from "../types/jsonrpc";

export abstract class AbstractProvider {
    // Account Methods
    abstract getBalance(address: string, assetId: string, options?: Options): Promise<number | bigint>
    abstract getContextInfo(address: string, options?: Options): Promise<ContextInfo>
    abstract getTesseract(address: string, with_interactions: boolean, options?: Options): Promise<Tesseract>
    abstract getTDU(address: string, options?: Options): Promise<TDU>
    abstract getInteractionByHash(ixHash: string): Promise<Interaction>
    abstract getInteractionByTesseract(address: string, options?: Options, ix_index?: string): Promise<Interaction>
    abstract getInteractionCount(address: string, options?: Options): Promise<number | bigint>
    abstract getPendingInteractionCount(address: string): Promise<number | bigint>
    abstract getAccountState(address: string, options?: Options): Promise<AccountState>
    abstract getAccountMetaInfo(address: string, options?: Options): Promise<AccountMetaInfo>
    abstract getContentFrom(address: string): Promise<ContentFrom>
    abstract getWaitTime(address: string): Promise<number|bigint>

    // Execution Methods
    // TODO: Update InteractionObject and InteractionResponse
    abstract sendInteraction(ixObject: InteractionObject): Promise<InteractionResponse>

    // Query Methods
    abstract getAssetInfoByAssetID(assetId: string): Promise<AssetInfo>
    abstract getInteractionReceipt(ixHash: string): Promise<InteractionReceipt>
    abstract getStorageAt(logicId: string, storageKey: string, options?: Options): Promise<any>
    abstract getLogicManifest(logicId: string, encoding: Encoding, options?: Options): Promise<string | LogicManifest.Manifest>
    abstract getContent(): Promise<Content>
    abstract getStatus(): Promise<Status>
    abstract getInspect(): Promise<Inspect>
    abstract getPeers(): Promise<string[]>
    abstract getDBEntry(key: string): Promise<string>
    abstract getAccounts(): Promise<string[]>

    abstract waitForInteraction(interactionHash: string, timeout?: number): Promise<InteractionReceipt>
    abstract waitForResult(interactionHash: string, timeout?: number): Promise<any>

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
