import JobQueue from "./services/JobQueue";

JobQueue.getInstance().start(process.argv[2] ?? null);
