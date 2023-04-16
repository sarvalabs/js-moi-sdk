import { LogicManifest } from "moi-utils";
export declare class ABICoder {
    static encodeABI(manifest: LogicManifest.Manifest): string;
    private static parseCalldata;
    static encodeArguments(fields: Record<string, LogicManifest.TypeField>, args: any[]): string;
}
