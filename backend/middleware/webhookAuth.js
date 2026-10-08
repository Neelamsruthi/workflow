const crypto = require("crypto");
const Workflow = require("../models/Workflow");
const { decrypt } = require("../utils/encryption");

const validateWebhookSignature = async (req, res, next) => {
    try {
        const { workflowId } = req.params;

        const signature =
            req.headers["x-webhook-signature"];

        if (!signature) {
            return res.status(401).json({
                message: "Missing webhook signature"
            });
        }

        const workflow =
            await Workflow.findOne({
                _id: workflowId,
                isActive: true
            });

        if (!workflow) {
            return res.status(404).json({
                message: "Active workflow not found"
            });
        }

        if (!workflow.webhookSecret) {
            return res.status(500).json({
                message:
                    "Webhook secret is not configured"
            });
        }

        const webhookSecret =
            decrypt(workflow.webhookSecret);

        const payload =
            JSON.stringify(req.body);

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    webhookSecret
                )
                .update(payload)
                .digest("hex");

        const signatureBuffer =
            Buffer.from(signature, "utf8");

        const expectedBuffer =
            Buffer.from(
                expectedSignature,
                "utf8"
            );

        if (
            signatureBuffer.length !==
            expectedBuffer.length ||
            !crypto.timingSafeEqual(
                signatureBuffer,
                expectedBuffer
            )
        ) {
            return res.status(401).json({
                message:
                    "Invalid webhook signature"
            });
        }

        next();

    } catch (error) {
        console.error(
            "Webhook authentication error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Webhook authentication failed"
        });
    }
};

module.exports =
    validateWebhookSignature;