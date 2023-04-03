export type InflightRequest = {
    callback: (error: Error, result: any) => void;
    payload: string;
};

export type Subscription = {
   tag: string;
   processFunc: (payload: any) => void;
};

export type AllTesseracts = {
    address: string
}