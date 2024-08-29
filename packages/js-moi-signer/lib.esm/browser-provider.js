import { BaseProvider } from "js-moi-providers";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
import { Signer } from "./signer";
export class BrowserProvider extends BaseProvider {
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
// @ts-ignore
export class BrowserSigner extends Signer {
    constructor(browser) {
        super(new BrowserProvider(browser));
        this.sign = browser.sign;
        this.getAddress = browser.getAddress;
        this.connect = () => {
            ErrorUtils.throwError("Browser signer does not support connecting to a provider", ErrorCode.UNSUPPORTED_OPERATION);
        };
        this.isInitialized = browser.isInitialized;
        this.signInteraction = browser.signInteraction;
    }
}
//# sourceMappingURL=browser-provider.js.map