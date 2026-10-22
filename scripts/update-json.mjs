// Write dist/update.json, the file Zotero polls through manifest.update_url.
import { readFileSync, writeFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("src/manifest.json", "utf8"));
const { id, strict_min_version, strict_max_version } = manifest.applications.zotero;
const version = manifest.version;
const update = {
	addons: {
		[id]: {
			updates: [
				{
					version,
					update_link: `https://github.com/zpeters/zotero-page-count/releases/download/v${version}/page-count.xpi`,
					applications: { zotero: { strict_min_version, strict_max_version } },
				},
			],
		},
	},
};
writeFileSync("dist/update.json", JSON.stringify(update, null, 2) + "\n");
console.log(`dist/update.json for ${id} ${version}`);
