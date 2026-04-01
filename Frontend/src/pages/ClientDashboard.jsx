import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { DashboardIcon, PostJobIcon, MyJobsIcon, FindFreelancersIcon } from "../components/NavIcons";
import ClientOverview        from "./client/ClientOverview";
import ClientPostJob         from "./client/ClientPostJob";
import ClientMyJobs          from "./client/ClientMyJobs";
import ClientFindFreelancers from "./client/ClientFindFreelancers";
import { storage } from "../utils/storage";
import "../styles.css";

const NAV_ITEMS = [
  { key: "overview", label: "Dashboard",       path: "/client/dashboard",        icon: () => <DashboardIcon /> },
  { key: "post",     label: "Post a Job",       path: "/client/post-job",         icon: () => <PostJobIcon /> },
  { key: "myjobs",   label: "My Jobs",          path: "/client/my-jobs",          icon: () => <MyJobsIcon /> },
  { key: "talent",   label: "Find Freelancers", path: "/client/find-freelancers", icon: () => <FindFreelancersIcon /> },
];

export default function ClientDashboard({ page = "overview" }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5000/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUser(r.data))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        sessionStorage.clear();
        
        // Also clear your custom storage utility!
        if (storage && storage.clearAuth) storage.clearAuth();
        else if (storage && storage.clear) storage.clear();
        
        navigate("/login");
      });
  }, [navigate]);

  if (!user) return <div className="prl-loading">Loading…</div>;

  const renderPage = () => {
    switch (page) {
      case "post":   return <ClientPostJob />;
      case "myjobs": return <ClientMyJobs />;
      case "talent": return <ClientFindFreelancers />;
      default:       return <ClientOverview user={user} />;
    }
  };

  const planCard = (
    <div className="prl-plan-card">
      <div className="prl-plan-icon">◈</div>
      <div className="prl-plan-title">
        {user.plan === "pro" ? "⭐ Pro Plan Active" : "Upgrade to Pro"}
      </div>
      <div className="prl-plan-desc">
        {user.plan === "pro"
          ? "You have full access to AI matching and all premium features."
          : "Get AI-powered freelancer matching, priority listings, and more."}
      </div>
      {user.plan !== "pro" && (
        <button className="prl-plan-btn" onClick={() => navigate("/pricing")}>Upgrade Now →</button>
      )}
    </div>
  );

  return (
    <DashboardLayout user={user} navItems={NAV_ITEMS} planCard={planCard}>
      {renderPage()}
    </DashboardLayout>
  );
}
