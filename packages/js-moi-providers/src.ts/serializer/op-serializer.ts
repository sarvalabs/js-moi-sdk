export interface OperationSerializer<TPayload = unknown> {
    readonly type: number;
    serialize(payload: TPayload): Uint8Array;
}
