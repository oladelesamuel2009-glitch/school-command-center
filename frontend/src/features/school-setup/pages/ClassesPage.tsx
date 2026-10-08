import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  getStoredUser,
  getToken,
} from "../../../lib/authStorage";
import {
  createClass,
  deleteClass,
  listClasses,
  updateClass,
  type SchoolClass,
} from "../services/classes.service";

const managementRoles = new Set(["proprietor", "principal", "admin"]);

export default function ClassesPage() {
  const user = getStoredUser();
  const token = getToken();

  const canManage = Boolean(
    user && managementRoles.has(user.role.toLowerCase())
  );

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadClasses() {
    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await listClasses(token);
      setClasses(response.data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load classes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadClasses();
  }, []);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function openCreateForm() {
    clearMessages();
    setEditingClass(null);
    setName("");
    setFormOpen(true);
  }

  function openEditForm(schoolClass: SchoolClass) {
    clearMessages();
    setEditingClass(schoolClass);
    setName(schoolClass.name);
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingClass(null);
    setName("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Class name is required.");
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      if (editingClass) {
        await updateClass(
          editingClass.id,
          { name: trimmedName },
          token
        );
        setSuccess("Class updated successfully.");
      } else {
        await createClass({ name: trimmedName }, token);
        setSuccess("Class created successfully.");
      }

      closeForm();
      await loadClasses();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save class."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(schoolClass: SchoolClass) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${schoolClass.name}"? This may also remove its class arms.`
    );

    if (!confirmed) {
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setDeletingId(schoolClass.id);
      clearMessages();

      await deleteClass(schoolClass.id, token);

      setSuccess("Class deleted successfully.");
      await loadClasses();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete class."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="classes-page">
      <header className="subjects-header">
        <div>
          <p className="eyebrow">School Setup</p>
          <h2>Classes</h2>
          <p className="subtext">
            Manage the official class levels used by your school.
          </p>
        </div>

        {canManage && (
          <button className="button" onClick={openCreateForm}>
            Add Class
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
                {editingClass ? "Edit class" : "New class"}
              </p>
              <h2>
                {editingClass ? "Update class" : "Add class"}
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
            <span>Class name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. SS1"
              disabled={saving}
              required
            />
          </label>

          <button className="button" type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingClass
                ? "Save changes"
                : "Create class"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="panel subjects-state">Loading classes...</div>
      ) : classes.length === 0 ? (
        <div className="panel subjects-state">
          <h2>No classes yet</h2>
          <p className="subtext">
            Add the first class level for your school.
          </p>
        </div>
      ) : (
        <div className="panel subject-table-panel">
          <div className="subject-table-wrap">
            <table className="subject-table">
              <thead>
                <tr>
                  <th>Class name</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {classes.map((schoolClass) => (
                  <tr key={schoolClass.id}>
                    <td data-label="Class name">{schoolClass.name}</td>

                    {canManage && (
                      <td data-label="Actions">
                        <div className="subject-actions">
                          <button
                            className="button secondary compact-button"
                            onClick={() => openEditForm(schoolClass)}
                            disabled={deletingId === schoolClass.id}
                          >
                            Edit
                          </button>

                          <button
                            className="button compact-button"
                            onClick={() => void handleDelete(schoolClass)}
                            disabled={deletingId === schoolClass.id}
                          >
                            {deletingId === schoolClass.id
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
