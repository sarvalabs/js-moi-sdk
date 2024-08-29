"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserSigner = exports.BrowserProvider = void 0;
const js_moi_providers_1 = require("js-moi-providers");
const js_moi_utils_1 = require("js-moi-utils");
const signer_1 = require("./signer");
class BrowserProvider extends js_moi_providers_1.BaseProvider {
    constructor(browser) {
        super();
        this.execute = async (method, params) => {
            const data = await browser.request(method, params);
            return { id: 1, jsonrpc: "2.0", result: data };
        };
        this.getSigner = async () => {
            return new BrowserSigner(browser);
        };
    }
    async getSigner() {
        const response = await this.execute("moi_RequestSigner", []);
        return this.processResponse(response);
    }
}
exports.BrowserProvider = BrowserProvider;
// @ts-ignore
class BrowserSigner extends signer_1.Signer {
    constructor(browser) {
        super(new BrowserProvider(browser));
        this.sign = browser.sign;
        this.getAddress = browser.getAddress;
        this.connect = () => {
            js_moi_utils_1.ErrorUtils.throwError("Browser signer does not support connecting to a provider", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
        };
        this.isInitialized = browser.isInitialized;
        this.signInteraction = browser.signInteraction;
    }
}
exports.BrowserSigner = BrowserSigner;
//# sourceMappingURL=browser-provider.js.map