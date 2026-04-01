import { useEffect, useState } from "react";
import { api, timeAgo } from "../../utils/api";

export default function FreelancerProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    // Fetch all jobs, then filter to ones this freelancer applied to (with status)
    api.get("/jobs/my-proposals")
      .then(r => setProposals(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = status => {
    if (status === "hired")    return <span style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>✅ Hired</span>;
    if (status === "rejected") return <span style={{ background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>❌ Not Selected</span>;
    return <span style={{ background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>🟡 Pending</span>;
  };

  return (
    <>
      <div className="prl-page-title">
        <h1>My Proposals</h1>
        <p>Track all the projects you have applied to.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading…</div>
      ) : proposals.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
          <p>You haven't applied to any projects yet.</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Go to <strong>Find Project</strong> and click Apply Now.</p>
        </div>
      ) : (
        <div className="prl-proposals-list">
          {proposals.map(p => (
            <div key={p.jobId} className="prl-proposal-card">
              <div className="prl-proposal-top">
                <div>
                  <div className="prl-proposal-job">{p.title}</div>
                  <div className="prl-proposal-client">Applied {timeAgo(p.appliedAt)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  {statusBadge(p.status)}
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>
                    ₹{Number(p.budget || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              {p.description && (
                <p className="prl-proposal-cover">"{p.description.slice(0, 120)}…"</p>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                {p.skills?.slice(0, 4).map((s, i) => <span key={i} className="prl-skill-tag">{s}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
