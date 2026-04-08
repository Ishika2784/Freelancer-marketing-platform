import { useState } from "react";
import PublicNav from "../components/PublicNav";
import "../styles.css";

const COURSES = [
  { cat: "Getting Started", title: "Freelancing 101: From Zero to First Client", lessons: 8, duration: "2h 30m", level: "Beginner", icon: "🚀", free: true },
  { cat: "Skills", title: "React & Node.js for Freelancers", lessons: 24, duration: "12h", level: "Intermediate", icon: "⚛️", free: false },
  { cat: "Business", title: "Pricing, Proposals & Contracts", lessons: 10, duration: "3h", level: "Beginner", icon: "📄", free: true },
  { cat: "Design", title: "UI/UX Design Fundamentals", lessons: 18, duration: "8h", level: "Beginner", icon: "🎨", free: false },
  { cat: "Business", title: "Building a 6-Figure Freelance Business", lessons: 15, duration: "5h", level: "Advanced", icon: "💰", free: false },
  { cat: "Skills", title: "Data Science for Freelancers", lessons: 20, duration: "10h", level: "Intermediate", icon: "📊", free: false },
  { cat: "Getting Started", title: "Writing Proposals That Win", lessons: 6, duration: "1h 30m", level: "Beginner", icon: "✍️", free: true },
  { cat: "Skills", title: "SEO & Content Marketing Mastery", lessons: 16, duration: "6h", level: "Intermediate", icon: "🔍", free: false },
];

const CATS = ["All", "Getting Started", "Skills", "Business", "Design"];
const LEVEL_COLORS = {
  Beginner:     ["#f0fdf4", "#15803d"],
  Intermediate: ["#eff6ff", "#1d4ed8"],
  Advanced:     ["#fff7ed", "#c2410c"],
};

export default function Learn() {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? COURSES : COURSES.filter(c => c.cat === cat);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <PublicNav />
      <div style={{ background: "linear-gradient(135deg,#1a1a2e,#2d2d4e)", padding: "70px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#f97316", fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>FREELANCER ACADEMY</div>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>Learn & Grow</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>Free and premium courses to level up your freelance career.</p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding: "7px 18px", borderRadius: 100, border: "1.5px solid", fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: cat === c ? "#f97316" : "#fff",
                color: cat === c ? "#fff" : "#475569",
                borderColor: cat === c ? "#f97316" : "#e2e8f0" }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
          {filtered.map((c, i) => {
            const [bg, color] = LEVEL_COLORS[c.level];
            return (
              <div key={i} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "transform .2s", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ background: "linear-gradient(135deg,#1a1a2e,#2d2d4e)", height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>
                  {c.icon}
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{c.level}</span>
                    {c.free
                      ? <span style={{ background: "#f0fdf4", color: "#15803d", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>FREE</span>
                      : <span style={{ background: "#fff7ed", color: "#f97316", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>PRO</span>}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", marginBottom: 8, lineHeight: 1.4 }}>{c.title}</h3>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>{c.lessons} lessons · {c.duration}</div>
                  <button className="btn btn-coral btn-sm" style={{ width: "100%" }}>
                    {c.free ? "Start Free →" : "Enroll Now →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
