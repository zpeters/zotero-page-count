/* Zotero 7+ bootstrapped plugin entry point. All logic lives in content/page-count.js. */

function install() {}

async function startup({ rootURI }) {
	await Zotero.initializationPromise;

	Services.scriptloader.loadSubScript(rootURI + "content/page-count.js");
	Zotero.PageCount.init();
}

function shutdown(data, reason) {
	if (reason === APP_SHUTDOWN) {
		return;
	}
	Zotero.PageCount?.shutdown();
	delete Zotero.PageCount;
}

function uninstall() {}
