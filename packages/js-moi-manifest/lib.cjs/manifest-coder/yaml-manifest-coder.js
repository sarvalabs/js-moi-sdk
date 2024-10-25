"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YamlManifestCoder = void 0;
const yaml_1 = __importDefault(require("yaml"));
const base_manifest_coder_1 = require("./base-manifest-coder");
const json_manifest_coder_1 = require("./json-manifest-coder");
class YamlManifestCoder extends base_manifest_coder_1.BaseManifestCoder {
    encode(yamlManifest) {
        const json = yaml_1.default.parse(yamlManifest);
        return new json_manifest_coder_1.JsonManifestCoder().encode(json);
    }
    decode(data) {
        const coder = new json_manifest_coder_1.JsonManifestCoder();
        return yaml_1.default.stringify(coder.decode(data));
    }
}
exports.YamlManifestCoder = YamlManifestCoder;
//# sourceMappingURL=yaml-manifest-coder.js.map