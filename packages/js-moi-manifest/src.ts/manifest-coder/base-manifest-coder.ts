import type { LogicManifest } from "../../types/manifest";

export abstract class BaseManifestCoder {
    protected validate(manifest: unknown): manifest is LogicManifest.Manifest {
        if (typeof manifest !== "object" || manifest === null) {
            return false;
        }

        if (!("elements" in manifest) || !Array.isArray(manifest.elements)) {
            return false;
        }

        return true;
    }
}
