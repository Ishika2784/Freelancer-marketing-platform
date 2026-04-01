import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import { useToast } from "../components/Toast";
import { storage } from "../utils/storage";

export default function Register() {
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false); const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [role, setRole] = useState("client"); const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isChecking, setIsChecking] = useState(() => !!localStorage.getItem("token") || !!storage.getToken());
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token") || storage.getToken(); 
    const r = localStorage.getItem("role") || storage.getRole();
    if (token) {
      navigate(r === "client" ? "/client/dashboard" : r === "freelancer" ? "/freelancer/dashboard" : "/");
    } else {
      setIsChecking(false);
    }
  }, [navigate]);

  useEffect(() => {
    let t; if (cooldown > 0) t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!email) { toast("Please enter your email first", "warn"); return; }
    setIsLoading(true);
    try { await axios.post("http://localhost:5000/api/auth/send-otp", { email }); setShowOtp(true); setCooldown(30); toast("OTP sent! Check your inbox."); }
    catch (err) { toast(err.response?.data?.message || "Error sending OTP", "error"); }
    finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try { await axios.post("http://localhost:5000/api/auth/verify-otp-for-register", { email, otp }); setIsOtpVerified(true); toast("OTP Verified! ✓"); }
    catch (err) { toast(err.response?.data?.message || "Invalid OTP", "error"); }
    finally { setIsLoading(false); }
  };

  const handleRegister = async () => {
    if (!isOtpVerified) { toast("Please verify your OTP first.", "warn"); return; }
    setIsLoading(true);
    try { await axios.post("http://localhost:5000/api/auth/register", { name, email, password, role }); toast("Account created! Redirecting to login…"); setTimeout(()=>navigate("/login"),1200); }
    catch (err) { toast(err.response?.data?.message || "Error registering", "error"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="authpage">
      <div className="authsplit">
        <div className="authleft">
          <h2 className="authleft-title">Join Freelancer.io Today!</h2>
          <p className="authleft-sub">Connect with top clients, showcase your skills, and unlock endless opportunities.</p>
          <div className="authleft-tags">
            {["50K+ Freelancers","12K+ Projects","98% Satisfaction","AI Matching"].map(t => (
              <span key={t} className="w-auth-tag">{t}</span>
            ))}
          </div>
        </div>
        <div className="authright">
          <div className="authlogo"><span className="logoicon">◈</span> Freelancer.io</div>
          <h2 className="authtitle">Create Account</h2>
          <p className="authsub">Join thousands of clients & freelancers</p>
          <input type="text" placeholder="Full name" value={name} disabled={isLoading || showOtp} onChange={e => setName(e.target.value)} />
          <input type="email" placeholder="Email address" value={email} disabled={isLoading || showOtp} onChange={e => setEmail(e.target.value)} />
          <select value={role} onChange={e => setRole(e.target.value)} disabled={isLoading || showOtp}>
            <option value="client">👔 I'm a Client</option>
            <option value="freelancer">💻 I'm a Freelancer</option>
          </select>
          <input type="password" placeholder="Password" value={password} disabled={isLoading || showOtp} onChange={e => setPassword(e.target.value)} />
          {!isOtpVerified && (
            <button className="authbtn" onClick={handleSendOtp} disabled={isLoading || cooldown > 0}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : showOtp ? "Resend OTP" : "Send OTP →"}
            </button>
          )}
          {showOtp && !isOtpVerified && (
            <>
              <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} disabled={isLoading} />
              <button className="authbtn" onClick={handleVerifyOtp} disabled={isLoading || otp.length < 6}>Verify OTP ✓</button>
            </>
          )}
          <button className="authbtn" onClick={handleRegister} disabled={!isOtpVerified || isLoading}>
            {isLoading ? "Creating account..." : "Create Account 🚀"}
          </button>
          <div className="authlink">Already have an account? <span onClick={() => navigate("/login")}>Sign in</span></div>
        </div>
      </div>
    </div>
  );
}
