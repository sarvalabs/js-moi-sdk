import { LogicManifest } from "moi-utils";
import { Schema as PoloSchema } from "js-polo"

const primitiveTypes = [
    "null", "bool", "bytes", "address", "string", "u64", "i64", "bigint"
]

const isPrimitiveType = (type: string): boolean => {
    return primitiveTypes.includes(type);
}

const isArray = (type: string): boolean => {
    return (/^\[(\d*)\]/).test(type)
}

const isMap = (type: string): boolean => {
    return type.startsWith("map")
}

const isClass = (type: string, classDefs: Map<string, number>): boolean => {
    return classDefs.has(type)
}

export class Schema {
    private elements: Map<number, LogicManifest.Element>
    private classDefs: Map<string, number>

    constructor(elements?: Map<number, LogicManifest.Element>, classDefs?: Map<string, number>) {
        this.elements = elements
        this.classDefs = classDefs
    }

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

    public static PISA_CLASS_SCHEMA = {
        kind: "struct",
        fields: {
            name: {
                kind: "string"
            },
            fields: {
                ...Schema.PISA_TYPE_FIELD_SCHEMA
            }
        }
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
            executes: {
                ...Schema.PISA_INSTRUCTIONS_SCHEMA
            },
            catches: {
                kind: "array",
                fields: {
                    values: {
                        kind: "string"
                    }
                }
            }
        }
    }

    public static PISA_EXCEPTION_SCHEMA = {
        kind: "struct",
        fields: {
            class: {
                kind: "string"
            },
            data: {
                kind: "string"
            },
            trace: {
                kind: "array",
                fields: {
                    values: {
                        kind: "string"
                    }
                }
            }
        }
    }

    public static PISA_RESULT_SCHEMA = {
        kind: "struct",
        fields: {
            outputs: {
                kind: "bytes"
            },
            error: {
                kind: "bytes"
            }
        }
    }

    private extractArrayDataType = (dataType: string): string => {
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
    
    private extractMapDataType = (dataType: string): [string, string] => {
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
    
    private convertPrimitiveDataType = (type: string) => {
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
            case "u64":
            case "i64":
            case "bigint":
                return "integer";
            default:
                throw new Error('unsupported data type!');
        }
    }

    private parseClassFields = (type: string) => {
        const ptr = this.classDefs.get(type)
        const element = this.elements.get(ptr)
        const schema = {
            kind: "struct",
            fields: {}
        }

        element.data = element.data as LogicManifest.Class
        Object.values(element.data.fields).forEach(field => {
            schema.fields[field.label] = this.parseDataType(field.type)
        })

        return schema
    }
    
    private parseDataType = (type: string) => {
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
            case isClass(type, this.classDefs):
                return this.parseClassFields(type)
            default:
                throw new Error("unsupported data type!")
        }
    }
    
    public parseFields = (fields: LogicManifest.TypeField[]): PoloSchema => {
        const schema = {
            kind: 'struct',
            fields: {}
        }
    
        if(typeof fields !== "object") {
            throw new Error("invalid fields") 
        }
    
        fields.forEach(field => {
            if(!field || !(field.label && field.type)) {
                throw new Error("invalid field")
            }
    
            schema.fields[field.label] = this.parseDataType(field.type);
        })
    
        return schema
    }
}
