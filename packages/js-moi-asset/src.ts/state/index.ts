export { PersistentState } from "./persistent-state";

export { EphemeralState } from "./ephemeral-state";

export {
    AbstractAccessor,
    ArrayIndexAccessor,
    ClassFieldAccessor,
    LengthAccessor,
    PropertyAccessor,
    generateStorageKey as generateSlotHash,
    type Accessor
} from "./accessor";

export { SlotAccessorBuilder } from "./accessor-builder";
