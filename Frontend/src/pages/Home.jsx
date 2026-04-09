import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles.css";
import { storage } from "../utils/storage";
import axios from "axios";
import { useToast } from "../components/Toast";
import PublicNav from "../components/PublicNav";

const PLANS = [
  { key: "free", name: "Free", price: "₹0", period: "INR / month", tagline: "See what AI can do", current: true, btnLabel: "Your current plan", btnStyle: "gpt2-btn-ghost",
    features: ["Get simple explanations","Have short chats for common questions","Try out basic job matching","Save limited memory and context"] },
  { key: "starter", name: "Go", price: "₹299", period: "INR / month (inclusive of GST)", tagline: "Keep hiring with expanded access", btnLabel: "Upgrade to Go", btnStyle: "gpt2-btn-outline",
    features: ["Explore freelancers in depth","Post more jobs and upload more content","Make more AI matches for your projects","Get more memory for smarter replies","Get help with planning and tasks","Explore projects, tasks, and custom filters"] },
  ];

function PricingContent({ onClose, navigate }) {
  const [billing, setBilling] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const toast = useToast();

  const handlePlan = async (plan) => {
    if (plan === "free" || plan === "starter" || plan === "enterprise") {
      toast("This plan is coming soon!", "warn"); return;
    }
    const token = storage.getToken();
    if (!token) { toast("Please login first", "warn"); onClose(); navigate("/login"); return; }
    setLoading(true); setActivePlan(plan);
    try {
      const res = await axios.post("http://localhost:5000/api/payment/createorder", { plan: "pro" },
        { headers: { Authorization: `Bearer ${token}` } });
      const order = res.data;
      const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!key) { toast("Razorpay key missing!", "error"); return; }
      new window.Razorpay({
        key, amount: order.amount, currency: "INR",
        name: "Freelancer.io", description: "Pro Plan", order_id: order.id,
        handler: async (response) => {
          await axios.post("http://localhost:5000/api/payment/verify", { ...response, plan: "pro" },
            { headers: { Authorization: `Bearer ${token}` } });
          toast("Payment successful! Pro plan activated. ");
          onClose();
          setTimeout(() => navigate("/client/dashboard"), 1000);
        },
        modal: { ondismiss: () => toast("Payment cancelled", "warn") },
      }).open();
    } catch (e) {
      toast(e.response?.data?.message || "Something went wrong", "error");
    } finally { setLoading(false); setActivePlan(null); }
  };

  const busy = (k) => loading && activePlan === k;

  return (
    <>
      <h1 className="gpt2-title">Upgrade your plan</h1>
      <div className="gpt2-toggle">
        <button className={`gpt2-toggle-btn ${billing === "personal" ? "active" : ""}`} onClick={() => setBilling("personal")}>Personal</button>
        <button className={`gpt2-toggle-btn ${billing === "business" ? "active" : ""}`} onClick={() => setBilling("business")}>Business</button>
      </div>
      <div className="gpt2-cards">
        {PLANS.map(plan => (
          <div key={plan.key} className={`gpt2-card ${plan.popular ? "gpt2-card-popular" : ""}`}>
            {plan.popular && <span className="gpt2-popular-badge">POPULAR</span>}
            <div className="gpt2-plan-name">{plan.name}</div>
            <div className="gpt2-plan-price">
              <span className="gpt2-price-symbol">₹</span>
              <span className="gpt2-price-num">{plan.price.replace("₹","")}</span>
            </div>
            <div className="gpt2-price-period">{plan.period}</div>
            <div className="gpt2-plan-tagline">{plan.tagline}</div>
            {plan.current
              ? <div className="gpt2-current-label">Your current plan</div>
              : <button className={`gpt2-btn ${plan.btnStyle}`} onClick={() => handlePlan(plan.key)} disabled={loading}>
                  {busy(plan.key) ? <span className="gpt2-spinner" /> : plan.btnLabel}
                </button>}
            <ul className="gpt2-features">
              {plan.features.map((f, i) => (
                <li key={i} className="gpt2-feature"><span className="gpt2-feat-icon">✦</span><span>{f}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="gpt2-footnote">Prices in INR inclusive of GST · Cancel anytime · Secure payments via Razorpay</p>
    </>
  );
}

const SKILLS = ["UI Designer", "3D Artist", "React Dev", "Copywriter", "Motion Designer", "Full Stack"];

const TESTIMONIALS = [

  { name: "Arjun Sharma",  role: "Software Developer",    stars: 4, color: "#f59e0b",
    text: '"Freelancer.io changed everything — the AI matching is insane and I landed 3 clients in my first week."' },
  { name: "Priya Mehta",   role: "UI Designer Enthusiast", stars: 5, color: "#fff", featured: true,
    text: "I stumbled upon Freelancer.io during a pivotal moment in my freelance journey, and it was a game-changer! The seamless interface allowed me to effortlessly browse projects and secure contracts." },
 
  { name: "Rahul Verma",   role: "Illustrator",            stars: 5, color: "#a855f7",
    text: '"Compared to other platforms, the user-friendly interface and diverse range of projects sets it apart. Highly recommend!"' },
];

function PricingModal({ onClose, navigate }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Lock background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleUpgrade = async () => {
    const token = storage.getToken();
    if (!token) { toast("Please login first", "warn"); onClose(); navigate("/login"); return; }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/payment/createorder", { plan: "pro" },
        { headers: { Authorization: `Bearer ${token}` } });
      const order = res.data;
      const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!key) { toast("Razorpay key missing!", "error"); return; }
      new window.Razorpay({
        key, amount: order.amount, currency: "INR",
        name: "Freelancer.io", description: "Pro Plan", order_id: order.id,
        handler: async (response) => {
          await axios.post("http://localhost:5000/api/payment/verify", { ...response, plan: "pro" },
            { headers: { Authorization: `Bearer ${token}` } });
          toast("Payment successful! Pro plan activated. 🎉");
          onClose();
          setTimeout(() => navigate("/client/dashboard"), 1000);
        },
        modal: { ondismiss: () => toast("Payment cancelled", "warn") },
      }).open();
    } catch (e) {
      toast(e.response?.data?.message || "Something went wrong", "error");
    } finally { setLoading(false); }
  };

  return (
    <div onClick={onClose} className="pm-overlay">
      <div onClick={e => e.stopPropagation()} className="pm-box">

        <button onClick={onClose} className="pm-close">×</button>

        <div className="pm-header">
          <div className="pm-badge">
            <span>◈ FREELANCER.IO PLANS</span>
          </div>
          <h2 className="pm-title">Unlock your potential</h2>
          <p className="pm-sub">Simple pricing · No hidden fees · Cancel anytime</p>
        </div>

        <div className="pm-cards">
          {/* FREE */}
          <div className="pm-card pm-card-free">
            <div className="pm-plan-label-free">FREE</div>
            <div className="pm-price">₹0</div>
            <div className="pm-period-free">per month, forever</div>
            <div className="pm-divider-free">
              {["Limited access", "Basic features", "Profile listings"].map((f, i) => (
                <div key={i} className="pm-feature">
                  <span style={{color:"#64748b",fontSize:13,flexShrink:0,marginTop:1,fontWeight:700}}>{"\u2713"}</span>
                  <span className="pm-feat-text-free">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="pm-btn-free">Continue Free</button>
          </div>

          {/* PRO */}
          <div className="pm-card pm-card-pro">
            <span className="pm-popular-badge">⭐ Most Popular</span>
            <div className="pm-plan-label-pro">PRO</div>
            <div className="pm-price">₹299</div>
            <div className="pm-period-pro">per month, billed monthly</div>
            <div className="pm-divider-pro">
              {["Unlimited access", "Priority support", "Better visibility", "AI Matching"].map((f, i) => (
                <div key={i} className="pm-feature">
                  <span style={{color:"#f97316",fontSize:13,flexShrink:0,marginTop:1,fontWeight:700}}>{"\u2713"}</span>
                  <span className="pm-feat-text-pro">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={handleUpgrade} disabled={loading} className="pm-btn-pro">
              {loading ? "Processing…" : "Upgrade Now →"}
            </button>
          </div>
        </div>

        <p className="pm-footnote">Prices in INR inclusive of GST · Secure payments via Razorpay</p>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = storage.isLoggedIn() || !!localStorage.getItem("token");
  const userRole   = storage.getRole() || localStorage.getItem("role");
  const [email, setEmail] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      axios.get("http://localhost:5000/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => {
          if (r.data.plan === "pro") setShowBanner(false);
        })
        .catch(() => {});
    }
  }, [isLoggedIn]);

  const toDashboard = () =>
    navigate(userRole === "client" ? "/client/dashboard" : "/freelancer/dashboard");

  const handleLogout = () => {
    storage.clearAuth();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };



  return (
    <div className="w-page">

      {/* ── BANNER ── */}
      {showBanner && (
        <div className="banner">
          Special offer — upgrade to Pro and unlock AI matching.
          <a href="/pricing"> See pricing →</a>
          <button className="banner-close" onClick={() => setShowBanner(false)}>✕</button>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <PublicNav onOpenPricing={() => setShowPricingModal(true)} />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <h1 className="herotitle">
            FREELANCE FREEDOM<br />AT YOUR FINGERTIPS
          </h1>
          <p className="herosub">
            Find skilled freelancers for your projects, from writing to web development —
            where talent meets opportunity!
          </p>
          <div className="herobtns">
            {isLoggedIn ? (
              <button className="btn herobtn-primary" onClick={toDashboard}>
                Go to Dashboard →
              </button>
            ) : (
              <>
                <button className="btn herobtn-primary" onClick={() => navigate("/register")}>
                  Get Started Free
                </button>
                <button className="btn herobtn-secondary" onClick={() => navigate("/login")}>
                  Browse Talent →
                </button>
              </>
            )}
          </div>
        </div>

        {/* Avatar cards */}
        <div className="avatar-row">
          {["👨🏿‍💼","👩🏾‍💼","👨🏾‍🎨","👨🏽‍💻","👨🏿‍🎤","👨🏻‍💼","👩🏻‍💼"].map((em, i) => (
            <div key={i} className={`avatar-card ${i === 3 ? "avatar-center" : ""}`}>
              <div className="avatar-emoji">{em}</div>
              <div className="avatar-skill">{SKILLS[i % SKILLS.length]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="features-strip">
        {[
          { icon: "👥", title: "Diverse Talent Pool",      desc: "Access a global network of skilled professionals spanning various industries." },
          { icon: "💰", title: "Cost-Effectiveness",       desc: "Save on overhead costs by hiring freelancers on a project basis." },
          { icon: "💡", title: "Specialized Expertise",    desc: "Tap into niche expertise that may not be available in-house." },
          { icon: "🌍", title: "Access to Global Markets", desc: "Expand your reach by working with freelancers around the world." },
        ].map((f, i) => (
          <div key={i} className="feature-item">
            <div className="feature-icon">{f.icon}</div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── WAVE ── */}
      <div className="wave-coral">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,0 C360,120 1080,120 1440,0 L1440,120 L0,120 Z" fill="#ffffff"/>
        </svg>
      </div>

      {/* ── CONNECT SECTION ── */}
      <section className="connect">
        <div className="connect-logo">
          <span className="w-nav-logo-icon" style={{ color: "#f97316" }}>◈</span>
          <span style={{ fontWeight: 800, fontSize: "1rem" }}>FREELANCER.IO</span>
        </div>
        <h2 className="connect-title">
          CONNECT. CREATE.<br />COLLABORATE
        </h2>
        <div className="connect-desc">
          <p>Our platform offers a seamless experience, empowering freelancers to showcase their skills and thrive in the workforce landscape.</p>
          <p>Whether you're a seasoned freelancer or a business in need of specialized talent — we connect the right people.</p>
          <button
            className="btn btn-outline"
            style={{ borderRadius: 100, padding: "12px 28px" }}
            onClick={() => isLoggedIn ? toDashboard() : navigate("/register")}
          >
            "Join. Thrive. Succeed."
          </button>
        </div>

        {/* Two big cards */}
        <div className="big-cards">
          <div className="big-card">
            <div className="big-card-img img-client">
              <div className="big-card-overlay">
                <div className="big-card-icon">👥</div>
                <h3>DISCOVER TALENT THAT FITS YOU</h3>
                <p>From quick turnarounds to big transformations, work with the largest independent professional network.</p>
                <button className="learn-more" onClick={() => isLoggedIn ? toDashboard() : navigate("/register")}>Learn More →</button>
              </div>
            </div>
          </div>
          <div className="big-card">
            <div className="big-card-img img-freelancer">
              <div className="big-card-overlay">
                <div className="big-card-icon">🔍</div>
                <h3>SEARCH FOR GREAT JOBS</h3>
                <p>Your career will flourish when you work with clients you're excited to work with.</p>
                <button className="learn-more" onClick={() => isLoggedIn ? toDashboard() : navigate("/register")}>Learn More →</button>
              </div>
            </div>
          </div>
        </div>

        {/* Dark card */}
        <div className="dark-row">
          <div className="dark-card">
            <div className="w-nav-logo">
              <span className="w-nav-logo-icon" style={{ color: "#f97316" }}>◈</span>
              <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#fff" }}>FREELANCER.IO</span>
            </div>
            <h3 className="dark-card-title">
              THIS IS HOW<br />GOOD ↗<br />COMPANIES FIND<br />GOOD PARTNERS.
            </h3>
            <a href="#" className="dark-learn">Learn More →</a>
            <div className="dark-sub">
              <span style={{ fontSize: "1.4rem" }}>🤝</span>
              <p>Access the top 1% of talent on Freelancer.io, along with a complete suite of hybrid workforce management tools.</p>
            </div>
          </div>
          <div className="dark-photo">
            <span style={{ fontSize: "6rem" }}>👩‍💼</span>
          </div>
        </div>
      </section>

      {/* ── WAVE UP ── */}
      <div className="wave-white">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,80 C360,0 1080,0 1440,80 L1440,0 L0,0 Z" fill="#ffffff"/>
        </svg>
      </div>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials">
        <h2 className="testimonials-title">REAL STORIES,<br />REAL RESULTS</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className={`t-card ${t.featured ? "t-featured" : ""}`}
              style={{ background: t.featured ? "#fff" : t.color === "#a855f7" ? "#a855f7" : "#f59e0b" }}
            >
              <div className="t-header">
                <div className="t-avatar">{t.name.charAt(0)}</div>
                <div>
                  <div className="t-name" style={{ color: t.featured ? "#1e293b" : "#fff" }}>{t.name}</div>
                  <div className="t-role" style={{ color: t.featured ? "#64748b" : "rgba(255,255,255,0.8)" }}>{t.role}</div>
                </div>
              </div>
              <div className="t-stars">{"★".repeat(t.stars)}</div>
              <p className="t-text" style={{ color: t.featured ? "#334155" : "#fff" }}>{t.text}</p>
              <div className="t-quote" style={{ color: t.featured ? "#e2e8f0" : "rgba(255,255,255,0.2)" }}>"</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── JOIN CTA ── */}
      <section className="join">
        <div className="join-card">
          <div className="join-left">
            <div className="w-nav-logo" style={{ marginBottom: 20 }}>
              <span className="w-nav-logo-icon" style={{ color: "#f97316" }}>◈</span>
              <span style={{ fontWeight: 800, color: "#fff", fontSize: "0.9rem" }}>FREELANCER.IO</span>
            </div>
            <h2 className="join-title">DON'T MISS OUT ON EXCITING PROJECTS — JOIN US TODAY!</h2>
            <p className="join-sub">
              Join Now and Elevate Your Freelance Career! Connect with top clients,
              showcase your skills, and unlock endless opportunities.
            </p>
            <div className="join-form">
              <input
                type="email"
                placeholder="Enter your email here..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="join-input"
              />
              <button className="btn btn-yellow" onClick={() => isLoggedIn ? toDashboard() : navigate("/register")}>
                {isLoggedIn ? "Go to Dashboard →" : "Join for Free"}
              </button>
            </div>
            <div className="join-note">🛡 We don't share or sell your email address publicly</div>
          </div>
          <div className="join-right">
            <span style={{ fontSize: "8rem" }}>👨🏾‍💻</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-brand">FREELANCER.IO ©</div>
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-handle">@FREELANCERIO</div>
            <div className="footer-handle">HELLO@FREELANCER.IO</div>
            <p className="footer-tagline">
              Your gateway to a vibrant community of talented freelancers and exciting
              project opportunities, where collaboration knows no bounds.
            </p>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">ABOUT</div>
            <Link className="footer-link" to="/careers">Careers</Link>
            <Link className="footer-link" >Press & News</Link>
            <Link className="footer-link" >Partnerships</Link>
            <Link className="footer-link" to="/privacy">Privacy Policy</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">COMMUNITY</div>
            <Link className="footer-link" >Forum</Link>
            <Link className="footer-link" >Events</Link>
            <Link className="footer-link" to="/blog">Blog</Link>
            <Link className="footer-link" >Podcasts</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">SUPPORT</div>
            <Link className="footer-link" to="/help">Help</Link>
            <Link className="footer-link" to="/learn">Learn</Link>
          </div>
        </div>
        <div className="footer-bottom">
          Freelancer.io {new Date().getFullYear()}. All Rights Reserved
        </div>
      </footer>

      {/* ── ENTERPRISE / PRICING MODAL ── */}
      {showPricingModal && (
        <PricingModal onClose={() => setShowPricingModal(false)} navigate={navigate} />
      )}

    </div>
  );
}


