# zotero-page-count tasks. Run `just` to list them.

default:
    @just --list

# Package src/ as dist/page-count.xpi and write dist/update.json.
build:
    rm -rf dist && mkdir -p dist
    cd src && zip -r -X ../dist/page-count.xpi . -x '.*'
    node scripts/update-json.mjs

# Syntax-check the JS, validate the manifest and run the parser tests.
check:
    node --check src/bootstrap.js
    node --check src/content/page-count.js
    node --check scripts/update-json.mjs
    node -e 'JSON.parse(require("fs").readFileSync("src/manifest.json"))'
    node --test tests/*.mjs

# Serve the GitHub Pages site on http://localhost:8000.
site:
    cd docs && python3 -m http.server 8000
