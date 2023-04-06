import { EventType, Filter, Listener } from "../types/event";
export default class Event {
    readonly listener: Listener;
    readonly once: boolean;
    readonly tag: string;
    _lastBlockNumber: number;
    _inflight: boolean;
    constructor(tag: string, listener: Listener, once: boolean);
    get event(): EventType;
    get type(): string;
    get address(): string;
    get hash(): string;
    get filter(): Filter;
    pollable(): boolean;
}
