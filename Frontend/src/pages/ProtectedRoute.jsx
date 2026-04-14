import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { storage } from "../utils/storage";

// Cache the auth check result for the session so we don't re-hit the API on every navigation
let authCache = null;

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  // If we already verified this session, skip loading state entirely
  const [ok, setOk] = useState(!!authCache);

  useEffect(() => {
    if (authCache) return; // already verified

    const token = localStorage.getItem("token") || storage.getToken();
    if (!token) { navigate("/login"); return; }

    axios.get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      authCache = true;
      setOk(true);
    }).catch(() => {
      authCache = null;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      if (storage.clearAuth) storage.clearAuth();
      navigate("/login");
    });
  }, [navigate]);

  if (!ok) return null; // invisible flash instead of "Loading..."

  return children;
}

// Clear cache on logout (call this from logout handlers)
export function clearAuthCache() { authCache = null; }

export default ProtectedRoute;
