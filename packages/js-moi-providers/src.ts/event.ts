import { defineReadOnly } from "js-moi-utils";
import { EventType, Listener } from "../types/event";
import type { EventTag } from "./base-provider";

// List of events that can be polled
const PollableEvents = [ "all_tesseracts", "tesseract" ];

export default class Event {
    readonly listener: Listener;
    readonly once: boolean;
    readonly tag: string;
    readonly params: unknown;

    constructor(tag: EventTag, listener: Listener, once: boolean) {
        defineReadOnly(this, "tag", tag.event);
        defineReadOnly(this, "params", tag.params);
        defineReadOnly(this, "listener", listener);
        defineReadOnly(this, "once", once);
    }

    /**
     * Returns the name of the event.
     * @returns The event name.
     */
    get event(): EventType {
        switch (this.type) {
            case "tesseract":
                return this.address;
        }

        return this.tag;
    }

    /**
     * Returns the type of the event.
     * @returns The event type.
     */
    get type(): string {
        return this.tag.split(":")[0]
    }

    /**
     * Returns the address from the tesseract event.
     * @returns The address form tesseract.
     */
    get address(): string {
        const comps = this.tag.split(":");
        if (comps[0] !== "tesseract") { return null; }
        return comps[1];
    }

    /**
     * Checks if the event is pollable.
     * @returns True if the event is pollable, false otherwise.
     */
    pollable(): boolean {
        return (this.tag.indexOf(":") >= 0 || PollableEvents.indexOf(this.tag) >= 0);
    }
}
