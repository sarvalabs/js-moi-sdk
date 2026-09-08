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
version = u'v0.8.0'
# The full version, including alpha/beta/rc tags.
release = u'v0.8.0'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = ['sphinx_js']
root_for_relative_js_paths = '~/'
js_source_path = [
    '../../packages/js-moi-manifest/lib.cjs', 
    '../../packages/js-moi-providers/lib.cjs',
    '../../packages/js-moi-signer/lib.cjs',
    '../../packages/js-moi-logic/lib.cjs',
    '../../packages/js-moi-bip39/lib.cjs',
    '../../packages/js-moi-hdnode/lib.cjs',
    '../../packages/js-moi-wallet/lib.cjs',
    '../../packages/js-moi-utils/lib.cjs'
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

# Serve robots.txt / sitemap.xml / llms.txt at the site root. NOTE: canonical
# URLs are emitted by _templates/layout.html (extensionless, matching how the
# host serves pages) instead of html_baseurl, which would append .html and
# point every canonical at a 308 redirect.
html_extra_path = ['_extra']

# Keep the version out of the <title> so search results don't go stale on
# every release; the release string still shows in the sidebar.
html_title = 'js-moi-sdk documentation'

# Expose each page's ".. meta:: :description:" value to the theme template so
# layout.html can reuse it for og:description / twitter:description.
import re as _re

def _inject_page_description(app, pagename, templatename, context, doctree):
    m = _re.search(r'name="description" content="([^"]*)"|content="([^"]*)" name="description"',
                   context.get('metatags', '') or '')
    context['page_description'] = (m.group(1) or m.group(2)) if m else ''

def setup(app):
    app.connect('html-page-context', _inject_page_description)
