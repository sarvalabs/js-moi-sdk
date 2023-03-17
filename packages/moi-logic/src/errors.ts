export default class Errors {
    public static builderNotFound(): Error {
        return new Error("Invalid builder name, builder not found!")
    }

    public static missingArguments(): Error {
        return new Error("One or more required arguments are missing.")
    }
    
    public static providerNotFound(): Error {
        return new Error("Provider not found!")
    }

    public static missingFuelInfo(): Error {
        return new Error("Neither fuel price nor fule limit is missing")
    }

    public static addressNotDefined(): Error {
        return new Error("This contract object doesn\'t have address set yet, please set an address first.")
    }
}
