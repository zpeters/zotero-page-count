/* Adds a "Pages" column to the item tree.
 *
 * Sources, in order, for a regular item:
 *   1. the `pages` field, a range such as "12-19" (counted by hand)
 *   2. the `numPages` field
 *   3. the total page count of the best PDF attachment (Zotero fulltext index)
 *
 * Column data providers must return synchronously. The PDF count is read from
 * the database, so it is loaded in the background, cached, and the item tree
 * is redrawn once it arrives. */

Zotero.PageCount = {
	DATA_KEY: "pageCount",
	LABEL: "#Pages",
	PLUGIN_ID: "page-count@zpeters",
	REFRESH_DELAY_MS: 250,

	columnKey: null,
	// item.id -> cell text, kept once a count is found.
	cache: new Map(),
	// item.id -> time (ms) of the last lookup that found no count.
	missAt: new Map(),
	RETRY_MS: 30000,
	// item IDs whose count arrived after their row was drawn.
	dirty: new Set(),
	pending: new Set(),
	refreshTimer: null,

	init() {
		this.columnKey = Zotero.ItemTreeManager.registerColumn({
			dataKey: this.DATA_KEY,
			label: this.LABEL,
			pluginID: this.PLUGIN_ID,
			width: "70",
			dataProvider: (item) => this.cellText(item),
		});
		this.loadAll().catch((err) => Zotero.logError(err));
	},

	// Read the page count of every item's oldest PDF in one query, so most
	// cells already have their value the first time the row is drawn.
	// Returns the item IDs that got a count.
	async loadAll() {
		const rows = await Zotero.DB.queryAsync(
			`SELECT COALESCE(A.parentItemID, A.itemID) AS id, F.totalPages AS total
			FROM itemAttachments A
			JOIN fulltextItems F ON F.itemID = A.itemID
			JOIN items I ON I.itemID = A.itemID
			WHERE A.contentType = 'application/pdf' AND F.totalPages > 0
				AND A.itemID NOT IN (SELECT itemID FROM deletedItems)
			ORDER BY I.dateAdded ASC`,
		);
		const ids = [];
		for (const row of rows) {
			if (!this.cache.has(row.id)) {
				this.cache.set(row.id, String(row.total));
				ids.push(row.id);
			}
		}
		return ids;
	},

	shutdown() {
		if (this.columnKey) {
			Zotero.ItemTreeManager.unregisterColumn(this.columnKey);
		}
		clearTimeout(this.refreshTimer);
		this.cache.clear();
		this.missAt.clear();
		this.pending.clear();
	},

	cellText(item) {
		if (item.isRegularItem()) {
			const fromFields = this.countFromFields(item);
			if (fromFields !== null) {
				return String(fromFields);
			}
		}
		if (this.cache.has(item.id)) {
			return this.cache.get(item.id);
		}
		const missed = this.missAt.get(item.id);
		if (missed === undefined || Date.now() - missed >= this.RETRY_MS) {
			this.load(item);
		}
		return "";
	},

	// Returns a number, or null when the item's own fields give no count.
	countFromFields(item) {
		const fromRange = this.parsePageRange(item.getField("pages"));
		if (fromRange !== null) {
			return fromRange;
		}
		const total = parseInt(item.getField("numPages"), 10);
		return Number.isFinite(total) && total > 0 ? total : null;
	},

	// Counts "12-19" as 8, "12" as 1 and "12, 14-16" as 4.
	// Returns null for anything it cannot read, such as "xii-xv" or "e0123".
	parsePageRange(text) {
		const s = String(text ?? "")
			.replace(/[‐-―−]/g, "-")
			.trim();
		if (!s) {
			return null;
		}
		let total = 0;
		for (const part of s.split(",")) {
			const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
			if (!m) {
				return null;
			}
			const start = Number(m[1]);
			const end = m[2] === undefined ? start : Number(m[2]);
			if (end < start) {
				return null;
			}
			total += end - start + 1;
		}
		return total;
	},

	load(item) {
		if (this.pending.has(item.id)) {
			return;
		}
		this.pending.add(item.id);
		this.pdfCount(item)
			.then((text) => {
				if (text) {
					this.cache.set(item.id, text);
					this.dirty.add(item.id);
				} else {
					this.missAt.set(item.id, Date.now());
				}
			})
			.catch((err) => Zotero.logError(err))
			.finally(() => {
				this.pending.delete(item.id);
				this.scheduleRefresh();
			});
	},

	async pdfCount(item) {
		let attachment = item;
		if (item.isRegularItem()) {
			attachment = await item.getBestAttachment();
		}
		if (!attachment || attachment.attachmentContentType !== "application/pdf") {
			return "";
		}
		const row = await Zotero.Fulltext.getPages(attachment.id);
		return row?.total ? String(row.total) : "";
	},

	// Batch the redraws: many rows can finish loading at about the same time.
	// A "refresh" notification makes the item tree clear the stored values for
	// these rows and redraw them, the same path Zotero uses after an item changes.
	scheduleRefresh() {
		clearTimeout(this.refreshTimer);
		this.refreshTimer = setTimeout(() => {
			const ids = [...this.dirty];
			this.dirty.clear();
			if (ids.length) {
				Zotero.Notifier.trigger("refresh", "item", ids);
			}
		}, this.REFRESH_DELAY_MS);
	},
};
