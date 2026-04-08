import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, timeAgo } from "../../utils/api";
import Stars from "../../components/Stars";

export default function FreelancerOverview({ user }) {
  const navigate = useNavigate();
  const [jobs, setJobs]           = useState([]);
  const [proposals, setProposals] = useState([]); // { jobId, status, appliedAt, ... }
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([api.get("/jobs"), api.get("/jobs/my-proposals")])
      .then(([jobsRes, propsRes]) => {
        setJobs(jobsRes.data);
        setProposals(propsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // map jobId -> proposal for quick lookup
  const proposalMap = Object.fromEntries(proposals.map(p => [p.jobId, p]));
  const applied = proposalMap; // keep same name for compatibility

  const userSkills = user.skills || [];
  const recommended = jobs
    .filter(j => j.status !== "in-progress" && j.status !== "hired" && j.status !== "closed" && j.status !== "completed")
    .filter(j => userSkills.length === 0 || j.skills?.some(s => userSkills.includes(s)))
    .map(j => {
      const daysLeft = j.deadline
        ? Math.ceil((new Date(j.deadline) - new Date()) / 86400000)
        : null;
      return { ...j, daysLeft };
    })
    .sort((a, b) => {
      // Jobs with deadlines first, sorted by urgency
      if (a.daysLeft !== null && b.daysLeft !== null) return a.daysLeft - b.daysLeft;
      if (a.daysLeft !== null) return -1;
      if (b.daysLeft !== null) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, 4);

  const appliedJobs = jobs.filter(j => proposalMap[j._id]).slice(0, 3);
  const appliedCount = proposals.length;
  const hiredCount = proposals.filter(p => p.status === "hired").length;

  return (
    <>
      {/* Welcome header */}
      <div className="prl-page-title">
        <h1>Welcome back, {user.name}! 👋</h1>
        <p>Here's your freelance activity at a glance.</p>
      </div>

      {/* Profile summary card */}
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
          {user.skills?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {user.skills.slice(0, 5).map((s, i) => (
                <span key={i} style={{
                  background: "rgba(249,115,22,0.2)", color: "#fed7aa",
                  border: "1px solid rgba(249,115,22,0.3)",
                  padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600
                }}>{s}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          {user.hourlyRate > 0 && (
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#4ade80" }}>
              ₹{user.hourlyRate.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>/hr</span>
            </div>
          )}
          {user.rating > 0 && <div style={{ marginTop: 4 }}><Stars rating={user.rating} size={14} /></div>}
          <button
            onClick={() => navigate("/profile")}
            style={{
              marginTop: 12, background: "rgba(249,115,22,0.2)", color: "#fed7aa",
              border: "1px solid rgba(249,115,22,0.4)", borderRadius: 8,
              padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer"
            }}>
            Edit Profile →
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Open Projects",  value: loading ? "…" : jobs.length,        icon: "💼", path: "/freelancer/find-project" },
          { label: "Applied",        value: loading ? "…" : appliedCount,        icon: "📨", path: "/freelancer/proposals" },
          { label: "Hired",          value: loading ? "…" : hiredCount,          icon: "🤝🏼", path: "/freelancer/proposals" },
          { label: "Skills",         value: user.skills?.length || 0,            icon: "💡" },
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Recommended jobs */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Recommended for You</span>
            <button className="panel-action" onClick={() => navigate("/freelancer/find-project")}>Browse All →</button>
          </div>
          {loading ? (
            <div style={{ padding: 20, color: "#94a3b8", textAlign: "center" }}>Loading…</div>
          ) : recommended.length === 0 ? (
            <div className="empty">
              No matches yet. <span onClick={() => navigate("/profile")}>Add skills →</span>
            </div>
          ) : recommended.map(job => (
            <div key={job._id} className="mini-row">
              <div>
                <div className="mini-title">{job.title}</div>
                <div className="mini-meta">
                  ₹{Number(job.budget || 0).toLocaleString()} · {timeAgo(job.createdAt)}
                  {job.daysLeft !== null && (
                    <span style={{
                      marginLeft: 8,
                      background: job.daysLeft <= 2 ? "#fff1f2" : job.daysLeft <= 5 ? "#fff7ed" : "#f0fdf4",
                      color: job.daysLeft <= 2 ? "#be123c" : job.daysLeft <= 5 ? "#c2410c" : "#15803d",
                      padding: "1px 7px", borderRadius: 100, fontSize: 10, fontWeight: 700
                    }}>
                      {job.daysLeft <= 0 ? "⚠️ Expired" : job.daysLeft === 1 ? "⏰ Last day!" : `⏳ ${job.daysLeft}d left`}
                    </span>
                  )}
                </div>
              </div>
              <span
                onClick={() => !applied[job._id] && navigate("/freelancer/find-project")}
                style={{
                  background: applied[job._id] ? "#f0fdf4" : "#fff7ed",
                  color: applied[job._id] ? "#15803d" : "#f97316",
                  border: `1px solid ${applied[job._id] ? "#bbf7d0" : "#fed7aa"}`,
                  padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                  cursor: applied[job._id] ? "default" : "pointer"
                }}>
                {applied[job._id] ? "Applied ✓" : "Open"}
              </span>
            </div>
          ))}
        </div>

        {/* Recent applications */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Recent Applications</span>
            <button className="panel-action" onClick={() => navigate("/freelancer/proposals")}>View All →</button>
          </div>
          {appliedJobs.length === 0 ? (
            <div className="empty">
              No applications yet. <span onClick={() => navigate("/freelancer/find-project")}>Find projects →</span>
            </div>
          ) : appliedJobs.map(j => {
            const p = proposalMap[j._id];
            const isHired = p?.status === "hired";
            return (
            <div key={j._id} className="mini-row">
              <div>
                <div className="mini-title">{j.title}</div>
                <div className="mini-meta">Applied {timeAgo(p?.appliedAt)}</div>
              </div>
              <span style={{
                background: isHired ? "#f0fdf4" : "#eff6ff",
                color: isHired ? "#15803d" : "#1d4ed8",
                border: `1px solid ${isHired ? "#bbf7d0" : "#bfdbfe"}`,
                padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700
              }}>
                {isHired ? "✅ Hired" : "🟡 Pending"}
              </span>
            </div>
            );
          })}
        </div>
      </div>

      {/* No skills nudge */}
      {user.skills?.length === 0 && (
        <div style={{
          marginTop: 20, padding: "20px 24px",
          background: "#fff7ed", border: "1.5px solid #fed7aa",
          borderRadius: 14, display: "flex", alignItems: "center", gap: 16
        }}>
          <span style={{ fontSize: "1.8rem" }}>💡</span>
          <div>
            <div style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Add your skills to get better matches</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>Clients search by skill — update your profile to appear in more searches.</div>
          </div>
          <button className="btn btn-coral btn-sm" style={{ marginLeft: "auto", borderRadius: 10 }}
            onClick={() => navigate("/profile")}>Update Profile</button>
        </div>
      )}
    </>
  );
}
