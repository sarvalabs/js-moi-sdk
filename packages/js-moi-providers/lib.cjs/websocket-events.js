"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketEvent = void 0;
var WebSocketEvent;
(function (WebSocketEvent) {
    WebSocketEvent["Close"] = "close";
    WebSocketEvent["Connect"] = "connect";
    WebSocketEvent["Error"] = "error";
    WebSocketEvent["Reconnect"] = "reconnect";
    WebSocketEvent["NewTesseracts"] = "newTesseracts";
    WebSocketEvent["NewPendingInteractions"] = "newPendingInteractions";
    WebSocketEvent["NewLog"] = "newLog";
    WebSocketEvent["NewTesseractsByAccount"] = "newTesseractsByAccount";
})(WebSocketEvent || (exports.WebSocketEvent = WebSocketEvent = {}));
//# sourceMappingURL=websocket-events.js.map