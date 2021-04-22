const JobQueue = require('./dist/services/JobQueue').default;

let jobQueue = new JobQueue(/* TODO: params? */);
jobQueue.start();
