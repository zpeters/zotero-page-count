import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Load the plugin file with a stub Zotero global, the way Zotero loads it.
const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "content", "page-count.js"), "utf8");
const sandbox = { Zotero: {} };
runInNewContext(source, sandbox);
const { parsePageRange } = sandbox.Zotero.PageCount;

test("single range", () => {
	assert.equal(parsePageRange("12-19"), 8);
});

test("single page", () => {
	assert.equal(parsePageRange("12"), 1);
});

test("list of pages and ranges", () => {
	assert.equal(parsePageRange("12, 14-16"), 4);
});

test("en dash, em dash and minus sign", () => {
	assert.equal(parsePageRange("12–19"), 8);
	assert.equal(parsePageRange("12—19"), 8);
	assert.equal(parsePageRange("12−19"), 8);
});

test("spaces around the dash", () => {
	assert.equal(parsePageRange(" 12 - 19 "), 8);
});

test("empty and missing values give null", () => {
	assert.equal(parsePageRange(""), null);
	assert.equal(parsePageRange(undefined), null);
	assert.equal(parsePageRange("   "), null);
});

test("roman numerals and article IDs give null", () => {
	assert.equal(parsePageRange("xii-xv"), null);
	assert.equal(parsePageRange("e0123"), null);
});

test("reversed range gives null", () => {
	assert.equal(parsePageRange("19-12"), null);
});

test("open-ended range gives null", () => {
	assert.equal(parsePageRange("12-"), null);
});
