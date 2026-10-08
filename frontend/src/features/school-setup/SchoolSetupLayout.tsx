import { NavLink, Outlet } from "react-router-dom";
import { schoolSetupSections } from "./schoolSetupSections";

export default function SchoolSetupLayout() {
  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">School Setup</p>
          <h1>Configure your school</h1>
          <p className="subtext">
            Set up the academic structure that will support attendance,
            assessments and results.
          </p>
        </div>
      </header>

      <div className="setup-layout">
        <nav className="setup-nav" aria-label="School Setup sections">
          <p className="eyebrow">Setup sections</p>

          <div className="setup-nav-links">
            {schoolSetupSections.map((section) => (
              <NavLink
                key={section.slug}
                to={`/school-setup/${section.slug}`}
                className={({ isActive }) =>
                  `setup-nav-link${isActive ? " active" : ""}`
                }
              >
                {section.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <section className="setup-content">
          <Outlet />
        </section>
      </div>
    </main>
  );
}
