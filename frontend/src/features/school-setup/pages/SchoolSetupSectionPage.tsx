import { Navigate, useParams } from "react-router-dom";
import {
  schoolSetupSections,
} from "../schoolSetupSections";
import AcademicSessionsPage from "./AcademicSessionsPage";
import ClassArmSubjectsPage from "./ClassArmSubjectsPage";
import ClassArmsPage from "./ClassArmsPage";
import ClassesPage from "./ClassesPage";
import SubjectsPage from "./SubjectsPage";
import TermsPage from "./TermsPage";

export default function SchoolSetupSectionPage() {
  const { section } = useParams<{ section?: string }>();

  if (section === "academic-sessions") {
    return <AcademicSessionsPage />;
  }

  if (section === "terms") {
    return <TermsPage />;
  }

  if (section === "classes") {
    return <ClassesPage />;
  }

  if (section === "class-arms") {
    return <ClassArmsPage />;
  }

  if (section === "subjects") {
    return <SubjectsPage />;
  }

  if (section === "class-arm-subjects") {
    return <ClassArmSubjectsPage />;
  }

  const selectedSection = schoolSetupSections.find(
    (item) => item.slug === section
  );

  if (!selectedSection) {
    return <Navigate to="/school-setup/academic-sessions" replace />;
  }

  return (
    <article className="panel setup-placeholder">
      <p className="eyebrow">School Setup</p>
      <h2>{selectedSection.label}</h2>

      <p className="subtext">{selectedSection.description}</p>

      <div className="setup-coming-soon">
        <strong>Management interface coming next</strong>
        <span>
          This section is ready for its backend-connected management interface.
        </span>
      </div>
    </article>
  );
}
