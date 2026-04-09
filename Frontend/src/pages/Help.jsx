import { useState } from "react";
import "../styles.css";

const FAQS = [
  { q: "How do I get started as a freelancer?", a: "Create an account, complete your profile with skills and hourly rate, then browse jobs in Find Project. Apply to jobs that match your skills." },
  { q: "How does the hiring process work?", a: "Clients post jobs, freelancers apply. The client reviews applicants and clicks 'Hire' on their preferred freelancer. You'll see your status update in My Proposals." },
  { q: "When and how do I get paid?", a: "Payments are processed through our secure payment system. Once a client marks a project complete, funds are released to your account within 2-3 business days." },
  { q: "What is the Pro plan?", a: "Pro plan gives clients access to AI-powered freelancer matching using Gemini AI. Freelancers on Pro get priority listing and advanced analytics." },
  { q: "How do I cancel my subscription?", a: "Go to Profile → Subscription and click Cancel Plan. Your Pro features remain active until the end of the billing period." },
  { q: "Is my payment information secure?", a: "Yes. We use Razorpay for payment processing. We never store your card details on our servers." },
  { q: "How do I report a problem with a client or freelancer?", a: "Use the Report button on any profile or job card, or email support@freelancer.io with details." },
  { q: "Can I work with clients outside India?", a: "Absolutely. Freelancer.io supports international clients and freelancers. Payments are processed in INR with automatic conversion." },
];

const CATEGORIES = [
  { icon: "🚀", title: "Getting Started", desc: "Account setup, profile tips, first steps" },
  { icon: "💳", title: "Payments & Billing", desc: "Invoices, refunds, subscription" },
  { icon: "🔒", title: "Account & Security", desc: "Password, 2FA, privacy settings" },
  { icon: "📋", title: "Jobs & Proposals", desc: "Posting, applying, hiring process" },
  { icon: "⭐", title: "Reviews & Ratings", desc: "How ratings work, disputes" },
  { icon: "🤖", title: "AI Features", desc: "AI matching, how it works" },
];

export default function Help() {
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "linear-gradient(135deg,#1a1a2e,#2d2d4e)", padding: "70px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>Help Center</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 28 }}>How can we help you today?</p>
        <div style={{ maxWidth: 500, margin: "0 auto", position: "relative" }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search for answers…"
            style={{ width: "100%", padding: "14px 16px 14px 46px", borderRadius: 100, border: "none", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
        {/* Categories */}
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a2e", marginBottom: 24 }}>Browse by Topic</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 56 }}>
          {CATEGORIES.map((c, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", cursor: "pointer", transition: "transform .2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 4, fontSize: 14 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a2e", marginBottom: 20 }}>Frequently Asked Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((f, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", padding: "18px 22px", background: "none", border: "none", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 15 }}>{f.q}</span>
                <span style={{ fontSize: 18, color: "#f97316", flexShrink: 0 }}>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div style={{ padding: "0 22px 18px", color: "#475569", fontSize: 14, lineHeight: 1.7 }}>{f.a}</div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No results found. Try a different search.</div>
          )}
        </div>

        {/* Contact */}
        <div style={{ marginTop: 48, background: "#fff", borderRadius: 18, padding: "32px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>💬</div>
          <h3 style={{ fontWeight: 800, color: "#1a1a2e", marginBottom: 8 }}>Still need help?</h3>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Our support team typically responds within 2 hours.</p>
          <a href="mailto:support@freelancer.io">
            <button className="btn btn-coral">Contact Support →</button>
          </a>
        </div>
      </div>
    </div>
  );
}
