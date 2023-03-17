import RequestManager from "moi-core-request-manager";
import PromiseStream from "moi-core-promise-stream";
// import Core from "moi-core";

export default class Method {
    private name: string;
    private call: string;
    // private noOfParams: number;
    private requestManager: RequestManager;
    // private defaultTesseract: number;
    private pollInterval: number;
    
    constructor(config: any) {
        if(!config.name || !config.call) {
            throw new Error("Invalid method config, the name and call properties are required when creating a method")
        }

        this.name = config.name;
        this.call = config.call;
        // this.noOfParams = config.noOfParams ?? 0;
        this.requestManager = config.requestManager;
        // this.defaultTesseract = config.defaultTesseract ?? -1
        this.pollInterval = 60
    }

    public setRequestManager(requestManager: RequestManager) {
        this.requestManager = requestManager;
    }

    private createPayload(args: any[]) {
        const params = args[0];
        const payload = {
            method: this.call,
            params: params,
            jsonrpc: "2.0",
            id: 1
        }

        return payload;
    }

    private confirmTransaction(stream: PromiseStream, ixHash: string, payload: any) {
        const moiMethods = [
            new Method({
                name: "getTesseractByHash",
                call: "moi.GetTesseractByHash"
            }),
            new Method({
                name: "getInteractionReceipt",
                call: "moi.GetInteractionReceipt"
            }),
            new Method({
                name: "getLogicManifest",
                call: "moi.GetLogicManifest"
            }),
        ];

        const queryMethods: any = {}
        
        moiMethods.forEach(method => {
            method.attach(queryMethods);
            method.setRequestManager(this.requestManager);
        })

        let intervalId

        const clearConfirmation = (receipt?: any) => {
            if(intervalId) {
                clearInterval(intervalId)
            }

            if(receipt) {
                stream.eventStream.emit("receipt", receipt)
                stream.eventStream.removeAllListeners()
                stream.resolve(receipt)

                return
            }

            stream.eventStream.removeAllListeners()
            stream.reject('Transaction was not mined within ' + this.pollInterval + ' seconds, please make sure your transaction was properly sent. Be aware that it might still be mined!')
        }

        const validateReceipt = (receipt?: any) => {   
            if(receipt) {
                clearConfirmation(receipt)

                return
            }
    
            queryMethods.getInteractionReceipt({hash: ixHash})
            .then(receipt => {
                console.log(receipt)
                if (!receipt || !receipt.data || !receipt.data.IxHash) {
                    throw new Error('Receipt missing or ix hash null');
                }

                clearConfirmation(receipt)
            }).catch(err => {
                // console.log(err)
            });
        }

        setTimeout(() => {
            clearConfirmation()
        }, this.pollInterval * 1000)

        const startWatching = () => {
            intervalId = setInterval(() => validateReceipt(), this.pollInterval);
        }

        const promise = queryMethods.getInteractionReceipt({hash: ixHash});

        promise.then(response => {
            if(response.data) {
                validateReceipt(response.data)

                return
            }
            startWatching()
            return
        }).catch(err => {
            console.log(err)
            startWatching()
            // console.log("hereee")
            // stream.reject(err)
        });
    }

    private createRequest() {
        const isSendIxMethod = this.call === "moi.SendInteractions";
        const send = (...args: any[]): any => {
            const stream = new PromiseStream(isSendIxMethod)
            const payload = this.createPayload(args);

            const promise = this.requestManager.send(payload)

            promise.then(response => {
                if(response.error) {
                    if(isSendIxMethod) {
                        stream.eventStream.emit("error", response.error.message)
                    }

                    stream.reject(response.error.message);
                    return;
                }
  
                if(isSendIxMethod){
                    stream.eventStream.emit("transactionHash", response.result.data)
                    // TODO: Should be replaced with response.result.data
                    this.confirmTransaction(stream, response.result.data, payload)

                    return
                }

                stream.resolve(response.result)
            }).catch(err => {
                if(isSendIxMethod){
                    stream.eventStream.emit("error", err)
                }

                stream.reject(err);
            });

            return stream.eventStream;
        }

        send.method = this
        return send
    }

    public createFunction(requestManager?: RequestManager): Function {
        const request = this.createRequest();

        this.setRequestManager(requestManager || this.requestManager)

        return request
    }

    public attach(obj: any) {
        const request = this.createRequest();

        obj[this.name] = request;
    }
}
