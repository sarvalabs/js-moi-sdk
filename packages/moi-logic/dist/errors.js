export default class Errors {
    static builderNotFound() {
        return new Error("Invalid builder name, builder not found!");
    }
    static missingArguments() {
        return new Error("One or more required arguments are missing.");
    }
    static providerNotFound() {
        return new Error("Provider not found!");
    }
    static missingFuelInfo() {
        return new Error("Neither fuel price nor fule limit is missing");
    }
    static addressNotDefined() {
        return new Error("This contract object doesn\'t have address set yet, please set an address first.");
    }
}
