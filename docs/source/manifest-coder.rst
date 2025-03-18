Manifest Call Encoder
=====================

The Manifest Call Encoder package provides functionality for encoding and decoding data
in accordance with the MOI Manifest Specification. This specification defines the structure
of routines, classes, methods, and state within a logic object, ensuring standardized
interaction with its properties.

This package enables developers to encode data that conforms to the format prescribed by
the logic Manifest. Proper encoding is essential for invoking routines on a logic object,
as it ensures that routine parameters are correctly structured to meet the expectations
defined within the Manifest.

In addition to encoding, the package facilitates the decoding of data received from the
blockchain or logic objects. Developers can interpret routine call results and other
Manifest-encoded data structures, extracting meaningful information for further processing.
This functionality enhances the efficiency and accuracy of data interpretation within the
MOI network.

Classes
-------

.. autoclass:: ElementDescriptor
   :members:

.. autoclass:: ManifestCoder
   :members:

.. autoclass:: Schema
   :members:

Functions
---------

.. autofunction:: isPrimitiveType

.. autofunction:: isArray

.. autofunction:: isClass

.. autofunction:: isMap