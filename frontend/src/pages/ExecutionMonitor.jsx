import React, {
    useEffect,
    useState
} from "react";

import {
    useParams,
    useNavigate
} from "react-router-dom";


const ExecutionMonitor = () => {
    const navigate = useNavigate();
    const { runId } =
        useParams();


    const [
        nodeStates,
        setNodeStates
    ] = useState([]);

    const [
        selectedNode,
        setSelectedNode
    ] = useState(null);

    const [
        connected,
        setConnected
    ] = useState(false);


    // ==================================================
    // SSE CONNECTION
    // ==================================================

  useEffect(() => {
    if (!runId) {
        return;
    }

    const token = localStorage.getItem("token");

    const connectSSE = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/executions/${runId}/stream`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    `SSE connection failed: ${response.status}`
                );
            }

            setConnected(true);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let buffer = "";

            while (true) {
                const { value, done } =
                    await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(
                    value,
                    { stream: true }
                );

                const messages =
                    buffer.split("\n\n");

                buffer =
                    messages.pop() || "";

                for (const message of messages) {
                    const dataLine =
                        message
                            .split("\n")
                            .find((line) =>
                                line.startsWith("data:")
                            );

                    if (!dataLine) {
                        continue;
                    }

                    try {
                        const data =
                            JSON.parse(
                                dataLine
                                    .replace(
                                        "data:",
                                        ""
                                    )
                                    .trim()
                            );

                        setNodeStates(
                            data.nodeStates || []
                        );
                    } catch (error) {
                        console.error(
                            "SSE data parsing error:",
                            error
                        );
                    }
                }
            }

        } catch (error) {
            console.error(
                "SSE connection error:",
                error
            );

            setConnected(false);

        } finally {
            setConnected(false);
        }
    };

    connectSSE();

}, [runId]);
      
         

    // ==================================================
    // STATUS STYLE
    // ==================================================

    const getStatusColor =
        (status) => {

            switch (status) {

                case "COMPLETED":
                    return "#16a34a";

                case "RUNNING":
                    return "#2563eb";

                case "FAILED":
                    return "#dc2626";

                case "SKIPPED":
                    return "#6b7280";

                case "PENDING":
                default:
                    return "#f59e0b";
            }
        };


    const getStatusIcon =
        (status) => {

            switch (status) {

                case "COMPLETED":
                    return "✓";

                case "RUNNING":
                    return "⟳";

                case "FAILED":
                    return "✕";

                case "SKIPPED":
                    return "−";

                case "PENDING":
                default:
                    return "○";
            }
        };


    // ==================================================
    // FORMAT JSON
    // ==================================================

    const formatJSON =
        (value) => {

            if (
                value === undefined ||
                value === null
            ) {

                return "No data";
            }


            try {

                return JSON.stringify(
                    value,
                    null,
                    2
                );

            } catch {

                return String(value);
            }
        };


    // ==================================================
    // UI
    // ==================================================

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "30px",
                background: "#f5f7fb",
                fontFamily:
                    "Arial, sans-serif"
            }}
        >

            {/* ==========================================
                HEADER
            ========================================== */}

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    marginBottom: "25px"
                }}
            >

                <div>
<div>
    <button
        onClick={() => navigate(-1)}
        style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            background: "#2563eb",
            color: "#ffffff",
            cursor: "pointer",
            fontWeight: "600",
            marginBottom: "15px"
        }}
    >
        ← Back
    </button>

    <h1
        style={{
            margin: 0,
            fontSize: "28px"
        }}
    >
        Execution Monitor
    </h1>

    <p
        style={{
            marginTop: "8px",
            color: "#6b7280"
        }}
    >
        Run ID: {runId}
    </p>
</div>
                
                </div>


                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >

                    <span
                        style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background:
                                connected
                                    ? "#16a34a"
                                    : "#dc2626"
                        }}
                    />

                    <span>
                        {connected
                            ? "Live"
                            : "Disconnected"}
                    </span>

                </div>

            </div>


            {/* ==========================================
                EXECUTION FLOW
            ========================================== */}

            <div
                style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "25px",
                    boxShadow:
                        "0 2px 10px rgba(0,0,0,0.08)",
                    marginBottom: "25px"
                }}
            >

                <h2
                    style={{
                        marginTop: 0
                    }}
                >
                    Workflow Execution
                </h2>


                {nodeStates.length === 0 ? (

                    <p
                        style={{
                            color: "#6b7280"
                        }}
                    >
                        Waiting for execution
                        data...
                    </p>

                ) : (

                    <div
                        style={{
                            display: "flex",
                            flexDirection:
                                "column",
                            gap: "12px"
                        }}
                    >

                        {nodeStates.map(
                            (
                                node,
                                index
                            ) => (

                                <React.Fragment
                                    key={
                                        node._id ||
                                        node.nodeId
                                    }
                                >

                                    <div
                                        onClick={() =>
                                            setSelectedNode(
                                                node
                                            )
                                        }
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "space-between",
                                            padding:
                                                "18px",
                                            border:
                                                selectedNode?._id ===
                                                node._id
                                                    ? "2px solid #2563eb"
                                                    : "1px solid #e5e7eb",
                                            borderRadius:
                                                "10px",
                                            cursor:
                                                "pointer",
                                            background:
                                                "#ffffff"
                                        }}
                                    >

                                        <div>

                                            <div
                                                style={{
                                                    fontWeight:
                                                        "600",
                                                    fontSize:
                                                        "16px"
                                                }}
                                            >
                                                {
                                                    node.nodeId
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    color:
                                                        "#6b7280",
                                                    fontSize:
                                                        "13px",
                                                    marginTop:
                                                        "5px"
                                                }}
                                            >
                                                Click to
                                                inspect
                                                execution
                                                data
                                            </div>

                                        </div>


                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                gap:
                                                    "8px",
                                                color:
                                                    getStatusColor(
                                                        node.status
                                                    ),
                                                fontWeight:
                                                    "600"
                                            }}
                                        >

                                            <span
                                                style={{
                                                    fontSize:
                                                        "20px"
                                                }}
                                            >
                                                {
                                                    getStatusIcon(
                                                        node.status
                                                    )
                                                }
                                            </span>

                                            {
                                                node.status
                                            }

                                        </div>

                                    </div>


                                    {index <
                                        nodeStates.length -
                                            1 && (

                                        <div
                                            style={{
                                                width:
                                                    "2px",
                                                height:
                                                    "20px",
                                                background:
                                                    "#d1d5db",
                                                margin:
                                                    "0 auto"
                                            }}
                                        />

                                    )}

                                </React.Fragment>
                            )
                        )}

                    </div>

                )}

            </div>


            {/* ==========================================
                NODE DETAILS
            ========================================== */}

            {selectedNode && (

                <div
                    style={{
                        background:
                            "#ffffff",
                        borderRadius:
                            "12px",
                        padding:
                            "25px",
                        boxShadow:
                            "0 2px 10px rgba(0,0,0,0.08)"
                    }}
                >

                    <div
                        style={{
                            display:
                                "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
                            marginBottom:
                                "20px"
                        }}
                    >

                        <div>

                            <h2
                                style={{
                                    margin: 0
                                }}
                            >
                                Node Details
                            </h2>

                            <p
                                style={{
                                    color:
                                        "#6b7280"
                                }}
                            >
                                {
                                    selectedNode.nodeId
                                }
                            </p>

                        </div>


                        <div
                            style={{
                                color:
                                    getStatusColor(
                                        selectedNode.status
                                    ),
                                fontWeight:
                                    "bold"
                            }}
                        >
                            {
                                selectedNode.status
                            }
                        </div>

                    </div>


                    {/* INPUT */}

                    <div
                        style={{
                            marginBottom:
                                "20px"
                        }}
                    >

                        <h3>
                            Input
                        </h3>

                        <pre
                            style={{
                                background:
                                    "#111827",
                                color:
                                    "#e5e7eb",
                                padding:
                                    "15px",
                                borderRadius:
                                    "8px",
                                overflowX:
                                    "auto"
                            }}
                        >
                            {
                                formatJSON(
                                    selectedNode.input
                                )
                            }
                        </pre>

                    </div>


                    {/* OUTPUT */}

                    <div
                        style={{
                            marginBottom:
                                "20px"
                        }}
                    >

                        <h3>
                            Output
                        </h3>

                        <pre
                            style={{
                                background:
                                    "#111827",
                                color:
                                    "#e5e7eb",
                                padding:
                                    "15px",
                                borderRadius:
                                    "8px",
                                overflowX:
                                    "auto"
                            }}
                        >
                            {
                                formatJSON(
                                    selectedNode.output
                                )
                            }
                        </pre>

                    </div>


                    {/* ERROR */}

                    {selectedNode.error && (

                        <div>

                            <h3
                                style={{
                                    color:
                                        "#dc2626"
                                }}
                            >
                                Error
                            </h3>

                            <pre
                                style={{
                                    background:
                                        "#fef2f2",
                                    color:
                                        "#dc2626",
                                    padding:
                                        "15px",
                                    borderRadius:
                                        "8px",
                                    overflowX:
                                        "auto"
                                }}
                            >
                                {
                                    selectedNode.error
                                }
                            </pre>

                        </div>

                    )}


                    {/* TIMING */}

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "1fr 1fr",
                            gap:
                                "15px",
                            marginTop:
                                "20px"
                        }}
                    >

                        <div>

                            <strong>
                                Started
                            </strong>

                            <p>
                                {
                                    selectedNode.startedAt
                                        ? new Date(
                                            selectedNode.startedAt
                                        ).toLocaleString()
                                        : "Not started"
                                }
                            </p>

                        </div>


                        <div>

                            <strong>
                                Completed
                            </strong>

                            <p>
                                {
                                    selectedNode.completedAt
                                        ? new Date(
                                            selectedNode.completedAt
                                        ).toLocaleString()
                                        : "Not completed"
                                }
                            </p>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default ExecutionMonitor;