import type { LogFilter } from "./jsonrpc";

export type EventType = string | LogFilter;

export type Listener = (...args: Array<any>) => void;
