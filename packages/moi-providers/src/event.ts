import { EventType, Filter, Listener } from "../types/event";

const PollableEvents = [ "block", "network", "pending", "poll" ];

function defineReadOnly<T, K extends keyof T>(object: T, name: K, value: T[K]): void {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}

function deserializeTopics(data: string): Array<string | Array<string>> {
    if (data === "") { return [ ]; }

    return data.split(/&/g).map((topic) => {
        if (topic === "") { return [ ]; }

        const comps = topic.split("|").map((topic) => {
            return ((topic === "null") ? null: topic);
        });

        return ((comps.length === 1) ? comps[0]: comps);
    });
}

export default class Event {
    readonly listener: Listener;
    readonly once: boolean;
    readonly tag: string;

    _lastBlockNumber: number
    _inflight: boolean;

    constructor(tag: string, listener: Listener, once: boolean) {
        defineReadOnly(this, "tag", tag);
        defineReadOnly(this, "listener", listener);
        defineReadOnly(this, "once", once);

        this._lastBlockNumber = -2;
        this._inflight = false;
    }

    get event(): EventType {
        switch (this.type) {
            case "tesseract":
                return this.address;
            case "tx":
               return this.hash;
            case "filter":
               return this.filter;
        }
        return this.tag;
    }

    get type(): string {
        return this.tag.split(":")[0]
    }

    get address(): string {
        const comps = this.tag.split(":");
        if (comps[0] !== "tesseract") { return null; }
        return comps[1];
    }

    get hash(): string {
        const comps = this.tag.split(":");
        if (comps[0] !== "tx") { return null; }
        return comps[1];
    }

    get filter(): Filter {
        const comps = this.tag.split(":");
        if (comps[0] !== "filter") { return null; }
        const address = comps[1];

        const topics = deserializeTopics(comps[2]);
        const filter: Filter = { };

        if (topics.length > 0) { filter.topics = topics; }
        if (address && address !== "*") { filter.address = address; }

        return filter;
    }

    pollable(): boolean {
        return (this.tag.indexOf(":") >= 0 || PollableEvents.indexOf(this.tag) >= 0);
    }
}