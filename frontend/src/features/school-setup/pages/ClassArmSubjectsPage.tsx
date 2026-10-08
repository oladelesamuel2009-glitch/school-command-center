import { useEffect, useMemo, useState } from "react";
import {
  getStoredUser,
  getToken,
} from "../../../lib/authStorage";
import { listSubjects, type Subject } from "../services/subjects.service";
import {
  addClassArmSubject,
  listClassArms,
  listClassArmSubjects,
  listClasses,
  removeClassArmSubject,
  updateClassArmSubject,
  type ClassArm,
  type ClassArmSubject,
  type SchoolClass,
  type SubjectConfigurationType,
} from "../services/classArmSubjects.service";

const managementRoles = new Set(["proprietor", "principal", "admin"]);

export default function ClassArmSubjectsPage() {
  const user = getStoredUser();
  const token = getToken();

  const canManage = Boolean(
    user && managementRoles.has(user.role.toLowerCase())
  );

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [configuredSubjects, setConfiguredSubjects] = useState<
    ClassArmSubject[]
  >([]);
  const [activeSubjects, setActiveSubjects] = useState<Subject[]>([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedClassArmId, setSelectedClassArmId] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingArms, setLoadingArms] = useState(false);
  const [loadingConfiguredSubjects, setLoadingConfiguredSubjects] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedType, setSelectedType] =
    useState<SubjectConfigurationType>("compulsory");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedClass = classes.find(
    (schoolClass) => schoolClass.id === selectedClassId
  );

  const selectedClassArm = classArms.find(
    (classArm) => classArm.id === selectedClassArmId
  );

  const availableSubjects = useMemo(() => {
    const configuredSubjectIds = new Set(
      configuredSubjects.map((item) => item.subject_id)
    );

    return activeSubjects.filter(
      (subject) => !configuredSubjectIds.has(subject.id)
    );
  }, [activeSubjects, configuredSubjects]);

  function displayError(requestError: unknown, fallback: string) {
    setError(
      requestError instanceof Error ? requestError.message : fallback
    );
  }

  async function loadInitialData() {
    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [classesResponse, subjectsResponse] = await Promise.all([
        listClasses(token),
        listSubjects(token),
      ]);

      setClasses(classesResponse.data);
      setActiveSubjects(subjectsResponse);

      if (classesResponse.data.length > 0) {
        setSelectedClassId(classesResponse.data[0].id);
      }
    } catch (requestError) {
      displayError(requestError, "Unable to load classes and subjects.");
    } finally {
      setLoading(false);
    }
  }

  async function loadClassArms(classId: string) {
    if (!token || !classId) {
      setClassArms([]);
      setSelectedClassArmId("");
      setConfiguredSubjects([]);
      return;
    }

    try {
      setLoadingArms(true);
      setError("");
      setClassArms([]);
      setSelectedClassArmId("");
      setConfiguredSubjects([]);

      const response = await listClassArms(classId, token);
      setClassArms(response.data);

      if (response.data.length > 0) {
        setSelectedClassArmId(response.data[0].id);
      }
    } catch (requestError) {
      displayError(requestError, "Unable to load class arms.");
    } finally {
      setLoadingArms(false);
    }
  }

  async function loadConfiguredSubjects(classArmId: string) {
    if (!token || !classArmId) {
      setConfiguredSubjects([]);
      return;
    }

    try {
      setLoadingConfiguredSubjects(true);
      setError("");

      const response = await listClassArmSubjects(classArmId, token);
      setConfiguredSubjects(response.data);
    } catch (requestError) {
      displayError(requestError, "Unable to load configured subjects.");
    } finally {
      setLoadingConfiguredSubjects(false);
    }
  }

  useEffect(() => {
    void loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      void loadClassArms(selectedClassId);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedClassArmId) {
      void loadConfiguredSubjects(selectedClassArmId);
    }
  }, [selectedClassArmId]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function handleClassChange(classId: string) {
    clearMessages();
    setSelectedClassId(classId);
  }

  function handleClassArmChange(classArmId: string) {
    clearMessages();
    setSelectedClassArmId(classArmId);
  }

  function openAddForm() {
    clearMessages();
    setSelectedSubjectId(availableSubjects[0]?.id || "");
    setSelectedType("compulsory");
    setFormOpen(true);
  }

  function closeAddForm() {
    if (!saving) {
      setFormOpen(false);
    }
  }

  async function handleAddSubject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedClassArmId) {
      setError("Select a class arm before adding a subject.");
      return;
    }

    if (!selectedSubjectId) {
      setError("Select a subject to add.");
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      await addClassArmSubject(
        selectedClassArmId,
        {
          subjectId: selectedSubjectId,
          type: selectedType,
        },
        token
      );

      setFormOpen(false);
      setSuccess("Subject added successfully.");
      await loadConfiguredSubjects(selectedClassArmId);
    } catch (requestError) {
      displayError(requestError, "Unable to add subject.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTypeChange(
    configuration: ClassArmSubject,
    type: SubjectConfigurationType
  ) {
    if (!token || type === configuration.type) {
      return;
    }

    try {
      setUpdatingId(configuration.id);
      clearMessages();

      await updateClassArmSubject(
        configuration.id,
        { type },
        token
      );

      setSuccess("Subject type updated successfully.");
      await loadConfiguredSubjects(selectedClassArmId);
    } catch (requestError) {
      displayError(requestError, "Unable to update subject type.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemove(configuration: ClassArmSubject) {
    const subjectName = configuration.subjects?.name || "this subject";

    const confirmed = window.confirm(
      `Are you sure you want to remove ${subjectName} from this class arm?`
    );

    if (!confirmed || !token) {
      return;
    }

    try {
      setRemovingId(configuration.id);
      clearMessages();

      await removeClassArmSubject(configuration.id, token);

      setSuccess("Subject removed successfully.");
      await loadConfiguredSubjects(selectedClassArmId);
    } catch (requestError) {
      displayError(requestError, "Unable to remove subject.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="class-arm-subjects-page">
      <header className="subjects-header">
        <div>
          <p className="eyebrow">School Setup</p>
          <h2>Class Arm Subjects</h2>
          <p className="subtext">
            Configure the subjects available to each class arm and identify
            whether they are compulsory or elective.
          </p>
        </div>
      </header>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      <section className="panel class-arm-selection-panel">
        <div>
          <p className="eyebrow">Select class arm</p>
          <h2>Choose where to configure subjects</h2>
        </div>

        {loading ? (
          <p className="subtext">Loading classes and subjects...</p>
        ) : classes.length === 0 ? (
          <div className="subjects-state">
            <p className="subtext">
              No classes are available yet. Create a class before configuring
              its subjects.
            </p>
          </div>
        ) : (
          <div className="two-grid">
            <label className="field">
              <span>Class</span>
              <select
                value={selectedClassId}
                onChange={(event) => handleClassChange(event.target.value)}
                disabled={loadingArms}
              >
                {classes.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Class arm</span>
              <select
                value={selectedClassArmId}
                onChange={(event) =>
                  handleClassArmChange(event.target.value)
                }
                disabled={loadingArms || classArms.length === 0}
              >
                {classArms.length === 0 ? (
                  <option value="">
                    {loadingArms
                      ? "Loading class arms..."
                      : "No class arms available"}
                  </option>
                ) : (
                  classArms.map((classArm) => (
                    <option key={classArm.id} value={classArm.id}>
                      {selectedClass?.name} → {classArm.name}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>
        )}
      </section>

      {selectedClassArm && (
        <section className="panel configured-subjects-panel">
          <header className="subjects-toolbar">
            <div>
              <p className="eyebrow">Configured subjects</p>
              <h2>
                {selectedClass?.name} → {selectedClassArm.name}
              </h2>
              <p className="subtext">
                Active subjects assigned to this class arm.
              </p>
            </div>

            {canManage && (
              <button
                className="button"
                onClick={openAddForm}
                disabled={availableSubjects.length === 0}
              >
                Add Subject
              </button>
            )}
          </header>

          {formOpen && canManage && (
            <form className="subject-form-panel" onSubmit={handleAddSubject}>
              <div className="subject-form-heading">
                <div>
                  <p className="eyebrow">New configuration</p>
                  <h2>Add subject</h2>
                </div>

                <button
                  type="button"
                  className="button secondary"
                  onClick={closeAddForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>

              <div className="two-grid">
                <label className="field">
                  <span>Subject</span>
                  <select
                    value={selectedSubjectId}
                    onChange={(event) =>
                      setSelectedSubjectId(event.target.value)
                    }
                    disabled={saving || availableSubjects.length === 0}
                    required
                  >
                    <option value="">Select a subject</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Type</span>
                  <select
                    value={selectedType}
                    onChange={(event) =>
                      setSelectedType(
                        event.target.value as SubjectConfigurationType
                      )
                    }
                    disabled={saving}
                  >
                    <option value="compulsory">Compulsory</option>
                    <option value="elective">Elective</option>
                  </select>
                </label>
              </div>

              <button
                className="button"
                type="submit"
                disabled={saving || availableSubjects.length === 0}
              >
                {saving ? "Adding..." : "Add subject"}
              </button>
            </form>
          )}

          {loadingConfiguredSubjects ? (
            <div className="subjects-state">Loading configured subjects...</div>
          ) : configuredSubjects.length === 0 ? (
            <div className="subjects-state">
              <h2>No subjects configured for this class arm yet.</h2>
              <p className="subtext">
                Add active subjects to make them available to this class arm.
              </p>
            </div>
          ) : (
            <div className="subject-table-wrap">
              <table className="subject-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Code</th>
                    <th>Type</th>
                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {configuredSubjects.map((configuration) => (
                    <tr key={configuration.id}>
                      <td data-label="Subject">
                        {configuration.subjects?.name || "Unknown subject"}
                      </td>
                      <td data-label="Code">
                        <code>
                          {configuration.subjects?.code || "—"}
                        </code>
                      </td>
                      <td data-label="Type">
                        {canManage ? (
                          <select
                            value={configuration.type}
                            onChange={(event) =>
                              void handleTypeChange(
                                configuration,
                                event.target.value as SubjectConfigurationType
                              )
                            }
                            disabled={
                              updatingId === configuration.id ||
                              removingId === configuration.id
                            }
                          >
                            <option value="compulsory">Compulsory</option>
                            <option value="elective">Elective</option>
                          </select>
                        ) : (
                          <span className="subject-status active">
                            {configuration.type === "compulsory"
                              ? "Compulsory"
                              : "Elective"}
                          </span>
                        )}
                      </td>

                      {canManage && (
                        <td data-label="Actions">
                          <button
                            className="button compact-button"
                            onClick={() =>
                              void handleRemove(configuration)
                            }
                            disabled={
                              updatingId === configuration.id ||
                              removingId === configuration.id
                            }
                          >
                            {removingId === configuration.id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
