import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles.css";
import { useToast } from "../components/Toast";
import { storage } from "../utils/storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(() => !!localStorage.getItem("token") || !!storage.getToken());
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const token = storage.getToken() || localStorage.getItem("token");
    const r = storage.getRole() || localStorage.getItem("role");
    if (token) {
      navigate(r === "client" ? "/client/dashboard" : r === "freelancer" ? "/freelancer/dashboard" : "/");
    } else {
      setIsChecking(false);
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password) { toast("Please fill in all fields", "error"); return; }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password, role });
      const user = res.data.user;
      // Clear any previous session before storing new one
      storage.clearAuth();
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      storage.setAuth(res.data.token, user.role);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", user.role);
      toast(`Welcome back, ${user.name || "User"}! `);
      setTimeout(() => {
        if (user.role === "client") navigate(user.plan === "pro" || user.plan === "free" ? "/client/dashboard" : "/pricing");
        else if (user.role === "freelancer") navigate("/freelancer/dashboard");
      }, 800);
    } catch (err) {
      toast(err.response?.data?.message || "Wrong credentials", "error");
      setLoading(false);
    }
  };

  if (isChecking) return null;

  return (
    <div className="authpage">
      <div className="authsplit">
        <div className="authleft">
          <h2 className="authleft-title">Welcome Back!</h2>
          <p className="authleft-sub">Sign in and connect with top talent or find your next great project.</p>
          <div className="authleft-tags">
            {["UI Designer","React Dev","3D Artist","Copywriter","Full Stack"].map(t => (
              <span key={t} className="w-auth-tag">{t}</span>
            ))}
          </div>
        </div>
        <div className="authright">
          <div className="authlogo"><span className="logoicon">◈</span> Freelancer.io</div>
          <h2 className="authtitle">Sign In</h2>
          <p className="authsub">Enter your credentials to continue</p>
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="client">👨🏻‍💼 Client</option>
            <option value="freelancer">👨🏻‍💻 Freelancer</option>
          </select>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
          <button className="authbtn" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
          <div className="authlink">Don't have an account? <span onClick={() => navigate("/register")}>Create one</span></div>
        </div>
      </div>
    </div>
  );
}
