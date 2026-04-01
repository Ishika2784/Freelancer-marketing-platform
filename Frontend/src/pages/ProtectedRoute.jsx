import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { storage } from "../utils/storage";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token") || storage.getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setLoading(false);
      } catch {
        sessionStorage.clear();
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        
        // Also clear your custom storage utility!
        if (storage.clearAuth) storage.clearAuth();
        else if (storage.clear) storage.clear();
        
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;

  return children;
}

export default ProtectedRoute;
// import {useEffect,useState} from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import ClientDashboard from './ClientDashboard';
// import FreelancerDash from './FreelancerDash';
// import "../index.css";

// function Dashboard() {
//     const [user, setUser] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchUser = async () => {
//             const token = localStorage.getItem("token");
//             if (!token) {
//                 navigate('/login');
//                 return;
//             }
//             try {
//                 const response = await axios.get("http://localhost:5000/api/auth/me", {
//                         headers:{
//                             Authorization: `Bearer ${token}`
//                         }
//                     }
//                 );
//                 setUser(response.data);
//             } catch (error) {
//                 console.error("Error fetching user data:", error);
//                 // If the token is expired or invalid, log them out and redirect
//                 if (error.response && (error.response.status === 401 || error.response.status === 400)) {
//                     localStorage.removeItem("token");
//                     navigate('/login');
//                 }
//             }
//         };
//         fetchUser();
//     }, [navigate]);
//         if (!user) {
//             return <p>Loading...</p>;
//         }
//         if (user.role === "freelancer"){
//             return <FreelancerDash user={user} />;
//         }
//         if (user.role === "client"){
//             return <ClientDashboard user={user} />;
//         }
//         return <p>Invalid role</p>;
//     }
// // return(
// //     <div className="dashboard">
// //   <h2>Welcome {user.name}</h2>
// //   <p className="plan">Plan: {user.plan}</p>

// //   {user.plan === "free" ? (
// //     <>
// //       <p className="feature">You can view limited jobs</p>

// //       <p className="locked">
// //         Unlimited jobs (Pro only)
// //       </p>

// //       <button
// //         className="upgrade-btn"
// //         onClick={() => window.location.href = "/pricing"}
// //       >
// //         Upgrade to Pro 
// //       </button>
// //     </>
// //   ) : (
// //     <>
// //       <p className="feature">Unlimited job access</p>
// //       <p className="feature"> Priority support</p>
// //     </>
// //   )}
// // </div>
// // );

// export default Dashboard;
                    