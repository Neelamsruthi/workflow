const NodeState = require("../models/NodeState");
const ExecutionRun = require("../models/ExecutionRun");
const executionQueue = require("../services/executionQueue");
const getExecutionStates = async (req, res) => {
    try {

        const { runId } = req.params;

const executionRun =
    await ExecutionRun.findOne({
        runId
    });

if (!executionRun) {
    return res.status(404).json({
        message: "Execution run not found"
    });
}

const nodeStates =
    await NodeState.find({
        runId: executionRun._id
    }).sort({
        createdAt: 1
    });

        return res.status(200).json({
            runId,
            nodeStates
        });

    } catch (error) {

        console.error(
            "Get execution states error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to fetch execution states",
            error:
                error.message
        });
    }
};
const streamExecution = async (req, res) => {
    try {

        const { runId } = req.params;
const executionRun =
    await ExecutionRun.findById(runId);

if (!executionRun) {
    return res.status(404).json({
        message: "Execution run not found"
    });
}
        res.setHeader(
            "Content-Type",
            "text/event-stream"
        );

        res.setHeader(
            "Cache-Control",
            "no-cache"
        );

        res.setHeader(
            "Connection",
            "keep-alive"
        );

        res.flushHeaders();


        const sendStates = async () => {
const nodeStates =
    await NodeState.find({
        runId: executionRun._id
    }).sort({
        createdAt: 1
    });
            res.write(
                `data: ${JSON.stringify({
                    runId,
                    nodeStates
                })}\n\n`
            );
        };


        await sendStates();


        const interval =
            setInterval(
                async () => {

                    try {

                        await sendStates();

                     const nodeStates =
    await NodeState.find({
        runId: executionRun._id
    });

                        const allFinished =
                            nodeStates.length > 0 &&
                            nodeStates.every(
                                (state) =>
                                    [
                                        "COMPLETED",
                                        "FAILED",
                                        "SKIPPED"
                                    ].includes(
                                        state.status
                                    )
                            );


                        if (allFinished) {

                            clearInterval(
                                interval
                            );

                            res.end();
                        }

                    } catch (error) {

                        clearInterval(
                            interval
                        );

                        res.end();
                    }

                },
                500
            );


        req.on(
            "close",
            () => {

                clearInterval(
                    interval
                );

                res.end();
            }
        );

    } catch (error) {

        console.error(
            "Execution stream error:",
            error.message
        );

        if (!res.headersSent) {

            return res.status(500).json({
                message:
                    "Failed to stream execution",
                error:
                    error.message
            });
        }

        res.end();
    }
};
const getFailedJobs = async (req, res) => {
    try {
        const jobs = await executionQueue.getFailed();

        const failedJobs = jobs.map((job) => ({
            id: job.id,
            name: job.name,
            attemptsMade: job.attemptsMade,
            failedReason: job.failedReason,
            data: job.data,
            timestamp: job.timestamp,
            processedOn: job.processedOn,
            finishedOn: job.finishedOn
        }));

        return res.status(200).json({
            count: failedJobs.length,
            failedJobs
        });

    } catch (error) {

        console.error(
            "Get failed jobs error:",
            error.message
        );

        return res.status(500).json({
            message: "Failed to fetch failed jobs",
            error: error.message
        });
    }
};
const retryFailedJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await executionQueue.getJob(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        await job.retry("failed");

        return res.status(200).json({
            message: "Failed job queued for retry",
            jobId: job.id
        });

    } catch (error) {

        console.error(
            "Retry failed job error:",
            error.message
        );

        return res.status(500).json({
            message: "Failed to retry job",
            error: error.message
        });
    }
};
module.exports = {
    getExecutionStates,
    streamExecution,
    getFailedJobs,
    retryFailedJob
};