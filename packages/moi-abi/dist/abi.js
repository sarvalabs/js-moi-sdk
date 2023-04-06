"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABICoder = void 0;
const js_polo_1 = require("js-polo");
const schema_1 = __importDefault(require("./schema"));
const moi_utils_1 = require("moi-utils");
class ABICoder {
    static encodeABI(manifest) {
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorizeString(manifest.syntax);
        polorizer.polorize(manifest.engine, schema_1.default.PISA_ENGINE_SCHEMA);
        if (manifest.elements) {
            const elements = new js_polo_1.Polorizer();
            manifest.elements.forEach((value) => {
                const element = new js_polo_1.Polorizer();
                element.polorizeInteger(value.ptr);
                element.polorizeString(value.kind);
                element.polorize(value.deps, schema_1.default.PISA_DEPS_SCHEMA);
                switch (value.kind) {
                    case "constant":
                        element.polorize(value.data, schema_1.default.PISA_CONSTANT_SCHEMA);
                        break;
                    case "typedef":
                        element.polorize(value.data, schema_1.default.PISA_TYPEDEF_SCHEMA);
                        break;
                    case "routine":
                        element.polorize(value.data, schema_1.default.PISA_ROUTINE_SCHEMA);
                        break;
                    case "state":
                        element.polorize(value.data, schema_1.default.PISA_STATE_SCHEMA);
                        break;
                    default:
                        throw new Error("Unsupported kind");
                }
                elements.polorizePacked(element);
            });
            polorizer.polorizePacked(elements);
        }
        const bytes = polorizer.bytes();
        return (0, moi_utils_1.bytesToHex)(bytes);
    }
    static encodeArguments(fields, args) {
        const callsite = {};
        const schema = schema_1.default.parseFields(fields);
        Object.entries(fields).forEach(([key, value]) => {
            if (value.type === "address") {
                callsite[value.label] = (0, moi_utils_1.hexToBytes)(args[key]);
            }
            else {
                callsite[value.label] = args[key];
            }
            return null;
        });
        const document = (0, js_polo_1.documentEncode)(callsite, schema);
        const bytes = document.bytes();
        const data = (0, moi_utils_1.bytesToHex)(new Uint8Array(bytes));
        return data;
    }
}
exports.ABICoder = ABICoder;
