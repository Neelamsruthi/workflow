import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (
        allowedRoles &&
        !allowedRoles.includes(role)
    ) {
        if (role === "OPERATIONS") {
            return <Navigate to="/operations" replace />;
        }

        return <Navigate to="/workspaces" replace />;
    }

    return children;
}

export default ProtectedRoute;