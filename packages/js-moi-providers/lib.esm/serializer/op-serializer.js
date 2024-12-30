import { Polorizer } from "js-polo";
export class OperationSerializer {
    serialize(payload) {
        const polorizer = new Polorizer();
        polorizer.polorize(payload, this.schema);
        return polorizer.bytes();
    }
}
//# sourceMappingURL=op-serializer.js.map