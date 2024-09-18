import { BaseProvider } from "js-moi-providers";
export class BrowserProvider extends BaseProvider {
    constructor(browser) {
        super();
        this.execute = async (method, params) => {
            return await browser.request(method, [params]);
        };
    }
}
//# sourceMappingURL=browser-provider.js.map