# AGENTS.md

Zotero 7+ bootstrapped plugin. No build step beyond zipping `src/`.

- `src/bootstrap.js`: lifecycle hooks only. All logic lives in `src/content/page-count.js`.
- The column reads page counts from the Zotero database: the `pages` field, then `numPages`, then the best PDF's fulltext index (`Zotero.Fulltext`). `loadAll()` loads every count in one query at startup. `load()` handles items it missed, one at a time.
- Column data providers are synchronous. Values that arrive later reach the screen through `Zotero.Notifier.trigger("refresh", "item", ids)`.
- `tests/` covers the page-range parser. It loads `src/content/page-count.js` with a stub `Zotero` global.
- `docs/` is the GitHub Pages site (static HTML, no framework).
- Version lives in `src/manifest.json`. Releases are made in the GitHub UI; `.github/workflows/ci.yml` runs on `release: published` and attaches the .xpi and update.json. Never upload release assets by hand.
- `manifest.applications.zotero` needs `id`, `update_url`, `strict_min_version` and `strict_max_version`. Zotero 10 refuses to install the plugin without them.
- VCS is jj.
