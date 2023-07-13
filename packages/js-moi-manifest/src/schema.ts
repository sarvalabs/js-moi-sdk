import { ErrorCode, ErrorUtils } from "js-moi-utils";
import { Schema as PoloSchema } from "js-polo";
import { LogicManifest } from "../types/manifest";

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

/**
 * Schema is a class that provides schema parsing functionality for encoding and
 * decoding manifest, arguments, logic states and other data based on 
 * a predefined schema. It supports parsing fields and generating a schema for 
 * decoding purposes.
 *
 * @class
 */
export class Schema {
    private elements: Map<number, LogicManifest.Element>
    private classDefs: Map<string, number>

    constructor(elements: Map<number, LogicManifest.Element>, classDefs: Map<string, number>) {
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

    public static PISA_METHOD_FIELD_SCHEMA = {
        kind: "array",
        fields: {
            values: {
                kind: "struct",
                fields: {
                    ptr: {
                        kind: "integer"
                    },
                    code: {
                        kind: "integer"
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
            },
            methods: {
                ...Schema.PISA_METHOD_FIELD_SCHEMA
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

    public static PISA_METHOD_SCHEMA = {
        kind: "struct",
        fields: {
            name: {
                kind: "string"
            },
            class: {
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

    /**
     * Extracts the array data type from the provided data type string.
     *
     * @param {string} dataType - The array data type, eg:"[]u64".
     * @returns {string} The extracted array data type.
     * @throws {Error} If the array type is invalid or unsupported.
     */
    private extractArrayDataType(dataType: string): string {
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
    
        ErrorUtils.throwError(
            "Failed to extract array type: The array type could not be determined.",
            ErrorCode.INVALID_ARGUMENT
        );
    }
    
    /**
     * Extracts the key and value data types from the provided map data type string.
     *
     * @param {string} dataType - The map data type. eg:"map[u64]string".
     * @returns {[string, string]} The extracted key and value data types as a tuple.
     * @throws {Error} If the map data type is invalid or unsupported.
     */
    private extractMapDataType(dataType: string): [string, string] {
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

        if (!key || !value) {
            ErrorUtils.throwError(
                "Failed to extract map type: The key or value type of the map could not be determined.",
                ErrorCode.INVALID_ARGUMENT
            );
        }
        
        return [key, value]
    }
    
    /**
     * Converts the primitive data type to a standardized representation.
     *
     * @param {string} type - The primitive data type.
     * @returns {string} The converted data type.
     * @throws {Error} If the data type is unsupported.
     */
    private convertPrimitiveDataType(type: string): string {
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
                ErrorUtils.throwError(
                    'Unsupported data type!',
                    ErrorCode.UNSUPPORTED_OPERATION
                );
        }
    }

    /**
     * Parses the fields of a class data type and generates the schema for the class.
     *
     * @param {string} className - The name of the class.
     * @returns {object} The schema for the class.
     */
    private parseClassFields(className: string): PoloSchema {
        const ptr = this.classDefs.get(className)
        if (ptr === undefined) {
            ErrorUtils.throwError(
                `Invalid class name: ${className}`,
                ErrorCode.INVALID_ARGUMENT
            );
        }

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

    /**
     * Parses a data type and generates the corresponding schema based on the 
     * data type. The parsing is performed recursively to handle nested data types, 
     * such as arrays, maps and class.
     *   
     * @param {string} type - The data type string.
     * @returns {object} The schema generated based on the data type.
     * @throws {Error} If the data type is unsupported.
     */
    private parseDataType(type: string): PoloSchema {
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
                ErrorUtils.throwError(
                    `Unsupported data type: ${type}!`,
                    ErrorCode.UNSUPPORTED_OPERATION
                );
        }
    }
    
    /**
     * Parses an array of fields and generates the schema based on the fields.
     *
     * @param {LogicManifest.TypeField[]} fields - The array of fields.
     * @returns {PoloSchema} The generated schema based on the fields.
     * @throws {Error} If the fields are invalid or contain unsupported data types.
     */
    public parseFields(fields: LogicManifest.TypeField[]): PoloSchema {
        const schema = {
            kind: 'struct',
            fields: {}
        }
    
        if(!Array.isArray(fields)) {
            ErrorUtils.throwError(
                "Invalid fields: Fields must be an array.",
                ErrorCode.INVALID_ARGUMENT,
            )
        }
    
        fields.forEach(field => {
            if(!field || !(field.label && field.type)) {
                ErrorUtils.throwError(
                    "Invalid field: Each field must have a label and a type.",
                    ErrorCode.INVALID_ARGUMENT
                )
            }
    
            schema.fields[field.label] = this.parseDataType(field.type);
        })
    
        return schema
    }
}
