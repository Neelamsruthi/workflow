const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const ExecutionRunSchema = new mongoose.Schema(
    {
       runId: {
    type: String,
    required: true,
    default: randomUUID
},

        workflowId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workflow",
            required: true
        },

        status: {
            type: String,
            enum: [
                "RUNNING",
                "COMPLETED",
                "FAILED"
            ],
            default: "RUNNING"
        },

        triggerPayload: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        startedAt: {
            type: Date,
            default: Date.now
        },

        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// SRS: { workflowId: 1, createdAt: -1 }
ExecutionRunSchema.index({
    workflowId: 1,
    createdAt: -1
});

// SRS: unique { runId: 1 }
ExecutionRunSchema.index(
    { runId: 1 },
    { unique: true }
);

// SRS: partial index for RUNNING executions
ExecutionRunSchema.index(
    { status: 1 },
    {
        partialFilterExpression: {
            status: "RUNNING"
        }
    }
);

module.exports = mongoose.model(
    "ExecutionRun",
    ExecutionRunSchema
);