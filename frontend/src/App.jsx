import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import WorkflowEditor from "./pages/WorkflowEditor";
import ExecutionMonitor from "./pages/ExecutionMonitor";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Workspaces from "./pages/Workspaces";
import OperationsDashboard from "./pages/OperationsDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ExecutionHistory from "./pages/ExecutionHistory";
function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}
                <Route
                    path="/"
                    element={<Register />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* Workflow Developer Only */}
                <Route
                    path="/workspaces"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "WORKFLOW_DEVELOPER"
                            ]}
                        >
                            <Workspaces />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/new-workflow"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "WORKFLOW_DEVELOPER"
                            ]}
                        >
                            <WorkflowEditor />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/workflows/:id"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "WORKFLOW_DEVELOPER"
                            ]}
                        >
                            <WorkflowEditor />
                        </ProtectedRoute>
                    }
                />


                {/* Operations Only */}
                <Route
                    path="/operations"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "OPERATIONS"
                            ]}
                        >
                            <OperationsDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* Execution Monitoring */}
                <Route
                    path="/executions/:runId"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "WORKFLOW_DEVELOPER",
                                "OPERATIONS"
                            ]}
                        >
                            <ExecutionMonitor />
                        </ProtectedRoute>
                    }
                />
<Route
    path="/workflows/:workflowId/executions"
    element={
        <ProtectedRoute
            allowedRoles={[
                "WORKFLOW_DEVELOPER",
                "OPERATIONS"
            ]}
        >
            <ExecutionHistory />
        </ProtectedRoute>
    }
/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;