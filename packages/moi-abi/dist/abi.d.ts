import LogicManifest from "../types/manifest";
export declare class ABICoder {
    static encodeABI(manifest: LogicManifest.Manifest): string;
    static encodeArguments(fields: Record<string, LogicManifest.TypeField>, args: any[]): string;
}
