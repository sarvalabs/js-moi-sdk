import { documentEncode, Polorizer } from "js-polo";
import LogicManifest from "../types/manifest";
import Schema from "./schema";
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

    public static encodeArguments(fields: Record<string, LogicManifest.TypeField>, args: any[]) {
        const callsite = {}
        const schema = Schema.parseFields(fields)
        Object.entries(fields).forEach(([key, value]:[string, LogicManifest.TypeField]) => {
            if(value.type === "address") {
                callsite[value.label] = hexToBytes(args[key])
            } else {
                callsite[value.label] = args[key];
            }
            
            return null;
        })

        const document = documentEncode(callsite, schema)
        const bytes = document.bytes()
        const data = bytesToHex(new Uint8Array(bytes))

        return data
    }
}
