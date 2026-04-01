import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { useToast } from "../../components/Toast";

const SKILL_SUGGESTIONS = [
  "React", "Node.js", "MongoDB", "Python", "Figma",
  "WordPress", "Flutter", "TypeScript", "AWS", "GraphQL",
];

export default function ClientPostJob() {
  const navigate    = useNavigate();
  const toast       = useToast();
  const [form, setForm]         = useState({ title: "", description: "", budget: "", skills: "", type: "fixed" });
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim())                              e.title       = "Title is required";
    if (!form.description.trim() || form.description.length < 20) e.description = "Min 20 characters";
    if (!form.budget || Number(form.budget) <= 0)        e.budget      = "Enter a valid budget";
    if (!form.skills.trim())                             e.skills      = "Add at least one skill";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: "" }));
  };

  const addSkill = s => {
    const cur = form.skills ? form.skills.split(",").map(x => x.trim()).filter(Boolean) : [];
    if (!cur.includes(s)) setForm(f => ({ ...f, skills: [...cur, s].join(", ") }));
  };

  const handleSubmit = async () => {
    if (!validate()) { toast("Please fix the errors below", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/jobs", form);
      toast("Job posted successfully! 🎉");
      setTimeout(() => navigate("/client/my-jobs"), 1000);
    } catch (e) {
      toast(e.response?.data?.message || "Error posting job", "error");
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <div className="prl-page-title">
        <h1>Post a New Job</h1>
        <p>Describe your project and let AI find the best freelancers.</p>
      </div>

      <div className="w-post-job-form" style={{ maxWidth: 680 }}>
        {/* Title */}
        <div className="pj-field">
          <label className="pj-label">Job Title <span className="pj-req">*</span></label>
          <input name="title" placeholder="e.g. React Developer for E-commerce Dashboard"
            value={form.title} onChange={handleChange} className={errors.title ? "pj-error-input" : ""} />
          {errors.title && <span className="pj-error-msg">{errors.title}</span>}
        </div>

        {/* Description */}
        <div className="pj-field">
          <label className="pj-label">Description <span className="pj-req">*</span></label>
          <textarea name="description" placeholder="Describe scope, deliverables, timeline…"
            value={form.description} onChange={handleChange} rows={5}
            className={errors.description ? "pj-error-input" : ""} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            {errors.description ? <span className="pj-error-msg">{errors.description}</span> : <span />}
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{form.description.length} chars</span>
          </div>
        </div>

        {/* Budget + Type */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="pj-field">
            <label className="pj-label">Budget (₹) <span className="pj-req">*</span></label>
            <input name="budget" type="number" placeholder="e.g. 15000"
              value={form.budget} onChange={handleChange} className={errors.budget ? "pj-error-input" : ""} />
            {errors.budget && <span className="pj-error-msg">{errors.budget}</span>}
          </div>
          <div className="pj-field">
            <label className="pj-label">Project Type</label>
            <select name="type" value={form.type} onChange={handleChange}
              style={{ width: "100%", padding: "13px 16px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, background: "#fff", color: "#1a1a2e", outline: "none" }}>
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>
        </div>

        {/* Skills */}
        <div className="pj-field">
          <label className="pj-label">Required Skills <span className="pj-req">*</span></label>
          <input name="skills" placeholder="e.g. React, Node.js, MongoDB"
            value={form.skills} onChange={handleChange} className={errors.skills ? "pj-error-input" : ""} />
          {errors.skills && <span className="pj-error-msg">{errors.skills}</span>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 12, color: "#94a3b8", alignSelf: "center" }}>Quick add:</span>
            {SKILL_SUGGESTIONS.map(s => (
              <button key={s} type="button" onClick={() => addSkill(s)}
                style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Skill preview */}
        {form.skills && (
          <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 8 }}>PREVIEW</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {form.skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
                <span key={i} className="prl-skill-tag">{s}</span>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-coral"
          style={{ width: "100%", borderRadius: 12, padding: "15px", fontSize: 15, fontWeight: 700 }}
          onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Posting…" : "Post Job →"}
        </button>
      </div>
    </>
  );
}
