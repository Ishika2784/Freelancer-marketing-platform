import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import axios from "axios";

function Pricing(){
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handlePlan = async(plan)=>{
    try{
        const token = localStorage.getItem("token");
        if(!token){
            alert("Please login first");
            navigate("/login");
            return;
        }
        setLoading(true);

        if(plan==="free"){
            await axios.post("http://localhost:5000/api/user/updateplan",
                {plan:"free"}
            ,{
                headers:{
                    Authorization: `Bearer ${token}`
            }
          }
        );

        const userRes= await axios.get("http://localhost:5000/api/auth/me",{
            headers:{
                Authorization: `Bearer ${token}`
            }
        });
        const user = userRes.data;

        if(user.plan){
            navigate("/client/dashboard");
        }
        return;
    }

    const response = await axios.post("http://localhost:5000/api/payment/createorder",
        { plan },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const order = response.data;

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
        alert("Razorpay key configuration is missing!");
        return;
    }

    const options ={
        key : razorpayKey,
        amount:order.amount,
        currency:"INR",
        name: "Freelancer Marketing Platform",
        description: `${plan} Plan`,
        order_id:order.id,

        handler:async function(response){
            console.log("STEP 1: Handler triggered", response);
            const res = await axios.post("http://localhost:5000/api/payment/verify",
                {
                    ...response,
                    plan
                },
                {
                    headers:{
                        Authorization: `Bearer ${token}`
                    }
                }
            );
               console.log("STEP 2: Verify success", res.data);
               console.log("Updated user:", res.data.user);

                alert("Payment successful! Plan upgraded.");
                // You can now use `res.data.user` to update any local state if needed
                navigate("/client/dashboard");
            }
        
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
    }
    catch(error){
        console.log(error);
        alert("something went wrong");
    }
};
return(
    <div className="pricing-page">
        <div className="pricing-hero">
            <h1>Choose Your Plan</h1>
            <p>Start free, upgrade when you're ready</p>
        </div>
        <div className="pricing-grid">
            <div className="price-card">
                <h3 className="price-name">Free</h3>
                <h2 className="price-amount">₹0</h2>
                <div className="price-period">per month</div>
                <div className="price-divider"></div>
                <ul className="price-features">
                    <li>Limited access</li>
                    <li>Basic features</li>
                    <li>Profile listings</li>
                </ul>
                <button className="price-btn price-btn-free" onClick={() => handlePlan("free")} disabled={loading}>
                    {loading ? "Processing..." : "Continue Free"}
                </button>
            </div>
            <div className="price-card popular">
                <h3 className="price-name">Pro</h3>
                <h2 className="price-amount">₹299</h2>
                <div className="price-period">per month</div>
                <div className="price-divider"></div>
                <ul className="price-features">
                    <li>Unlimited access</li>
                    <li>Priority support</li>
                    <li>Better visibility</li>
                    <li>AI Matching</li>
                </ul>
                <button className="price-btn price-btn-pro" onClick={() => handlePlan("pro")} disabled={loading}>
                    {loading ? "Processing..." : "Upgrade Now "}
                </button>
            </div>
        </div>
    </div>
);
  
}
export default Pricing;