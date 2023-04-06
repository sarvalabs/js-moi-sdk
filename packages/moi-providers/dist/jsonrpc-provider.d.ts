import { BaseProvider } from "./base-provider";
import Event from "./event";
export declare class JsonRpcProvider extends BaseProvider {
    host: string;
    constructor(host: string);
    execute(method: string, params: any): Promise<any>;
    send(method: string, params: any[]): Promise<any>;
    _startEvent(event: Event): void;
    _stopEvent(event: Event): void;
}
