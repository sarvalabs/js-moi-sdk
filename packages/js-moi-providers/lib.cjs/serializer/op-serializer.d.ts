import { type Schema } from "js-polo";
export declare abstract class OperationSerializer {
    abstract readonly type: number;
    abstract readonly schema: Schema;
    serialize(payload: any): Uint8Array;
}
//# sourceMappingURL=op-serializer.d.ts.map