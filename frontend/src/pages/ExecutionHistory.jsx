import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function ExecutionHistory() {
    const { workflowId } = useParams();

    const [workflow, setWorkflow] = useState(null);
    const [executions, setExecutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchExecutions = async () => {
            try {
                const token = localStorage.getItem("token");

                const workflowResponse = await axios.get(
                    `http://localhost:5000/api/workflows/${workflowId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setWorkflow(
                    workflowResponse.data.workflow
                );

                const executionResponse = await axios.get(
                    `http://localhost:5000/api/workflows/${workflowId}/executions`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setExecutions(
                    executionResponse.data.executions || []
                );
            } catch (error) {
                console.error(error);

                setMessage(
                    error.response?.data?.message ||
                    "Failed to load execution history"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchExecutions();
    }, [workflowId]);

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
                <p>Loading execution history...</p>
            </div>
        );
    }

    return (
        <div className="workspaces-page">

            <div className="workspaces-header">

                <div>
                    <h1>
                        {workflow?.title || "Workflow"} -
                        Execution History
                    </h1>

                    <p>
                        View previous executions and
                        execution performance.
                    </p>
                </div>

                <button
                    className="create-workflow-btn"
                    onClick={() =>
                        navigate("/operations")
                    }
                >
                    Back to Operations
                </button>

            </div>

            {message && (
                <p>{message}</p>
            )}

            {executions.length === 0 ? (
                <p>
                    No executions found for this workflow.
                </p>
            ) : (
                <div className="workspace-grid">

                    {executions.map((execution) => {

                        const latency =
                            getLatency(execution);

                        return (
                            <div
                                key={execution._id}
                                className="workspace-card"
                            >

                                <h3>
                                    Execution
                                </h3>

                                <p>
                                    <strong>
                                        Status:
                                    </strong>{" "}
                                    {execution.status}
                                </p>

                                <p>
                                    <strong>
                                        Started:
                                    </strong>{" "}
                                    {execution.startedAt
                                        ? new Date(
                                            execution.startedAt
                                        ).toLocaleString()
                                        : "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Completed:
                                    </strong>{" "}
                                    {execution.completedAt
                                        ? new Date(
                                            execution.completedAt
                                        ).toLocaleString()
                                        : "Still running"}
                                </p>

                                <p>
                                    <strong>
                                        Latency:
                                    </strong>{" "}
                                    {latency !== null
                                        ? `${latency} ms`
                                        : "Calculating..."}
                                </p>

                               <div
    style={{
        display: "flex",
        gap: "10px",
        marginTop: "10px"
    }}
>
    <button
        onClick={() =>
            navigate(
                `/executions/${latestExecution._id}`
            )
        }
    >
        View Latest
    </button>

    <button
        onClick={() =>
            navigate(
                `/workflows/${workflow._id}/executions`
            )
        }
    >
        View All Executions
    </button>
</div>

                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
}

export default ExecutionHistory;