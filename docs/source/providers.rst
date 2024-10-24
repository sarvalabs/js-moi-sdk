=========
Providers
=========

--------------------------------------------------------------------------------

A Provider is a convenient interface for connecting to MOI nodes and retrieving 
data from the blockchain. With the providers module, developers can choose from 
various MOI providers such as Voyage to establish a connection with the MOI 
network. 

The Provider class abstracts away the complexities of interacting directly 
with the MOI network and provides a consistent and straightforward API for 
retrieving blockchain data. Whether it's querying account balances, interaction 
history, or logic information, the providers module simplifies the process of 
connecting to MOI nodes and fetching data, making it easier for developers to 
build applications that interact with the MOI network.

Types
-----
**InteractionInfo**

The ``InteractionInfo`` interface represents information about an interaction. It has the following properties:

* ``nonce`` - ``string``: The nonce value.
* ``type`` - ``string``: The type of the interaction.
* ``sender`` - ``string``: The sender of the interaction.
* ``receiver`` - ``string``: The receiver of the interaction.
* ``cost`` - ``string``: The cost of the interaction.
* ``fuel_price`` - ``string``: The fuel price for the interaction.
* ``fuel_limit`` - ``string``: The fuel limit for the interaction.
* ``input`` - ``string``: The input data for the interaction.
* ``hash`` - ``string``: The hash of the interaction.

**Content**

The ``Content`` interface represents ixpool information. It has the following properties:

* ``pending`` - ``Map<string, Map<number | bigint, InteractionInfo>>``: A map representing pending interactions in the ixpool.
* ``queued`` - ``Map<string, Map<number | bigint, InteractionInfo>>``: A map representing queued interactions in the ixpool.

**ContentFrom**

The ``ContentFrom`` interface represents ixpool information based on the sender. It has the following properties:

* ``pending`` - ``Map<number | bigint, InteractionInfo>``: A map representing pending interactions in the ixpool belonging to a specific sender.
* ``queued`` - ``Map<number | bigint, InteractionInfo>``: A map representing queued interactions in the ixpool belonging to a specific sender.

**Status**

The ``Status`` interface represents the status of ixpool. It has the following properties:

* ``pending`` - ``number | bigint``: The number or bigint value representing the number of pending interactions in ixpool.
* ``queued`` - ``number | bigint``: The number or bigint value representing the number of queued interactions in ixpool.

**WaitTime**

The ``WaitTime`` interface represents ixpool wait time information. It has the following properties:

* ``expired`` - ``boolean``: A boolean indicating if the wait time has expired.
* ``time`` - ``number | bigint``: The number or bigint value representing the wait time.

**Inspect**

The ``Inspect`` interface represents ixpool inspection information. It has the following properties:

* ``pending`` - ``Map<string, Map<string, string>>``: A map representing the pending interactions in ixpool.
* ``queued`` - ``Map<string, Map<string, string>>``: A map representing the queued interactions in ixpool.
* ``wait_time`` - ``Map<string, WaitTime>``: A map representing the wait times of each account in ixpool.

**Options**

The ``Options`` interface represents the **tesseract** options. It has the following properties:

* ``tesseract_number`` (optional) - ``number``: The Tesseract number.
* ``tesseract_hash`` (optional) - ``string``: The Tesseract hash.

**ContextInfo**

The ``ContextInfo`` interface represents information about the context. It has the following properties:

* ``behaviour_nodes`` - ``string[]``: An array of strings representing behavior nodes.
* ``random_nodes`` - ``string[]``: An array of strings representing random nodes.
* ``storage_nodes`` - ``string[]``: An array of strings representing storage nodes.

**TDUBase**

The ``TDUBase`` interface represents the base structure for TDU (Total Digital Utility). It has the following properties:

* ``asset_id`` - ``string``: The asset id.

**TDU**

The ``TDU`` interface extends ``TDUBase`` and represents a Total Digital Utility. It has the following additional property:

* ``amount`` - ``number | bigint``: The amount associated with the asset id.

**AccountState**

