import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useToast } from "../../components/Toast";
import Stars from "../../components/Stars";

const SKILL_OPTIONS = [
  "Website Design", "Logo Design", "Mobile App Development", "Data Entry",
  "Article Writing", "React", "Node.js", "Python", "Figma", "WordPress",
  "Flutter", "SEO", "Graphic Design", "Video Editing",
];

export default function ClientFindFreelancers() {
  const toast = useToast();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [sortBy, setSortBy]           = useState("Most Relevant");
  const [minRate, setMinRate]         = useState("");
  const [maxRate, setMaxRate]         = useState("");
  const [skillFilters, setSkillFilters] = useState([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [favorites, setFavorites]     = useState({});

  useEffect(() => {
    api.get("/user/freelancers")
      .then(r => setFreelancers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSkill = s => setSkillFilters(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const filtered = freelancers.filter(f => {
    if (search && !f.name?.toLowerCase().includes(search.toLowerCase()) &&
        !f.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
    if (minRate && (f.hourlyRate || 0) < Number(minRate)) return false;
    if (maxRate && (f.hourlyRate || 0) > Number(maxRate)) return false;
    if (skillFilters.length > 0 && !skillFilters.some(s => f.skills?.includes(s))) return false;
    if (countrySearch && !f.location?.toLowerCase().includes(countrySearch.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Hourly Rate (Low to High)") return (a.hourlyRate || 0) - (b.hourlyRate || 0);
    if (sortBy === "Hourly Rate (High to Low)") return (b.hourlyRate || 0) - (a.hourlyRate || 0);
    if (sortBy === "Rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header + search */}
      <div style={{ marginBottom: 20 }}>
        <div className="prl-page-title" style={{ marginBottom: 16 }}>
          <h1>Find Freelancers</h1>
          <p>Browse {freelancers.length} verified professionals ready to work on your project.</p>
        </div>
        <div className="prl-search-bar">
          <div className="prl-search-left">
            <span className="prl-search-icon">🔍</span>
            <input className="prl-search-input" placeholder="Search by name, skill, or keyword…"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="prl-search-clear" onClick={() => setSearch("")}>✕</button>}
          </div>
          <button className="prl-search-btn">Search</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* ── FILTERS ── */}
        <div className="ft-filters-panel">
          <div className="ft-filter-head">
            <span className="ft-filter-title">Filters</span>
          </div>

          {/* Hourly rate */}
          <div className="ft-filter-section">
            <div className="ft-filter-label-row">
              <span className="ft-filter-label">Hourly rate</span>
              <button className="ft-clear-btn" onClick={() => { setMinRate(""); setMaxRate(""); }}>Clear</button>
            </div>
            <div className="ft-rate-row">
              <div className="ft-rate-input-wrap">
                <span className="ft-rate-prefix">₹</span>
                <input type="number" className="ft-rate-input" placeholder="0" value={minRate} onChange={e => setMinRate(e.target.value)} />
              </div>
              <span className="ft-rate-to">to</span>
              <div className="ft-rate-input-wrap">
                <span className="ft-rate-prefix">₹</span>
                <input type="number" className="ft-rate-input" placeholder="40+" value={maxRate} onChange={e => setMaxRate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="ft-filter-section">
            <div className="ft-filter-label-row">
              <span className="ft-filter-label">Skills</span>
              <button className="ft-clear-btn" onClick={() => setSkillFilters([])}>Clear</button>
            </div>
            <div className="ft-skill-list">
              {SKILL_OPTIONS.map(s => (
                <label key={s} className="ft-checkbox-row">
                  <input type="checkbox" className="prl-checkbox" checked={skillFilters.includes(s)} onChange={() => toggleSkill(s)} />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="ft-filter-section">
            <div className="ft-filter-label-row">
              <span className="ft-filter-label">Location</span>
              <button className="ft-clear-btn" onClick={() => setCountrySearch("")}>Clear</button>
            </div>
            <div className="ft-skill-search-wrap">
              <span style={{ fontSize: 13, color: "#94a3b8" }}>🔍</span>
              <input className="ft-skill-search" placeholder="Search location"
                value={countrySearch} onChange={e => setCountrySearch(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ft-results-header">
            <div className="ft-results-count">
              <span style={{ fontWeight: 700, color: "#1a1a2e" }}>Top results</span>
              <span style={{ color: "#94a3b8", fontSize: 13, marginLeft: 8 }}>
                {sorted.length} of {freelancers.length} freelancers
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>Sort by</span>
              <select className="ft-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option>Most Relevant</option>
                <option>Rating</option>
                <option>Hourly Rate (Low to High)</option>
                <option>Hourly Rate (High to Low)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading freelancers…</div>
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>👤</div>
              <p>No freelancers match your filters.</p>
            </div>
          ) : (
            <div className="ft-list">
              {sorted.map(f => (
                <div key={f._id} className="ft-card">
                  <div className="ft-card-avatar">{f.name?.charAt(0).toUpperCase()}</div>
                  <div className="ft-card-body">
                    <div className="ft-card-top">
                      <div>
                        <span className="ft-card-name">{f.name}</span>
                        {f.location && <span className="ft-card-handle"> @{f.name?.toLowerCase().replace(/\s/g, "")}</span>}
                      </div>
                      <div className="ft-card-rate">
                        {f.hourlyRate > 0
                          ? <>₹{f.hourlyRate.toLocaleString()} <span>per hour</span></>
                          : <span style={{ color: "#94a3b8" }}>Rate not set</span>}
                      </div>
                    </div>
                    <div className="ft-card-stats">
                      <Stars rating={f.rating || 0} size={14} />
                      {f.yearsOfExperience > 0 && (
                        <span className="ft-stat-chip ft-chip-green">✓ {f.yearsOfExperience} yrs exp</span>
                      )}
                      {f.location && <span className="ft-stat-flag">📍 {f.location}</span>}
                    </div>
                    {f.bio && (
                      <p className="ft-card-bio">{f.bio.slice(0, 120)}{f.bio.length > 120 ? "…" : ""}</p>
                    )}
                    <div className="ft-card-skills">
                      {f.skills?.slice(0, 5).map((s, i) => <span key={i} className="ft-skill-pill">{s}</span>)}
                    </div>
                  </div>
                  <div className="ft-card-actions">
                    <button className="ft-fav-btn"
                      onClick={() => setFavorites(p => ({ ...p, [f._id]: !p[f._id] }))}
                      style={{ color: favorites[f._id] ? "#f97316" : "#94a3b8" }}>♥</button>
                    <button className="ft-invite-btn" onClick={() => toast(`Invitation sent to ${f.name}!`)}>Invite to Bid</button>
                    <button className="ft-contact-btn" onClick={() => toast(`Contact request sent to ${f.name}!`)}>Contact</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
