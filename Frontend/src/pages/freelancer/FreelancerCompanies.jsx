import { useEffect, useState } from "react";
import { api } from "../../utils/api";

export default function FreelancerCompanies() {
  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    // Derive unique clients from all jobs
    api.get("/jobs")
      .then(r => {
        const map = {};
        r.data.forEach(j => {
          const key = j.clientId || j.postedBy;
          if (key && !map[key]) {
            map[key] = {
              id: key,
              name: j.clientName || "Client",
              industry: j.skills?.[0] || "General",
              open: 0,
              logo: (j.clientName || "C").charAt(0).toUpperCase(),
            };
          }
          if (key) map[key].open++;
        });
        setClients(Object.values(map));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="prl-page-title">
        <h1>Browse Companies</h1>
        <p>Discover clients actively posting projects on the platform.</p>
      </div>

      <div className="prl-search-bar" style={{ marginBottom: 28 }}>
        <div className="prl-search-left">
          <span className="prl-search-icon">🔍</span>
          <input className="prl-search-input" placeholder="Search companies…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="prl-search-btn">Search</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🏢</div>
          <p>No companies found yet.</p>
        </div>
      ) : (
        <div className="prl-companies-grid">
          {filtered.map(c => (
            <div key={c.id} className="prl-company-card">
              <div className="prl-company-logo">{c.logo}</div>
              <div className="prl-company-info">
                <div className="prl-company-name">{c.name}</div>
                <div className="prl-company-meta"><span>🏭 {c.industry}</span></div>
                <div className="prl-company-open">{c.open} open project{c.open !== 1 ? "s" : ""}</div>
              </div>
              <button className="prl-apply-btn" style={{ alignSelf: "center", background: "#1a1a2e" }}>
                View Jobs
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
