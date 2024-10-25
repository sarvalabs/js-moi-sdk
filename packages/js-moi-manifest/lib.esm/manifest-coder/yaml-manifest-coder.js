import yaml from "yaml";
import { BaseManifestCoder } from "./base-manifest-coder";
import { JsonManifestCoder } from "./json-manifest-coder";
export class YamlManifestCoder extends BaseManifestCoder {
    encode(yamlManifest) {
        const json = yaml.parse(yamlManifest);
        return new JsonManifestCoder().encode(json);
    }
    decode(data) {
        const coder = new JsonManifestCoder();
        return yaml.stringify(coder.decode(data));
    }
}
//# sourceMappingURL=yaml-manifest-coder.js.map