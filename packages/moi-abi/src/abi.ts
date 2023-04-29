import { Depolorizer, documentEncode, Polorizer } from "js-polo";
import { Schema } from "./schema";
import { Exception } from "../types/response";
import { bytesToHex, hexToBytes, LogicManifest } from "moi-utils";

export class ABICoder {
    private schema: Schema

    constructor(elements?: Map<number, LogicManifest.Element>, classDefs?: Map<string, number>) {
        this.schema = new Schema(elements, classDefs)
    }

    public static encodeABI(manifest: LogicManifest.Manifest): string {
        const polorizer = new Polorizer();
        polorizer.polorizeString(manifest.syntax);
        polorizer.polorize(manifest.engine, Schema.PISA_ENGINE_SCHEMA);
    
        if(manifest.elements) {
            const elements = new Polorizer();
        
            manifest.elements.forEach((value) => {
                const element = new Polorizer();
        
                element.polorizeInteger(value.ptr);
                element.polorize(value.deps, Schema.PISA_DEPS_SCHEMA);
                element.polorizeString(value.kind);
        
                switch(value.kind) {    
                    case "constant":
                        element.polorize(value.data, Schema.PISA_CONSTANT_SCHEMA);
                        break;
                    case "typedef":
                        element.polorize(value.data, Schema.PISA_TYPEDEF_SCHEMA);
                        break;
                    case "class":
                        element.polorize(value.data, Schema.PISA_CLASS_SCHEMA);
                        break;
                    case "routine":
                        element.polorize(value.data, Schema.PISA_ROUTINE_SCHEMA);
                        break;
                    case "state":
                        element.polorize(value.data, Schema.PISA_STATE_SCHEMA);
                        break;
                    default:
                        throw new Error("Unsupported kind");
                }
        
                elements.polorizePacked(element);
            })
        
            polorizer.polorizePacked(elements);
        }

        const bytes = polorizer.bytes();
    
        return "0x" + bytesToHex(bytes);
    }

    private parseCalldata(schema: any, arg: any): any {
        if(schema.kind === "bytes" && typeof arg === "string") {
            return hexToBytes(arg)
        } else if(schema.kind === "array" && ["bytes", "array", "map"].includes(schema.fields.values.kind)) {
            return arg.map(value => 
                this.parseCalldata(schema.fields.values, value)
            )
        } else if (schema.kind === "map" && (["bytes", "array", "map"].includes(schema.fields.keys.kind) || 
        ["bytes", "array", "map"].includes(schema.fields.values.kind))) {
            const map = new Map()
            // Loop through the entries of the Map
            for(const [key, value] of arg.entries()) {
                map.set(
                    this.parseCalldata(schema.fields.keys, key), 
                    this.parseCalldata(schema.fields.values, value)
                );
            }

            return map;
        }

        return arg
    }

    public encodeArguments(fields: LogicManifest.TypeField[], args: any[]) {
        const schema = this.schema.parseFields(fields);
        const calldata = {};
        Object.values(fields).forEach((field:LogicManifest.TypeField) => {
            calldata[field.label] = this.parseCalldata(
                schema.fields[field.label], 
                args[field.slot]
            );
        });

        const document = documentEncode(calldata, schema);
        const bytes = document.bytes();
        const data = "0x" + bytesToHex(new Uint8Array(bytes));

        return data;
    }

    public decodeOutput(output: string, fields: LogicManifest.TypeField[]): unknown | null {
        if(output) {
            const decodedOutput = hexToBytes(output)
            const depolorizer = new Depolorizer(decodedOutput)
            const schema = this.schema.parseFields(fields);
            return depolorizer.depolorize(schema)
        }

        return null
    }

    public static decodeException(error: string): Exception | null {
        if(error) {
            const decodedError = hexToBytes(error)
            const depolorizer = new Depolorizer(decodedError)
            const exception = depolorizer.depolorize(Schema.PISA_EXCEPTION_SCHEMA)

            return exception as Exception
        }

        return null
    }

    public decodeState(data: string, field: string, fields: LogicManifest.TypeField[]): unknown {
        const decodedData = hexToBytes(data)
        const depolorizer = new Depolorizer(decodedData)
        const schema = this.schema.parseFields(fields);
        return depolorizer.depolorize(schema.fields[field])
    }
}
