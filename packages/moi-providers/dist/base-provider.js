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
    _pollingInterval;
    _poller;
    _bootstrapPoll;
    defaultOptions = {
        tesseract_number: -1
    };
    constructor() {
        super();
        // Events being listened to
        this._events = [];
        this._pollingInterval = 4000;
    }
    processResponse(response) {
        if (response.result) {
            if (response.result.data) {
                return response.result.data;
            }
            moi_utils_1.Errors.throwError(response.result.error.message, moi_utils_1.ErrorCode.SERVER_ERROR);
        }
        moi_utils_1.Errors.throwError(response.error.message, moi_utils_1.ErrorCode.SERVER_ERROR);
    }
    // Account Methods
    async getBalance(address, assetId, options) {
        try {
            const params = {
                from: address,
                assetid: assetId,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.Balance", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getContextInfo(address, options) {
        try {
            const params = {
                from: address,
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
                from: address,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.TDU", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getInteractionCount(address, options) {
        try {
            const params = {
                from: address,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.InteractionCount", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getPendingInteractionCount(address) {
        try {
            const params = {
                from: address
            };
            const response = await this.execute("moi.PendingInteractionCount", params);
            return this.processResponse(response);
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
    async getAccountMetaInfo(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : this.defaultOptions
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
                from: address
            };
            const response = await this.execute("ixpool.ContentFrom", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getWaitTime(address) {
        try {
            const params = {
                from: address
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
                from: address,
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
                moi_utils_1.Errors.throwError(response.result.error.message, moi_utils_1.ErrorCode.SERVER_ERROR);
            }
            moi_utils_1.Errors.throwError(response.error.message, moi_utils_1.ErrorCode.SERVER_ERROR);
        }
        catch (error) {
            throw new Error("bad result form backend");
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
                "storage-key": storageKey,
                options: options ? options : this.defaultOptions
            };
            const response = await this.execute("moi.StorageAt", params);
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
            const decodedManifest = (0, moi_utils_1.decodeBase64)(data);
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
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getStatus() {
        try {
            const response = await this.execute("ixpool.Status", null);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getInspect() {
        try {
            const response = await this.execute("ixpool.Inspect", null);
            return this.processResponse(response);
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
            const response = await this.execute("debug.GetAccounts", null);
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
                switch (receipt.IxType) {
                    case moi_utils_1.IxType.VALUE_TRANSFER:
                        resolve(null);
                        break;
                    case moi_utils_1.IxType.ASSET_CREATE:
                        if (receipt.ExtraData) {
                            receipt.ExtraData = receipt.ExtraData;
                            resolve(receipt.ExtraData.asset_id);
                        }
                        reject({ message: "asset id not found" });
                        break;
                    case moi_utils_1.IxType.LOGIC_DEPLOY:
                        if (receipt.ExtraData) {
                            receipt.ExtraData = receipt.ExtraData;
                            resolve(receipt.ExtraData.logic_id);
                        }
                        reject({ message: "logic id not found" });
                        break;
                    case moi_utils_1.IxType.LOGIC_INVOKE:
                        if (receipt.ExtraData) {
                            receipt.ExtraData = receipt.ExtraData;
                            resolve(receipt.ExtraData.return_data);
                        }
                        reject({ message: "invalid logic invoke response" });
                        break;
                    default:
                        moi_utils_1.Errors.throwError("Unsupported interaction type", moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
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
        this.polling = (this._events.filter((e) => e.pollable()).length > 0);
    }
    _stopEvent(event) {
        this.polling = (this._events.filter((e) => e.pollable()).length > 0);
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
    get polling() {
        return (this._poller != null);
    }
    set polling(value) {
        if (value && !this._poller) {
            this._poller = setInterval(() => { this.poll(); }, this.pollingInterval);
            if (!this._bootstrapPoll) {
                this._bootstrapPoll = setTimeout(() => {
                    this.poll();
                    // We block additional polls until the polling interval
                    // is done, to prevent overwhelming the poll function
                    this._bootstrapPoll = setTimeout(() => {
                        // If polling was disabled, something may require a poke
                        // since starting the bootstrap poll and it was disabled
                        if (!this._poller) {
                            this.poll();
                        }
                        // Clear out the bootstrap so we can do another
                        this._bootstrapPoll = null;
                    }, this.pollingInterval);
                }, 0);
            }
        }
        else if (!value && this._poller) {
            clearInterval(this._poller);
            this._poller = null;
        }
    }
    async poll() {
    }
    get pollingInterval() {
        return this._pollingInterval;
    }
    set pollingInterval(value) {
        if (typeof (value) !== "number" || value <= 0 || parseInt(String(value)) != value) {
            throw new Error("invalid polling interval");
        }
        this._pollingInterval = value;
        if (this._poller) {
            clearInterval(this._poller);
            this._poller = setInterval(() => { this.poll(); }, this._pollingInterval);
        }
    }
}
exports.BaseProvider = BaseProvider;
function getEventTag(eventName) {
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
}
