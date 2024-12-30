"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationSerializer = void 0;
const js_polo_1 = require("js-polo");
class OperationSerializer {
    serialize(payload) {
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorize(payload, this.schema);
        return polorizer.bytes();
    }
}
exports.OperationSerializer = OperationSerializer;
//# sourceMappingURL=op-serializer.js.map