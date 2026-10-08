import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
function OperationsDashboard() {
    const [workflows, setWorkflows] = useState([]);
    const [executions, setExecutions] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                const workflowResponse = await axios.get(
                    "http://localhost:5000/api/workflows",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const workflowList =
                    workflowResponse.data.workflows || [];

                setWorkflows(workflowList);

                const executionData = {};

                for (const workflow of workflowList) {
                    try {
                        const response = await axios.get(
                            `http://localhost:5000/api/workflows/${workflow._id}/executions`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );

                        executionData[workflow._id] =
                            response.data.executions || [];

                    } catch (error) {
                        console.error(
                            `Failed to load executions for ${workflow.title}`,
                            error
                        );

                        executionData[workflow._id] = [];
                    }
                }

                setExecutions(executionData);

            } catch (error) {
                console.error(error);

                setMessage(
                    error.response?.data?.message ||
                    "Failed to load operations dashboard"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getLatestExecution = (workflowId) => {
        const workflowExecutions =
            executions[workflowId] || [];

        return workflowExecutions.length > 0
            ? workflowExecutions[0]
            : null;
    };

    const getLatency = (execution) => {
        if (
            !execution?.startedAt ||
            !execution?.completedAt
        ) {
            return null;
        }

        return (
            new Date(execution.completedAt).getTime() -
            new Date(execution.startedAt).getTime()
        );
    };

    if (loading) {
        return (
            <div className="workspaces-page">
                <p>
                    Loading operations dashboard...
                </p>
            </div>
        );
    }
const totalWorkflows = workflows.length;

const activeWorkflows = workflows.filter(
    (workflow) => workflow.isActive
).length;

const allExecutions = Object.values(executions).flat();

const totalExecutions = allExecutions.length;

const failedExecutions = allExecutions.filter(
    (execution) => execution.status === "FAILED"
).length;
    return (
        <div className="workspaces-page">

            <div className="workspaces-header">

                <div>
                  <div className="workspaces-header">

    <div>
        <h1>
            Operations Dashboard
        </h1>

        <p>
            Monitor workflow executions,
            status and latency.
        </p>
    </div>

    <button
        className="create-workflow-btn"
        onClick={logout}
    >
        Logout
    </button>

</div>
                    <p>
                        Monitor workflow executions,
                        status and latency.
                    </p>
                </div>

            </div>

            {message && (
                <p>{message}</p>
            )}
<div className="operations-summary">

    <div className="summary-card">
        <h3>Total Workflows</h3>
        <strong>{totalWorkflows}</strong>
    </div>

    <div className="summary-card">
        <h3>Active Workflows</h3>
        <strong>{activeWorkflows}</strong>
    </div>

    <div className="summary-card">
        <h3>Total Executions</h3>
        <strong>{totalExecutions}</strong>
    </div>

    <div className="summary-card">
        <h3>Failed Executions</h3>
        <strong>{failedExecutions}</strong>
    </div>

</div>
            {workflows.length === 0 ? (

                <p>
                    No workflows available.
                </p>

            ) : (

                <div className="workspace-grid">

                    {workflows.map((workflow) => {

                        const latestExecution =
                            getLatestExecution(
                                workflow._id
                            );

                        const latency =
                            getLatency(
                                latestExecution
                            );

                        return (
                            <div
                                key={workflow._id}
                                className="workspace-card"
                            >

                                <h3>
                                    {workflow.title}
                                </h3>

                                <p>
                                    {workflow.description ||
                                        "No description"}
                                </p>

                                <span
                                    className={`workspace-status ${
                                        workflow.isActive
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    {workflow.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </span>

                                <div
                                    style={{
                                        marginTop: "20px"
                                    }}
                                >

                                    <strong>
                                        Latest Execution
                                    </strong>

                                    {latestExecution ? (

                                        <div
                                            style={{
                                                marginTop: "10px"
                                            }}
                                        >

                                            <p>
                                                Status:{" "}
                                                <strong>
                                                    {
                                                        latestExecution.status
                                                    }
                                                </strong>
                                            </p>

                                            <p>
                                                Started:{" "}
                                                {latestExecution.startedAt
                                                    ? new Date(
                                                        latestExecution.startedAt
                                                    ).toLocaleString()
                                                    : "N/A"}
                                            </p>

                                            <p>
                                                Completed:{" "}
                                                {latestExecution.completedAt
                                                    ? new Date(
                                                        latestExecution.completedAt
                                                    ).toLocaleString()
                                                    : "Still running"}
                                            </p>

                                            <p>
                                                Latency:{" "}
                                                {latency !== null
                                                    ? `${latency} ms`
                                                    : "Calculating..."}
                                            </p>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/executions/${latestExecution._id}`
                                                    )
                                                }
                                            >
                                                View Execution
                                            </button>

                                        </div>

                                    ) : (

                                        <p
                                            style={{
                                                color: "#6b7280",
                                                marginTop: "10px"
                                            }}
                                        >
                                            No executions yet.
                                        </p>

                                    )}

                                </div>

                            </div>
                        );
                    })}

                </div>

            )}

        </div>
    );
}

export default OperationsDashboard;