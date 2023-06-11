"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moi_utils_1 = require("moi-utils");
// List of events that can be polled
const PollableEvents = ["all_tesseracts", "tesseract"];
class Event {
    listener;
    once;
    tag;
    constructor(tag, listener, once) {
        (0, moi_utils_1.defineReadOnly)(this, "tag", tag);
        (0, moi_utils_1.defineReadOnly)(this, "listener", listener);
        (0, moi_utils_1.defineReadOnly)(this, "once", once);
    }
    /**
     * Returns the name of the event.
     * @returns The event name.
     */
    get event() {
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
    get type() {
        return this.tag.split(":")[0];
    }
    /**
     * Returns the address from the tesseract event.
     * @returns The address form tesseract.
     */
    get address() {
        const comps = this.tag.split(":");
        if (comps[0] !== "tesseract") {
            return null;
        }
        return comps[1];
    }
    /**
     * Checks if the event is pollable.
     * @returns True if the event is pollable, false otherwise.
     */
    pollable() {
        return (this.tag.indexOf(":") >= 0 || PollableEvents.indexOf(this.tag) >= 0);
    }
}
exports.default = Event;
