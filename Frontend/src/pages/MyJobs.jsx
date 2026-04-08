﻿﻿﻿import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles.css";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState({});
  const [loadingMatches, setLoadingMatches] = useState({});
  const [user, setUser] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editForm, setEditForm] = useState({ title:"", description:"", budget:"", skills:"", type:"fixed" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const [uRes, jRes] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/jobs/my", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUser(uRes.data); setJobs(jRes.data);
      } catch(e) { toast("Failed to load jobs","error"); }
      finally { setLoading(false); }
    };
    load();
  }, [navigate]);

  const refetch = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/jobs/my", { headers:{ Authorization:`Bearer ${token}` } });
    setJobs(res.data);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${deleteTarget}`, { headers:{ Authorization:`Bearer ${token}` } });
      setJobs(j=>j.filter(x=>x._id!==deleteTarget));
      toast("Job deleted");
    } catch(e) { toast(e.response?.data?.message||"Delete failed","error"); }
    finally { setDeleteTarget(null); }
  };

  const handleUpdate = async (id) => {
    if (!editForm.title.trim()) { toast("Title required","error"); return; }
    setSavingEdit(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/jobs/${id}`, editForm, { headers:{ Authorization:`Bearer ${token}` } });
      setEditingJobId(null); await refetch(); toast("Job updated");
    } catch(e) { toast(e.response?.data?.message||"Update failed","error"); }
    finally { setSavingEdit(false); }
  };

  const fetchMatches = async (id) => {
    if (matches[id]) { setMatches(p=>{ const n={...p}; delete n[id]; return n; }); return; }
    setLoadingMatches(p=>({...p,[id]:true}));
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/jobs/${id}/matches`, { headers:{ Authorization:`Bearer ${token}` } });
      setMatches(p=>({...p,[id]:res.data}));
    } catch(e) { toast(e.response?.data?.message||"AI match failed","error"); }
    finally { setLoadingMatches(p=>({...p,[id]:false})); }
  };

  if (loading) return <div className="w-loading">Loading your jobs...</div>;
  const isPro = user?.plan==="pro";
  const bidCount = (id) => Math.floor(Math.abs(parseInt(id?.slice(-4),16)%18))+1;

  return (
    <div className="w-dashboard">
      {deleteTarget && <ConfirmModal message="Delete this job posting?" onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)} />}
      <div className="w-container">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:12}}>
          <div><h2 style={{fontSize:"1.8rem",fontWeight:800,color:"#1a1a2e",margin:0}}>My Posted Jobs</h2><p style={{color:"#94a3b8",fontSize:14,margin:"4px 0 0"}}>Manage listings and view AI-recommended freelancers</p></div>
          <button className="w-btn w-btn-coral" onClick={()=>navigate("/post-job")}>+ Post New Job</button>
        </div>
        {jobs.length===0 ? (
          <div className="w-panel" style={{textAlign:"center",padding:60}}>
            <div style={{fontSize:"3rem",marginBottom:12}}>📋</div>
            <h3 style={{color:"#1a1a2e",marginBottom:8}}>No jobs posted yet</h3>
            <p style={{color:"#94a3b8",marginBottom:20}}>Post your first job and start receiving proposals.</p>
            <button className="w-btn w-btn-coral" onClick={()=>navigate("/post-job")}>Post a Job →</button>
          </div>
        ) : jobs.map(job=>(
          <div key={job._id} className="w-job-card">
            {editingJobId===job._id ? (
              <div className="w-edit-form">
                <div className="pj-field"><label className="pj-label">Title</label><input value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})} /></div>
                <div className="pj-field"><label className="pj-label">Description</label><textarea value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})} rows={3} style={{resize:"vertical"}} /></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                  <div className="pj-field"><label className="pj-label">Budget (Rs)</label><input type="number" value={editForm.budget} onChange={e=>setEditForm({...editForm,budget:e.target.value})} /></div>
                  <div className="pj-field">
                    <label className="pj-label">Project Type</label>
                    <select value={editForm.type} onChange={e=>setEditForm({...editForm,type:e.target.value})} style={{padding:"13px 16px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:14,background:"#fff",color:"#1a1a2e",outline:"none",width:"100%"}}>
                      <option value="fixed">Fixed Price</option>
                      <option value="hourly">Hourly Rate</option>
                    </select>
                  </div>
                  <div className="pj-field"><label className="pj-label">Skills</label><input value={editForm.skills} onChange={e=>setEditForm({...editForm,skills:e.target.value})} placeholder="React, Node..." /></div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button className="w-btn w-btn-coral w-btn-sm" onClick={()=>handleUpdate(job._id)} disabled={savingEdit}>{savingEdit?"Saving...":"Save Changes"}</button>
                  <button className="w-btn w-btn-sm" style={{background:"#f1f5f9",color:"#475569",border:"1.5px solid #e2e8f0",borderRadius:100}} onClick={()=>setEditingJobId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-job-header">
                  <div>
                    <h3 className="w-job-title">{job.title}</h3>
                    {job.description && <p style={{fontSize:13,color:"#64748b",margin:"6px 0 0",lineHeight:1.5}}>{job.description.slice(0,120)}{job.description.length>120?"...":""}</p>}
                  </div>
                  <span className="w-job-date">Posted {new Date(job.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:16,margin:"10px 0",flexWrap:"wrap"}}>
                  <span style={{fontSize:14,fontWeight:700,color:"#15803d"}}>Rs{Number(job.budget).toLocaleString()}</span>
                  <span style={{fontSize:12,color:"#94a3b8"}}>•</span>
                  <span style={{fontSize:13,color:"#64748b",textTransform:"capitalize"}}>{job.type||"Fixed"} Price</span>
                </div>
                <div style={{marginBottom:12}}>
                  {job.skills?.length>0 ? job.skills.map((s,i)=><span key={i} className="prl-skill-tag">{s}</span>) : <span style={{fontSize:13,color:"#94a3b8"}}>No skills specified</span>}
                </div>
                <div className="w-job-actions">
                  <button className="w-btn w-btn-sm" style={{background:"#f1f5f9",color:"#475569",border:"1.5px solid #e2e8f0",borderRadius:100,fontWeight:600}} onClick={()=>{ setEditingJobId(job._id); setEditForm({title:job.title,description:job.description||"",budget:job.budget,skills:job.skills?.join(", ")||"",type:job.type||"fixed"}); }}>Edit</button>
                  <button className="w-btn w-btn-sm" style={{background:"#fff1f2",color:"#be123c",border:"1.5px solid #fecdd3",borderRadius:100,fontWeight:600}} onClick={()=>setDeleteTarget(job._id)}>Delete</button>
                  <span className="w-bid-pill" style={{marginLeft:"auto"}}>Bids: {bidCount(job._id)}</span>
                  {isPro ? (
                    <button className="w-btn w-btn-coral w-btn-sm" onClick={()=>fetchMatches(job._id)} disabled={loadingMatches[job._id]}>{loadingMatches[job._id]?"Finding...":matches[job._id]?"Hide Matches":"AI Matches"}</button>
                  ) : (
                    <button className="w-btn w-btn-sm" style={{background:"#fffbeb",color:"#b45309",border:"1.5px solid #fde68a",borderRadius:100,fontWeight:600}} onClick={()=>navigate("/pricing")}>Upgrade for AI</button>
                  )}
                </div>
              </>
            )}
            {loadingMatches[job._id] && <div style={{marginTop:14,padding:"12px 16px",background:"#f8fafc",borderRadius:10,fontSize:13,color:"#64748b"}}>Finding best freelancers with AI...</div>}
            {matches[job._id] && (
              <div className="w-matches-section">
                <h4>Gemini AI Matches</h4>
                {matches[job._id].ai_response ? <div className="w-ai-response">{matches[job._id].ai_response}</div> : <p style={{color:"#94a3b8",fontSize:13}}>No matches generated.</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
