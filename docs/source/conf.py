# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'moi.js'
copyright = '2023, Sarva Labs Inc. & MOI Protocol Developers'
author = 'Sarva Labs Inc'

# The version info for the project you're documenting, acts as replacement for
# |version| and |release|, also used in various other places throughout the
# built documents.
#
# The short X.Y version.
version = u'v0.1.0'
# The full version, including alpha/beta/rc tags.
release = u'v0.1.0'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = ['sphinx_js']
root_for_relative_js_paths = '~/'
js_source_path = [
    '../../packages/moi-abi/dist', 
    '../../packages/moi-providers/dist',
    '../../packages/moi-signer/dist',
    '../../packages/moi-logic/dist',
    '../../packages/moi-hdnode/dist',
    '../../packages/moi-wallet/dist',
    '../../packages/moi-utils/dist'
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
