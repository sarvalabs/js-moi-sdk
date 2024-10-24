import { blake2b } from "@noble/hashes/blake2b";
import { Polorizer } from "js-polo";
import { encodeToString } from "./hex";
/**
 * Hashes a topic string
 *
 * @param {string} topic - topic value to hash
 * @returns {string} a hash of the topic
 */
export const topicHash = (topic) => {
    const polorizer = new Polorizer();
    polorizer.polorizeString(topic);
    return encodeToString(blake2b(polorizer.bytes(), { dkLen: 32 }));
};
//# sourceMappingURL=logic-events.js.map