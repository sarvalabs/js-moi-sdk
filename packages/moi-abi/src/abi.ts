import { documentEncode, Polorizer } from "js-polo";
import LogicManifest from "../types/manifest";
import { Schema } from "./schema";
import { bytesToHex, hexToBytes } from "moi-utils";

export class ABICoder {
    public static encodeABI(manifest: LogicManifest.Manifest): string {
        const polorizer = new Polorizer();
        polorizer.polorizeString(manifest.syntax);
        polorizer.polorize(manifest.engine, Schema.PISA_ENGINE_SCHEMA);
    
        if(manifest.elements) {
            const elements = new Polorizer();
        
            manifest.elements.forEach((value) => {
                const element = new Polorizer();
        
                element.polorizeInteger(value.ptr);
                element.polorizeString(value.kind);
                element.polorize(value.deps, Schema.PISA_DEPS_SCHEMA);
        
                switch(value.kind) {
                    case "constant":
                        element.polorize(value.data, Schema.PISA_CONSTANT_SCHEMA);
                        break;
                    case "typedef":
                        element.polorize(value.data, Schema.PISA_TYPEDEF_SCHEMA);
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
    
        return bytesToHex(bytes);
    }

    private static parseCalldata(schema: any, arg: any): any {
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

    public static encodeArguments(fields: Record<string, LogicManifest.TypeField>, args: any[]) {
        const schema = Schema.parseFields(fields);
        let calldata = {};
        Object.values(fields).forEach((field:LogicManifest.TypeField) => {
            calldata[field.label] = this.parseCalldata(
                schema.fields[field.label], 
                args[field.slot]
            );
        });

        const document = documentEncode(calldata, schema);
        const bytes = document.bytes();
        const data = bytesToHex(new Uint8Array(bytes));

        return data;
    }
}
