import { useNavigate, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { storage } from "../utils/storage";
import { api } from "../utils/api";
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

const NOTIF_ICONS = { hired: "🎉", info: "💼", message: "💬", default: "🔔" };

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const ref = useRef(null);

  // Fetch real notifications
  useEffect(() => {
    if (!user) return;
    api.get("/user/notifications")
      .then(r => setNotifs(r.data || []))
      .catch(() => {});
  }, [user]);

  const markRead = async () => {
    if (notifs.some(n => !n.read)) {
      await api.post("/user/notifications/read").catch(() => {});
      setNotifs(n => n.map(x => ({ ...x, read: true })));
    }
  };

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

  const unread = notifs.filter(n => !n.read).length;
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
          <button className="notif-btn" onClick={() => { setShowNotif(v => !v); setShowProfile(false); if (!showNotif) markRead(); }}>
            🔔 {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>
          {showNotif && (
            <div className="dropdown notif-panel">
              <div className="notif-header">
                <span>Notifications</span>
                {unread > 0 && <span className="notif-badge-count">{unread}</span>}
              </div>
              {notifs.length === 0 ? (
                <div className="dropdown-empty">No notifications yet</div>
              ) : notifs.map((n, i) => (
                <div key={i} className={`notif-item ${n.read ? "" : "notif-unread"}`}>
                  <span className="notif-icon">{NOTIF_ICONS[n.type] || NOTIF_ICONS.default}</span>
                  <div>
                    <div className="notif-text">{n.message}</div>
                    <div className="notif-time">{new Date(n.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}</div>
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
