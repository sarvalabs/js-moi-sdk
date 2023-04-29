import { EventType, Listener } from "../types/event";
export default class Event {
    readonly listener: Listener;
    readonly once: boolean;
    readonly tag: string;
    constructor(tag: string, listener: Listener, once: boolean);
    get event(): EventType;
    get type(): string;
    get address(): string;
    pollable(): boolean;
}
