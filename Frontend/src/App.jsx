import { BrowserRouter, useRoutes, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./pages/ProtectedRoute";
import Home               from "./pages/Home";
import Login              from "./pages/login";
import Register           from "./pages/register";
import Pricing            from "./pages/Pricing";
import Profile            from "./pages/Profile";
import PostJob            from "./pages/PostJob";
import MyJobs             from "./pages/MyJobs";
import ClientDashboard    from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDash";
import Careers            from "./pages/Careers";
import PrivacyPolicy      from "./pages/PrivacyPolicy";
import Help               from "./pages/Help";
import Blog               from "./pages/Blog";
import Events             from "./pages/Events";  
import Learn              from "./pages/Learn"; 
const P = (C, props = {}) => <ProtectedRoute><C {...props} /></ProtectedRoute>;
const routes = [
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/profile", element: P(Profile) },
  { path: "/post-job",element: P(PostJob) },
  { path: "/my-jobs", element: P(MyJobs) },
  { path: "/client/dashboard", element: P(ClientDashboard, { page: "overview" }) },
  { path: "/client/post-job",element: P(ClientDashboard, { page: "post"     }) },
  { path: "/client/my-jobs",element: P(ClientDashboard, { page: "myjobs"   }) },
  { path: "/client/find-freelancers", element: P(ClientDashboard, { page: "talent"   }) },
  { path: "/client/*", element: <Navigate to="/client/dashboard" replace /> },
  { path: "/freelancer/dashboard", element: P(FreelancerDashboard, { page: "overview"  }) },
  { path: "/freelancer/find-project", element: P(FreelancerDashboard, { page: "find"      }) },
  { path: "/freelancer/companies",element: P(FreelancerDashboard, { page: "companies" }) },
  { path: "/freelancer/proposals",element: P(FreelancerDashboard, { page: "proposals" }) },
  
  { path: "/careers", element: <Careers /> },
  { path: "/privacy", element: <PrivacyPolicy /> },
  { path: "/help", element: <Help /> },
  { path: "/blog", element: <Blog /> },
  { path: "/events", element: <Events /> },
  { path: "/learn", element: <Learn /> },

  { path: "/freelancer/*",element: <Navigate to="/freelancer/dashboard" replace /> },
];

function AppRoutes() { return useRoutes(routes); }

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
}