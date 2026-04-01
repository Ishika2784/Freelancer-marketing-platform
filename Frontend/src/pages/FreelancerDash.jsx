import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { DashboardIcon, FindProjectIcon, CompaniesIcon, ProposalsIcon } from "../components/NavIcons";
import FreelancerOverview    from "./freelancer/FreelancerOverview";
import FreelancerFindProject from "./freelancer/FreelancerFindProject";
import FreelancerCompanies   from "./freelancer/FreelancerCompanies";
import FreelancerProposals   from "./freelancer/FreelancerProposals";
import { storage } from "../utils/storage";
import "../styles.css";

const NAV_ITEMS = [
  { key: "overview",   label: "Dashboard",    path: "/freelancer/dashboard",    icon: () => <DashboardIcon /> },
  { key: "find",       label: "Find Project", path: "/freelancer/find-project", icon: () => <FindProjectIcon /> },
  { key: "companies",  label: "Companies",    path: "/freelancer/companies",    icon: () => <CompaniesIcon /> },
  { key: "proposals",  label: "My Proposals", path: "/freelancer/proposals",    icon: () => <ProposalsIcon /> },
];

export default function FreelancerDashboard({ page = "overview" }) {
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
      case "find":      return <FreelancerFindProject />;
      case "companies": return <FreelancerCompanies />;
      case "proposals": return <FreelancerProposals />;
      default:          return <FreelancerOverview user={user} />;
    }
  };

  return (
    <DashboardLayout user={user} navItems={NAV_ITEMS}>
      {renderPage()}
    </DashboardLayout>
  );
}