The ``AccountState`` interface represents the state of an account. It has the following properties:

* ``nonce`` - ``string``: The nonce value.
* ``acc_type`` - ``number``: The account type.
* ``balance`` - ``string``: The account balance.
* ``asset_approvals`` - ``string``: The asset approvals.
* ``context_hash`` - ``string``: The context hash.
* ``storage_root`` - ``string``: The storage root.
* ``logic_root`` - ``string``: The logic root.
* ``file_root`` - ``string``: The file root.

**AccountMetaInfo**

The ``AccountMetaInfo`` interface represents meta-information about an account. It has the following properties:

* ``type`` - ``number``: The account type.
* ``address`` - ``string``: The account address.
* ``height`` - ``string``: The account height.
* ``tesseract_hash`` - ``string``: The Tesseract hash.
* ``lattice_exists`` - ``boolean``: Indicates whether a lattice exists for the account.
* ``state_exists`` - ``boolean``: Indicates whether a state exists for the account.

**AccSyncStatus**

The ``AccSyncStatus`` interface encapsulates information about account synchronization. It includes the following properties:

* ``current_height`` - ``string``: The current tesseract height.
* ``expected_height`` - ``string``: The expected tesseract height.
* ``is_primary_sync_done`` - ``boolean``: Indicates whether the primary sync is completed.

**NodeSyncStatus**

The ``NodeSyncStatus`` interface encapsulates information about node synchronization. It includes the following properties:

* ``total_pending_accounts`` - ``string``: The total no of unsynced accounts.
* ``is_principal_sync_done`` - ``boolean``: Indicates whether the principal sync is completed.
* ``principal_sync_done_time`` - ``string``: The time at which principal sync got completed.
* ``is_initial_sync_done`` - ``boolean``: Indicates whether the initial sync is completed.

**SyncStatus**

The ``SyncStatus`` interface represents synchronization status information of an account and it's nodes. It has the following properties:

* ``acc_sync_status`` - ``AccSyncStatus``: The account sync information.
* ``node_sync_status`` - ``NodeSyncStatus | null``: The node sync information.

**InteractionRequest**

The ``InteractionRequest`` interface represents a signed interaction request. It has the following properties:

* ``ix_args`` - ``string``: The encoded interaction parameters.
* ``signature`` - ``string``: The signature for the interaction.

**InteractionResponse**

The ``InteractionResponse`` interface represents a response to an interaction. It has the following properties:

* ``hash`` - ``string``: The hash of the interaction.
* ``wait`` - ``function``: A function that returns a promise for the interaction receipt after waiting for a specified timeout.
* ``result`` - ``function``: A function that returns a promise for the result of the interaction after waiting for a specified timeout.

**InteractionCallResponse**

The ``InteractionCallResponse`` interface represents a response to an interaction. It has the following properties:

* ``receipt`` - ``InteractionReceipt``: The receipt of the interaction.
* ``result`` - ``function``: A function that returns the result of an interaction.

**StateHash**

The ``StateHash`` interface represents state hash information. It has the following properties:

* ``address`` - ``string``: The address associated with the state hash.
* ``hash`` - ``string``: The state hash value.

**ContextHash**

The ``ContextHash`` interface represents context hash information. It has the following properties:

* ``address`` - ``string``: The address associated with the context hash.
* ``hash`` - ``string``: The context hash value.

**InteractionReceipt**

The ``InteractionReceipt`` interface represents a receipt for an interaction. It has the following properties:

* ``ix_type`` - ``string``: The type of the interaction.
* ``ix_hash`` - ``string``: The hash of the interaction.
* ``status`` - ``number``: The status of the interaction.
* ``fuel_used`` - ``string``: The amount of fuel used for the interaction.
* ``participants`` - ``Participant[]``: The participants involved in the interaction.
* ``extra_data`` - ``AssetCreationReceipt | AssetMintOrBurnReceipt | LogicDeployReceipt | LogicInvokeReceipt | null``: Additional data specific to the interaction type or null.
* ``from`` - ``string``: The sender of the interaction.
* ``to`` - ``string``: The receiver of the interaction.
* ``ix_index`` - ``string``: The index of the interaction.
* ``ts_hash`` - ``string``: The hash of the tesseract.

