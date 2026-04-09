import { useNavigate, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { storage } from "../utils/storage";
import "../styles.css";

function Stars({ rating = 0 }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? "star-on" : "star-off"}>★</span>
      ))}
      <span className="star-val">{rating ? rating.toFixed(1) : "—"}</span>
    </span>
  );
}

const NOTIFS = [
  { icon:"💼", text:"New bid on your React Dashboard job", time:"2m ago", read:false },
  { icon:"✅", text:"Payment released for Logo Design", time:"1h ago", read:false },
  { icon:"⭐", text:"You received a 5-star review!", time:"3h ago", read:true },
  { icon:"🤖", text:"AI found 3 new matches for your job", time:"1d ago", read:true },
];

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const ref = useRef(null);

  const handleLogout = () => {
    storage.clearAuth();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowNotif(false);
        setShowProfile(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!user) return (
    <nav className="nav">
      <div className="navlogo">
        <span className="navlogo-icon">◈</span>
        <Link to="/" style={{ color: "inherit" }}>Freelancer.io</Link>
      </div>
    </nav>
  );

  const unread = NOTIFS.filter(n => !n.read).length;
  const planExpiry = user?.planExpiry ? new Date(user.planExpiry) : null;
  const daysLeft = planExpiry ? Math.max(0, Math.ceil((planExpiry - new Date()) / 86400000)) : null;
  const go = (path) => { navigate(path); setShowProfile(false); setMenuOpen(false); };

  return (
    <nav className="nav" ref={ref}>
      {/* Logo */}
      <div className="navlogo">
        <span className="navlogo-icon">◈</span>
        <Link to={user.role === "client" ? "/client/dashboard" : "/freelancer/dashboard"} style={{ color: "inherit" }}>
          Freelancer.io
        </Link>
      </div>

      {/* Desktop nav links */}
      <div className="navlinks">
        {user.role === "client" && (
          <>
            <Link to="/post-job">Post a Job</Link>
            <Link to="/my-jobs">My Jobs</Link>
          </>
        )}
        {user.role === "freelancer" && (
          <>
            <Link to="/freelancer/find-project">Browse Jobs</Link>
            <Link to="/freelancer/proposals">My Proposals</Link>
          </>
        )}
      </div>

      {/* Desktop actions */}
      <div className="nav-actions">
        {/* Notifications */}
        <div className="nav-avatar-wrap">
          <button className="notif-btn" onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}>
            🔔 {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>
          {showNotif && (
            <div className="dropdown notif-panel">
              <div className="notif-header">
                <span>Notifications</span>
                <span className="notif-badge-count">{unread}</span>
              </div>
              {NOTIFS.map((n, i) => (
                <div key={i} className={`notif-item ${n.read ? "" : "notif-unread"}`}>
                  <span className="notif-icon">{n.icon}</span>
                  <div>
                    <div className="notif-text">{n.text}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="nav-avatar-wrap">
          <button className="nav-avatar-btn" onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}>
            <span className="nav-avatar-letter">{user.name?.charAt(0).toUpperCase()}</span>
            <span className="nav-avatar-name">{user.name?.split(" ")[0]}</span>
            <span className="nav-avatar-chevron">▾</span>
          </button>
          {showProfile && (
            <div className="dropdown">
              <div className="dropdown-user">
                <div className="dropdown-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="dropdown-name">{user.name}</div>
                  <div className="dropdown-email">{user.email}</div>
                  {user.role === "freelancer" && <Stars rating={user.rating || 4.7} />}
                </div>
              </div>
              <div className="dropdown-sub">
                <div className="sub-label">
                  <span>{user.plan === "pro" ? "⭐ Pro Plan" : "Free Plan"}</span>
                  {daysLeft !== null
                    ? <span className={daysLeft <= 5 ? "sub-warn" : "sub-ok"}>{daysLeft}d left</span>
                    : <span className="sub-warn">Limited</span>}
                </div>
                {daysLeft !== null && (
                  <div className="sub-bar">
                    <div className="sub-fill" style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }} />
                  </div>
                )}
                {user.plan === "free" && (
                  <button className="sub-upgrade" onClick={() => go("/pricing")}>Upgrade to Pro →</button>
                )}
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => go("/profile")}>
                <span className="dropdown-item-icon">👤</span> Profile
              </button>
              {user.role === "client" && (
                <button className="dropdown-item" onClick={() => go("/pricing")}>
                  <span className="dropdown-item-icon">💎</span> Subscription
                </button>
              )}
              <div className="dropdown-divider" />
              <button className="dropdown-item dropdown-danger" onClick={handleLogout}>
                <span className="dropdown-item-icon">🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`ham-line${menuOpen ? " open" : ""}`} />
          <span className={`ham-line${menuOpen ? " open" : ""}`} />
          <span className={`ham-line${menuOpen ? " open" : ""}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-user">
            <div className="mobile-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="mobile-user-name">{user.name}</div>
              <div className="mobile-user-role">{user.role === "client" ? "Client" : "Freelancer"}</div>
            </div>
          </div>
          <div className="mobile-menu-divider" />

          {user.role === "client" && (
            <>
              <button className="mobile-menu-link" onClick={() => go("/post-job")}>💼 Post a Job</button>
              <button className="mobile-menu-link" onClick={() => go("/my-jobs")}>📋 My Jobs</button>
              <button className="mobile-menu-link" onClick={() => go("/client/find-freelancers")}>🔍 Find Freelancers</button>
            </>
          )}
          {user.role === "freelancer" && (
            <>
              <button className="mobile-menu-link" onClick={() => go("/freelancer/find-project")}>🔍 Browse Jobs</button>
              <button className="mobile-menu-link" onClick={() => go("/freelancer/proposals")}>📄 My Proposals</button>
              <button className="mobile-menu-link" onClick={() => go("/freelancer/companies")}>🏢 Companies</button>
            </>
          )}

          <div className="mobile-menu-divider" />
          <button className="mobile-menu-link" onClick={() => go("/profile")}>👤 Profile</button>
          {user.role === "client" && (
            <button className="mobile-menu-link" onClick={() => go("/pricing")}>💎 Subscription</button>
          )}

          <div className="mobile-menu-divider" />
          <button className="mobile-menu-link mobile-menu-danger" onClick={handleLogout}>🚪 Sign Out</button>
        </div>
      )}
    </nav>
  );
}
