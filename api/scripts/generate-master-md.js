const QueueManager = require("../dist/services/QueueManager").default; // eslint-disable-line @typescript-eslint/no-var-requires

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error("Please specify a PID.");
    return;
}
QueueManager.getInstance().queueMetadataOperation(args[0], "add");
