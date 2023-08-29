import { LogicManifest } from "js-moi-manifest";
import { Tesseract, Interaction } from "js-moi-utils";
import { EventType, Listener } from "../types/event";
import { AccountState, AccountMetaInfo, AssetInfo, ContextInfo, Options, TDU, 
InteractionRequest, InteractionResponse, InteractionReceipt, Content, Status, 
Inspect, ContentFrom, Encoding, Registry, CallorEstimateIxObject, ConnectionsInfo, CallorEstimateOptions, NodeInfo, InteractionCallResponse, SyncStatus } from "../types/jsonrpc";

/**
 * Abstract class representing a provider for interacting with the MOI protocol.
 * Provides methods for account operations, execution, and querying.
 */
export abstract class AbstractProvider {
    // Account Methods
    abstract getBalance(address: string, assetId: string, options?: Options): Promise<number | bigint>
    abstract getContextInfo(address: string, options?: Options): Promise<ContextInfo>
    abstract getTesseract(address: string, with_interactions: boolean, options?: Options): Promise<Tesseract>
    abstract getTDU(address: string, options?: Options): Promise<TDU[]>
    abstract getInteractionByHash(ixHash: string): Promise<Interaction>
    abstract getInteractionByTesseract(address: string, options?: Options, ix_index?: string): Promise<Interaction>
    abstract getInteractionCount(address: string, options?: Options): Promise<number | bigint>
    abstract getPendingInteractionCount(address: string): Promise<number | bigint>
    abstract getAccountState(address: string, options?: Options): Promise<AccountState>
    abstract getAccountMetaInfo(address: string, options?: Options): Promise<AccountMetaInfo>
    abstract getLogicIds(address: string, options?: Options): Promise<string[]>
    abstract getRegistry(address: string, options?: Options): Promise<Registry>
    abstract getSyncStatus(address: string): Promise<SyncStatus>
    abstract getContentFrom(address: string): Promise<ContentFrom>
    abstract getWaitTime(address: string): Promise<number|bigint>

    // Execution Methods
    abstract call(ixObject: CallorEstimateIxObject, options?: CallorEstimateOptions): Promise<InteractionCallResponse>
    abstract estimateFuel(ixObject: CallorEstimateIxObject, options?: CallorEstimateOptions): Promise<number | bigint>
    abstract sendInteraction(ixObject: InteractionRequest): Promise<InteractionResponse>

    // Query Methods
    abstract getAssetInfoByAssetID(assetId: string): Promise<AssetInfo>
    abstract getInteractionReceipt(ixHash: string): Promise<InteractionReceipt>
    abstract getStorageAt(logicId: string, storageKey: string, options?: Options): Promise<any>
    abstract getLogicManifest(logicId: string, encoding: Encoding, options?: Options): Promise<string | LogicManifest.Manifest>
    abstract getContent(): Promise<Content>
    abstract getStatus(): Promise<Status>
    abstract getInspect(): Promise<Inspect>
    abstract getPeers(): Promise<string[]>
    abstract getVersion(): Promise<string>
    abstract getNodeInfo(): Promise<NodeInfo>
    abstract getDBEntry(key: string): Promise<string>
    abstract getAccounts(): Promise<string[]>
    abstract getConnections(): Promise<ConnectionsInfo>

    // Event Emitter (ish)
    abstract on(eventName: EventType, listener: Listener): AbstractProvider;
    abstract once(eventName: EventType, listener: Listener): AbstractProvider;
    abstract listenerCount(eventName?: EventType): number;
    abstract listeners(eventName?: EventType): Array<Listener>;
    abstract off(eventName: EventType, listener?: Listener): AbstractProvider;
    abstract removeAllListeners(eventName?: EventType): AbstractProvider;

    // Alias for "on"

    /**
     * Alias for "on" method.
     * 
     * @param eventName - The name of the event.
     * @param listener - The listener function to be called when the event is emitted.
     * @returns The provider instance for chaining.
     */
    addListener(eventName: EventType, listener: Listener): AbstractProvider {
        return this.on(eventName, listener);
    }

    // Alias for "off"

    /**
     * Alias for "off" method.
     * 
     * @param eventName - The name of the event.
     * @param listener - The listener function to be unregistered.
     * @returns The provider instance for chaining.
     */
    removeListener(eventName: EventType, listener: Listener): AbstractProvider {
        return this.off(eventName, listener);
    }
}
