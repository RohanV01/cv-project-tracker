import { useMemo, useState } from "react";
import { projectHasRd } from "../api";
import { useProjects } from "../layout/AppShell";
import { ProjectTable } from "../components/ProjectTable";
import { Modal } from "../components/Modal";
import { NewProjectModal } from "../components/NewProjectModal";

export function RdListPage() {
  const { projects, refresh } = useProjects();
  const [showNewProject, setShowNewProject] = useState(false);

  const rdProjects = useMemo(() => projects.filter(projectHasRd), [projects]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>R&amp;D</h1>
          <p className="muted">{rdProjects.length} project{rdProjects.length === 1 ? "" : "s"} in active R&amp;D tracking.</p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => setShowNewProject(true)}>
            + New Project
          </button>
        </div>
      </div>

      <ProjectTable projects={rdProjects} />

      {showNewProject && (
        <Modal title="New project" onClose={() => setShowNewProject(false)}>
          <NewProjectModal onCreated={refresh} onClose={() => setShowNewProject(false)} />
        </Modal>
      )}
    </>
  );
}
