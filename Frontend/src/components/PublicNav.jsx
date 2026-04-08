import { useNavigate, useLocation } from "react-router-dom";
import { storage } from "../utils/storage";
import "../styles.css";

const LINKS = [
  { label: "Blog",    path: "/blog" },
  { label: "Events",  path: "/events" },
  { label: "Learn",   path: "/learn" },
  { label: "Careers", path: "/careers" },
  { label: "Help",    path: "/help" },
];

export default function PublicNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isLoggedIn = storage.isLoggedIn() || !!localStorage.getItem("token");
  const userRole   = storage.getRole() || localStorage.getItem("role");

  const toDashboard = () =>
    navigate(userRole === "client" ? "/client/dashboard" : "/freelancer/dashboard");

  return (
    <nav style={{
      background: "#1a1a2e", padding: "0 32px", height: 60,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.2)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("/")}>
        <span style={{ color: "#f97316", fontSize: "1.2rem" }}>◈</span>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>Freelancer.io</span>
      </div>

      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {LINKS.map(l => (
          <button key={l.path} onClick={() => navigate(l.path)}
            style={{
              background: pathname === l.path ? "rgba(249,115,22,0.15)" : "transparent",
              color: pathname === l.path ? "#f97316" : "rgba(255,255,255,0.7)",
              border: "none", padding: "6px 14px", borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s"
            }}>
            {l.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {isLoggedIn ? (
          <button className="btn btn-coral btn-sm" onClick={toDashboard}>Dashboard</button>
        ) : (
          <>
            <button className="btn-ghost" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }} onClick={() => navigate("/login")}>Log In</button>
            <button className="btn btn-coral btn-sm" onClick={() => navigate("/register")}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}
