import { EventType, Listener } from "../types/event";
import type { EventTag } from "./base-provider";
export default class Event {
    readonly listener: Listener;
    readonly once: boolean;
    readonly tag: string;
    readonly params: unknown;
    constructor(tag: EventTag, listener: Listener, once: boolean);
    /**
     * Returns the name of the event.
     * @returns The event name.
     */
    get event(): EventType;
    /**
     * Returns the type of the event.
     * @returns The event type.
     */
    get type(): string;
    /**
     * Returns the address from the tesseract event.
     * @returns The address form tesseract.
     */
    get address(): string;
    /**
     * Checks if the event is pollable.
     * @returns True if the event is pollable, false otherwise.
     */
    pollable(): boolean;
}
//# sourceMappingURL=event.d.ts.map