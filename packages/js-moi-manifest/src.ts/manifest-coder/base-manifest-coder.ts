import type { LogicManifest } from "../../types/manifest";

export interface ManifestCoder {
    /**
     * Serializes a manifest.
     *
     * @param manifest The manifest to serialize.
     * @returns The serialized manifest.
     */
    encode(manifest: LogicManifest.Manifest): Uint8Array;

    /**
     * Deserializes a manifest.
     *
     * @param data The data to deserialize.
     * @returns The deserialized manifest.
     */
    decode(data: string | Uint8Array): LogicManifest.Manifest;
}

export abstract class BaseManifestCoder implements ManifestCoder {
    public abstract encode(manifest: LogicManifest.Manifest): Uint8Array;

    public abstract decode(
        data: string | Uint8Array
    ): LogicManifest.Manifest;

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
