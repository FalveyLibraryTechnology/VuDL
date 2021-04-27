const JobQueue = require("./dist/services/JobQueue").default; // eslint-disable-line @typescript-eslint/no-var-requires

let jobQueue = new JobQueue(/* TODO: params? */);
jobQueue.start();
