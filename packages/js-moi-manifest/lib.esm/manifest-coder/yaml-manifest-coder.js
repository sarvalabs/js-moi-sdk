import { parse, stringify } from "yaml";
import { BaseManifestCoder } from "./base-manifest-coder";
import { JsonManifestCoder } from "./json-manifest-coder";
export class YamlManifestCoder extends BaseManifestCoder {
    encode(yamlManifest) {
        const json = parse(yamlManifest);
        return new JsonManifestCoder().encode(json);
    }
    decode(data) {
        const coder = new JsonManifestCoder();
        return stringify(coder.decode(data));
    }
}
//# sourceMappingURL=yaml-manifest-coder.js.map