**AssetInfo**

The ``AssetInfo`` interface represents information about an asset. It has the following properties:

* ``symbol`` - ``string``: The symbol of the asset.
* ``operator`` - ``string``: The operator of the asset.
* ``supply`` - ``string``: The supply of the asset.
* ``dimension`` - ``string``: The dimension of the asset.
* ``standard`` - ``string``: The standard of the asset.
* ``is_logical`` - ``boolean``: Indicates whether the asset is logical.
* ``is_stateful`` - ``boolean``: Indicates whether the asset is stateful.
* ``logic_id`` (optional) - ``string``: The ID of the logic associated with the asset (if applicable).

**Registry**

The ``Registry`` interface represents registry information. It has the following properties:

* ``asset_id`` - ``string``: The ID of the asset in the registry.
* ``asset_info`` - ``AssetInfo``: Information about the asset in the registry.

**Filter**

The ``Filter`` interface represents a filter with a unique identifier. It has the following properties:

* ``id`` - ``string``: The unique identifier for the filter.

**FilterDeletionResult**

The ``FilterDeletionResult`` interface represents the result of a deletion operation. It has the following properties:

* ``status`` - ``boolean``: Indicates whether the deletion was successful (true) or not (false).
**NodeInfo**

The ``NodeInfo`` interface represents information about a node. It has the following property:

* ``krama_id`` - ``string``: The krama id associated with the node.

**ConnectionsInfo**

The ``ConnectionsInfo`` interface provides information about connections and active pub-sub topics. It consists of the following properties:

* ``connections`` - A list of connections, each containing:
    * ``peer_id`` - ``string``: The ID of the peer associated with the connection.
    * ``streams`` - A list of streams, each containing:
        * ``protocol`` - ``string``: The protocol of the stream.
        * ``direction`` - ``number``: The direction of the stream.

* ``inbound_conn_count`` - ``number``: The count of inbound connections.
* ``outbound_conn_count`` - ``number``: The count of outbound connections.
* ``active_pub_sub_topics`` - A dictionary where the keys are topic strings and the values are numbers representing the count of active connections for each topic.

**AssetCreatePayload**

The ``AssetCreatePayload`` interface represents a payload for creating an asset. It has the following properties:

* ``symbol`` - ``string``: The symbol of the asset.
* ``supply`` - ``number | bigint``: The supply of the asset.
* ``standard`` - ``AssetStandard``: The asset standard (optional).
* ``dimension`` - ``number``: The dimension of the asset (optional).
* ``is_stateful`` - ``boolean``: Indicates whether the asset is stateful (optional).
* ``is_logical`` - ``boolean``: Indicates whether the asset is logical (optional).
* ``logic_payload`` - ``LogicPayload``: The payload for the associated logic (optional).

**AssetMintOrBurnPayload**

The ``AssetMintOrBurnPayload`` interface represents a payload for minting or burning an asset. It has the following properties:

* ``asset_id`` - ``string``: The ID of the asset.
* ``amount`` - ``number | bigint``: The amount to mint or burn.

**LogicPayload**

The ``LogicPayload`` interface represents a payload for logic deployment or invokation. It has the following properties:

* ``logic_id`` - ``string``: The ID of the logic (optional).
* ``callsite`` - ``string``: The callsite for the logic execution.
* ``calldata`` - ``Uint8Array``: The calldata for the logic execution.
* ``manifest`` - ``Uint8Array``: The encoded manifest to deploy (optional).

**InteractionPayload**

The ``InteractionPayload`` type represents a payload for an interaction. It can be one of the following types: ``AssetCreatePayload``, ``AssetMintOrBurnPayload``, or ``LogicPayload``.

**InteractionObject**

The ``InteractionObject`` interface represents an interaction object. It has the following properties:

