import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { SummaryPage } from "./views/SummaryPage";
import { RdListPage } from "./views/RdListPage";
import { ProductionListPage } from "./views/ProductionListPage";
import { ProjectDetailPage } from "./views/ProjectDetailPage";
import "./theme.css";
import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<SummaryPage />} />
          <Route path="/rd" element={<RdListPage />} />
          <Route path="/production" element={<ProductionListPage />} />
          <Route path="/projects/:code" element={<ProjectDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
