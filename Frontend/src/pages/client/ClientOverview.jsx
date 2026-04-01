import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, timeAgo } from "../../utils/api";

export default function ClientOverview({ user }) {
  const navigate = useNavigate();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/jobs/my")
      .then(r => setJobs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const recent = [...jobs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <>
      {/* Welcome header */}
      <div className="prl-page-title">
        <h1>Welcome back, {user.name}! 👋</h1>
        <p>Here's what's happening with your projects today.</p>
      </div>

      {/* Client summary card */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 100%)",
        borderRadius: 18, padding: "28px 32px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          color: "#fff", fontSize: "1.8rem", fontWeight: 900,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, boxShadow: "0 4px 16px rgba(249,115,22,0.4)"
        }}>
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", marginBottom: 4 }}>{user.name}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>{user.email}</div>
          <span style={{
            background: user.plan === "pro" ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.1)",
            color: user.plan === "pro" ? "#fed7aa" : "rgba(255,255,255,0.6)",
            border: `1px solid ${user.plan === "pro" ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.15)"}`,
            padding: "4px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700
          }}>
            {user.plan === "pro" ? "⭐ Pro Plan" : "Free Plan"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-coral btn-sm" style={{ borderRadius: 10 }}
            onClick={() => navigate("/client/post-job")}>+ Post a Job</button>
          {user.plan !== "pro" && (
            <button onClick={() => navigate("/pricing")} style={{
              background: "rgba(249,115,22,0.15)", color: "#fed7aa",
              border: "1px solid rgba(249,115,22,0.3)", borderRadius: 10,
              padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}>Upgrade →</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Active Jobs",  value: loading ? "…" : jobs.length, icon: "💼", path: "/client/my-jobs" },
          { label: "Plan",         value: user.plan === "pro" ? "Pro" : "Free", icon: "🎯" },
        ].map((s, i) => (
          <div key={i} className="stat"
            onClick={() => s.path && navigate(s.path)}
            style={{ cursor: s.path ? "pointer" : "default" }}>
            <span className="stat-icon">{s.icon}</span>
            <h3>{s.value}</h3>
            <p>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent jobs */}
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Recent Job Postings</span>
          <button className="panel-action" onClick={() => navigate("/client/my-jobs")}>View All →</button>
        </div>
        {loading ? (
          <div style={{ padding: 24, color: "#94a3b8", textAlign: "center" }}>Loading…</div>
        ) : recent.length === 0 ? (
          <div className="empty">
            No jobs yet. <span onClick={() => navigate("/client/post-job")}>Post one →</span>
          </div>
        ) : recent.map(job => (
          <div key={job._id} className="mini-row">
            <div>
              <div className="mini-title">{job.title}</div>
              <div className="mini-meta">
                ₹{Number(job.budget || 0).toLocaleString()} · {timeAgo(job.createdAt)}
              </div>
            </div>
            <span style={{
              background: "#fff7ed", color: "#f97316",
              border: "1px solid #fed7aa",
              padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700
            }}>
              {job.type || "Fixed"}
            </span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
        <div className="panel" style={{ cursor: "pointer", transition: "all .2s" }}
          onClick={() => navigate("/client/post-job")}
          onMouseOver={e => e.currentTarget.style.borderColor = "#fed7aa"}
          onMouseOut={e => e.currentTarget.style.borderColor = ""}>
          <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>📝</div>
          <div style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Post a New Job</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>Describe your project and get proposals from top freelancers.</div>
        </div>
        <div className="panel" style={{ cursor: "pointer", transition: "all .2s" }}
          onClick={() => navigate("/client/find-freelancers")}
          onMouseOver={e => e.currentTarget.style.borderColor = "#fed7aa"}
          onMouseOut={e => e.currentTarget.style.borderColor = ""}>
          <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>🔍</div>
          <div style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Find Freelancers</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>Browse verified professionals and invite them to bid on your project.</div>
        </div>
      </div>
    </>
  );
}
