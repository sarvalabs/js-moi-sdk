# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'js-moi-sdk'
copyright = '2023, Sarva Labs Inc. & MOI Protocol Developers'
author = 'Sarva Labs Inc'

# The version info for the project you're documenting, acts as replacement for
# |version| and |release|, also used in various other places throughout the
# built documents.
#
# The short X.Y version.
version = u'v0.3.0-rc2'
# The full version, including alpha/beta/rc tags.
release = u'v0.3.0-rc2'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = ['sphinx_js']
root_for_relative_js_paths = '~/'
js_source_path = [
    '../../packages/js-moi-manifest/dist', 
    '../../packages/js-moi-providers/dist',
    '../../packages/js-moi-signer/dist',
    '../../packages/js-moi-logic/dist',
    '../../packages/js-moi-bip39/dist',
    '../../packages/js-moi-hdnode/dist',
    '../../packages/js-moi-wallet/dist',
    '../../packages/js-moi-utils/dist'
]
primary_domain = 'js'

templates_path = ['_templates']
exclude_patterns = []

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
html_css_files = ["css/custom.css"]

# Path to the favicon file relative to the conf.py file
html_favicon = '_static/img/favicon.svg'
