import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createSchool } from "../services/auth.service";

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    schoolName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await createSchool(form);

      setSuccess("School account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "School creation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card wide">
        <div className="brand">SCC</div>

        <p className="eyebrow">Create School</p>
        <h1>Start your school workspace</h1>
        <p className="subtext">
          Create the first school account and proprietor login.
        </p>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>School name</span>
            <input
              value={form.schoolName}
              onChange={(event) =>
                setForm({ ...form, schoolName: event.target.value })
              }
              required
            />
          </label>

          <div className="two-grid">
            <label className="field">
              <span>First name</span>
              <input
                value={form.firstName}
                onChange={(event) =>
                  setForm({ ...form, firstName: event.target.value })
                }
                required
              />
            </label>

            <label className="field">
              <span>Last name</span>
              <input
                value={form.lastName}
                onChange={(event) =>
                  setForm({ ...form, lastName: event.target.value })
                }
                required
              />
            </label>
          </div>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              required
            />
          </label>

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create school account"}
          </button>
        </form>

        <p className="footer-text">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
