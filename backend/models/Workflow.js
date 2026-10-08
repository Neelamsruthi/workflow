const mongoose = require("mongoose");

const NodeSchema = new mongoose.Schema(
    {
        nodeId: {
            type: String,
            required: true
        },

        type: {
            type: String,
            required: true,
            enum: [
                "TRIGGER_WEBHOOK",
                "ACTION_HTTP",
                "TRANSFORM_JS",
                "ROUTER_IF_ELSE",
                "DELAY"
            ]
        },

        config: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        position: {
            x: {
                type: Number,
                default: 0
            },
            y: {
                type: Number,
                default: 0
            }
        }
    },
    {
        _id: false
    }
);

const EdgeSchema = new mongoose.Schema(
    {
        sourceNodeId: {
            type: String,
            required: true
        },

        targetNodeId: {
            type: String,
            required: true
        },

        conditionHandle: {
            type: String,
            default: "default"
        }
    },
    {
        _id: false
    }
);

const WorkflowSchema = new mongoose.Schema(
    {
        tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
},
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        isActive: {
            type: Boolean,
            default: false
        },

        version: {
            type: Number,
            default: 1
        },

        nodes: {
            type: [NodeSchema],
            default: []
        },

        edges: {
            type: [EdgeSchema],
            default: []
        },

        deployedChecksum: {
            type: String,
            default: null
        },
        webhookSecret: {
    type: String,
    default: null
},
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Workflow", WorkflowSchema);