import Manifest from "../types/manifest";
import PoloSchema from "js-polo/src/schema"

const primitiveTypes = [
    "null", "bool", "bytes", "address", "string", "uint64", "int64", "bigint"
]

const isPrimitiveType = (type: string): boolean => {
    return primitiveTypes.includes(type);
}

const isArray = (type: string): boolean => {
    return (/^\[(\d*)\]/).test(type)
}

const isMap = (type: string): boolean => {
    return type.startsWith("map[")
}

export default class Schema {
    public static PISA_ENGINE_SCHEMA = {
        kind: "struct",
        fields: {
            kind: {
                kind: "string"
            },
            flags: {
                kind: "array",
                fields: {
                    values: {
                        kind: "string"
                    }
                }
            }
        }
    }

    public static PISA_DEPS_SCHEMA = {
        kind: "array",
        fields: {
            values: {
                kind: "integer"
            }
        }
    }

    public static PISA_TYPE_FIELD_SCHEMA = {
        kind: "array",
        fields: {
            values: {
                kind: "struct",
                fields: {
                    slot: {
                        kind: "integer"
                    },
                    label: {
                        kind: "string"
                    },
                    type: {
                        kind: "string"
                    }
                }
            }
        }
    }

    public static PISA_INSTRUCTIONS_SCHEMA = {
        kind: "struct",
        fields: {
            bin: {
                kind: "bytes"
            },
            hex: {
                kind: "string"
            },
            asm: {
                kind: "array",
                fields: {
                    values: {
                        kind: "string"
                    }
                }
            }
        }
    }

    public static PISA_STATE_SCHEMA = {
        kind: "struct",
        fields: {
            kind: {
                kind: "string"
            },
            fields: {
                ...Schema.PISA_TYPE_FIELD_SCHEMA
            }
        }
    }

    public static PISA_CONSTANT_SCHEMA = {
        kind: "struct",
        fields: {
            type: {
                kind: "string"
            },
            value: {
                kind: "string"
            }
        }
    }
    
    public static PISA_TYPEDEF_SCHEMA = {
        kind: "string",
        fields: {}
    }
    
    public static PISA_ROUTINE_SCHEMA = {
        kind: "struct",
        fields: {
            name: {
                kind: "string"
            },
            kind: {
                kind: "string"
            },
            accepts: {
                ...Schema.PISA_TYPE_FIELD_SCHEMA
            },
            returns: {
                ...Schema.PISA_TYPE_FIELD_SCHEMA
            },
            catches: {
                kind: "array",
                fields: {
                    values: {
                        kind: "string"
                    }
                }
            },
            executes: {
                ...Schema.PISA_INSTRUCTIONS_SCHEMA
            }
        }
    }

    private static extractArrayDataType = (dataType: string): string => {
        let endIndex: number = 0
    
        for(let i = 0; i < dataType.length; i++) {
            if (dataType.charAt(i) == "]") {
                endIndex = i + 1;
                break;
            }
        }
    
        const type: string = dataType.slice(endIndex,)
        
        if(type) {
            return type
        }
    
        throw new Error("invalid array type!")
    }
    
    private static extractMapDataType = (dataType: string): [string, string] => {
        let brackets: string[] = []
        let startIndex: number = 0
        let endIndex: number = 0
        
        for(let i = 0; i < dataType.length; i++) {
          if(dataType.charAt(i) == "[") {
            if (startIndex === 0) {
               startIndex = i + 1;
            }
            
            brackets.push("[")
          } else if (dataType.charAt(i) == "]") {
            brackets.pop()
            
            if(brackets.length === 0) {
              endIndex = i;
              break;
            }
          }
        }
    
        const key = dataType.slice(startIndex, endIndex)
    
        const value = dataType.replace("map[" + key + "]", "")
        
        return [key, value]
    }
    
    private static convertPrimitiveDataType = (type: string) => {
        switch(type) {
            case "null":
                return "null";
            case "bool":
                return "bool";
            case "bytes":
            case "address":
                return "bytes";
            case "string":
                return "string";
            case "uint64":
            case "int64":
            case "bigint":
                return "integer";
            default:
                throw new Error('unsupported data type!');
        }
    }
    
    private static parseDataType = (type: string) => {
        switch(true) {
            case isPrimitiveType(type):
                return {
                    kind: this.convertPrimitiveDataType(type)
                }
            case isArray(type):
                const values = this.extractArrayDataType(type)
                return {
                    kind: "array",
                    fields: {
                        values: this.parseDataType(values)
                    }
                }
            case isMap(type):
                const [key, value] = this.extractMapDataType(type)
                return {
                    kind: "map",
                    fields: {
                        keys: this.parseDataType(key),
                        values: this.parseDataType(value)
                    }
                };
            default:
                throw new Error("unsupported data type!")
        }
    }
    
    public static parseFields = (fields: Record<string, Manifest.TypeField>): PoloSchema => {
        const schema = {
            kind: 'struct',
            fields: {}
        }
    
        if(typeof fields !== "object") {
            throw new Error("invalid fields") 
        }
    
        Object.values(fields).forEach(field => {
            if(!field || !(field.label && field.type)) {
                throw new Error("invalid field")
            }
    
            schema.fields[field.label] = this.parseDataType(field.type);
        })
    
        return schema
    }
}
