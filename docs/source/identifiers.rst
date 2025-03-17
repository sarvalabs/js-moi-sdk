Identifier
==========

An Identifier is a unique hex value that represents a participant, asset,
or logic object in the MOI ecosystem. Identifiers are used to reference participant,
asset, or logic in interactions and queries. Full specification of identifier can be found in the
`Specification <https://github.com/sarvalabs/go-moi-identifiers/blob/main/SPECIFICATION.md>`_.
This package provides functionality to extract flags, metadata,
variant IDs, and fingerprint from an identifier. It also includes
validation for multiple versions of each identifier.

Classes
-------

.. autoclass:: IdentifierTag
    :members:


.. autoclass:: Identifier
    :members:

.. autoclass:: ParticipantId
    :members:

.. autoclass:: LogicId
    :members:

.. autoclass:: AssetId
    :members:

Functions
---------

.. autofunction:: createParticipantId

.. autofunction:: isIdentifier
