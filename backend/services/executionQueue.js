const { Queue } = require("bullmq");
const redisConnection = require("../config/redis");

const executionQueue = new Queue("workflow-execution", {
    connection: redisConnection,

    defaultJobOptions: {
        attempts: 3,

        backoff: {
            type: "exponential",
            delay: 1000
        },

        removeOnComplete: 100,
        removeOnFail: false
    }
});

module.exports = executionQueue;