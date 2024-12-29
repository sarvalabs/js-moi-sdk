import type { OpType } from "js-moi-utils";
import type { OperationSerializer } from "./op-serializer";

export class Serializer {
    static register(type: OpType, serializer: OperationSerializer) {}
}
