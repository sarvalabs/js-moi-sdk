export enum WebSocketEvent {
    Close = "close",

    Connect = "connect",

    Error = "error",

    Reconnect = "reconnect",

    NewTesseracts = "newTesseracts",

    NewPendingInteractions = "newPendingInteractions",

    NewLog = "newLog",

    NewTesseractsByAccount = "newTesseractsByAccount",
}