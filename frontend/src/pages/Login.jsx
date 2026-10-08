import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();
        setMessage("");

        try {

            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email,
                    password
                }
            );

            console.log(
                "Login successful:",
                response.data
            );

            // Save JWT
            localStorage.setItem(
                "token",
                response.data.token
            );

            // Save user role
            localStorage.setItem(
                "role",
                response.data.user?.role ||
                response.data.role ||
                ""
            );

            console.log("Token and role saved");
if (response.data.user?.role === "OPERATIONS") {
    navigate("/operations");
} else {
    navigate("/workspaces");
}

        } catch (error) {

            console.error(
                "Login failed:",
                error.response?.data?.message ||
                error.message
            );

            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    return (

        <div>

            <h2>
                Login
            </h2>

            <form onSubmit={handleLogin}>

                <div>

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                </div>

                <div>

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                </div>

                <button type="submit">
                    Login
                </button>

            </form>

            {message && (
                <p>{message}</p>
            )}

            <p>
                Don't have an account?{" "}
                <button
                    type="button"
                    onClick={() => navigate("/register")}
                >
                    Register
                </button>
            </p>

        </div>
    );
}

export default Login;