* ``type`` - ``IxType``: The type of the interaction.
* ``nonce`` - ``number | bigint``: The nonce value (optional).
* ``sender`` - ``string``: The sender of the interaction (optional).
* ``receiver`` - ``string``: The receiver of the interaction (optional).
* ``payer`` - ``string``: The payer of the interaction (optional).
* ``transfer_values`` - ``Map<string, number | bigint>``: Transfer values associated with the interaction (optional).
* ``perceived_values`` - ``Map<string, number | bigint>``: Perceived values associated with the interaction (optional).
* ``fuel_price`` - ``number | bigint``: The fuel price for the interaction.
* ``fuel_limit`` - ``number | bigint``: The fuel limit for the interaction.
* ``payload`` - ``InteractionPayload``: The payload of the interaction (optional).

**CallorEstimateIxObject**

The ``CallorEstimateIxObject`` interface extends ``InteractionObject`` and represents an interaction object. It has the following properties:

* ``nonce`` - ``number | bigint``: The nonce value.
* ``sender`` - ``string``: The sender of the interaction.

**WsReconnectOptions**

The ``WsReconnectOptions`` interface represents options for websocket reconnection. It has the following properties:

* ``auto`` - ``boolean``: Specifies if automatic reconnection should be enabled (optional).
* ``delay`` - ``number``: The delay duration in milliseconds between reconnection attempts (optional).
* ``maxAttempts`` - ``number``: The maximum number of reconnection attempts (optional).
* ``onTimeout`` - ``boolean``: Specifies whether the reconnection attempts should be triggered on timeout (optional).

**WebsocketProviderOptions**

The ``WebsocketProviderOptions`` interface represents options for a websocket provider. It has the following properties:

* ``host`` - ``string``: The host of the websocket connection (optional).
* ``timeout`` - ``number``: The timeout value for the connection (optional).
* ``reconnect`` - ``any``: Reconnection options for the websocket connection (optional).
* ``reconnectDelay`` - ``number``: The delay duration for reconnection attempts (optional).
* ``reconnectOptions`` - ``WsReconnectOptions``: Additional options for reconnection (optional).
* ``headers`` - ``any``: Custom headers for the websocket connection (optional).
* ``protocol`` - ``string``: The protocol to be used for the connection (optional).
* ``clientConfig`` - ``object``: Configuration options for the websocket client (optional).
* ``requestOptions`` - ``any``: Additional options for the websocket connection request (optional).
* ``origin`` - ``string``: The origin for the websocket connection (optional).

.. note::

   **Important:** Please note that the current version of js-moi-sdk only supports the `reconnectOptions` property of `WebsocketProviderOptions`. Other properties may not be available or functional in the current version.


Abstract Provider
-----------------
AbstractProvider is an abstract class that defines the common interface and 
methods for all providers. It serves as a blueprint for other provider classes, 
enforcing consistent behavior and standardizing the processing of input 
arguments, output results, and event tracking within an environment where 
network consistency is achieved gradually.

Base Provider
-------------

A BaseProvider is a subclass of AbstractProvider and acts as a fundamental 
building block for other subclasses. The BaseProvider class promotes code 
reusability and modularity by defining common methods and attributes. It 
facilitates the development of provider classes with a cohesive and 
consistent approach, reducing redundancy and enhancing maintainability.

Account Methods
~~~~~~~~~~~~~~~

.. autofunction:: getBalance

.. autofunction:: getContextInfo

.. autofunction:: getTDU

.. autofunction:: getInteractionByHash

.. autofunction:: getInteractionByTesseract

.. autofunction:: getInteractionCount

.. autofunction:: getPendingInteractionCount

.. autofunction:: getAccountState

.. autofunction:: getAccountMetaInfo

.. autofunction:: getContentFrom

.. autofunction:: getWaitTime

.. autofunction:: getTesseract

.. autofunction:: getLogicIds

.. autofunction:: getRegistry

.. autofunction:: getSyncStatus

Execution Methods
~~~~~~~~~~~~~~~~~

.. autofunction:: BaseProvider#call

.. autofunction:: BaseProvider#estimateFuel

.. autofunction:: BaseProvider#sendInteraction

