export const marshal = (data: object): Uint8Array => {
    const jsonString = JSON.stringify(data);
    return new TextEncoder().encode(jsonString);
}

export const unmarshal = (bytes: Uint8Array): any => {
    try {
        const jsonString = new TextDecoder().decode(bytes);
        return JSON.parse(jsonString);
    } catch (error) {
        throw new Error('Error deserializing data:', error);
    }
}