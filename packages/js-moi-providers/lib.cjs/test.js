"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serializer_1 = require("./serializer/serializer");
const serializer = new serializer_1.InteractionSerializer();
serializer.serialize({
    sender: {
        address: "0x000000",
        sequence: 1,
        key_id: 1,
    },
});
//# sourceMappingURL=test.js.map