Query Methods
~~~~~~~~~~~~~

.. autofunction:: getAssetInfoByAssetID

.. autofunction:: getLogs

.. autofunction:: getInteractionReceipt

.. autofunction:: getStorageAt

.. autofunction:: getLogicManifest

.. autofunction:: getContent

.. autofunction:: getStatus

.. autofunction:: getInspect

.. autofunction:: getPeers

.. autofunction:: BaseProvider#getVersion

.. autofunction:: getNodeInfo

.. autofunction:: getNewTesseractFilter

.. autofunction:: getNewTesseractsByAccountFilter

.. autofunction:: getPendingInteractionFilter

.. autofunction:: getLogsFilter

.. autofunction:: getFilterChanges

.. autofunction:: removeFilter

Event Methods
~~~~~~~~~~~~~

.. autofunction:: on

.. autofunction:: off

.. autofunction:: once

.. autofunction:: listeners

.. autofunction:: listenerCount

.. autofunction:: removeAllListeners

Json Rpc Provider
-----------------
The JsonRpcProvider is a subclass of ``BaseProvider`` it facilitates interaction 
with MOI nodes using the JSON-RPC protocol. It offers a flexible interface to 
send HTTP (or HTTPS) requests and retrieve data from the blockchain.

.. code-block:: javascript

    // Example
    const provider = new JsonRpcProvider("http://localhost:1600");

Usage
~~~~~

Tesseract
^^^^^^^^^

.. code-block:: javascript

    // Example
    const address  = "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b";
    const options = { 
        tesseract_number: 1 
    }
    const tesseract = await provider.getTesseract(address, true, options);
    console.log(tesseract)

    // Output:
    /*
        {
            "header": {
                "address": "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b",
                "prev_hash": "0x034e75e7d8b2910004e70d6d45157166e87fb1d47485248edf8919108179307e",
                "height": "0x1",
                "fuel_used": "0x64",
                "fuel_limit": "0x3e8",
                ...
            },
            "body": {
                "state_hash": "0x82543da922babd1c32b4856edd44a4bf5881edc3714cfe90b6d1576e00164aee",
                "context_hash": "0xa1058908a4db1594632be49790b24211cd4920a0f27b3d2b876808f910b3e320",
                "interaction_hash": "0x8aab5bc0817393d2ea163482c13ccc0f8f3e01cef0c889b8b3cffb51e4d76894",
                "receipt_hash": "0x3e35a1f481df15da518ef6821f7b6f340f74f4f9c3f3eb30b15944ffea144f75",
                ...
            },
            "ixns": [
                {
                    "type": 3,
                    "nonce": "0x0",
                    "sender": "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b",
                    "receiver": "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "payer": "0x0000000000000000000000000000000000000000000000000000000000000000",
                    ...
                    "hash": "0x7750a0f1c848e05f1e52204e464af0d9d2f06470117e9187bb3643216c4c4ee9"
                }
            ],
            "seal": "0x0460afdac7733765afa6410e58ebe0d69d484dfe021fba989438c51c69c078d6677446f179176681f005c0d755979bf81c090e02fdf8544bc618463e86c2778b7764b90c813f58a5965a47c5572bcf5784743e4c6c425e4bfa0f18b043e9aff21183",
            "hash": "0xd343a7336df38590b47e5b20cb65940f463c358a08cded7af7cd6cde63a5575f"
        }
    */

Context Info
^^^^^^^^^^^^

.. code-block:: javascript

    // Example
    const address = "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b"
    const contextInfo = await provider.getContextInfo(address)
    console.log(contextInfo)

    // Output
    /*
        {
            "behaviour_nodes": [
                "3Wywv4WykAqs6mH1YAWNHKYFw77tuF4iFkcQPxyFgzT9XEPPEkaK.16Uiu2HAkzhT4eoJoQWz9P7S65j6F6dSHEVGN925AXg5kqhisgSai",
                "3Wy3MY7saXna1ypZMYVooUPD9k3hU7vWXQvTRFdpabmSC7pr8om9.16Uiu2HAm3hy8wAw9hjuxXqGGmnpQQrU7ouZWwJuDAQJbesvg49hX"
            ],
            "random_nodes": [],
            "storage_nodes": []
        }
    */

