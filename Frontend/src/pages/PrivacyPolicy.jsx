import "../styles.css";

const SECTIONS = [
  { title: "Information We Collect", content: "We collect information you provide directly — name, email, skills, and profile details. We also collect usage data such as pages visited, features used, and device information to improve our platform." },
  { title: "How We Use Your Information", content: "Your data is used to operate and improve Freelancer.io, match freelancers with clients, process payments, send important notifications, and personalize your experience. We never sell your personal data to third parties." },
  { title: "Data Sharing", content: "We share your profile information with clients or freelancers as part of the platform's core functionality. We may share data with trusted service providers (payment processors, email services) under strict confidentiality agreements." },
  { title: "Data Security", content: "We use industry-standard encryption (TLS/SSL) for data in transit and at rest. Passwords are hashed using bcrypt. We conduct regular security audits and follow OWASP best practices." },
  { title: "Cookies", content: "We use session cookies for authentication and analytics cookies to understand usage patterns. You can disable cookies in your browser settings, though some features may not function correctly." },
  { title: "Your Rights", content: "You have the right to access, correct, or delete your personal data at any time. You can export your data or request account deletion by contacting us at privacy@freelancer.io." },
  { title: "Children's Privacy", content: "Freelancer.io is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has registered, contact us immediately." },
  { title: "Changes to This Policy", content: "We may update this policy periodically. We'll notify you of significant changes via email or a prominent notice on the platform. Continued use after changes constitutes acceptance." },
];

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "linear-gradient(135deg,#1a1a2e,#2d2d4e)", padding: "60px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, color: "#fff", marginBottom: 12 }}>Privacy Policy</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Last updated: April 2026</p>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
        <p style={{ color: "#64748b", lineHeight: 1.8, marginBottom: 40, fontSize: 15 }}>
          At Freelancer.io, your privacy matters. This policy explains what data we collect, how we use it, and your rights regarding your personal information.
        </p>
        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1a1a2e", marginBottom: 10 }}>{i + 1}. {s.title}</h2>
            <p style={{ color: "#475569", lineHeight: 1.8, fontSize: 15 }}>{s.content}</p>
          </div>
        ))}
        <div style={{ marginTop: 48, padding: "24px", background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0" }}>
          <div style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>Contact Us</div>
          <p style={{ color: "#64748b", fontSize: 14 }}>Questions about this policy? Email us at <span style={{ color: "#f97316" }}>privacy@freelancer.io</span></p>
        </div>
      </div>
    </div>
  );
}
