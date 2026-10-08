import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
function Workspaces() {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const role = localStorage.getItem("role");

    const isWorkflowDeveloper =
        role === "WORKFLOW_DEVELOPER";

    const isOperations =
        role === "OPERATIONS";

    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:5000/api/workflows",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
console.log("WORKSPACES RESPONSE:", response.data);
console.log("WORKSPACES LIST:", response.data.workflows);
                setWorkflows(
                    response.data.workflows || []
                );

            } catch (error) {
                console.error(error);

                setMessage(
                    error.response?.data?.message ||
                    "Failed to load workflows"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchWorkflows();
    }, []);
useEffect(() => {
    console.log("WORKFLOWS STATE:", workflows);
}, [workflows]);
    if (loading) {
        return (
            <div className="workspaces-page">
                <p>Loading workflows...</p>
            </div>
        );
    }

    return (
        <div className="workspaces-page">

            <div className="workspaces-header">

    <div>
        <h1>My Workflows</h1>

        <p>
            Create and manage your workflows.
        </p>
    </div>

    <div
        style={{
            display: "flex",
            gap: "10px"
        }}
    >
        <button
            className="create-workflow-btn"
            onClick={() =>
                navigate("/new-workflow")
            }
        >
            + Create Workflow
        </button>

        <button
            className="create-workflow-btn"
            onClick={logout}
        >
            Logout
        </button>
    </div>

</div>
        

            {message && (
                <p>{message}</p>
            )}

            {workflows.length === 0 ? (
                <p>No workflows created yet.</p>
            ) : (
                <div className="workspace-grid">

                    {workflows.map((workflow) => (
                        <div
                            key={workflow._id}
                            className="workspace-card"
                            onClick={() =>
                                navigate(
                                    `/workflows/${workflow._id}`
                                )
                            }
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

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default Workspaces;