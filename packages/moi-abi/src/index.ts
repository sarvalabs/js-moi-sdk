import { Polorizer, documentEncode } from "js-polo";
import LogicManifest from "../types/manifest";
import Schema from "./schema";
import { bytesToHex } from "moi-utils";

export default class ABICoder {
    public static encodeABI(abi: LogicManifest.Manifest): string {
        const abiClone = JSON.parse(JSON.stringify(abi))
        const schema = Schema.parseABI(abiClone)
        const polorizer = new Polorizer()
        polorizer.polorize(abiClone, schema)
        const bytes = polorizer.bytes()
        const data = bytesToHex(new Uint8Array(bytes))
       
        return data
    }

    public static encodeArguments(fields: Record<string, LogicManifest.TypeField>, args: any[]) {
        const callsite = {}
        const schema = Schema.parseFields(fields)
        Object.entries(fields).forEach(([key, value]:[string, LogicManifest.TypeField]) => {
            callsite[value.label] = args[key];
            
            return null;
        })

        const document = documentEncode(callsite, schema)
        const bytes = document.bytes()
        const data = bytesToHex(new Uint8Array(bytes))

        return data
    }
}
