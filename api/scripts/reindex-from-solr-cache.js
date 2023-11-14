const QueueManager = require("../dist/services/QueueManager").default; // eslint-disable-line @typescript-eslint/no-var-requires
const SolrCache = require("../dist/services/SolrCache").default; // eslint-disable-line @typescript-eslint/no-var-requires

const queue = QueueManager.getInstance();
const cache = SolrCache.getInstance();
const cachedItems = cache.getDocumentsFromCache();
if (cachedItems === false) {
    console.error("Cache is disabled.");
    return;
}
cachedItems.map(async (file) => {
    console.log(file);
    await queue.performCacheReindexOperation(file);
});
