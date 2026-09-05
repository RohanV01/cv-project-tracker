import { useMemo } from "react";
import { projectHasProduction } from "../api";
import { useProjects } from "../layout/AppShell";
import { ProjectTable } from "../components/ProjectTable";

export function ProductionListPage() {
  const { projects } = useProjects();

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
      </div>

      <ProjectTable projects={productionProjects} />
    </>
  );
}
