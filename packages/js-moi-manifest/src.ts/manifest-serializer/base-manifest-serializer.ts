import type { LogicManifest } from "../../types/manifest";

export interface ManifestSerializer {
    /**
     * Serializes a manifest.
     *
     * @param manifest The manifest to serialize.
     * @returns The serialized manifest.
     */
    serialize(manifest: LogicManifest.Manifest): Uint8Array;

    /**
     * Deserializes a manifest.
     *
     * @param data The data to deserialize.
     * @returns The deserialized manifest.
     */
    deserialize(data: string | Uint8Array): LogicManifest.Manifest;
}

export abstract class BaseManifestSerializer implements ManifestSerializer {
    public abstract serialize(manifest: LogicManifest.Manifest): Uint8Array;

    public abstract deserialize(
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
