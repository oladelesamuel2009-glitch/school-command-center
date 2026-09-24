import { Link, useNavigate } from "react-router-dom";
import { clearAuth, getStoredUser } from "../../../lib/authStorage";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = getStoredUser();

  function logout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome{user ? `, ${user.firstName}` : ""}</h1>
          <p className="subtext">
            Your School Command Center workspace is coming alive.
          </p>
        </div>

        <button className="button secondary" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Current user</p>
          <h2>{user ? `${user.firstName} ${user.lastName}` : "Unknown user"}</h2>
          <p className="subtext">Role: {user?.role || "N/A"}</p>
          <p className="subtext">School ID: {user?.schoolId || "N/A"}</p>
        </article>

        <article className="panel">
          <p className="eyebrow">User Management</p>
          <h2>Invite staff</h2>
          <p className="subtext">
            Create invitation links for principals, admins and teachers.
          </p>
          <Link className="button link-button" to="/users">
            Go to User Management
          </Link>
        </article>

        <article className="panel muted-panel">
          <p className="eyebrow">Next feature</p>
          <h2>School Setup</h2>
          <p className="subtext">
            Sessions, terms, classes, class arms and subjects will come next.
          </p>
        </article>
      </section>
    </main>
  );
}
