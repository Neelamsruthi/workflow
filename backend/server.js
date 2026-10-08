const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

// Start BullMQ worker
require("./services/executionWorker");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Workflow Orchestrator API is running"
    });
});

app.use(
    "/api/workflows",
    require("./routes/workflowRoutes")
);

app.use(
    "/api/webhooks",
    require("./routes/webhookRoutes")
);

app.use(
    "/api/executions",
    require("./routes/executionRoutes")
);

app.use(
    "/api/auth",
    require("./routes/authRoutes")
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});