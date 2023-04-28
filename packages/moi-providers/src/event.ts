import { EventType, Listener } from "../types/event";
import { defineReadOnly } from "moi-utils";

const PollableEvents = [ "all_tesseracts", "tesseract" ];

export default class Event {
    readonly listener: Listener;
    readonly once: boolean;
    readonly tag: string;

    constructor(tag: string, listener: Listener, once: boolean) {
        defineReadOnly(this, "tag", tag);
        defineReadOnly(this, "listener", listener);
        defineReadOnly(this, "once", once);
    }

    get event(): EventType {
        switch (this.type) {
            case "tesseract":
                return this.address;
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

    pollable(): boolean {
        return (this.tag.indexOf(":") >= 0 || PollableEvents.indexOf(this.tag) >= 0);
    }
}
