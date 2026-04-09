import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { storage } from "../utils/storage";

const NAV_LINKS = [
  { label: "Find Talent", path: "scroll:features-strip" },
  { label: "Find Work",   path: "/login" },
  { label: "Enterprise",  path: "modal:pricing" },
  { label: "Why Us",      path: "scroll:connect" },
];

export default function PublicNav({ onOpenPricing }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isLoggedIn = storage.isLoggedIn() || !!localStorage.getItem("token");
  const userRole   = storage.getRole()    || localStorage.getItem("role");

  const toDashboard = () => {
    navigate(userRole === "client" ? "/client/dashboard" : "/freelancer/dashboard");
    setMenuOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleNavClick = (l) => {
    if (l.path.startsWith("modal:")) {
      if (onOpenPricing) onOpenPricing();
    } else if (l.path.startsWith("scroll:")) {
      const selector = l.path.replace("scroll:", ".");
      if (pathname === "/") {
        document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" }), 300);
      }
    } else {
      navigate(l.path);
    }
    setMenuOpen(false);
  };

  return (
    <nav
      className="pnav-container"
      ref={menuRef}
      style={{
        background: "#ffffff",
        padding: "0 40px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}
      >
        <span style={{ color: "#f97316", fontSize: "1.3rem" }}>◈</span>
        <span style={{ color: "#1a1a2e", fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px" }}>
          Freelancer.io
        </span>
      </div>

      {/* Desktop links — hidden below 768px */}
      <div className="pnav-desktop-links">
        {NAV_LINKS.map((l) => (
          <button
            key={l.path}
            onClick={() => handleNavClick(l)}
            style={{
              background: "transparent",
              border: "none",
              color: "#475569",
              fontSize: 13.5,
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.18s",
              fontFamily: "inherit",
            }}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Desktop auth — hidden below 768px */}
      <div className="pnav-desktop-auth" style={{ alignItems: "center", gap: 8 }}>
        {isLoggedIn ? (
          <button onClick={toDashboard} style={btnPrimary}>Dashboard</button>
        ) : (
          <>
    
            <button onClick={() => navigate("/login")} style={btnGhost}>Log In</button>
            <button onClick={() => navigate("/register")} style={btnPrimary}>Sign Up</button>
          </>
        )}
      </div>

      <button
        className="pnav-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 5,
          background: "rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 8,
          width: 40,
          height: 40,
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
        }}
      >
        <span style={hamLine(menuOpen, 1)} />
        <span style={hamLine(menuOpen, 2)} />
        <span style={hamLine(menuOpen, 3)} />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            background: "#ffffff",
            borderTop: "1px solid rgba(0,0,0,0.05)",
            padding: "12px 16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            zIndex: 999,
          }}
        >
          {NAV_LINKS.map((l) => (
            <button
              key={l.path}
              onClick={() => handleNavClick(l)}
              style={{
                background: "transparent",
                border: "none",
                color: "#1a1a2e",
                fontSize: 15,
                fontWeight: 600,
                padding: "13px 16px",
                borderRadius: 10,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                width: "100%",
              }}
            >
              {l.label}
            </button>
          ))}

          <div style={{ height: 1, background: "rgba(0,0,0,0.05)", margin: "8px 0" }} />

          {isLoggedIn ? (
            <button onClick={toDashboard} style={{ ...btnPrimary, width: "100%", padding: "13px 16px", borderRadius: 10, fontSize: 15 }}>
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => { navigate("/login"); setMenuOpen(false); }}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,0,0,0.15)",
                  color: "#1a1a2e",
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "12px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  marginBottom: 4,
                }}
              >
                Log In
              </button>
              <button
                onClick={() => { navigate("/register"); setMenuOpen(false); }}
                style={{ ...btnPrimary, width: "100%", padding: "13px 16px", borderRadius: 10, fontSize: 15 }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const btnPrimary = {
  background: "#f97316",
  border: "none",
  color: "#fff",
  fontSize: 13.5,
  fontWeight: 700,
  padding: "9px 20px",
  borderRadius: 100,
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
  fontFamily: "inherit",
  transition: "background 0.18s",
};

const btnGhost = {
  background: "transparent",
  border: "none",
  color: "#475569",
  fontSize: 13.5,
  fontWeight: 600,
  padding: "8px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontFamily: "inherit",
};

function hamLine(open, n) {
  const base = {
    display: "block",
    width: 18,
    height: 2,
    background: "#1a1a2e",
    borderRadius: 2,
    transition: "all 0.25s",
  };
  if (!open) return base;
  if (n === 1) return { ...base, transform: "translateY(7px) rotate(45deg)" };
  if (n === 2) return { ...base, opacity: 0, transform: "scaleX(0)" };
  if (n === 3) return { ...base, transform: "translateY(-7px) rotate(-45deg)" };
  return base;
}
