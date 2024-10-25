import yaml from "yaml";
import { BaseManifestCoder } from "./base-manifest-coder";
import { JsonManifestCoder } from "./json-manifest-coder";


export class YamlManifestCoder extends BaseManifestCoder {
    public encode(yamlManifest: string): Uint8Array {
        const json = yaml.parse(yamlManifest);
        return new JsonManifestCoder().encode(json);
        
    }

    public decode(data: string | Uint8Array): string {
        const coder = new JsonManifestCoder();
        return yaml.stringify(coder.decode(data));   
    }
}