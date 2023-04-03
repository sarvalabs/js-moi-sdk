export type EventType = string | Filter;

export type Listener = (...args: Array<any>) => void;

export type BlockTag = string | number;

export interface EventFilter {
    address?: string;
    topics?: Array<string | Array<string> | null>;
}

export interface Filter extends EventFilter {
    fromBlock?: BlockTag,
    toBlock?: BlockTag,
}