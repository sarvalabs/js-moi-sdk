import type { NestedArray } from "./util";

export interface LogsEvent {
    address: string;
    start_height: number;
    end_height: number;
    topics: NestedArray<string>;
}

export type EventType = string | LogsEvent;

export type Listener = (...args: Array<any>) => void;
