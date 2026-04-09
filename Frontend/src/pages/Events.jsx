import "../styles.css";

const EVENTS = [
  { type: "Webinar", title: "How to Price Your Freelance Services in 2026", date: "Apr 15, 2026", time: "7:00 PM IST", host: "Priya Sharma", spots: 120, registered: 89, icon: "🎙️" },
  { type: "Workshop", title: "Building a Winning Freelance Portfolio", date: "Apr 22, 2026", time: "6:00 PM IST", host: "Arjun Mehta", spots: 50, registered: 43, icon: "🎨" },
  { type: "AMA", title: "Ask Me Anything: Scaling to ₹1L/month", date: "Apr 28, 2026", time: "8:00 PM IST", host: "Rahul Kumar", spots: 200, registered: 156, icon: "💬" },
  { type: "Hackathon", title: "Freelancer.io Build Challenge — Win ₹1 Lakh", date: "May 3–5, 2026", time: "All Day", host: "Freelancer.io Team", spots: 500, registered: 312, icon: "🏆" },
  { type: "Webinar", title: "Client Communication Masterclass", date: "May 10, 2026", time: "7:00 PM IST", host: "Sneha Rao", spots: 100, registered: 34, icon: "📞" },
  { type: "Meetup", title: "Freelancers of Mumbai — In-Person Networking", date: "May 18, 2026", time: "5:00 PM IST", host: "Community Team", spots: 80, registered: 61, icon: "🤝" },
];

const TYPE_COLORS = {
  Webinar:   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  Workshop:  { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" },
  AMA:       { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  Hackathon: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  Meetup:    { bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
};

export default function Events() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "linear-gradient(135deg,#1a1a2e,#2d2d4e)", padding: "70px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#f97316", fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>COMMUNITY</div>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>Events & Webinars</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>Learn, connect, and grow with the Freelancer.io community.</p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {EVENTS.map((e, i) => {
            const c = TYPE_COLORS[e.type] || TYPE_COLORS.Webinar;
            const pct = Math.round((e.registered / e.spots) * 100);
            return (
              <div key={i} style={{ background: "#fff", borderRadius: 18, padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ fontSize: "2.5rem", flexShrink: 0 }}>{e.icon}</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{e.type}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{e.date} · {e.time}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e", marginBottom: 6 }}>{e.title}</h3>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>Hosted by {e.host}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: pct > 80 ? "#ef4444" : "#f97316", borderRadius: 100 }} />
                    </div>
                    <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{e.registered}/{e.spots} spots</span>
                  </div>
                </div>
                <button className="btn btn-coral btn-sm" style={{ flexShrink: 0 }}>
                  {pct >= 100 ? "Join Waitlist" : "Register Free →"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
