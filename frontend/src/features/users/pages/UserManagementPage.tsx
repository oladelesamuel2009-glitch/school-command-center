import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../../../lib/authStorage";
import { createStaffInvitation } from "../services/users.service";

export default function UserManagementPage() {
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "teacher",
    staffId: "",
    department: "",
    employmentDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invitationLink, setInvitationLink] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setInvitationLink("");
    setLoading(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("You must be logged in to invite staff");
      }

      const response = await createStaffInvitation(form, token);

      setInvitationLink(response.data.invitationLink);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create invitation"
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyInvitationLink() {
    if (!invitationLink) return;

    await navigator.clipboard.writeText(invitationLink);
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">User Management</p>
          <h1>Create staff invitation</h1>
          <p className="subtext">
            Generate invitation links for principals, admins and teachers.
          </p>
        </div>

        <Link className="button secondary" to="/dashboard">
          Back to dashboard
        </Link>
      </header>

      <section className="panel form-panel">
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
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

          <div className="two-grid">
            <label className="field">
              <span>Phone</span>
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </label>

            <label className="field">
              <span>Role</span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value })
                }
              >
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
                <option value="principal">Principal</option>
              </select>
            </label>
          </div>

          <div className="two-grid">
            <label className="field">
              <span>Staff ID</span>
              <input
                value={form.staffId}
                onChange={(event) =>
                  setForm({ ...form, staffId: event.target.value })
                }
                required
              />
            </label>

            <label className="field">
              <span>Department</span>
              <input
                value={form.department}
                onChange={(event) =>
                  setForm({ ...form, department: event.target.value })
                }
              />
            </label>
          </div>

          <label className="field">
            <span>Employment date</span>
            <input
              type="date"
              value={form.employmentDate}
              onChange={(event) =>
                setForm({ ...form, employmentDate: event.target.value })
              }
            />
          </label>

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Creating invitation..." : "Create invitation"}
          </button>
        </form>

        {invitationLink && (
          <div className="invitation-box">
            <p className="eyebrow">Invitation link</p>
            <p className="subtext">
              Copy this link and send it to the staff member manually.
            </p>

            <code>{invitationLink}</code>

            <button className="button secondary" onClick={copyInvitationLink}>
              Copy link
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
