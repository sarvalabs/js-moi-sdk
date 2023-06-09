import { Exception } from "../types/response";
import { LogicManifest } from "moi-utils";
export declare class ABICoder {
    private schema;
    constructor(elements: Map<number, LogicManifest.Element>, classDefs: Map<string, number>);
    static encodeABI(manifest: LogicManifest.Manifest): string;
    private parseCalldata;
    encodeArguments(fields: LogicManifest.TypeField[], args: any[]): string;
    decodeOutput(output: string, fields: LogicManifest.TypeField[]): unknown | null;
    static decodeException(error: string): Exception | null;
    decodeState(data: string, field: string, fields: LogicManifest.TypeField[]): unknown;
}
