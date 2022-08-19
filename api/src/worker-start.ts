import JobQueue from "./services/JobQueue";
import QueueManager from "./services/QueueManager";

new JobQueue(QueueManager.getInstance()).start();
