"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const primitiveTypes = [
    "null", "bool", "bytes", "address", "string", "uint64", "int64", "bigint"
];
const isPrimitiveType = (type) => {
    return primitiveTypes.includes(type);
};
const isArray = (type) => {
    return (/^\[(\d*)\]/).test(type);
};
const isMap = (type) => {
    return type.startsWith("map[");
};
class Schema {
    static PISA_ENGINE_SCHEMA = {
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
    };
    static PISA_DEPS_SCHEMA = {
        kind: "array",
        fields: {
            values: {
                kind: "integer"
            }
        }
    };
    static PISA_TYPE_FIELD_SCHEMA = {
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
    };
    static PISA_INSTRUCTIONS_SCHEMA = {
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
    };
    static PISA_STATE_SCHEMA = {
        kind: "struct",
        fields: {
            kind: {
                kind: "string"
            },
            fields: {
                ...Schema.PISA_TYPE_FIELD_SCHEMA
            }
        }
    };
    static PISA_CONSTANT_SCHEMA = {
        kind: "struct",
        fields: {
            type: {
                kind: "string"
            },
            value: {
                kind: "string"
            }
        }
    };
    static PISA_TYPEDEF_SCHEMA = {
        kind: "string",
        fields: {}
    };
    static PISA_ROUTINE_SCHEMA = {
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
    };
    static extractArrayDataType = (dataType) => {
        let endIndex = 0;
        for (let i = 0; i < dataType.length; i++) {
            if (dataType.charAt(i) == "]") {
                endIndex = i + 1;
                break;
            }
        }
        const type = dataType.slice(endIndex);
        if (type) {
            return type;
        }
        throw new Error("invalid array type!");
    };
    static extractMapDataType = (dataType) => {
        let brackets = [];
        let startIndex = 0;
        let endIndex = 0;
        for (let i = 0; i < dataType.length; i++) {
            if (dataType.charAt(i) == "[") {
                if (startIndex === 0) {
                    startIndex = i + 1;
                }
                brackets.push("[");
            }
            else if (dataType.charAt(i) == "]") {
                brackets.pop();
                if (brackets.length === 0) {
                    endIndex = i;
                    break;
                }
            }
        }
        const key = dataType.slice(startIndex, endIndex);
        const value = dataType.replace("map[" + key + "]", "");
        return [key, value];
    };
    static convertPrimitiveDataType = (type) => {
        switch (type) {
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
    };
    static parseDataType = (type) => {
        switch (true) {
            case isPrimitiveType(type):
                return {
                    kind: this.convertPrimitiveDataType(type)
                };
            case isArray(type):
                const values = this.extractArrayDataType(type);
                return {
                    kind: "array",
                    fields: {
                        values: this.parseDataType(values)
                    }
                };
            case isMap(type):
                const [key, value] = this.extractMapDataType(type);
                return {
                    kind: "map",
                    fields: {
                        keys: this.parseDataType(key),
                        values: this.parseDataType(value)
                    }
                };
            default:
                throw new Error("unsupported data type!");
        }
    };
    static parseFields = (fields) => {
        const schema = {
            kind: 'struct',
            fields: {}
        };
        if (typeof fields !== "object") {
            throw new Error("invalid fields");
        }
        Object.values(fields).forEach(field => {
            if (!field || !(field.label && field.type)) {
                throw new Error("invalid field");
            }
            schema.fields[field.label] = this.parseDataType(field.type);
        });
        return schema;
    };
}
exports.default = Schema;
