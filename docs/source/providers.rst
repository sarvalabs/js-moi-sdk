Provider
========

A Provider is a convenient interface for connecting to MOI nodes
and retrieving data from the blockchain. With the providers module,
developers can choose from various MOI providers such as Voyage to
establish a connection with the MOI network.

The Provider class abstracts away the complexities of interacting
directly with the MOI network and provides a consistent and
straightforward API for retrieving blockchain data. Whether it's
querying account balances, interaction history, or logic
information, the providers module simplifies the process
of connecting to MOI nodes and fetching data, making it easier
for developers to build applications that interact with the MOI
network.

Transport
---------

Transport are the underlying communication channels used by the
Provider to connect to MOI nodes. The Transport class defines
the common interface for establishing connections and sending
requests to MOI nodes. By abstracting the communication layer,
the Transport class enables the Provider to interact with
different types of MOI nodes, provides a consistent way to
communicate with the network.

Developers can create their own custom transports by extending
the ``Transport`` interface and implementing the required methods.

**For example**

Below is an example of a custom transport using 
`axios <https://www.npmjs.com/package/axios>`_ to connect to a MOI 
json-rpc server.

.. code-block:: javascript

    import axios from "axios";
    import type { JsonRpcRequest, JsonRpcResponse, Transport } from "js-moi-sdk";

    export class AxiosTransport implements Transport {
        private readonly url = "https://voyage-rpc.moi.technology/babylon/";

        async request<TResult = unknown>(request: JsonRpcRequest): Promise<JsonRpcResponse<TResult>> {
            const response = await axios.post(this.url, request, {
                timeout: 30000,
            });

            return response.data as JsonRpcResponse<TResult>;
        }
    }


This custom transport can be plugged into the Provider to perform
interactions with the MOI network.

.. code-block:: javascript

    import { Provider } from "js-moi-sdk";
    import { AxiosTransport } from "./axios-transport";

    const provider = new Provider(new AxiosTransport());

    const info await provider.getNetworkInfo()
    
    console.log(info);

    >> { chain_id: 1, version: "v0.12.0" }

Currently, the `js-moi-provider` package provides built-in HTTP and WebSocket
transports for connecting to MOI nodes. Developers can use these transports
to establish connections with the MOI network and retrieve data from the blockchain.

Classes
*******

.. js:autoclass:: HttpTransport

   Documentation for HttpTransport.