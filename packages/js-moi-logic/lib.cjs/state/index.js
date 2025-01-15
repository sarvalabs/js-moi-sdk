"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotAccessorBuilder = exports.generateSlotHash = exports.PropertyAccessor = exports.LengthAccessor = exports.ClassFieldAccessor = exports.ArrayIndexAccessor = exports.AbstractAccessor = exports.EphemeralState = exports.PersistentState = void 0;
var persistent_state_1 = require("./persistent-state");
Object.defineProperty(exports, "PersistentState", { enumerable: true, get: function () { return persistent_state_1.PersistentState; } });
var ephemeral_state_1 = require("./ephemeral-state");
Object.defineProperty(exports, "EphemeralState", { enumerable: true, get: function () { return ephemeral_state_1.EphemeralState; } });
var accessor_1 = require("./accessor");
Object.defineProperty(exports, "AbstractAccessor", { enumerable: true, get: function () { return accessor_1.AbstractAccessor; } });
Object.defineProperty(exports, "ArrayIndexAccessor", { enumerable: true, get: function () { return accessor_1.ArrayIndexAccessor; } });
Object.defineProperty(exports, "ClassFieldAccessor", { enumerable: true, get: function () { return accessor_1.ClassFieldAccessor; } });
Object.defineProperty(exports, "LengthAccessor", { enumerable: true, get: function () { return accessor_1.LengthAccessor; } });
Object.defineProperty(exports, "PropertyAccessor", { enumerable: true, get: function () { return accessor_1.PropertyAccessor; } });
Object.defineProperty(exports, "generateSlotHash", { enumerable: true, get: function () { return accessor_1.generateStorageKey; } });
var accessor_builder_1 = require("./accessor-builder");
Object.defineProperty(exports, "SlotAccessorBuilder", { enumerable: true, get: function () { return accessor_builder_1.SlotAccessorBuilder; } });
//# sourceMappingURL=index.js.map