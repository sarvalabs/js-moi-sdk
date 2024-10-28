import type { Tesseract } from "js-moi-utils/src.ts";
import type { WebSocketEvent } from "../src.ts/index.js";
import type { LogFilter } from "./jsonrpc.js";

export type NewTesseractsByAccount = {
    event: WebSocketEvent.NewTesseractsByAccount;
    params: { address: string; };
};

export type NewLogs = { event: WebSocketEvent.NewLog; params: LogFilter; };

export type ProviderEvents = keyof WebsocketEventMap |
{ event: string; params: any; };

export interface WebsocketEventMap {
    [WebSocketEvent.NewTesseracts]: [tesseract: Tesseract];
    [WebSocketEvent.NewPendingInteractions]: [interactionHash: string];
    [WebSocketEvent.Connect]: [];
    [WebSocketEvent.Error]: [error: unknown];
    [WebSocketEvent.Close]: [];
    [WebSocketEvent.Reconnect]: [attempt: number];
}
