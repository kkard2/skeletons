import { useState } from "react";
import "../App.css";
import { useNavigate } from "react-router";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const json = await res.json();

            if (res.status >= 400 && res.status < 500 && json.error) {
                setError(json.error);
            } else if (res.ok) {
                navigate("/login");
            } else {
                throw new Error();
            }
        } catch(e) {
            setError("Unknown error");
            throw e;
        }
    }

    return (
        <div className="form-container">
            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        minLength={3}
                        maxLength={16}
                        pattern="^[a-zA-Z0-9_]+$"
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        minLength={8}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit">Register</button>
                <a href="/login">Already have an account?</a>
            </form>
        </div>
    );
}
