import Manifest from "../types/manifest";
import PoloSchema from "js-polo/src/schema"

const PISA_SYNTAX_SCHEMA = {
    kind: "string"
}

const PISA_ENGINE_SCHEMA = {
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

const PISA_DEPS_SCHEMA = {
    kind: "array",
    fields: {
        values: {
            kind: "integer"
        }
    }
}

const PISA_TYPE_FIELD_SCHEMA = {
    kind: "map",
    fields: {
        keys: {
            kind: "string"
        },
        values: {
            kind: "struct",
            fields: {
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

const PISA_INSTRUCTIONS_SCHEMA = {
    kind: "struct",
    fields: {
        bin: {
            kind: "array",
            fields: {
                values: {
                    kind: "integer"
                }
            }
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

const PISA_BUILDER_SCHEMA = {
    kind: "struct",
    fields: {
        name: {
            kind: "string"
        },
        scope: {
            kind: "string"
        },
        accepts: {
            ...PISA_TYPE_FIELD_SCHEMA
        },
        returns: {
            ...PISA_TYPE_FIELD_SCHEMA
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
            ...PISA_INSTRUCTIONS_SCHEMA
        }
    }
}

const PISA_STORAGE_SCHEMA = {
    kind: "struct",
    fields: {
        scope: {
            kind: "string"
        },
        fields: {
            kind: "map",
            fields: {
                keys: {
                    kind: "string"
                },
                values: {
                    kind: "struct",
                    fields: {
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
    }
}

const PISA_CONSTANT_SCHEMA = {
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

const PISA_TYPEDEF_SCHEMA = {
    kind: "string"
}

const PISA_ROUTINE_SCHEMA = {
    kind: "struct",
    fields: {
        name: {
            kind: "string"
        },
        accepts: {
            ...PISA_TYPE_FIELD_SCHEMA
        },
        returns: {
            ...PISA_TYPE_FIELD_SCHEMA
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
            ...PISA_INSTRUCTIONS_SCHEMA
        }
    }
}

const PISA_ELEMENT_SCHEMA = {
    kind: "struct",
    fields: {
        kind: {
            kind: "string"
        },
        deps: {
            ...PISA_DEPS_SCHEMA
        },
        data: {}
    }
}

const PISA_ELEMENTS_SCHEMA = {
    kind: "struct",
    fields: {}
}

const MANIFEST_SCHEMA = {
    kind: "struct",
    fields: {
        syntax: {
            ...PISA_SYNTAX_SCHEMA
        },
        engine: {
            ...PISA_ENGINE_SCHEMA
        },
        elements: {
            ...PISA_ELEMENTS_SCHEMA
        }
    }
}

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
    public static parseABI = (manifest: Manifest.Manifest): PoloSchema => {
        const schema = {...MANIFEST_SCHEMA}
        Object.entries(manifest.elements).forEach(([key, value]) => {
            let dataSchema
            switch(value.kind) {
                case "storage":
                    value.data = value.data as Storage
    
                    if(value.data.fields) {
                        value.data.fields = new Map(
                            Object.entries(value.data.fields)
                        )
                    }
    
                    dataSchema = PISA_STORAGE_SCHEMA
    
                    break;
                case "builder":
                    dataSchema = PISA_BUILDER_SCHEMA
    
                    value.data = value.data as Manifest.Builder
    
                    if(value.data.accepts) {
                        value.data.accepts = new Map(
                            Object.entries(value.data.accepts)
                        )
                    } 
        
                    if(value.data.returns) {
                        value.data.returns = new Map(
                            Object.entries(value.data.returns)
                        )
                    }
    
                    break;
                case "constant":
                    dataSchema = PISA_CONSTANT_SCHEMA
    
                    break;
                case "typedef":
                    dataSchema = PISA_TYPEDEF_SCHEMA
    
                    break;
                case "routine":
                    dataSchema = PISA_ROUTINE_SCHEMA
                    value.data = value.data as Manifest.Routine
    
                    if(value.data.accepts) {
                        value.data.accepts = new Map(
                            Object.entries(value.data.accepts)
                        )
                    } 
        
                    if(value.data.returns) {
                        value.data.returns = new Map(
                            Object.entries(value.data.returns)
                        )
                    }
                    
                    break;
                default:
                    throw new Error("Invalid type")
            }
    
            schema.fields.elements.fields[key] = {
                ...PISA_ELEMENT_SCHEMA,
                fields: {
                    ...PISA_ELEMENT_SCHEMA.fields,
                    data: dataSchema
                }
            }
        })
    
        return schema
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
