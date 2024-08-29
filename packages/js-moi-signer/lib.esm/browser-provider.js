import { BaseProvider } from "js-moi-providers";
import { Signer } from "./signer";
export class BrowserProvider extends BaseProvider {
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
export class BrowserSigner extends Signer {
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
//# sourceMappingURL=browser-provider.js.map