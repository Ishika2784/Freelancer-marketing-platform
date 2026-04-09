import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { storage } from "../utils/storage";
import { SettingsIcon, SignOutIcon } from "../components/NavIcons";
import "../styles.css";

export default function DashboardLayout({ user, navItems, planCard, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    storage.clearAuth();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="prl-layout">
      {sidebarOpen && <div className="prl-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── SIDEBAR ── */}
      <aside className={`prl-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="prl-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="prl-logo-icon">◈</span>
          <span className="prl-logo-text">Freelancer.io</span>
        </div>

        {/* User card */}
        <div className="prl-user-card" onClick={() => navigate("/profile")}>
          <div className="prl-user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="prl-user-info">
            <div className="prl-user-name">{user?.name}</div>
            <div className="prl-user-email">{user?.email}</div>
          </div>
          <span className="prl-user-chevron">▾</span>
        </div>

        {/* Nav */}
        <div className="prl-nav-label">MENU</div>
        <nav className="prl-nav">
          {navItems.map(n => {
            const isActive = location.pathname === n.path ||
              (n.path !== "/client/dashboard" && n.path !== "/freelancer/dashboard" && location.pathname.startsWith(n.path));
            return (
              <button
                key={n.key}
                className={`prl-nav-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(n.path)}
              >
                <span className="prl-nav-icon">{n.icon()}</span>
                <span>{n.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Preferences */}
        <div className="prl-nav-label" style={{ marginTop: 24 }}>PREFERENCES</div>
        <nav className="prl-nav">
          <button className="prl-nav-item" onClick={() => navigate("/profile")}>
            <span className="prl-nav-icon"><SettingsIcon /></span>
            <span>Settings</span>
          </button>
          <button className="prl-nav-item nav-signout" onClick={handleLogout}>
            <span className="prl-nav-icon"><SignOutIcon /></span>
            <span style={{ color: "#ef4444" }}>Sign Out</span>
          </button>
        </nav>

        {/* Optional plan card (clients only) */}
        {planCard}
      </aside>

      {/* ── MAIN ── */}
      <main className="prl-main">
        <div className="prl-mobile-header">
          <button className="prl-hamburger" onClick={() => setSidebarOpen(v => !v)}>☰</button>
          <span className="prl-logo-text" style={{ fontWeight: 900 }}>Freelancer.io</span>
        </div>
        {children}
      </main>
    </div>
  );
}
