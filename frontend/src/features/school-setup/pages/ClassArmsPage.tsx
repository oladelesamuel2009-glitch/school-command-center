import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  getStoredUser,
  getToken,
} from "../../../lib/authStorage";
import {
  createClassArm,
  deleteClassArm,
  listClassArms,
  listClasses,
  updateClassArm,
  type ClassArm,
  type SchoolClass,
} from "../services/classArms.service";

const managementRoles = new Set(["proprietor", "principal", "admin"]);

export default function ClassArmsPage() {
  const user = getStoredUser();
  const token = getToken();

  const canManage = Boolean(
    user && managementRoles.has(user.role.toLowerCase())
  );

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingClassArms, setLoadingClassArms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingClassArm, setEditingClassArm] = useState<ClassArm | null>(
    null
  );
  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedClass = classes.find(
    (schoolClass) => schoolClass.id === selectedClassId
  );

  async function loadClasses() {
    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoadingClasses(false);
      return;
    }

    try {
      setLoadingClasses(true);
      setError("");

      const response = await listClasses(token);
      setClasses(response.data);

      if (response.data.length > 0) {
        setSelectedClassId((currentId) => currentId || response.data[0].id);
      } else {
        setSelectedClassId("");
        setClassArms([]);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load classes."
      );
    } finally {
      setLoadingClasses(false);
    }
  }

  async function loadClassArms(classId: string) {
    if (!token || !classId) {
      setClassArms([]);
      return;
    }

    try {
      setLoadingClassArms(true);
      setError("");

      const response = await listClassArms(classId, token);
      setClassArms(response.data);
    } catch (requestError) {
      setClassArms([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load class arms."
      );
    } finally {
      setLoadingClassArms(false);
    }
  }

  useEffect(() => {
    void loadClasses();
  }, []);

  useEffect(() => {
    setClassArms([]);

    if (selectedClassId) {
      void loadClassArms(selectedClassId);
    }
  }, [selectedClassId]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function handleClassChange(classId: string) {
    clearMessages();
    setSelectedClassId(classId);
  }

  function openCreateForm() {
    clearMessages();
    setEditingClassArm(null);
    setName("");
    setFormOpen(true);
  }

  function openEditForm(classArm: ClassArm) {
    clearMessages();
    setEditingClassArm(classArm);
    setName(classArm.name);
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingClassArm(null);
    setName("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!selectedClassId) {
      setError("Select a class before managing class arms.");
      return;
    }

    if (!trimmedName) {
      setError("Class arm name is required.");
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      if (editingClassArm) {
        await updateClassArm(
          editingClassArm.id,
          { name: trimmedName },
          token
        );
        setSuccess("Class arm updated successfully.");
      } else {
        await createClassArm(
          selectedClassId,
          { name: trimmedName },
          token
        );
        setSuccess("Class arm created successfully.");
      }

      closeForm();
      await loadClassArms(selectedClassId);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save class arm."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(classArm: ClassArm) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the class arm "${classArm.name}"?`
    );

    if (!confirmed) {
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setDeletingId(classArm.id);
      clearMessages();

      await deleteClassArm(classArm.id, token);

      setSuccess("Class arm deleted successfully.");
      await loadClassArms(selectedClassId);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete class arm."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="class-arms-page">
      <header className="subjects-header">
        <div>
          <p className="eyebrow">School Setup</p>
          <h2>Class Arms</h2>
          <p className="subtext">
            Manage the arms belonging to each class level.
          </p>
        </div>
      </header>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      {loadingClasses ? (
        <div className="panel subjects-state">Loading classes...</div>
      ) : classes.length === 0 ? (
        <div className="panel subjects-state">
          <h2>No classes available</h2>
          <p className="subtext">
            Create a class before adding class arms.
          </p>
        </div>
      ) : (
        <>
          <section className="panel class-arm-selection-panel">
            <label className="field">
              <span>Class</span>
              <select
                value={selectedClassId}
                onChange={(event) =>
                  handleClassChange(event.target.value)
                }
                disabled={loadingClassArms || saving}
              >
                {classes.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedClass && (
              <p className="subtext">
                Class arms for {selectedClass.name}.
              </p>
            )}
          </section>

          <section className="panel configured-subjects-panel">
            <header className="subjects-toolbar">
              <div>
                <p className="eyebrow">Class arms</p>
                <h2>{selectedClass?.name || "Select a class"}</h2>
              </div>

              {canManage && selectedClassId && (
                <button
                  className="button"
                  onClick={openCreateForm}
                  disabled={loadingClassArms}
                >
                  Add Class Arm
                </button>
              )}
            </header>

            {formOpen && canManage && (
              <form className="subject-form-panel" onSubmit={handleSubmit}>
                <div className="subject-form-heading">
                  <div>
                    <p className="eyebrow">
                      {editingClassArm
                        ? "Edit class arm"
                        : "New class arm"}
                    </p>
                    <h2>
                      {editingClassArm
                        ? "Update class arm"
                        : "Add class arm"}
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
                  <span>Class arm name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. SS2A"
                    disabled={saving}
                    required
                  />
                </label>

                <button className="button" type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingClassArm
                      ? "Save changes"
                      : "Create class arm"}
                </button>
              </form>
            )}

            {loadingClassArms ? (
              <div className="subjects-state">
                Loading class arms...
              </div>
            ) : classArms.length === 0 ? (
              <div className="subjects-state">
                <h2>No class arms yet</h2>
                <p className="subtext">
                  {canManage
                    ? "Create the first class arm for this class."
                    : "No class arms have been configured for this class."}
                </p>
              </div>
            ) : (
              <div className="subject-table-wrap">
                <table className="subject-table">
                  <thead>
                    <tr>
                      <th>Class arm name</th>
                      {canManage && <th>Actions</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {classArms.map((classArm) => (
                      <tr key={classArm.id}>
                        <td data-label="Class arm name">
                          {classArm.name}
                        </td>

                        {canManage && (
                          <td data-label="Actions">
                            <div className="subject-actions">
                              <button
                                className="button secondary compact-button"
                                onClick={() => openEditForm(classArm)}
                                disabled={deletingId === classArm.id}
                              >
                                Edit
                              </button>

                              <button
                                className="button compact-button"
                                onClick={() => void handleDelete(classArm)}
                                disabled={deletingId === classArm.id}
                              >
                                {deletingId === classArm.id
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
