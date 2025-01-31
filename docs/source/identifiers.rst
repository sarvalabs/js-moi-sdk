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
    :members:


Identifier
----------

.. autoclass:: Identifier
    :members:

.. autofunction:: isIdentifier

Participant Id
--------------

.. autoclass:: ParticipantId
    :members:


.. autofunction:: createParticipantId


Logic Id
--------

.. autoclass:: LogicId
    :members:


Asset Id
--------

.. autoclass:: AssetId
    :members:
