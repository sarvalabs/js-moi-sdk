"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = void 0;
const moi_utils_1 = require("moi-utils");
const moi_utils_2 = require("moi-utils");
const moi_utils_3 = require("moi-utils");
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
            moi_utils_2.Errors.throwError(response.result.error.message, moi_utils_2.ErrorCode.SERVER_ERROR);
        }
        moi_utils_2.Errors.throwError(response.error.message, moi_utils_2.ErrorCode.SERVER_ERROR);
    }
    // Account Methods
    async getBalance(address, assetId, options) {
        const params = {
            from: address,
            assetid: assetId,
            options: options ? options : this.defaultOptions
        };
        const response = await this.execute("moi.Balance", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getContextInfo(address, options) {
        const params = {
            from: address,
            options: options ? options : this.defaultOptions
        };
        const response = await this.execute("moi.ContextInfo", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getTDU(address, options) {
        const params = {
            from: address,
            options: options ? options : this.defaultOptions
        };
        const response = await this.execute("moi.TDU", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getInteractionCount(address, options) {
        const params = {
            from: address,
            options: options ? options : this.defaultOptions
        };
        const response = await this.execute("moi.InteractionCount", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getPendingInteractionCount(address) {
        const params = {
            from: address
        };
        const response = await this.execute("moi.PendingInteractionCount", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getAccountState(address, options) {
        const params = {
            address: address,
            options: options ? options : this.defaultOptions
        };
        const response = await this.execute("moi.AccountState", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getAccountMetaInfo(address, options) {
        const params = {
            address: address,
            options: options ? options : this.defaultOptions
        };
        const response = await this.execute("moi.AccountMetaInfo", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getContentFrom(address) {
        const params = {
            from: address
        };
        const response = await this.execute("ixpool.ContentFrom", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getWaitTime(address) {
        const params = {
            from: address
        };
        const response = await this.execute("ixpool.WaitTime", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getTesseract(address, with_interactions, options) {
        const params = {
            from: address,
            with_interactions: with_interactions,
            options: options ? options : this.defaultOptions
        };
        const response = await this.execute("moi.Tesseract", params);
        try {
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
                        wait: this.waitForInteraction.bind(this)
                    };
                }
                moi_utils_2.Errors.throwError(response.result.error.message, moi_utils_2.ErrorCode.SERVER_ERROR);
            }
            moi_utils_2.Errors.throwError(response.error.message, moi_utils_2.ErrorCode.SERVER_ERROR);
        }
        catch (error) {
            throw new Error("bad result form backend");
        }
    }
    // Query Methods
    async getAssetInfoByAssetID(assetId) {
        const params = {
            asset_id: assetId
        };
        const response = await this.execute("moi.AssetInfoByAssetID", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getInteractionReceipt(ixHash) {
        const params = {
            hash: ixHash
        };
        const response = await this.execute("moi.InteractionReceipt", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getStorageAt(logicId, storageKey, options) {
        const params = {
            logic_id: logicId,
            "storage-key": storageKey,
            options: options ? options : this.defaultOptions
        };
        const response = await this.execute("moi.StorageAt", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getLogicManifest(logicId) {
        const params = {
            logic_id: logicId,
            options: this.defaultOptions
        };
        const response = await this.execute("moi.LogicManifest", params);
        try {
            const data = this.processResponse(response);
            const decodedManifest = (0, moi_utils_3.decodeBase64)(data);
            return (0, moi_utils_1.bytesToHex)(decodedManifest);
        }
        catch (error) {
            throw error;
        }
    }
    async getContent() {
        const response = await this.execute("ixpool.Content", null);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getStatus() {
        const response = await this.execute("ixpool.Status", null);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getInspect() {
        const response = await this.execute("ixpool.Inspect", null);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getPeers() {
        const response = await this.execute("net.Peers", null);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getDBEntry(key) {
        const params = {
            key: key
        };
        const response = await this.execute("debug.DBGet", params);
        try {
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    async getAccounts() {
        const response = await this.execute("debug.GetAccounts", null);
        try {
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
            return "tx:" + eventName;
        }
        if (eventName.indexOf(":") === -1) {
            return eventName;
        }
    }
    throw new Error("invalid event - " + eventName);
}
