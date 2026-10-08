import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { getStoredUser, getToken } from "../../../lib/authStorage";
import {
  createSubject,
  listSubjects,
  updateSubject,
  updateSubjectStatus,
  type Subject,
} from "../services/subjects.service";

type SubjectForm = {
  name: string;
  code: string;
};

const emptyForm: SubjectForm = {
  name: "",
  code: "",
};

const managementRoles = new Set(["proprietor", "principal", "admin"]);

export default function SubjectsPage() {
  const user = getStoredUser();
  const token = getToken();

  const canManageSubjects = Boolean(
    user && managementRoles.has(user.role.toLowerCase())
  );

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [inactiveSubjects, setInactiveSubjects] = useState<Subject[]>([]);
  const [showInactive, setShowInactive] = useState(false);

  const [loading, setLoading] = useState(true);
  const [inactiveLoading, setInactiveLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState<SubjectForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeSubjects = useMemo(
    () => subjects.filter((subject) => subject.active),
    [subjects]
  );

  async function loadActiveSubjects() {
    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await listSubjects(token);
      setSubjects(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load subjects."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadInactiveSubjects() {
    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setInactiveLoading(true);
      setError("");

      const response = await listSubjects(token, true);
      setInactiveSubjects(
        response.filter((subject) => !subject.active)
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load inactive subjects."
      );
    } finally {
      setInactiveLoading(false);
    }
  }

  useEffect(() => {
    void loadActiveSubjects();
  }, []);

  async function toggleInactiveSubjects() {
    const nextValue = !showInactive;
    setShowInactive(nextValue);

    if (nextValue && inactiveSubjects.length === 0) {
      await loadInactiveSubjects();
    }
  }

  function openCreateForm() {
    setEditingSubject(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function openEditForm(subject: Subject) {
    setEditingSubject(subject);
    setForm({
      name: subject.name,
      code: subject.code,
    });
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingSubject(null);
    setForm(emptyForm);
  }

  function handleFieldChange(field: keyof SubjectForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: field === "code" ? value.toUpperCase() : value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();

    if (!name || !code) {
      setError("Subject name and subject code are required.");
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingSubject) {
        await updateSubject(
          editingSubject.id,
          {
            name,
            code,
          },
          token
        );
        setSuccess("Subject updated successfully.");
      } else {
        await createSubject(
          {
            name,
            code,
          },
          token
        );
        setSuccess("Subject created successfully.");
      }

      closeForm();
      await loadActiveSubjects();

      if (showInactive) {
        await loadInactiveSubjects();
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save subject."
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeSubjectStatus(subject: Subject) {
    const nextActive = !subject.active;
    const action = nextActive ? "reactivate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${subject.name}"?`
    );

    if (!confirmed) {
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setChangingStatusId(subject.id);
      setError("");
      setSuccess("");

      await updateSubjectStatus(subject.id, nextActive, token);

      setSuccess(
        nextActive
          ? `${subject.name} was reactivated successfully.`
          : `${subject.name} was deactivated successfully.`
      );

      await loadActiveSubjects();

      if (showInactive) {
        await loadInactiveSubjects();
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update subject status."
      );
    } finally {
      setChangingStatusId(null);
    }
  }

  return (
    <section className="subjects-page">
      <header className="subjects-header">
        <div>
          <p className="eyebrow">School Setup</p>
          <h2>Subjects</h2>
          <p className="subtext">
            Manage your school&apos;s official subject catalogue.
          </p>
        </div>

        {canManageSubjects && (
          <button className="button" onClick={openCreateForm}>
            Add Subject
          </button>
        )}
      </header>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      {formOpen && canManageSubjects && (
        <form className="panel subject-form-panel" onSubmit={handleSubmit}>
          <div className="subject-form-heading">
            <div>
              <p className="eyebrow">
                {editingSubject ? "Edit subject" : "New subject"}
              </p>
              <h2>{editingSubject ? "Update subject" : "Add subject"}</h2>
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

          <div className="two-grid">
            <label className="field">
              <span>Subject name</span>
              <input
                value={form.name}
                onChange={(event) =>
                  handleFieldChange("name", event.target.value)
                }
                placeholder="e.g. Chemistry"
                disabled={saving}
                required
              />
            </label>

            <label className="field">
              <span>Subject code</span>
              <input
                value={form.code}
                onChange={(event) =>
                  handleFieldChange("code", event.target.value)
                }
                placeholder="e.g. CHEM"
                disabled={saving}
                required
              />
            </label>
          </div>

          <button className="button" type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingSubject
                ? "Save changes"
                : "Create subject"}
          </button>
        </form>
      )}

      <div className="subjects-toolbar">
        <div>
          <p className="eyebrow">Active catalogue</p>
          <p className="subtext">
            Only active subjects are shown in the normal catalogue.
          </p>
        </div>

        <button
          className="button secondary"
          onClick={toggleInactiveSubjects}
          disabled={inactiveLoading}
        >
          {inactiveLoading
            ? "Loading..."
            : showInactive
              ? "Hide inactive subjects"
              : "View inactive subjects"}
        </button>
      </div>

      {loading ? (
        <div className="panel subjects-state">Loading subjects...</div>
      ) : activeSubjects.length === 0 ? (
        <div className="panel subjects-state">
          <h2>No active subjects yet</h2>
          <p className="subtext">
            Add the first subject to your school&apos;s official catalogue.
          </p>
        </div>
      ) : (
        <SubjectTable
          subjects={activeSubjects}
          canManageSubjects={canManageSubjects}
          changingStatusId={changingStatusId}
          onEdit={openEditForm}
          onChangeStatus={changeSubjectStatus}
        />
      )}

      {showInactive && (
        <section className="inactive-subjects-section">
          <div className="subjects-toolbar">
            <div>
              <p className="eyebrow">Preserved records</p>
              <h2>Inactive subjects</h2>
            </div>
          </div>

          {inactiveLoading ? (
            <div className="panel subjects-state">
              Loading inactive subjects...
            </div>
          ) : inactiveSubjects.length === 0 ? (
            <div className="panel subjects-state">
              <p className="subtext">There are no inactive subjects.</p>
            </div>
          ) : (
            <SubjectTable
              subjects={inactiveSubjects}
              canManageSubjects={canManageSubjects}
              changingStatusId={changingStatusId}
              onEdit={openEditForm}
              onChangeStatus={changeSubjectStatus}
            />
          )}
        </section>
      )}
    </section>
  );
}

type SubjectTableProps = {
  subjects: Subject[];
  canManageSubjects: boolean;
  changingStatusId: string | null;
  onEdit: (subject: Subject) => void;
  onChangeStatus: (subject: Subject) => void;
};

function SubjectTable({
  subjects,
  canManageSubjects,
  changingStatusId,
  onEdit,
  onChangeStatus,
}: SubjectTableProps) {
  return (
    <div className="panel subject-table-panel">
      <div className="subject-table-wrap">
        <table className="subject-table">
          <thead>
            <tr>
              <th>Subject name</th>
              <th>Code</th>
              <th>Status</th>
              {canManageSubjects && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td data-label="Subject name">{subject.name}</td>
                <td data-label="Code">
                  <code>{subject.code}</code>
                </td>
                <td data-label="Status">
                  <span
                    className={`subject-status ${
                      subject.active ? "active" : "inactive"
                    }`}
                  >
                    {subject.active ? "Active" : "Inactive"}
                  </span>
                </td>

                {canManageSubjects && (
                  <td data-label="Actions">
                    <div className="subject-actions">
                      <button
                        className="button secondary compact-button"
                        onClick={() => onEdit(subject)}
                        disabled={changingStatusId === subject.id}
                      >
                        Edit
                      </button>

                      <button
                        className="button compact-button"
                        onClick={() => onChangeStatus(subject)}
                        disabled={changingStatusId === subject.id}
                      >
                        {changingStatusId === subject.id
                          ? "Updating..."
                          : subject.active
                            ? "Deactivate"
                            : "Reactivate"}
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
  );
}
