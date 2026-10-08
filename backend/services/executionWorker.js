const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const { startExecution } = require("./executionService");

const executionWorker = new Worker(
    "workflow-execution",
    async (job) => {
        console.log("Processing execution job:", job.id);

        const { runId } = job.data;

        await startExecution(runId);

        console.log("Workflow execution finished:", runId);
    },
   {
    connection: redisConnection,
    concurrency: 5,
    lockDuration: 10000,
    stalledInterval: 5000,
    maxStalledCount: 1
}
);

executionWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

executionWorker.on("failed", (job, error) => {
    console.error(
        `Job ${job?.id} failed:`,
        error.message
    );
});

console.log("Workflow execution worker started");

module.exports = executionWorker;