WebSocket Provider
------------------
The WebSocketProvider is a subclass of ``BaseProvider`` that enables interaction 
with MOI nodes using the WebSocket protocol. It provides a flexible interface 
for sending and receiving data from the blockchain in real-time.

Using WebSocket, the provider establishes a persistent connection with the MOI 
node, allowing for efficient and continuous communication. This is particularly 
useful for applications requiring real-time updates or streaming data from 
the blockchain.

The WebSocketProvider offers similar functionality as the JsonRpcProvider but 
operates over WebSocket instead of HTTP or HTTPS. It allows for subscribing to 
specific events or filters, receiving instant notifications when relevant data 
changes on the blockchain.

The MOI protocol has incorporated support for invoking JSON-RPC methods over a 
WebSocket connection, facilitating real-time interaction with the blockchain.

.. code-block:: javascript

    // Example
    const provider = new WebSocketProvider("ws://localhost:1600/ws", {
        reconnectOptions: {
            auto: true,
            delay: 5000,
            maxAttempts: 50
        }
    });

WebSocket Events
~~~~~~~~~~~~~~~~
The event's listed below are related to the WebSocketProvider itself and 
its connection status and operation. These are not specific to blockchain data.

``CONNECT`` - This event is triggered when the WebSocketProvider successfully 
establishes a connection with the MOI node. It indicates that the WebSocket 
connection has been established and is ready for sending and receiving data.

``RECONNECT`` - This event occurs when the WebSocketProvider attempts to 
reconnect to the MOI node after a disconnection.

``CLOSE`` - This event is emitted when the WebSocket connection is closed 
intentionally or due to an error. It provides information about the reason for 
the closure, such as a manual disconnection or a network failure.

``DEBUG`` - This event is primarily used for debugging purposes. It provides 
additional information or logs related to the WebSocketProvider's internal 
operations, network communication, or any other relevant debugging details.

``ERROR`` - This event is emitted when an error occurs during the 
WebSocketProvider's operation. It indicates that something unexpected or 
erroneous has happened, such as a network error, an invalid response from the 
MOI node, or any other unforeseen issue.

Protocol Events
~~~~~~~~~~~~~~~
The event's listed below are specific to blockchain data.

``ALL_TESSERACTS`` - This event is triggered when a new tesseract is mined on 
the blockchain. It provides information about the tesseract, such as its 
height, hash, timestamp, and other relevant data.

``0x...`` (address) - This event is triggered when a new tesseract belonging to 
the given address is mined on the blockchain. It provides information about the 
tesseract.

``PENDING_INTERACTIONS`` - This event is emitted when a new interaction is added to
interaction pool. It provides an interaction hash.

Usage
~~~~~

Subscribing to all tesseracts
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    // Example
    const handleTesseracts = async (tesseract) => {
        console.log("New tesseract finalized", tesseract);
    };

    // Listen for "connect" event
    provider.on(WebSocketEvents.CONNECT, () => {
        console.log("WebSocket connection established successfully");

        // Listen for "tesseracts" event
        provider.on(WebSocketEvents.ALL_TESSERACTS, handleTesseracts);

        // Listen for "pending_interactions" event
        provider.on(WebSocketEvents.PENDING_INTERACTIONS, handleInteraction);
    });

    // Listen for "debug" event
    provider.on(WebSocketEvents.DEBUG, (info) => {
        console.log("WebSocket provider debug info:", info);
    });

    // Handle WebSocket connection errors
    provider.on(WebSocketEvents.ERROR, (err) => {
        console.log("WebSocket connection error:", err);
    });

    // Handle WebSocket connection close
    provider.on(WebSocketEvents.CLOSE, (info) => {
        console.log("WebSocket connection closed: ", info);

        // Remove "tesseracts" event listener
        provider.off(WebSocketEvents.ALL_TESSERACTS, handleTesseracts);
    });

