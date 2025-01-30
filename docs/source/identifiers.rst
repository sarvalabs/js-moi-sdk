Identifier
==========

In the MOI network ecosystem, an identifier is a unique string
that represents a specific asset, logic or participant. Full 
specification of identifier can be found in the
`Specification <https://github.com/sarvalabs/go-moi-identifiers/blob/main/SPECIFICATION.md>`_.
This package provides functionality to extract flags, metadata,
variant IDs, and account IDs from an identifier. It also includes
validation for multiple versions of each identifier.

Installation
------------

This package is already included in the ``js-moi-sdk`` package, if you want to install
`js-moi-identifiers <https://www.npmjs.com/package/js-moi-identifiers>`_ package separately,
you can install it using the following command:

**Using npm**

.. code-block:: bash

    npm install js-moi-identifiers

**Using yarn**

.. code-block:: bash

    yarn add js-moi-identifiers

**Using pnpm**

.. code-block:: bash

    pnpm add js-moi-identifiers

Participant
-----------

.. autoclass:: ParticipantId
   :members: 

