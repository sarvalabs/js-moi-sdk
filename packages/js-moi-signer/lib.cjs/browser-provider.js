"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserProvider = void 0;
const js_moi_providers_1 = require("js-moi-providers");
class BrowserProvider extends js_moi_providers_1.BaseProvider {
    constructor(browser) {
        super();
        this.execute = async (method, params) => {
            return await browser.request(method, [params]);
        };
    }
}
exports.BrowserProvider = BrowserProvider;
//# sourceMappingURL=browser-provider.js.map