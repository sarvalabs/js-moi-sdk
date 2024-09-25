import { defineReadOnly } from "js-moi-utils";
// List of events that can be polled
const PollableEvents = ["all_tesseracts", "tesseract"];
export default class Event {
    listener;
    once;
    tag;
    params;
    constructor(tag, listener, once) {
        defineReadOnly(this, "tag", tag.event);
        defineReadOnly(this, "params", tag.params);
        defineReadOnly(this, "listener", listener);
        defineReadOnly(this, "once", once);
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
//# sourceMappingURL=event.js.map