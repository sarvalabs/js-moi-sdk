import { InteractionSerializer } from "./serializer/serializer";
const serializer = new InteractionSerializer();
serializer.serialize({
    sender: {
        address: "0x000000",
        sequence: 1,
        key_id: 1,
    },
});
//# sourceMappingURL=test.js.map