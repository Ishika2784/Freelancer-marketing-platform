import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";import { api } from "../../utils/api";
import { useToast } from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";

/* ── Parse AI text → extract name blocks ── */
function parseMatchNames(text) {
  const names = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const m = line.match(/^\s*\d+\.\s*Name:\s*(.+)/i) || line.match(/Name:\s*(.+)/i);
    if (m) names.push(m[1].trim());
  }
  return names;
}

/* ── Freelancer Profile Modal ── */
function FreelancerModal({ freelancer, jobId, jobTitle, onClose, onHired }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [hiring, setHiring] = useState(false);

  const handleHire = async () => {
    setHiring(true);
    try {
      await api.post(`/jobs/${jobId}/hire`, { freelancerId: freelancer._id });
      toast(`🎉 ${freelancer.name} hired! They've been notified.`);
      onHired(freelancer._id);
      onClose();
      // Navigate to chat with this freelancer
      navigate(`/client/chat?with=${freelancer._id}`);
    } catch (e) {
      toast(e.response?.data?.message || "Hire failed", "error");
    } finally { setHiring(false); }
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:20, padding:"32px 28px", maxWidth:440, width:"100%", boxShadow:"0 24px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:56, height:56, borderRadius:16, background:"#6366f1", color:"#fff", fontSize:"1.5rem", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {freelancer.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:"1.1rem", color:"#1a1a2e" }}>{freelancer.name}</div>
              <div style={{ fontSize:12, color:"#64748b" }}>{freelancer.email}</div>
              {freelancer.location && <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>📍 {freelancer.location}</div>}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", width:32, height:32, borderRadius:"50%", fontSize:16, cursor:"pointer", color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        {freelancer.bio && (
          <p style={{ fontSize:13.5, color:"#475569", lineHeight:1.6, margin:"0 0 16px", padding:"12px 14px", background:"#f8fafc", borderRadius:10 }}>{freelancer.bio}</p>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {freelancer.hourlyRate && (
            <div style={{ background:"#f0fdf4", borderRadius:10, padding:"10px 14px" }}>
              <div style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>Hourly Rate</div>
              <div style={{ fontSize:"1.1rem", fontWeight:800, color:"#15803d" }}>₹{freelancer.hourlyRate}/hr</div>
            </div>
          )}
          {freelancer.yearsOfExperience > 0 && (
            <div style={{ background:"#eff6ff", borderRadius:10, padding:"10px 14px" }}>
              <div style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>Experience</div>
              <div style={{ fontSize:"1.1rem", fontWeight:800, color:"#1d4ed8" }}>{freelancer.yearsOfExperience} yrs</div>
            </div>
          )}
        </div>

        {freelancer.skills?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>Skills</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {freelancer.skills.map((s, i) => (
                <span key={i} style={{ background:"#f1f5f9", color:"#334155", border:"1px solid #e2e8f0", padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize:12, color:"#94a3b8", marginBottom:16, padding:"8px 12px", background:"#fffbeb", borderRadius:8, border:"1px solid #fde68a" }}>
          💼 Hiring for: <strong style={{ color:"#92400e" }}>{jobTitle}</strong>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"11px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#fff", color:"#475569", fontWeight:600, fontSize:14, cursor:"pointer" }}>Cancel</button>
          <button onClick={handleHire} disabled={hiring} style={{ flex:2, padding:"11px", borderRadius:10, border:"none", background:"#f97316", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:"0 4px 14px rgba(249,115,22,0.35)" }}>
            {hiring ? "Hiring…" : "🤝 Hire & Notify"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Clickable AI Match Card ── */
function MatchCard({ name, text, applicants, jobId, jobTitle, onHired }) {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Find this freelancer in applicants list by name (case-insensitive)
  const applicant = applicants?.find(a =>
    a.freelancer?.name?.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(a.freelancer?.name?.toLowerCase())
  );

  const handleClick = async () => {
    if (!applicant) {
      toast(`${name} hasn't applied to this job yet`, "warn");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/user/profile/${applicant.freelancer._id}`);
      setProfile(res.data);
    } catch {
      // fallback to applicant data we already have
      setProfile(applicant.freelancer);
    } finally { setLoading(false); }
  };

  return (
    <>
      {profile && (
        <FreelancerModal
          freelancer={profile}
          jobId={jobId}
          jobTitle={jobTitle}
          onClose={() => setProfile(null)}
          onHired={onHired}
        />
      )}
      <div
        onClick={handleClick}
        style={{
          background: applicant ? "#fff" : "#f8fafc",
          border: applicant ? "1.5px solid #e2e8f0" : "1.5px dashed #e2e8f0",
          borderRadius: 12,
          padding: "12px 14px",
          marginBottom: 8,
          cursor: applicant ? "pointer" : "default",
          transition: "all 0.18s",
          position: "relative",
        }}
        onMouseEnter={e => { if (applicant) e.currentTarget.style.borderColor = "#f97316"; }}
        onMouseLeave={e => { if (applicant) e.currentTarget.style.borderColor = "#e2e8f0"; }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <div style={{ width:32, height:32, borderRadius:10, background: applicant ? "#6366f1" : "#e2e8f0", color: applicant ? "#fff" : "#94a3b8", fontWeight:800, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"#1a1a2e" }}>{name}</div>
            {applicant?.freelancer?.hourlyRate && (
              <div style={{ fontSize:11, color:"#15803d", fontWeight:600 }}>₹{applicant.freelancer.hourlyRate}/hr</div>
            )}
          </div>
          {applicant && (
            <span style={{ marginLeft:"auto", fontSize:11, background:"#f0fdf4", color:"#15803d", border:"1px solid #bbf7d0", padding:"2px 8px", borderRadius:100, fontWeight:700 }}>
              Applied ✓
            </span>
          )}
          {!applicant && (
            <span style={{ marginLeft:"auto", fontSize:11, color:"#94a3b8" }}>Not applied</span>
          )}
        </div>
        <div style={{ fontSize:12.5, color:"#64748b", lineHeight:1.5 }}>{text}</div>
        {applicant && (
          <div style={{ marginTop:6, fontSize:11, color:"#f97316", fontWeight:600 }}>
            {loading ? "Loading profile…" : "👆 Click to view profile & hire"}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Parse AI response into structured match blocks ── */
function parseMatchBlocks(text) {
  if (!text) return [];
  const blocks = [];
  // Split on numbered entries like "1." "2." "3."
  const parts = text.split(/\n(?=\d+\.\s*Name:)/i);
  for (const part of parts) {
    const nameM = part.match(/Name:\s*(.+)/i);
    if (!nameM) continue;
    const name = nameM[1].trim();
    // Extract reason line
    const reasonM = part.match(/Reason:\s*(.+)/i);
    const reason = reasonM ? reasonM[1].trim() : part.replace(/Name:.*\n?/i, "").trim().slice(0, 120);
    // Extract match score
    const scoreM = part.match(/Match Score:\s*(\w+)/i);
    const score = scoreM ? scoreM[1] : null;
    blocks.push({ name, reason, score });
  }
  return blocks;
}

/* ── Main Component ── */
export default function ClientMyJobs() {
  const navigate    = useNavigate();
  const toast       = useToast();
  const [jobs, setJobs]               = useState([]);
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [matches, setMatches]         = useState({});
  const [loadingM, setLoadingM]       = useState({});
  const [applicants, setApplicants]   = useState({});
  const [loadingA, setLoadingA]       = useState({});
  const [editId, setEditId]           = useState(null);
  const [editForm, setEditForm]       = useState({ title:"", description:"", budget:"", skills:"" });
  const [deleteTarget, setDelete]     = useState(null);
  const [saving, setSaving]           = useState(false);
  const [rateModal, setRateModal]     = useState(null);
  const [rating, setRating]           = useState(5);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, jRes] = await Promise.all([api.get("/auth/me"), api.get("/jobs/my")]);
      setUser(uRes.data);
      setJobs(jRes.data);
    } catch { toast("Failed to load jobs", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    try {
      await api.delete(`/jobs/${deleteTarget}`);
      setJobs(j => j.filter(x => x._id !== deleteTarget));
      toast("Job deleted");
    } catch (e) { toast(e.response?.data?.message || "Delete failed", "error"); }
    finally { setDelete(null); }
  };

  const handleUpdate = async id => {
    if (!editForm.title.trim()) { toast("Title required", "error"); return; }
    setSaving(true);
    try {
      await api.put(`/jobs/${id}`, editForm);
      setEditId(null);
      await load();
      toast("Job updated");
    } catch (e) { toast(e.response?.data?.message || "Update failed", "error"); }
    finally { setSaving(false); }
  };

  const fetchMatches = async (id, forceRefresh = false) => {
    if (matches[id] && !forceRefresh) { setMatches(p => { const n={...p}; delete n[id]; return n; }); return; }
    setLoadingM(p => ({ ...p, [id]: true }));
    // Also fetch applicants so we can link names
    if (!applicants[id]) {
      try {
        const aRes = await api.get(`/jobs/${id}/applicants`);
        setApplicants(p => ({ ...p, [id]: aRes.data }));
      } catch {}
    }
    try {
      const res = await api.get(forceRefresh ? `/jobs/${id}/matches?refresh=true` : `/jobs/${id}/matches`);
      setMatches(p => ({ ...p, [id]: res.data }));
    } catch (e) { toast(e.response?.data?.message || "AI match failed", "error"); }
    finally { setLoadingM(p => ({ ...p, [id]: false })); }
  };

  const fetchApplicants = async id => {
    if (applicants[id] !== undefined) {
      setApplicants(p => { const n={...p}; delete n[id]; return n; });
      return;
    }
    setLoadingA(p => ({ ...p, [id]: true }));
    try {
      const res = await api.get(`/jobs/${id}/applicants`);
      setApplicants(p => ({ ...p, [id]: res.data }));
    } catch (e) { toast(e.response?.data?.message || "Failed to load applicants", "error"); }
    finally { setLoadingA(p => ({ ...p, [id]: false })); }
  };

  const handleHired = (jobId, freelancerId) => {
    // Refresh applicants after hire
    api.get(`/jobs/${jobId}/applicants`)
      .then(r => setApplicants(p => ({ ...p, [jobId]: r.data })))
      .catch(() => {});
  };

  const handleSubmitRating = async () => {
    try {
      await api.post(`/jobs/${rateModal.jobId}/rate`, { freelancerId: rateModal.freelancerId, rating });
      toast("Freelancer rated successfully");
      setRateModal(null);
      await load();
    } catch (e) { toast(e.response?.data?.message || "Failed to submit rating", "error"); }
  };

  const isPro = user?.plan === "pro";
  if (loading) return <div style={{ textAlign:"center", padding:60, color:"#94a3b8" }}>Loading…</div>;

  return (
    <>
      {rateModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#fff", borderRadius:18, padding:"32px 36px", maxWidth:400, width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.2)", textAlign:"center" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:12 }}>⭐</div>
            <h3 style={{ fontSize:"1.1rem", fontWeight:800, color:"#1a1a2e", margin:"0 0 10px" }}>Rate {rateModal.name}</h3>
            <p style={{ fontSize:13.5, color:"#64748b", margin:"0 0 24px" }}>How was your experience?</p>
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:24, fontSize:36, cursor:"pointer" }}>
              {[1,2,3,4,5].map(star => (
                <span key={star} onClick={() => setRating(star)} style={{ color: star <= rating ? "#f59e0b" : "#e2e8f0" }}>★</span>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setRateModal(null)} style={{ padding:"10px 24px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#fff", color:"#475569", fontWeight:600, fontSize:14, cursor:"pointer" }}>Cancel</button>
              <button onClick={handleSubmitRating} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"#f97316", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>Submit</button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && <ConfirmModal message="Delete this job posting?" onConfirm={handleDelete} onCancel={() => setDelete(null)} />}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div className="prl-page-title" style={{ margin:0 }}>
          <h1>My Posted Jobs</h1>
          <p>Manage your listings and view AI-recommended freelancers.</p>
        </div>
        <button className="btn btn-coral" onClick={() => navigate("/client/post-job")}>+ Post New Job</button>
      </div>

      {jobs.length === 0 ? (
        <div className="panel" style={{ textAlign:"center", padding:60 }}>
          <div style={{ fontSize:"3rem", marginBottom:12 }}>📋</div>
          <h3 style={{ color:"#1a1a2e", marginBottom:8 }}>No jobs posted yet</h3>
          <p style={{ color:"#94a3b8", marginBottom:20 }}>Post your first job and start receiving proposals.</p>
          <button className="btn btn-coral" onClick={() => navigate("/client/post-job")}>Post a Job →</button>
        </div>
      ) : jobs.map(job => (
        <div key={job._id} className="job-card">
          {editId === job._id ? (
            <div className="w-edit-form">
              <div className="pj-field"><label className="pj-label">Title</label>
                <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div className="pj-field"><label className="pj-label">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ resize:"vertical" }} /></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="pj-field"><label className="pj-label">Budget (₹)</label>
                  <input type="number" value={editForm.budget} onChange={e => setEditForm(f => ({ ...f, budget: e.target.value }))} /></div>
                <div className="pj-field"><label className="pj-label">Skills</label>
                  <input value={editForm.skills} onChange={e => setEditForm(f => ({ ...f, skills: e.target.value }))} placeholder="React, Node…" /></div>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                <button className="btn btn-coral btn-sm" onClick={() => handleUpdate(job._id)} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
                <button className="btn btn-sm" style={{ background:"#f1f5f9", color:"#475569", border:"1.5px solid #e2e8f0", borderRadius:100 }} onClick={() => setEditId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="job-header">
                <div>
                  <h3 className="job-title">{job.title}</h3>
                  {job.description && <p style={{ fontSize:13, color:"#64748b", margin:"6px 0 0", lineHeight:1.5 }}>{job.description.slice(0,120)}{job.description.length>120?"…":""}</p>}
                </div>
                <span className="job-date">{new Date(job.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:16, margin:"10px 0", flexWrap:"wrap" }}>
                <span style={{ fontSize:14, fontWeight:700, color:"#15803d" }}>₹{Number(job.budget||0).toLocaleString()}</span>
                <span style={{ fontSize:12, color:"#94a3b8" }}>•</span>
                <span style={{ fontSize:13, color:"#64748b", textTransform:"capitalize" }}>{job.type||"Fixed"} Price</span>
              </div>
              <div style={{ marginBottom:12 }}>
                {job.skills?.length>0 ? job.skills.map((s,i)=><span key={i} className="prl-skill-tag">{s}</span>) : <span style={{ fontSize:13, color:"#94a3b8" }}>No skills specified</span>}
              </div>
              <div className="job-actions">
                <button className="btn btn-sm" style={{ background:"#f1f5f9", color:"#475569", border:"1.5px solid #e2e8f0", borderRadius:100, fontWeight:600 }}
                  onClick={() => { setEditId(job._id); setEditForm({ title:job.title, description:job.description||"", budget:job.budget, skills:job.skills?.join(", ")||"" }); }}>✏️ Edit</button>
                <button className="btn btn-sm" style={{ background:"#fff1f2", color:"#be123c", border:"1.5px solid #fecdd3", borderRadius:100, fontWeight:600 }}
                  onClick={() => setDelete(job._id)}>🗑 Delete</button>
                <button className="btn btn-sm" style={{ background:"#eff6ff", color:"#1d4ed8", border:"1.5px solid #bfdbfe", borderRadius:100, fontWeight:600 }}
                  onClick={() => fetchApplicants(job._id)} disabled={loadingA[job._id]}>
                  {loadingA[job._id] ? "Loading…" : applicants[job._id]!==undefined ? "Hide Applicants" : "👥 Applicants"}
                </button>
                {isPro
                  ? <button className="btn btn-coral btn-sm" onClick={() => fetchMatches(job._id)} disabled={loadingM[job._id]}>
                      {loadingM[job._id] ? "Finding…" : matches[job._id] ? "Hide Matches" : "✨ AI Matches"}
                    </button>
                  : <button className="btn btn-sm" style={{ background:"#fffbeb", color:"#b45309", border:"1.5px solid #fde68a", borderRadius:100, fontWeight:600 }} onClick={() => navigate("/pricing")}>⭐ Upgrade for AI</button>
                }
              </div>
            </>
          )}

          {/* AI Matches — parsed into clickable cards */}
          {loadingM[job._id] && (
            <div style={{ marginTop:14, padding:"12px 16px", background:"#f8fafc", borderRadius:10, fontSize:13, color:"#64748b" }}>Finding best freelancers with AI…</div>
          )}
          {matches[job._id] && (
            <div className="w-matches-section">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <h4 style={{ margin:0 }}>✨ Gemini AI Matches</h4>
                <button className="btn btn-sm" style={{ background:"#f8fafc", color:"#475569", border:"1px solid #e2e8f0", borderRadius:100, fontSize:12 }} onClick={() => fetchMatches(job._id, true)}>🔄 Refresh</button>
              </div>
              {matches[job._id].ai_response ? (
                <>
                  <p style={{ fontSize:12, color:"#94a3b8", margin:"0 0 10px" }}>Click an applicant card to view their profile and hire them.</p>
                  {parseMatchBlocks(matches[job._id].ai_response).map((block, i) => (
                    <MatchCard
                      key={i}
                      name={block.name}
                      text={block.reason}
                      score={block.score}
                      applicants={applicants[job._id] || []}
                      jobId={job._id}
                      jobTitle={job.title}
                      onHired={(fId) => handleHired(job._id, fId)}
                    />
                  ))}
                </>
              ) : <p style={{ color:"#94a3b8", fontSize:13 }}>No matches generated.</p>}
            </div>
          )}

          {/* Applicants list */}
          {applicants[job._id] !== undefined && (
            <div className="w-matches-section">
              <h4>👥 Applicants ({applicants[job._id].length})</h4>
              {applicants[job._id].length === 0 ? (
                <p style={{ color:"#94a3b8", fontSize:13 }}>No applicants yet.</p>
              ) : applicants[job._id].map((a, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"#6366f1", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:15, flexShrink:0 }}>
                    {a.freelancer?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:"#1a1a2e" }}>{a.freelancer?.name}</div>
                    <div style={{ fontSize:12, color:"#64748b" }}>{a.freelancer?.email}</div>
                    {a.freelancer?.skills?.length>0 && (
                      <div style={{ marginTop:4 }}>{a.freelancer.skills.slice(0,4).map((s,j)=><span key={j} className="prl-skill-tag" style={{ fontSize:11 }}>{s}</span>)}</div>
                    )}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                    <div style={{ fontSize:12, color:"#94a3b8" }}>{new Date(a.appliedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
                    {a.status==="hired" ? (
                      <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
                        <span style={{ background:job.status==="completed"?"#eff6ff":"#f0fdf4", color:job.status==="completed"?"#1d4ed8":"#15803d", border:`1px solid ${job.status==="completed"?"#bfdbfe":"#bbf7d0"}`, padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>
                          {job.status==="completed"?"🏆 Completed":"✅ Hired"}
                        </span>
                        {job.status!=="completed" && (
                          <button className="btn btn-sm" style={{ background:"#fffbeb", color:"#b45309", border:"1.5px solid #fde68a", borderRadius:100, fontWeight:700, padding:"3px 10px", fontSize:11 }}
                            onClick={() => { setRating(5); setRateModal({ jobId:job._id, freelancerId:a.freelancer._id, name:a.freelancer.name }); }}>⭐ Rate & Complete</button>
                        )}
                      </div>
                    ) : a.status==="rejected" ? (
                      <span style={{ background:"#fff1f2", color:"#be123c", border:"1px solid #fecdd3", padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>Not Selected</span>
                    ) : (
                      <button className="btn btn-sm" style={{ background:"#f0fdf4", color:"#15803d", border:"1.5px solid #bbf7d0", borderRadius:100, fontWeight:700, padding:"5px 14px", fontSize:12 }}
                        onClick={async () => {
                          try {
                            await api.post(`/jobs/${job._id}/hire`, { freelancerId: a.freelancer._id });
                            toast(`🎉 ${a.freelancer.name} hired! They've been notified.`);
                            const res = await api.get(`/jobs/${job._id}/applicants`);
                            setApplicants(p => ({ ...p, [job._id]: res.data }));
                            navigate(`/client/chat?with=${a.freelancer._id}`);
                          } catch (e) { toast(e.response?.data?.message||"Hire failed","error"); }
                        }}>🤝 Hire</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
