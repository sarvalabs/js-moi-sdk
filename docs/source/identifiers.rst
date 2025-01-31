Identifier
==========

In the MOI network ecosystem, an identifier is a unique string
that represents a specific asset, logic or participant. Full 
specification of identifier can be found in the
`Specification <https://github.com/sarvalabs/go-moi-identifiers/blob/main/SPECIFICATION.md>`_.
This package provides functionality to extract flags, metadata,
variant IDs, and account IDs from an identifier. It also includes
validation for multiple versions of each identifier.

Identifier Tag
--------------
.. autoclass:: IdentifierTag
    :members: value, getKind, getVersion, getTag, getMaxSupportedVersion, validate


Identifier
----------

.. autoclass:: Identifier
    :members: getFingerprint, getVersion,getFlags, createNewVariant, getMetadata, getVariant, getTag, toBytes, toHex, toString, toJSON

.. autofunction:: isIdentifier

Participant Id
--------------

.. autoclass:: ParticipantId
    :members: validate, isValid


.. autofunction:: createParticipantId


Logic Id
--------

.. autoclass:: LogicId
    :members: validate, isValid


Asset Id
--------

.. autoclass:: AssetId
    :members: validate, isValid
