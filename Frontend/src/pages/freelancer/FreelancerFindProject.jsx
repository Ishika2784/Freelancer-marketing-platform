import { useEffect, useState } from "react";
import { api, timeAgo } from "../../utils/api";
import { storage } from "../../utils/storage";

const CATEGORIES    = ["Web Design","Mobile Development","Graphic Design","Content Writing","SEO","Data Science","Video Editing","UI/UX Design"];
const EXPERIENCE    = ["Any","Entry Level","Intermediate","Expert"];
const BUDGET_RANGES = ["Any","Less than ₹5K","₹5K–₹20K","₹20K–₹50K","₹50K+"];

export default function FreelancerFindProject() {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [viewMode, setViewMode]   = useState("grid");
  const [sortBy, setSortBy]       = useState("Newest");
  const [expFilter, setExpFilter] = useState("Any");
  const [projType, setProjType]   = useState("Hourly");
  const [budgetFilter, setBudget] = useState("Any");
  const [catFilter, setCat]       = useState("");

  // Persist applied state across sessions
  const [applied, setApplied] = useState({});

  useEffect(() => {
    api.get("/jobs")
      .then(r => setJobs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Sync applied state from backend
  useEffect(() => {
    if (jobs.length === 0) return;
    api.get("/jobs/my-applications")
      .then(r => {
        const map = {};
        r.data.forEach(id => { map[id] = true; });
        setApplied(map);
      })
      .catch(() => {
        // fallback to sessionStorage if endpoint unavailable
        setApplied(storage.getApplied());
      });
  }, [jobs]);

  const handleApply = async id => {
    try {
      await api.post(`/jobs/${id}/apply`);
      setApplied(prev => ({ ...prev, [id]: true }));
    } catch (e) {
      alert(e.response?.data?.message || "Failed to apply");
    }
  };

  const handleReset = () => { setExpFilter("Any"); setProjType("Hourly"); setBudget("Any"); setCat(""); setSearch(""); };

  const filtered = jobs.filter(j => {
    if (search && !j.title?.toLowerCase().includes(search.toLowerCase()) &&
        !j.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
    if (expFilter !== "Any" && j.level !== expFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Budget: High to Low") return (b.budget || 0) - (a.budget || 0);
    if (sortBy === "Budget: Low to High") return (a.budget || 0) - (b.budget || 0);
    if (sortBy === "Oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <>
      <div className="prl-page-title">
        <h1>Find Projects Here!</h1>
        <p>Browse real project opportunities posted by clients.</p>
      </div>

      <div className="prl-search-bar">
        <div className="prl-search-left">
          <span className="prl-search-icon">🔍</span>
          <input className="prl-search-input" placeholder="Search by title or skill…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="prl-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>
        <button className="prl-search-btn">Find Projects</button>
      </div>

      <div className="prl-content">
        {/* Filters */}
        <div className="prl-filters">
          <div className="prl-filters-header">
            <span className="prl-filters-title">Filters</span>
            <button className="prl-reset-btn" onClick={handleReset}>Reset</button>
          </div>
          <div className="prl-filter-section">
            <div className="prl-filter-label">Category</div>
            <select className="prl-filter-select" value={catFilter} onChange={e => setCat(e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="prl-filter-section">
            <div className="prl-filter-label">Experience Level</div>
            {EXPERIENCE.map(e => (
              <label key={e} className="prl-checkbox-row">
                <input type="checkbox" className="prl-checkbox" checked={expFilter === e} onChange={() => setExpFilter(e)} />
                <span>{e}</span>
                <span className="prl-filter-count">{e === "Any" ? jobs.length : jobs.filter(j => j.level === e).length}</span>
              </label>
            ))}
          </div>
          <div className="prl-filter-section">
            <div className="prl-filter-label">Project Type</div>
            <div className="prl-toggle-group">
              {["Hourly", "Fixed Price"].map(t => (
                <button key={t} className={`prl-toggle-btn ${projType === t ? "active" : ""}`} onClick={() => setProjType(t)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="prl-filter-section">
            <div className="prl-filter-label">Budget Range</div>
            {BUDGET_RANGES.map(b => (
              <label key={b} className="prl-checkbox-row">
                <input type="checkbox" className="prl-checkbox" checked={budgetFilter === b} onChange={() => setBudget(b)} />
                <span>{b}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="prl-results">
          <div className="prl-results-header">
            <div className="prl-results-count">
              {loading ? "Loading…" : <>Showing Results <span>({sorted.length})</span></>}
            </div>
            <div className="prl-results-controls">
              <div className="prl-sort">
                <span>Sort by:</span>
                <select className="prl-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option>Newest</option>
                  <option>Oldest</option>
                  <option>Budget: High to Low</option>
                  <option>Budget: Low to High</option>
                </select>
              </div>
              <div className="prl-vietoggle">
                <button className={`prl-viebtn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>☰</button>
                <button className={`prl-viebtn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>⊞</button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading projects…</div>
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔍</div>
              <p>No projects found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className={`prl-jobs-grid ${viewMode === "list" ? "prl-list-view" : ""}`}>
              {sorted.map(job => (
                <div key={job._id} className="prl-job-card">
                  <div className="prl-job-top">
                    <div className="prl-job-level">{job.level || "Open"}</div>
                    <div className="prl-job-posted">{timeAgo(job.createdAt)}</div>
                    <button className="prl-job-menu">⋮</button>
                  </div>
                  <h3 className="prl-job-title">{job.title}</h3>
                  <div className="prl-job-meta">
                    <span className="prl-status-selecting">🟢 Open</span>
                  </div>
                  {job.description && (
                    <p className="prl-job-desc">{job.description.slice(0, 100)}{job.description.length > 100 ? "…" : ""}</p>
                  )}
                  <div className="prl-job-skills">
                    {job.skills?.slice(0, 5).map((s, i) => <span key={i} className="prl-skill-tag">{s}</span>)}
                  </div>
                  <div className="prl-job-footer">
                    <div className="prl-job-rate">
                      <span className="prl-rate-icon">₹</span>
                      <span className="prl-rate-val">{Number(job.budget || 0).toLocaleString()}</span>
                    </div>
                    <button
                      className={`prl-apply-btn ${applied[job._id] ? "prl-applied" : ""}`}
                      onClick={() => handleApply(job._id)}
                      disabled={!!applied[job._id]}
                    >
                      {applied[job._id] ? "Applied ✓" : "Apply Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
