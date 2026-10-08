import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  getStoredUser,
  getToken,
} from "../../../lib/authStorage";
import {
  createAcademicSession,
  deleteAcademicSession,
  listAcademicSessions,
  updateAcademicSession,
  type AcademicSession,
  type AcademicSessionPayload,
} from "../services/academicSessions.service";

type SessionForm = {
  name: string;
  startDate: string;
  endDate: string;
};

const emptyForm: SessionForm = {
  name: "",
  startDate: "",
  endDate: "",
};

const managementRoles = new Set(["proprietor", "principal", "admin"]);

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

export default function AcademicSessionsPage() {
  const user = getStoredUser();
  const token = getToken();

  const canManage = Boolean(
    user && managementRoles.has(user.role.toLowerCase())
  );

  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingSession, setEditingSession] =
    useState<AcademicSession | null>(null);
  const [form, setForm] = useState<SessionForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSessions() {
    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await listAcademicSessions(token);
      setSessions(response.data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load academic sessions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function openCreateForm() {
    clearMessages();
    setEditingSession(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(session: AcademicSession) {
    clearMessages();
    setEditingSession(session);
    setForm({
      name: session.name,
      startDate: session.start_date || "",
      endDate: session.end_date || "",
    });
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingSession(null);
    setForm(emptyForm);
  }

  function updateField(field: keyof SessionForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError("Academic session name is required.");
      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      form.startDate > form.endDate
    ) {
      setError("Start date cannot be after end date.");
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    const payload: AcademicSessionPayload = {
      name,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };

    try {
      setSaving(true);
      clearMessages();

      if (editingSession) {
        await updateAcademicSession(editingSession.id, payload, token);
        setSuccess("Academic session updated successfully.");
      } else {
        await createAcademicSession(payload, token);
        setSuccess("Academic session created successfully.");
      }

      closeForm();
      await loadSessions();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save academic session."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(session: AcademicSession) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the academic session "${session.name}"?`
    );

    if (!confirmed) {
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setDeletingId(session.id);
      clearMessages();

      await deleteAcademicSession(session.id, token);

      setSuccess("Academic session deleted successfully.");
      await loadSessions();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete academic session."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="academic-sessions-page">
      <header className="subjects-header">
        <div>
          <p className="eyebrow">School Setup</p>
          <h2>Academic Sessions</h2>
          <p className="subtext">
            Academic sessions represent the academic years used by your
            school.
          </p>
        </div>

        {canManage && (
          <button className="button" onClick={openCreateForm}>
            Add Academic Session
          </button>
        )}
      </header>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      {formOpen && canManage && (
        <form className="panel subject-form-panel" onSubmit={handleSubmit}>
          <div className="subject-form-heading">
            <div>
              <p className="eyebrow">
                {editingSession ? "Edit session" : "New session"}
              </p>
              <h2>
                {editingSession
                  ? "Update academic session"
                  : "Add academic session"}
              </h2>
            </div>

            <button
              type="button"
              className="button secondary"
              onClick={closeForm}
              disabled={saving}
            >
              Cancel
            </button>
          </div>

          <label className="field">
            <span>Session name</span>
            <input
              value={form.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
              placeholder="e.g. 2026/2027"
              disabled={saving}
              required
            />
          </label>

          <div className="two-grid">
            <label className="field">
              <span>Start date</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  updateField("startDate", event.target.value)
                }
                disabled={saving}
              />
            </label>

            <label className="field">
              <span>End date</span>
              <input
                type="date"
                value={form.endDate}
                onChange={(event) =>
                  updateField("endDate", event.target.value)
                }
                disabled={saving}
              />
            </label>
          </div>

          <button className="button" type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingSession
                ? "Save changes"
                : "Create session"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="panel subjects-state">
          Loading academic sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="panel subjects-state">
          <h2>No academic sessions yet</h2>
          <p className="subtext">
            Create the first academic session for your school.
          </p>
        </div>
      ) : (
        <div className="panel subject-table-panel">
          <div className="subject-table-wrap">
            <table className="subject-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Start date</th>
                  <th>End date</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td data-label="Session">{session.name}</td>
                    <td data-label="Start date">
                      {formatDate(session.start_date)}
                    </td>
                    <td data-label="End date">
                      {formatDate(session.end_date)}
                    </td>

                    {canManage && (
                      <td data-label="Actions">
                        <div className="subject-actions">
                          <button
                            className="button secondary compact-button"
                            onClick={() => openEditForm(session)}
                            disabled={deletingId === session.id}
                          >
                            Edit
                          </button>

                          <button
                            className="button compact-button"
                            onClick={() => void handleDelete(session)}
                            disabled={deletingId === session.id}
                          >
                            {deletingId === session.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
