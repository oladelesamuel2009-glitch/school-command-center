import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMe, login } from "../services/auth.service";
import { saveAuth } from "../../../lib/authStorage";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const loginResponse = await login({ email, password });

      const token = loginResponse.data.session?.access_token;

      if (!token) {
        throw new Error("Login succeeded but no access token was returned");
      }

      const meResponse = await getMe(token);

      saveAuth(token, meResponse.user);

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand">SCC</div>

        <p className="eyebrow">School Command Center</p>
        <h1>Welcome back</h1>
        <p className="subtext">
          Log in to see what needs your attention today.
        </p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="footer-text">
          New school? <Link to="/create-school">Create school account</Link>
        </p>
      </section>
    </main>
  );
}
