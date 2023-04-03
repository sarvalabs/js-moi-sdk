// import RequestManager from "moi-core-request-manager";
// import Method from "moi-core-method";
// import Subscriptions from "moi-core-subscriptions";

// const methods = [
//     new Method({
//         name: "getLatestTesseract",
//         call: "moi.GetLatestTesseract"
//     }),
//     new Method({
//         name: "getTesseractByHash",
//         call: "moi.GetTesseractByHash"
//     }),
//     new Method({
//         name: "getTesseractByHeight",
//         call: "moi.GetTesseractByHeight"
//     }),
//     new Method({
//         name: "getAssetInfoByAssetID",
//         call: "moi.GetAssetInfoByAssetID"
//     }),
//     new Method({
//         name: "getBalance",
//         call: "moi.GetBalance"
//     }),
//     new Method({
//         name: "getTDU",
//         call: "moi.GetTDU"
//     }),
//     new Method({
//         name: "getContextInfo",
//         call: "moi.GetContextInfo"
//     }),
//     new Method({
//         name: "getInteractionReceipt",
//         call: "moi.GetInteractionReceipt"
//     }),
//     new Method({
//         name: "getLogicManifest",
//         call: "moi.GetLogicManifest"
//     }),
//     new Method({
//         name: "getInteractionCountByAddress",
//         call: "moi.GetInteractionCountByAddress"
//     }),
//     new Method({
//         name: "sendInteractions",
//         call: "moi.SendInteractions"
//     }),
//     new Subscriptions({
//         name: "subscribe",
//         type: "moi",
//         Subscriptions: {
//             "newTesseracts": {
//                 subscriptionName: "newTesseracts",
//                 params: 0,
//             }
//         }
//     })
// ]

// export default class Core {
//     private requestManager: RequestManager;

//     constructor(provider: string){
//         this.requestManager = new RequestManager(provider)
//         this.initializeMethods()
//     }

//     private initializeMethods() {
//         methods.forEach((method: Method | Subscriptions) => {
//             method.setRequestManager(this.requestManager);
//             method.attach(this);
//         })
//     }
// }
