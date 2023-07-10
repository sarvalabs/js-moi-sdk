=========
Providers
=========

--------------------------------------------------------------------------------

A Provider is a convenient interface for connecting to MOI nodes and retrieving 
data from the blockchain. With the providers module, developers can choose from 
various MOI providers, such as Voyage, to establish a connection with the MOI 
network. 

The Provider class abstracts away the complexities of interacting directly 
with the MOI network and provides a consistent and straightforward API for 
retrieving blockchain data. Whether it's querying account balances, interaction 
history, or logic information, the providers module simplifies the process of 
connecting to MOI nodes and fetching data, making it easier for developers to 
build applications that interact with the MOI network.

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

Execution Methods
~~~~~~~~~~~~~~~~~

.. autofunction:: BaseProvider#sendInteraction

Query Methods
~~~~~~~~~~~~~

.. autofunction:: getAssetInfoByAssetID

.. autofunction:: getInteractionReceipt

.. autofunction:: getStorageAt

.. autofunction:: getLogicManifest

.. autofunction:: getContent

.. autofunction:: getStatus

.. autofunction:: getInspect

.. autofunction:: getDBEntry

.. autofunction:: getAccounts

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

The current version of the MOI protocol does not include support for invoking 
JSON-RPC methods over a WebSocket connection. However, it is expected to be 
added in upcoming releases of the protocol.

.. code-block:: javascript

    // Example
    const provider = new WebSocketProvider("ws://localhost:1600/ws", {
        reconnectOptions: {
            auto: true,
            delay: 5000
        }
    });

The event's listed below are related to the WebSocketProvider itself and 
its connection status and operation. Theses are not specific to blockchain data.

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

.. ``ALL_TESSERACTS`` - This event is triggered when a new tesseract is mined on 
.. the blockchain. It provides information about the tesseract, such as its 
.. height, hash, timestamp, and other relevant data.

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