Subscribing to account specific tesseracts
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    // Example
    const adddress = "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b";
    const handleTesseracts = async (tesseract) => {
        console.log("New tesseract finalized", tesseract);
    };

    // Listen for "connect" event
    provider.on(WebSocketEvents.CONNECT, () => {
        console.log("WebSocket connection established successfully");

        // Listen for "tesseracts" event
        provider.on(adddress, handleTesseracts);
    });

    // Listen for "debug" event
    provider.on(WebSocketEvents.DEBUG, (info) => {
        console.log("WebSocket provider debug info:", info);
    });

    // Handle WebSocket connection errors
    provider.on(WebSocketEvents.ERROR, (err) => {
        console.log("WebSocket connection error:", err);
    });

    // Handle WebSocket connection close
    provider.on(WebSocketEvents.CLOSE, (info) => {
        console.log("WebSocket connection closed: ", info);

        // Remove "tesseracts" event listener
        provider.off(adddress, handleTesseracts);
    });

Websocket enabled JSON-RPC communication
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    // Example
    const address = "0x102e973bc33200fdb3383b4c8e490433743211edb33e53b8915d5a4b2668cf5e";
    const contextInfo = await provider.getContextInfo(address)
    console.log(contextInfo)

    // Output
    /*
        {
            "behaviour_nodes": [
                "3WwLTp3WztxoLKKdPSLn9PRDPyB5mvVfGCpahP9kYaiqjrE8LwH1.16Uiu2HAm6wumV4gJkAAqTkfowUcbF1i1yQmLFcAhjbbJuDu2hURC"
            ],
            "random_nodes": [],
            "storage_nodes": []
        }
    */

Voyage Provider
---------------
The **VoyageProvider** is a subclass of ``BaseProvider`` it allows users to 
connect their applications to the MOI network using the voyage service.
Voyage is a reliable and scalable infrastructure provider for MOI, offering a 
convenient way to access the MOI blockchain without the need to run a full node. 
It acts as a middle layer between applications and the blockchain, handling the 
complexities of node management, synchronization, and data retrieval.

.. code-block:: javascript

    // Example
    const provider = new VoyageProvider("babylon");

Usage
~~~~~

Account State
^^^^^^^^^^^^^

.. code-block:: javascript

    // Example
    const address = "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b";
    const options = {
        tesseract_number: 1
    }
    const account = await provider.getAccountState(address, options)
    console.log(account)

    // Output
    /*
        {
            "acc_type": 2,
            "asset_approvals": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "asset_registry": "0x6800fedfcca2fa63d9b404d09c2b206476930468013e6150178d7f37aad120ac",
            "balance": "0x48b8dbcc3d7979c47f6272010ed74f59101b2bfe9d261d6797772dacd37f4400",
            "context_hash": "0xa1058908a4db1594632be49790b24211cd4920a0f27b3d2b876808f910b3e320",
            "file_root": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "logic_root": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "nonce": "0x1",
            "storage_root": "0x0000000000000000000000000000000000000000000000000000000000000000"
        }
    */

Interaction By Hash
^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    // Example
    const ixHash = "0x7750a0f1c848e05f1e52204e464af0d9d2f06470117e9187bb3643216c4c4ee9";
    const interaction = await provider.getInteractionByHash(ixHash)
    console.log(interaction)

    // Output
    /*
        {
            "type": 3,
            "nonce": "0x0",
            "sender": "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b",
            "receiver": "0x0000000000000000000000000000000000000000000000000000000000000000",
            ...
            "payload": {
                "symbol": "TESTING",
                "supply": "0x130d41",
                ...
            },
            ...
            "hash": "0x7750a0f1c848e05f1e52204e464af0d9d2f06470117e9187bb3643216c4c4ee9",
            "signature": "0x01473045022100d6491012bf4c3c9adbfd919100afb1de570079542197c472fb08295ab97df5f502200e58ec59d0243d8a76a20ee1e676e9f1098d351dd7c7ad55ea5777fb4ec26e5202",
            ...
            "ix_index": "0x0"
        }
    */
