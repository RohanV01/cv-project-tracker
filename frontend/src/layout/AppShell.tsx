import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { listProjects, type Project } from "../api";
import { TopNav } from "./TopNav";

interface ShellContext {
  projects: Project[];
  refresh: () => void;
}

export function useProjects() {
  return useOutletContext<ShellContext>();
}

export function AppShell() {
  const [projects, setProjects] = useState<Project[]>([]);

  function refresh() {
    listProjects().then(setProjects);
  }

  useEffect(refresh, []);

  return (
    <div className="shell">
      <TopNav />
      <main className="main">
        <Outlet context={{ projects, refresh } satisfies ShellContext} />
      </main>
    </div>
  );
}
