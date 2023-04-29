"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moi_utils_1 = require("moi-utils");
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
    get event() {
        switch (this.type) {
            case "tesseract":
                return this.address;
        }
        return this.tag;
    }
    get type() {
        return this.tag.split(":")[0];
    }
    get address() {
        const comps = this.tag.split(":");
        if (comps[0] !== "tesseract") {
            return null;
        }
        return comps[1];
    }
    pollable() {
        return (this.tag.indexOf(":") >= 0 || PollableEvents.indexOf(this.tag) >= 0);
    }
}
exports.default = Event;
