import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

const POSTS = [
  { id: 1, tag: "Freelancing", title: "10 Tips to Land Your First Client as a Freelancer", excerpt: "Breaking into freelancing can feel overwhelming. Here's a proven roadmap to get your first paying client within 30 days.", author: "Priya S.", date: "Mar 28, 2026", readTime: "5 min", img: "💡" },
  { id: 2, tag: "For Clients", title: "How to Write a Job Post That Attracts Top Talent", excerpt: "A well-written job post is the difference between 50 mediocre proposals and 5 perfect ones. Learn the formula.", author: "Arjun M.", date: "Mar 20, 2026", readTime: "4 min", img: "📝" },
  { id: 3, tag: "AI & Tech", title: "How AI Matching is Changing the Freelance Industry", excerpt: "Our Gemini-powered matching engine has reduced time-to-hire by 60%. Here's how it works under the hood.", author: "Dev Team", date: "Mar 15, 2026", readTime: "7 min", img: "🤖" },
  { id: 4, tag: "Career", title: "From ₹20K to ₹2L/month: A Freelancer's Journey", excerpt: "Rahul went from struggling to find work to earning ₹2 lakh a month in 18 months. This is his story.", author: "Rahul K.", date: "Mar 10, 2026", readTime: "8 min", img: "📈" },
  { id: 5, tag: "Productivity", title: "The Freelancer's Guide to Managing Multiple Projects", excerpt: "Juggling 3+ clients without burning out requires systems. Here are the tools and habits that actually work.", author: "Sneha R.", date: "Mar 5, 2026", readTime: "6 min", img: "⚡" },
  { id: 6, tag: "Payments", title: "Understanding Freelance Contracts & Payment Protection", excerpt: "Get paid on time, every time. A guide to contracts, milestones, and dispute resolution on Freelancer.io.", author: "Legal Team", date: "Feb 28, 2026", readTime: "5 min", img: "🔒" },
];

const TAGS = ["All", "Freelancing", "For Clients", "AI & Tech", "Career", "Productivity", "Payments"];

export default function Blog() {
  const [activeTag, setActiveTag] = useState("All");
  const navigate = useNavigate();

  const filtered = activeTag === "All" ? POSTS : POSTS.filter(p => p.tag === activeTag);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "linear-gradient(135deg,#1a1a2e,#2d2d4e)", padding: "70px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#f97316", fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>INSIGHTS & STORIES</div>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>The Freelancer.io Blog</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>Tips, stories, and insights for freelancers and clients.</p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        {/* Tag filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 40 }}>
          {TAGS.map(t => (
            <button key={t} onClick={() => setActiveTag(t)}
              style={{ padding: "7px 18px", borderRadius: 100, border: "1.5px solid", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s",
                background: activeTag === t ? "#f97316" : "#fff",
                color: activeTag === t ? "#fff" : "#475569",
                borderColor: activeTag === t ? "#f97316" : "#e2e8f0" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
          {filtered.map(p => (
            <div key={p.id} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", cursor: "pointer", transition: "transform .2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ background: "linear-gradient(135deg,#1a1a2e,#2d2d4e)", height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                {p.img}
              </div>
              <div style={{ padding: "20px 22px" }}>
                <span style={{ background: "#fff7ed", color: "#f97316", border: "1px solid #fed7aa", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{p.tag}</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e", margin: "12px 0 8px", lineHeight: 1.4 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 16 }}>{p.excerpt}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
                  <span>{p.author} · {p.date}</span>
                  <span>{p.readTime} read</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
