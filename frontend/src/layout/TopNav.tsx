import { NavLink } from "react-router-dom";
import logo from "../assets/civentichem-logo.png";

const TABS = [
  { to: "/", label: "Summary" },
  { to: "/rd", label: "R&D" },
  { to: "/production", label: "Production" },
];

export function TopNav() {
  return (
    <header className="topnav">
      <div className="topnav-brand">
        <img src={logo} alt="CiVentiChem" className="brand-logo" />
        <div className="brand-divider" />
        <div className="brand-name">CV Project Tracker</div>
      </div>

      <nav className="segmented">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) => `segmented-option ${isActive ? "active" : ""}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="topnav-status">
        <span className="topnav-status-label">DATA</span>
        <span className="topnav-status-value">Fully local · SQLite</span>
      </div>
    </header>
  );
}
