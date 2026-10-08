import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("WORKFLOW_DEVELOPER");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        role
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Registration failed"
                );
                return;
            }

            setMessage(
                "Registration successful. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            console.error("Register error:", error);
            setMessage("Unable to connect to server");
        }
    };

    return (
        <>
            <style>{`

                * {
                    box-sizing: border-box;
                }

                .register-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 30px;
                    background:
                        linear-gradient(
                            135deg,
                            #eff6ff 0%,
                            #f8fafc 50%,
                            #eef2ff 100%
                        );
                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;
                }

                .register-container {
                    width: 100%;
                    max-width: 1050px;
                    min-height: 620px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow:
                        0 20px 60px
                        rgba(15, 23, 42, 0.12);
                }

                /* LEFT BRAND SECTION */

                .register-brand {
                    padding: 60px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background:
                        linear-gradient(
                            145deg,
                            #1d4ed8,
                            #2563eb,
                            #4f46e5
                        );
                    color: white;
                }

                .brand-icon {
                    width: 55px;
                    height: 55px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                    background:
                        rgba(255, 255, 255, 0.18);
                    font-size: 27px;
                    margin-bottom: 25px;
                }

                .register-brand h1 {
                    margin: 0;
                    font-size: 38px;
                    line-height: 1.15;
                    font-weight: 700;
                }

                .register-brand h1 span {
                    color: #bfdbfe;
                }

                .register-brand-description {
                    margin-top: 20px;
                    max-width: 420px;
                    color: #dbeafe;
                    font-size: 16px;
                    line-height: 1.7;
                }

                .brand-features {
                    margin-top: 35px;
                    display: flex;
                    flex-direction: column;
                    gap: 17px;
                }

                .brand-feature {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #eff6ff;
                    font-size: 15px;
                }

                .feature-check {
                    width: 25px;
                    height: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background:
                        rgba(255, 255, 255, 0.18);
                    font-size: 13px;
                }

                /* REGISTER CARD */

                .register-card {
                    padding: 55px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .register-header {
                    margin-bottom: 30px;
                }

                .register-header h2 {
                    margin: 0;
                    color: #0f172a;
                    font-size: 30px;
                }

                .register-header p {
                    margin-top: 8px;
                    color: #64748b;
                    font-size: 14px;
                }

                /* FORM */

                .register-form-group {
                    margin-bottom: 19px;
                }

                .register-form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #334155;
                    font-size: 14px;
                    font-weight: 600;
                }

                .register-input,
                .register-select {
                    width: 100%;
                    padding: 13px 14px;
                    border: 1px solid #cbd5e1;
                    border-radius: 9px;
                    background: #f8fafc;
                    color: #0f172a;
                    font-size: 14px;
                    outline: none;
                    transition: 0.2s ease;
                }

                .register-input::placeholder {
                    color: #94a3b8;
                }

                .register-input:focus,
                .register-select:focus {
                    border-color: #2563eb;
                    background: white;
                    box-shadow:
                        0 0 0 3px
                        rgba(37, 99, 235, 0.1);
                }

                /* SUBMIT */

                .register-submit {
                    width: 100%;
                    margin-top: 8px;
                    padding: 14px;
                    border: none;
                    border-radius: 9px;
                    background: #2563eb;
                    color: white;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.2s ease;
                }

                .register-submit:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                }

                /* MESSAGE */

                .register-message {
                    margin-top: 18px;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    text-align: center;
                }

                .register-success {
                    background: #dcfce7;
                    color: #166534;
                }

                .register-error {
                    background: #fee2e2;
                    color: #b91c1c;
                }

                /* FOOTER */

                .register-footer {
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: center;
                    gap: 6px;
                    font-size: 14px;
                    color: #64748b;
                }

                .register-login-button {
                    padding: 0;
                    border: none;
                    background: transparent;
                    color: #2563eb;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .register-login-button:hover {
                    text-decoration: underline;
                }

                /* RESPONSIVE */

                @media (max-width: 800px) {

                    .register-container {
                        grid-template-columns: 1fr;
                        max-width: 520px;
                    }

                    .register-brand {
                        padding: 40px;
                    }

                    .register-brand h1 {
                        font-size: 30px;
                    }

                    .brand-features {
                        display: none;
                    }

                    .register-card {
                        padding: 40px;
                    }
                }

                @media (max-width: 500px) {

                    .register-page {
                        padding: 15px;
                    }

                    .register-brand,
                    .register-card {
                        padding: 30px 25px;
                    }

                    .register-brand h1 {
                        font-size: 26px;
                    }

                    .register-header h2 {
                        font-size: 25px;
                    }
                }

            `}</style>

            <div className="register-page">

                <div className="register-container">

                    {/* LEFT SIDE */}

                    <div className="register-brand">

                        <div className="brand-icon">
                            ⚡
                        </div>

                        <h1>
                            Workflow
                            <span> Orchestrator</span>
                        </h1>

                        <p className="register-brand-description">
                            Build, deploy and monitor
                            powerful serverless workflows
                            across multiple clouds.
                        </p>

                        <div className="brand-features">

                            <div className="brand-feature">
                                <span className="feature-check">
                                    ✓
                                </span>

                                Visual Workflow Builder
                            </div>

                            <div className="brand-feature">
                                <span className="feature-check">
                                    ✓
                                </span>

                                Multi-Cloud Execution
                            </div>

                            <div className="brand-feature">
                                <span className="feature-check">
                                    ✓
                                </span>

                                Real-Time Monitoring
                            </div>

                        </div>

                    </div>

                    {/* RIGHT SIDE */}

                    <div className="register-card">

                        <div className="register-header">

                            <h2>
                                Create Account
                            </h2>

                            <p>
                                Start building your workflows
                            </p>

                        </div>

                        <form onSubmit={handleRegister}>

                            <div className="register-form-group">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    className="register-input"
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    required
                                />

                            </div>

                            <div className="register-form-group">

                                <label>
                                    Email Address
                                </label>

                                <input
                                    className="register-input"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />

                            </div>

                            <div className="register-form-group">

                                <label>
                                    Password
                                </label>

                                <input
                                    className="register-input"
                                    type="password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />

                            </div>

                            <div className="register-form-group">

                                <label>
                                    Account Role
                                </label>

                                <select
                                    className="register-select"
                                    value={role}
                                    onChange={(e) =>
                                        setRole(e.target.value)
                                    }
                                    required
                                >
                                    <option value="WORKFLOW_DEVELOPER">
                                        Workflow Developer
                                    </option>

                                    <option value="OPERATIONS">
                                        Operations
                                    </option>
                                </select>

                            </div>

                            <button
                                type="submit"
                                className="register-submit"
                            >
                                Create Account
                            </button>

                        </form>

                        {message && (
                            <div
                                className={`register-message ${
                                    message.includes("successful")
                                        ? "register-success"
                                        : "register-error"
                                }`}
                            >
                                {message}
                            </div>
                        )}

                        <div className="register-footer">

                            <span>
                                Already have an account?
                            </span>

                            <button
                                type="button"
                                className="register-login-button"
                                onClick={() =>
                                    navigate("/login")
                                }
                            >
                                Sign in
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}

export default Register;