import { useState, useEffect } from "react";
import "../styles.css";
import { useToast } from "../components/Toast";
import { api } from "../utils/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState(""); const [skills, setSkills] = useState("");
  const [bio, setBio] = useState(""); const [location, setLocation] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState(""); const [hourlyRate, setHourlyRate] = useState("");
  const [loading, setLoading] = useState(true); const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data); setName(res.data.name || ""); setBio(res.data.bio || "");
      setLocation(res.data.location || ""); setYearsOfExperience(res.data.yearsOfExperience || "");
      setHourlyRate(res.data.hourlyRate || "");
      if (res.data.skills) setSkills(res.data.skills.join(", "));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCancel = () => {
    setName(user?.name||""); setBio(user?.bio||""); setLocation(user?.location||"");
    setYearsOfExperience(user?.yearsOfExperience||""); setHourlyRate(user?.hourlyRate||"");
    setSkills(user?.skills ? user.skills.join(", ") : ""); setIsEditing(false);
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // Ensure all fields (including identifiers) are passed safely to prevent backend crashes
      const payload = {
        _id: user?._id || user?.id,
        email: user?.email,
        role: user?.role || "client",
        name: name || "",
        bio: bio || "",
        location: location || ""
      };

      if (user?.role === "freelancer") {
        payload.skills = Array.isArray(skills) ? skills : (typeof skills === "string" && skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : []);
        payload.yearsOfExperience = yearsOfExperience ? Number(yearsOfExperience) : 0;
        payload.hourlyRate = hourlyRate ? Number(hourlyRate) : 0;
      }

      await api.put("/user/profile", payload);
      await fetchProfile(); toast("Profile updated successfully!"); setIsEditing(false);
    } catch (e) { 
      console.error("Backend Error Details:", e.response?.data || e.message); 
      toast(e.response?.data?.message || "Server Error: Check console for details", "error"); 
    }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="w-loading">Loading profile...</div>;

  return (
    <div className="dashboard">
      <div className="w-profile-wrap">
        <div className="w-profile-card">
          <div className="w-profile-cover" />
          <div className="w-profile-body">
            <div className="w-profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="w-profile-info">
              <div>
                <h2 className="w-profile-name">{user?.name}</h2>
                <p className="w-profile-role">
                  {user?.role} · <span className="w-profile-plan">{user?.plan === "pro" ? "⭐ Pro Plan" : "Free Plan"}</span>
                </p>
              </div>
              {!isEditing && (
                <button className="btn btn-coral btn-sm" onClick={() => setIsEditing(true)}>Edit Profile</button>
              )}
            </div>

            {isEditing ? (
              <div>
                <h3 className="w-section-title">Personal Information</h3>
                <div className="w-form-group"><label>Email</label><input type="email" value={user?.email||""} disabled className="w-disabled" /></div>
                <div className="w-form-group"><label>Full Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name" /></div>
                <div className="w-form-group"><label>Location</label><input type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. New Delhi, India" /></div>
                <div className="w-form-group">
                  <label>Bio</label>
                  <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell us about yourself..." rows="4" maxLength="500" style={{resize:"vertical"}} />
                  <small className="w-input-hint">Max 500 characters</small>
                </div>
                {user?.role === "freelancer" && (
                  <>
                    <h3 className="w-section-title" style={{marginTop:32}}>Freelancer Details</h3>
                    <div className="w-form-group"><label>Years of Experience</label><input type="number" value={yearsOfExperience} onChange={e=>setYearsOfExperience(e.target.value)} placeholder="e.g. 5" /></div>
                    <div className="w-form-group"><label>Hourly Rate (₹)</label><input type="number" value={hourlyRate} onChange={e=>setHourlyRate(e.target.value)} placeholder="e.g. 1500" /></div>
                    <div className="w-form-group"><label>Skills</label><input type="text" value={skills} onChange={e=>setSkills(e.target.value)} placeholder="React, Node, MongoDB" /><small className="w-input-hint">Comma separated</small></div>
                  </>
                )}
                <div style={{display:"flex",gap:12,marginTop:24}}>
                  <button className="w-save-btn" onClick={handleUpdate} disabled={updating}>{updating?"Saving...":"Save Changes"}</button>
                  <button className="w-cancel-btn" onClick={handleCancel} disabled={updating}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="w-section-title">About</h3>
                <p style={{color:"var(--gray-500)",lineHeight:1.7,marginBottom:28}}>{user?.bio||"No bio provided."}</p>
                <h3 className="w-section-title">Details</h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:28}}>
                  {[["Location",user?.location||"Not specified"],["Email",user?.email],
                    ...(user?.role==="freelancer"?[["Experience",user?.yearsOfExperience?`${user.yearsOfExperience} Years`:"Not specified"],["Hourly Rate",user?.hourlyRate?`₹${user.hourlyRate}/hr`:"Not specified"]]:[])]
                    .map(([k,v])=>(
                      <div key={k}>
                        <strong style={{display:"block",color:"var(--gray-400)",fontSize:12,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.8px"}}>{k}</strong>
                        <div style={{color:"var(--gray-700)",fontSize:14}}>{v}</div>
                      </div>
                    ))}
                </div>
                {user?.role==="freelancer" && (
                  <>
                    <h3 className="w-section-title">Skills</h3>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {user?.skills?.length>0 ? user.skills.map((s,i)=><span key={i} className="w-badge">{s}</span>) : <p style={{color:"var(--gray-400)"}}>No skills added yet.</p>}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
