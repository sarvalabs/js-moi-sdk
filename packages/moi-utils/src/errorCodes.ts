interface ErrorCode {
    name: string 
    message: string
}

export const UnKnown: ErrorCode = {
    name: "UNKNOWN",
    message: "error message not mentioned"
}
