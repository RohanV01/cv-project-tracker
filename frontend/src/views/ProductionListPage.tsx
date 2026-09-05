import { useMemo, useState } from "react";
import { projectHasProduction } from "../api";
import { useProjects } from "../layout/AppShell";
import { ProjectTable } from "../components/ProjectTable";
import { Modal } from "../components/Modal";
import { NewManufacturingProjectModal } from "../components/NewManufacturingProjectModal";

export function ProductionListPage() {
  const { projects, refresh } = useProjects();
  const [showNewProject, setShowNewProject] = useState(false);

  const productionProjects = useMemo(() => projects.filter(projectHasProduction), [projects]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Production</h1>
          <p className="muted">
            {productionProjects.length} project{productionProjects.length === 1 ? "" : "s"} in active production tracking.
          </p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => setShowNewProject(true)}>
            + New Project
          </button>
        </div>
      </div>

      <ProjectTable projects={productionProjects} />

      {showNewProject && (
        <Modal title="New manufacturing project" onClose={() => setShowNewProject(false)}>
          <NewManufacturingProjectModal onCreated={refresh} onClose={() => setShowNewProject(false)} />
        </Modal>
      )}
    </>
  );
}
