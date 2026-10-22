<p align="center">
  <img src="docs/page-count.svg" width="72" height="72" alt="">
</p>

<h1 align="center">Page Count</h1>

<p align="center">
  A Zotero plugin that adds a <code>#Pages</code> column to your item list.<br>
  <a href="https://zpeters.github.io/zotero-page-count/">Website</a> ·
  <a href="https://github.com/zpeters/zotero-page-count/releases/latest">Download</a>
</p>

<p align="center">
  <a href="https://github.com/zpeters/zotero-page-count/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/zpeters/zotero-page-count?color=0f766e"></a>
  <img alt="Zotero 7+" src="https://img.shields.io/badge/Zotero-7%2B-0f766e">
  <a href="https://github.com/zpeters/zotero-page-count/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/zpeters/zotero-page-count/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/zpeters/zotero-page-count?color=555"></a>
</p>

---

Zotero shows titles, authors and dates, but not how long a paper is. Page Count
adds a **#Pages** column so you can see the length of each item at a glance.

## How the count is found

For each regular item, the first source that has a value wins:

1. **The `pages` field.** A range such as `12-19` counts as 8 pages. A list
   such as `12, 14-16` counts as 4. Roman numerals and article IDs such as
   `e0123` are not counted.
2. **The `numPages` field.**
3. **The PDF.** If the item has a PDF attachment, the plugin uses the page count
   that Zotero stores when it indexes the PDF's text. This is the oldest PDF
   attached to the item.

Standalone PDFs use their own page count.

Items with none of these show an empty cell.

## Install

1. Download `page-count.xpi` from the [latest release](https://github.com/zpeters/zotero-page-count/releases/latest).
2. In Zotero, open **Tools → Plugins**.
3. Click the gear icon, choose **Install Plugin From File…**, and select the file.

Zotero checks for updates of the plugin automatically.

## Use

After you install it, right-click the column header of your item list and
choose **#Pages**.

Counts load in the background. When Zotero has indexed a PDF, its count appears
in the list.

## Requirements

- Zotero 7 or later.
- For PDF counts, Zotero must have indexed the PDF's text. Zotero does this
  automatically for most PDFs.

## Development

The plugin is plain JavaScript with no build step. The tools are provided by
the Nix flake:

```sh
direnv allow     # or: nix develop
just check       # syntax, manifest and parser tests
just build       # writes dist/page-count.xpi and dist/update.json
```

The parser tests live in `tests/`. Run them with `just check`.

## License

MIT. See [LICENSE](LICENSE).
