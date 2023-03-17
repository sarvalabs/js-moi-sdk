import HttpProvider from "moi-http-provider";
import { Providers } from "../types/providers";

export default class RequestManager {
    public providers: Providers

    constructor(provider: string) {
        this.providers = {
            httpProvider: new HttpProvider(provider)
        }
    }

    public send = (payload: any): any => {
        return this.providers.httpProvider.send(payload)
    }
}
