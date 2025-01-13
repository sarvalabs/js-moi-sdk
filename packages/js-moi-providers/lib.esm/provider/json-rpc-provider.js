import { bytesToHex, ensureHexPrefix, ErrorCode, ErrorUtils, interaction, isHex, isValidAddress, LogicId, StorageKey, validateIxRequest, } from "js-moi-utils";
import { EventEmitter } from "events";
export class JsonRpcProvider extends EventEmitter {
    _transport;
    /**
     * Creates a new instance of the provider.
     *
     * @param transport - The transport to use for communication with the network.
     */
    constructor(transport) {
        super();
        if (transport == null) {
            ErrorUtils.throwError("Transport is required", ErrorCode.INVALID_ARGUMENT);
        }
        this._transport = transport;
    }
    /**
     * The transport used to communicate with the network.
     */
    get transport() {
        return this._transport;
    }
    /**
     * Calls a JSON-RPC method on the network using the `request` method and processes the response.
     *
     * @param method - The name of the method to invoke.
     * @param params - The parameters to pass to the method.
     *
     * @returns A promise that resolves processed result from the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    async call(method, ...params) {
        const response = await this.request(method, params);
        return this.processJsonRpcResponse(response);
    }
    /**
     * Sends a JSON-RPC request to the network.
     *
     * @param method - name of the method to invoke.
     * @param params - parameters to pass to the method.
     *
     * @returns A promise that resolves to the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    async request(method, params = []) {
        return await this.transport.request(method, params);
    }
    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     */
    async getNetworkInfo(option) {
        return await this.call("moi.Protocol", option);
    }
    async simulate(ix, option) {
        let encodedIxArgs;
        switch (true) {
            case ix instanceof Uint8Array: {
                encodedIxArgs = bytesToHex(ix);
                break;
            }
            case typeof ix === "object": {
                const result = validateIxRequest(ix);
                if (result != null) {
                    ErrorUtils.throwError(`Invalid interaction request: ${result.message}`, ErrorCode.INVALID_ARGUMENT, { ...result });
                }
                encodedIxArgs = bytesToHex(interaction(ix));
                break;
            }
            case typeof ix === "string": {
                if (!isHex(ix)) {
                    ErrorUtils.throwArgumentError("Must be a valid hex string", "interaction", ix);
                }
                encodedIxArgs = ix;
                break;
            }
            default: {
                ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
            }
        }
        return await this.call("moi.Simulate", {
            interaction: encodedIxArgs,
            ...option,
        });
    }
    async getAccount(identifier, option) {
        if (!isValidAddress(identifier)) {
            ErrorUtils.throwArgumentError("Must be a valid address", "identifier", identifier);
        }
        return await this.call("moi.Account", { identifier, ...option });
    }
    async getTesseractByReference(reference, option) {
        return await this.call("moi.Tesseract", {
            reference: reference,
            ...option,
        });
    }
    async getTesseract(identifier, height, option) {
        const isValidOption = (option) => typeof option === "undefined" || typeof option === "object";
        switch (true) {
            case isValidAddress(identifier) && typeof height === "number" && isValidOption(option): {
                // Getting tesseract by address and height
                if (Number.isNaN(height) || height < -1) {
                    ErrorUtils.throwError("Invalid height value", ErrorCode.INVALID_ARGUMENT);
                }
                return await this.getTesseractByReference({ relative: { identifier: identifier, height } }, option);
            }
            case typeof identifier === "object" && isValidOption(height): {
                // Getting tesseract by reference
                return await this.getTesseractByReference(identifier, height);
            }
            case typeof identifier === "string" && isValidOption(height): {
                // Getting tesseract by hash
                return await this.getTesseractByReference({ absolute: identifier }, height);
            }
        }
        ErrorUtils.throwError("Invalid arguments passed to get correct method signature", ErrorCode.INVALID_ARGUMENT);
    }
    getLogic(value, option) {
        const identifier = typeof value === "string" ? value : value.getAddress();
        if (!isValidAddress(identifier)) {
            ErrorUtils.throwArgumentError("Must be a valid address", "identifier", identifier);
        }
        return this.call("moi.Logic", { identifier, ...option });
    }
    async getLogicStorage(logicId, address, storageId, option) {
        const logicID = typeof logicId === "string" ? new LogicId(logicId) : logicId;
        let params;
        switch (true) {
            case typeof storageId === "undefined" || (typeof storageId === "object" && !(storageId instanceof StorageKey)): {
                // Getting logic storage by logic id and storage key
                const id = typeof address === "string" ? address : address.hex();
                params = [{ storage_id: id, logic_id: logicID.value, ...storageId }];
                break;
            }
            case typeof storageId === "string":
            case storageId instanceof StorageKey: {
                // Getting logic storage by logic id, address, and storage key
                if (!isValidAddress(address)) {
                    ErrorUtils.throwArgumentError("Must be a valid address", "address", address);
                }
                const id = typeof storageId === "string" ? storageId : storageId.hex();
                params = [{ storage_id: id, logic_id: logicID.value, address, ...option }];
                break;
            }
            default: {
                ErrorUtils.throwError("Invalid arguments passed to get correct method signature", ErrorCode.INVALID_ARGUMENT);
            }
        }
        return ensureHexPrefix(await this.call("moi.LogicStorage", ...params));
    }
    /**
     * Processes a JSON-RPC response and returns the result.
     * If the response contains an error, it throws an error with the provided message, code, and data.
     *
     * @template T - The type of the result expected from the JSON-RPC response.
     * @param {JsonRpcResponse<T>} response - The JSON-RPC response to process.
     * @returns {T} - The result from the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    processJsonRpcResponse(response) {
        if ("error" in response) {
            const { data } = response.error;
            const params = data ? (typeof data === "object" ? data : { data }) : {};
            ErrorUtils.throwError(response.error.message, response.error.code, params);
        }
        return response.result;
    }
}
//# sourceMappingURL=json-rpc-provider.js.map