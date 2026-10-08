const mongoose = require("mongoose");

const NodeStateSchema = new mongoose.Schema(
    {
        runId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExecutionRun",
            required: true,
            index: true
        },

        nodeId: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "RUNNING",
                "COMPLETED",
                "FAILED",
                "SKIPPED"
            ],
            default: "PENDING"
        },

        input: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        output: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        error: {
            type: String,
            default: null
        },

        startedAt: {
            type: Date,
            default: null
        },

        completedAt: {
            type: Date,
            default: null
        },
        latencyMs: {
    type: Number,
    default: null
},
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "NodeState",
    NodeStateSchema
);