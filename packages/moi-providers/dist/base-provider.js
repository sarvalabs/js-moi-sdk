"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = void 0;
const moi_utils_1 = require("moi-utils");
const abstract_provider_1 = require("./abstract-provider");
const event_1 = __importDefault(require("./event"));
const defaultTimeout = 120;
class BaseProvider extends abstract_provider_1.AbstractProvider {
    _events;
    defaultOptions = {
        tesseract_number: -1
    };
    constructor() {
        super();
        // Events being listened to
        this._events = [];
    }
    processResponse(response) {
        if (response.result) {
            if (response.result.data) {
                return response.result.data;
            }
            moi_utils_1.ErrorUtils.throwError(response.result.error.message, moi_utils_1.ErrorCode.SERVER_ERROR);
        }
        moi_utils_1.ErrorUtils.throwError(response.error.message, moi_utils_1.ErrorCode.SERVER_ERROR);
    }
    // Account Methods
    async getBalance(address, assetId, options) {
        try {
            const params = {
                address: address,
                asset_id: assetId,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.Balance", params);
            const balance = this.processResponse(response);
            return (0, moi_utils_1.hexToBN)(balance);
        }
        catch (error) {
            throw error;
        }
    }
    async getContextInfo(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.ContextInfo", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getTDU(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.TDU", params);
            const tdu = this.processResponse(response);
            Object.keys(tdu).forEach((assetId) => {
                tdu[assetId] = (0, moi_utils_1.hexToBN)(tdu[assetId]);
            });
            return tdu;
        }
        catch (error) {
            throw error;
        }
    }
    async getInteractionByHash(ixHash) {
        try {
            const params = {
                hash: ixHash
            };
            const response = await this.execute("moi.InteractionByHash", params);
            return this.processResponse(response);
        }
        catch (err) {
            throw err;
        }
    }
    async getInteractionByTesseract(address, options, ix_index = (0, moi_utils_1.toQuantity)(1)) {
        try {
            const params = {
                address: address,
                options: options ? options : this.defaultOptions,
                ix_index: ix_index
            };
            const response = await this.execute("moi.InteractionByTesseract", params);
            return this.processResponse(response);
        }
        catch (err) {
            throw err;
        }
    }
    async getInteractionCount(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.InteractionCount", params);
            const ixCount = this.processResponse(response);
            return (0, moi_utils_1.hexToBN)(ixCount);
        }
        catch (error) {
            throw error;
        }
    }
    async getPendingInteractionCount(address) {
        try {
            const params = {
                address: address
            };
            const response = await this.execute("moi.PendingInteractionCount", params);
            const ixCount = this.processResponse(response);
            return (0, moi_utils_1.hexToBN)(ixCount);
        }
        catch (error) {
            throw error;
        }
    }
    async getAccountState(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.AccountState", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getAccountMetaInfo(address) {
        try {
            const params = {
                address: address
            };
            const response = await this.execute("moi.AccountMetaInfo", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getContentFrom(address) {
        try {
            const params = {
                address: address
            };
            const response = await this.execute("ixpool.ContentFrom", params);
            const content = this.processResponse(response);
            const contentResponse = {
                pending: new Map(),
                queued: new Map(),
            };
            Object.keys(content.pending).forEach(nonce => contentResponse.pending.set((0, moi_utils_1.hexToBN)(nonce), content.pending[nonce]));
            Object.keys(content.queued).forEach(nonce => contentResponse.queued.set((0, moi_utils_1.hexToBN)(nonce), content.queued[nonce]));
            return contentResponse;
        }
        catch (error) {
            throw error;
        }
    }
    async getWaitTime(address) {
        try {
            const params = {
                address: address
            };
            const response = await this.execute("ixpool.WaitTime", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getTesseract(address, with_interactions, options) {
        try {
            const params = {
                address: address,
                with_interactions: with_interactions,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.Tesseract", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getRegistry(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.Registry", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    // Execution Methods
    async sendInteraction(ixObject) {
        const response = await this.execute("moi.SendInteractions", ixObject);
        try {
            if (response.result) {
                if (response.result.data) {
                    return {
                        hash: response.result.data,
                        wait: this.waitForInteraction.bind(this),
                        result: this.waitForResult.bind(this)
                    };
                }
                moi_utils_1.ErrorUtils.throwError(response.result.error.message, moi_utils_1.ErrorCode.SERVER_ERROR);
            }
            moi_utils_1.ErrorUtils.throwError(response.error.message, moi_utils_1.ErrorCode.SERVER_ERROR);
        }
        catch (error) {
            throw error;
        }
    }
    // Query Methods
    async getAssetInfoByAssetID(assetId) {
        try {
            const params = {
                asset_id: assetId
            };
            const response = await this.execute("moi.AssetInfoByAssetID", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getInteractionReceipt(ixHash) {
        try {
            const params = {
                hash: ixHash
            };
            const response = await this.execute("moi.InteractionReceipt", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getStorageAt(logicId, storageKey, options) {
        try {
            const params = {
                logic_id: logicId,
                storage_key: storageKey,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.Storage", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getLogicManifest(logicId, encoding, options) {
        try {
            const params = {
                logic_id: logicId,
                encoding: encoding,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.LogicManifest", params);
            const data = this.processResponse(response);
            const decodedManifest = (0, moi_utils_1.hexToBytes)(data);
            switch (encoding) {
                case "JSON":
                    return (0, moi_utils_1.unmarshal)(decodedManifest);
                case "POLO":
                    return (0, moi_utils_1.bytesToHex)(decodedManifest);
                default:
                    throw new Error("Unsupported encoding format!");
            }
        }
        catch (error) {
            throw error;
        }
    }
    async getContent() {
        try {
            const response = await this.execute("ixpool.Content", null);
            const content = this.processResponse(response);
            const contentResponse = {
                pending: new Map(),
                queued: new Map(),
            };
            Object.keys(content.pending).forEach(key => {
                contentResponse.pending.set(key, new Map());
                Object.keys(content.pending[key]).forEach(nonce => contentResponse.pending.get(key).set((0, moi_utils_1.hexToBN)(nonce), content.pending[key][nonce]));
            });
            Object.keys(content.queued).forEach(key => {
                contentResponse.queued.set(key, new Map());
                Object.keys(content.queued[key]).forEach(nonce => contentResponse.queued.get(key).set((0, moi_utils_1.hexToBN)(nonce), content.queued[key][nonce]));
            });
            return contentResponse;
        }
        catch (error) {
            throw error;
        }
    }
    async getStatus() {
        try {
            const response = await this.execute("ixpool.Status", null);
            const status = this.processResponse(response);
            return {
                pending: (0, moi_utils_1.hexToBN)(status.pending),
                queued: (0, moi_utils_1.hexToBN)(status.queued)
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getInspect() {
        try {
            const response = await this.execute("ixpool.Inspect", null);
            const inspect = this.processResponse(response);
            const inspectResponse = {
                pending: new Map(),
                queued: new Map(),
                wait_time: new Map()
            };
            Object.keys(inspect.pending).forEach(key => {
                inspectResponse.pending.set(key, new Map(Object.entries(inspect.pending[key])));
            });
            Object.keys(inspect.queued).forEach(key => {
                inspectResponse.queued.set(key, new Map(Object.entries(inspect.queued[key])));
            });
            Object.keys(inspectResponse.wait_time).forEach(key => {
                inspectResponse.wait_time.set(key, {
                    ...inspectResponse.wait_time[key],
                    time: (0, moi_utils_1.hexToBN)(inspectResponse.wait_time[key]["time"])
                });
            });
            return inspectResponse;
        }
        catch (error) {
            throw error;
        }
    }
    async getPeers() {
        try {
            const response = await this.execute("net.Peers", null);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getDBEntry(key) {
        try {
            const params = {
                key: key
            };
            const response = await this.execute("debug.DBGet", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getAccounts() {
        try {
            const response = await this.execute("debug.Accounts", null);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async waitForInteraction(interactionHash, timeout) {
        if (timeout == undefined) {
            timeout = defaultTimeout;
        }
        return new Promise(async (resolve, reject) => {
            let intervalId;
            let timeoutId;
            const checkReceipt = async () => {
                try {
                    const receipt = await this.getInteractionReceipt(interactionHash);
                    if (receipt) {
                        resolve(receipt);
                        clearInterval(intervalId);
                        clearTimeout(timeoutId);
                    }
                }
                catch (err) {
                }
            };
            await checkReceipt();
            intervalId = setInterval(checkReceipt, 5000);
            timeoutId = setTimeout(() => {
                clearInterval(intervalId);
                reject({ message: "failed to fetch receipt" });
            }, timeout * 1000);
        });
    }
    async waitForResult(interactionHash, timeout) {
        return new Promise(async (resolve, reject) => {
            try {
                const receipt = await this.waitForInteraction(interactionHash, timeout);
                switch ((0, moi_utils_1.hexToBN)(receipt.ix_type)) {
                    case moi_utils_1.IxType.VALUE_TRANSFER:
                        resolve(null);
                        break;
                    case moi_utils_1.IxType.ASSET_CREATE:
                        if (receipt.extra_data) {
                            receipt.extra_data = receipt.extra_data;
                            resolve(receipt.extra_data.asset_id);
                        }
                        reject({ message: "asset id not found" });
                        break;
                    case moi_utils_1.IxType.ASSET_MINT:
                    case moi_utils_1.IxType.ASSET_BURN:
                        if (receipt.extra_data) {
                            receipt.extra_data = receipt.extra_data;
                            resolve(receipt.extra_data["total_supply"]);
                        }
                        reject({ message: "total supply not found" });
                        break;
                    case moi_utils_1.IxType.LOGIC_DEPLOY:
                        if (receipt.extra_data) {
                            receipt.extra_data = receipt.extra_data;
                            resolve(receipt.extra_data);
                        }
                        reject({
                            message: "invalid logic deploy response",
                            error: null
                        });
                        break;
                    case moi_utils_1.IxType.LOGIC_INVOKE:
                        if (receipt.extra_data) {
                            receipt.extra_data = receipt.extra_data;
                            resolve(receipt.extra_data);
                        }
                        reject({
                            message: "invalid logic invoke response",
                            error: null
                        });
                        break;
                    default:
                        reject({
                            message: "unsupported interaction type",
                            error: null
                        });
                }
            }
            catch (err) {
                throw err;
            }
        });
    }
    execute(method, params) {
        throw new Error(method + " not implemented");
    }
    _startEvent(event) {
    }
    _stopEvent(event) {
    }
    _addEventListener(eventName, listener, once) {
        const event = new event_1.default(getEventTag(eventName), listener, once);
        this._events.push(event);
        this._startEvent(event);
        return this;
    }
    on(eventName, listener) {
        return this._addEventListener(eventName, listener, false);
    }
    once(eventName, listener) {
        return this._addEventListener(eventName, listener, true);
    }
    emit(eventName, ...args) {
        let result = false;
        let stopped = [];
        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag) {
                return true;
            }
            setTimeout(() => {
                event.listener.apply(this, args);
            }, 0);
            result = true;
            if (event.once) {
                stopped.push(event);
                return false;
            }
            return true;
        });
        stopped.forEach((event) => { this._stopEvent(event); });
        return result;
    }
    listenerCount(eventName) {
        if (!eventName) {
            return this._events.length;
        }
        let eventTag = getEventTag(eventName);
        return this._events.filter((event) => {
            return (event.tag === eventTag);
        }).length;
    }
    listeners(eventName) {
        if (eventName == null) {
            return this._events.map((event) => event.listener);
        }
        let eventTag = getEventTag(eventName);
        return this._events
            .filter((event) => (event.tag === eventTag))
            .map((event) => event.listener);
    }
    off(eventName, listener) {
        if (listener == null) {
            return this.removeAllListeners(eventName);
        }
        const stopped = [];
        let found = false;
        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag || event.listener != listener) {
                return true;
            }
            if (found) {
                return true;
            }
            found = true;
            stopped.push(event);
            return false;
        });
        stopped.forEach((event) => { this._stopEvent(event); });
        return this;
    }
    removeAllListeners(eventName) {
        let stopped = [];
        if (eventName == null) {
            stopped = this._events;
            this._events = [];
        }
        else {
            const eventTag = getEventTag(eventName);
            this._events = this._events.filter((event) => {
                if (event.tag !== eventTag) {
                    return true;
                }
                stopped.push(event);
                return false;
            });
        }
        stopped.forEach((event) => { this._stopEvent(event); });
        return this;
    }
}
exports.BaseProvider = BaseProvider;
const getEventTag = (eventName) => {
    if (typeof (eventName) === "string") {
        eventName = eventName.toLowerCase();
        if ((0, moi_utils_1.hexDataLength)(eventName) === 32) {
            return "tesseract:" + eventName;
        }
        if (eventName.indexOf(":") === -1) {
            return eventName;
        }
    }
    throw new Error("invalid event - " + eventName);
};
