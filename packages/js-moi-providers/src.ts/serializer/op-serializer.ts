export interface OperationSerializer<TPayload = unknown> {
    serialize(payload: TPayload): Uint8Array;
}
