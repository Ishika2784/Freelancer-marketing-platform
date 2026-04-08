import { useNavigate } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import "../styles.css";

const OPENINGS = [
  { role: "Senior React Developer", dept: "Engineering", location: "Remote", type: "Full-time" },
  { role: "Node.js Backend Engineer", dept: "Engineering", location: "Remote", type: "Full-time" },
  { role: "Product Designer (UI/UX)", dept: "Design", location: "Hybrid", type: "Full-time" },
  { role: "Growth Marketing Manager", dept: "Marketing", location: "Remote", type: "Full-time" },
  { role: "Community Manager", dept: "Operations", location: "Remote", type: "Part-time" },
  { role: "AI/ML Engineer", dept: "Engineering", location: "Remote", type: "Full-time" },
];

const PERKS = [
  { icon: "\uD83C\uDF0D", title: "Remote First", desc: "Work from anywhere in the world." },
  { icon: "\uD83D\uDCC8", title: "Equity", desc: "Own a piece of what you build." },
  { icon: "\uD83C\uDFE5", title: "Health Cover", desc: "Full medical, dental & vision." },
  { icon: "\uD83D\uDCDA", title: "Learning Budget", desc: "\u20B950K/year for courses & books." },
  { icon: "\uD83C\uDFD6\uFE0F", title: "Unlimited PTO", desc: "Take time when you need it." },
  { icon: "\uD83D\uDCBB", title: "Home Setup", desc: "\u20B91L stipend for your workspace." },
];

export default function Careers() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <PublicNav />
      <div style={{ background: "linear-gradient(135deg,#1a1a2e,#2d2d4e)", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#f97316", fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>WE'RE HIRING</div>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>Build the future of work</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, maxWidth: 520, margin: "0 auto 32px" }}>
          Join a team redefining how talent and opportunity connect worldwide.
        </p>
        <button className="btn btn-coral" onClick={() => document.getElementById("openings").scrollIntoView({ behavior: "smooth" })}>
          View Open Roles
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a1a2e", marginBottom: 32, textAlign: "center" }}>Why Freelancer.io?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, marginBottom: 64 }}>
          {PERKS.map((p, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>{p.icon}</div>
              <div style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>{p.title}</div>
              <div style={{ fontSize: 14, color: "#64748b" }}>{p.desc}</div>
            </div>
          ))}
        </div>

        <h2 id="openings" style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a1a2e", marginBottom: 24 }}>Open Positions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {OPENINGS.map((o, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>{o.role}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{o.dept} · {o.location} · {o.type}</div>
              </div>
              <button className="btn btn-coral btn-sm">Apply Now</button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 48, color: "#64748b", fontSize: 14 }}>
          Don't see a fit?{" "}
          <span style={{ color: "#f97316", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/")}>
            Send us your resume anyway
          </span>
        </div>
      </div>
    </div>
  );
}
