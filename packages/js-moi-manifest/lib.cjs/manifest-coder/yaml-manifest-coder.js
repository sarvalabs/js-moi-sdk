"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YamlManifestCoder = void 0;
const yaml_1 = require("yaml");
const base_manifest_coder_1 = require("./base-manifest-coder");
const json_manifest_coder_1 = require("./json-manifest-coder");
class YamlManifestCoder extends base_manifest_coder_1.BaseManifestCoder {
    encode(yamlManifest) {
        const json = (0, yaml_1.parse)(yamlManifest);
        return new json_manifest_coder_1.JsonManifestCoder().encode(json);
    }
    decode(data) {
        const coder = new json_manifest_coder_1.JsonManifestCoder();
        return (0, yaml_1.stringify)(coder.decode(data));
    }
}
exports.YamlManifestCoder = YamlManifestCoder;
//# sourceMappingURL=yaml-manifest-coder.js.map