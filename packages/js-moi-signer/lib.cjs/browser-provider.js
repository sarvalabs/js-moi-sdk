"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserSigner = exports.BrowserProvider = void 0;
const js_moi_providers_1 = require("js-moi-providers");
const signer_1 = require("./signer");
class BrowserProvider extends js_moi_providers_1.BaseProvider {
    constructor(browser) {
        super();
        this.execute = async (method, params) => {
            const data = await browser.request(method, params);
            return { id: 1, jsonrpc: "2.0", result: data };
        };
    }
    async getSigner() {
        const response = await this.execute("moi_RequestSigner", []);
        return this.processResponse(response);
    }
}
exports.BrowserProvider = BrowserProvider;
class BrowserSigner extends signer_1.Signer {
    constructor() {
        super();
    }
    sign(message) {
        throw new Error("Not implemented");
    }
    getAddress() {
        throw new Error("Method not implemented.");
    }
    connect(provider) {
        throw new Error("Method not implemented.");
    }
    isInitialized() {
        throw new Error("Method not implemented.");
    }
    signInteraction(ixObject, sigAlgo) {
        throw new Error("Method not implemented.");
    }
}
exports.BrowserSigner = BrowserSigner;
//# sourceMappingURL=browser-provider.js.map