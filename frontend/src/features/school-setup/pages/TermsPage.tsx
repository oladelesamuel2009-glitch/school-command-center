import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  getStoredUser,
  getToken,
} from "../../../lib/authStorage";
import {
  createTerm,
  deleteTerm,
  listAcademicSessionsForTerms,
  listTerms,
  updateTerm,
  type Term,
  type TermPayload,
} from "../services/terms.service";
import type { AcademicSession } from "../services/academicSessions.service";

type TermForm = {
  name: string;
  startDate: string;
  endDate: string;
};

const emptyForm: TermForm = {
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

export default function TermsPage() {
  const user = getStoredUser();
  const token = getToken();

  const canManage = Boolean(
    user && managementRoles.has(user.role.toLowerCase())
  );

  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [terms, setTerms] = useState<Term[]>([]);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [form, setForm] = useState<TermForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedSession = sessions.find(
    (session) => session.id === selectedSessionId
  );

  async function loadSessions() {
    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoadingSessions(false);
      return;
    }

    try {
      setLoadingSessions(true);
      setError("");

      const response = await listAcademicSessionsForTerms(token);
      setSessions(response.data);

      if (response.data.length > 0) {
        setSelectedSessionId((currentId) => currentId || response.data[0].id);
      } else {
        setSelectedSessionId("");
        setTerms([]);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load academic sessions."
      );
    } finally {
      setLoadingSessions(false);
    }
  }

  async function loadTerms(sessionId: string) {
    if (!token || !sessionId) {
      setTerms([]);
      return;
    }

    try {
      setLoadingTerms(true);
      setError("");

      const response = await listTerms(sessionId, token);
      setTerms(response.data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load terms."
      );
      setTerms([]);
    } finally {
      setLoadingTerms(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      void loadTerms(selectedSessionId);
    } else {
      setTerms([]);
    }
  }, [selectedSessionId]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function handleSessionChange(sessionId: string) {
    clearMessages();
    setSelectedSessionId(sessionId);
  }

  function openCreateForm() {
    clearMessages();
    setEditingTerm(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(term: Term) {
    clearMessages();
    setEditingTerm(term);
    setForm({
      name: term.name,
      startDate: term.start_date || "",
      endDate: term.end_date || "",
    });
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingTerm(null);
    setForm(emptyForm);
  }

  function updateField(field: keyof TermForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();

    if (!selectedSessionId) {
      setError("Select an academic session before managing terms.");
      return;
    }

    if (!name) {
      setError("Term name is required.");
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    const payload: TermPayload = {
      name,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };

    try {
      setSaving(true);
      clearMessages();

      if (editingTerm) {
        await updateTerm(editingTerm.id, payload, token);
        setSuccess("Term updated successfully.");
      } else {
        await createTerm(selectedSessionId, payload, token);
        setSuccess("Term created successfully.");
      }

      closeForm();
      await loadTerms(selectedSessionId);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save term."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(term: Term) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the term "${term.name}"?`
    );

    if (!confirmed) {
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setDeletingId(term.id);
      clearMessages();

      await deleteTerm(term.id, token);

      setSuccess("Term deleted successfully.");
      await loadTerms(selectedSessionId);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete term."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="terms-page">
      <header className="subjects-header">
        <div>
          <p className="eyebrow">School Setup</p>
          <h2>Terms</h2>
          <p className="subtext">
            Manage the terms belonging to each academic session.
          </p>
        </div>
      </header>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      {loadingSessions ? (
        <div className="panel subjects-state">
          Loading academic sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="panel subjects-state">
          <h2>No academic sessions available</h2>
          <p className="subtext">
            Create an academic session before adding terms.
          </p>
        </div>
      ) : (
        <>
          <section className="panel term-session-panel">
            <label className="field">
              <span>Academic session</span>
              <select
                value={selectedSessionId}
                onChange={(event) =>
                  handleSessionChange(event.target.value)
                }
                disabled={loadingTerms || saving}
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedSession && (
              <p className="subtext">
                Terms for the {selectedSession.name} academic session.
              </p>
            )}
          </section>

          <section className="panel configured-subjects-panel">
            <header className="subjects-toolbar">
              <div>
                <p className="eyebrow">Session terms</p>
                <h2>{selectedSession?.name || "Select a session"}</h2>
              </div>

              {canManage && selectedSessionId && (
                <button className="button" onClick={openCreateForm}>
                  Add Term
                </button>
              )}
            </header>

            {formOpen && canManage && (
              <form className="subject-form-panel" onSubmit={handleSubmit}>
                <div className="subject-form-heading">
                  <div>
                    <p className="eyebrow">
                      {editingTerm ? "Edit term" : "New term"}
                    </p>
                    <h2>
                      {editingTerm ? "Update term" : "Add term"}
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
                  <span>Term name</span>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="e.g. First Term"
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
                    : editingTerm
                      ? "Save changes"
                      : "Create term"}
                </button>
              </form>
            )}

            {loadingTerms ? (
              <div className="subjects-state">Loading terms...</div>
            ) : terms.length === 0 ? (
              <div className="subjects-state">
                <h2>No terms in this academic session yet</h2>
                <p className="subtext">
                  Add the first term for this academic session.
                </p>
              </div>
            ) : (
              <div className="subject-table-wrap">
                <table className="subject-table">
                  <thead>
                    <tr>
                      <th>Term</th>
                      <th>Start date</th>
                      <th>End date</th>
                      {canManage && <th>Actions</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {terms.map((term) => (
                      <tr key={term.id}>
                        <td data-label="Term">{term.name}</td>
                        <td data-label="Start date">
                          {formatDate(term.start_date)}
                        </td>
                        <td data-label="End date">
                          {formatDate(term.end_date)}
                        </td>

                        {canManage && (
                          <td data-label="Actions">
                            <div className="subject-actions">
                              <button
                                className="button secondary compact-button"
                                onClick={() => openEditForm(term)}
                                disabled={deletingId === term.id}
                              >
                                Edit
                              </button>

                              <button
                                className="button compact-button"
                                onClick={() => void handleDelete(term)}
                                disabled={deletingId === term.id}
                              >
                                {deletingId === term.id
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
            )}
          </section>
        </>
      )}
    </section>
  );
}
