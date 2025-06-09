import { useState } from "react";
import { useAppContext } from "../types";
import "../App.css";
import { useNavigate } from "react-router";

export default function LoginPage() {
    const { dispatch } = useAppContext();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const json = await res.json();

            if (res.ok) {
                const { user, token } = json;
                dispatch({ type: "LOGIN", user, token });
                navigate("/messages");
            } else if (res.status === 401) {
                const { error } = json;
                setError(error);
            } else {
                throw new Error();
            }
        } catch {
            setError("Unknown error");
        }
    }

    return (
        <div className="form-container">
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit">Login</button>
                <a href="/register">Create account</a>
            </form>
        </div>
    );
}
