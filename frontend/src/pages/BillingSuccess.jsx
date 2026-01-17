import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth, API } from "@/App";
import axios from "axios";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const BillingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [paymentInfo, setPaymentInfo] = useState(null);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const pollPaymentStatus = async (sessionId, attempts = 0) => {
      const maxAttempts = 10;
      const pollInterval = 2000;

      if (attempts >= maxAttempts) {
        setStatus("error");
        toast.error("Payment verification timed out. Please check your email for confirmation.");
        return;
      }

      try {
        const res = await axios.get(`${API}/billing/checkout-status/${sessionId}`);
        
        if (res.data.payment_status === "paid") {
          setStatus("success");
          setPaymentInfo(res.data);
          
          // Refresh user data
          const userRes = await axios.get(`${API}/auth/me`);
          updateUser(userRes.data);
          
          toast.success("Payment successful! Your plan has been upgraded.");
        } else if (res.data.status === "expired") {
          setStatus("error");
          toast.error("Payment session expired. Please try again.");
        } else {
          // Continue polling
          setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
        }
      } catch (err) {
        console.error("Error checking payment status", err);
        setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
      }
    };

    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      pollPaymentStatus(sessionId);
    } else {
      setStatus("error");
    }
  }, [searchParams, updateUser]);

  // Removed duplicate pollPaymentStatus - now inside useEffect
  const _pollPaymentStatusDummy = async (sessionId, attempts = 0) => {
    const maxAttempts = 10;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus("error");
      toast.error("Payment verification timed out. Please check your email for confirmation.");
      return;
    }

    try {
      const res = await axios.get(`${API}/billing/checkout-status/${sessionId}`);
      
      if (res.data.payment_status === "paid") {
        setStatus("success");
        setPaymentInfo(res.data);
        
        // Refresh user data
        const userRes = await axios.get(`${API}/auth/me`);
        updateUser(userRes.data);
        
        toast.success("Payment successful! Your plan has been upgraded.");
      } else if (res.data.status === "expired") {
        setStatus("error");
        toast.error("Payment session expired. Please try again.");
      } else {
        // Continue polling
        setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
      }
    } catch (err) {
      console.error("Error checking payment status", err);
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    }
  };

  const handleContinue = () => {
    // If user hasn't completed onboarding, go there first
    if (!user?.onboarding_completed) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {status === "loading" && (
          <>
            <div className="w-20 h-20 rounded-full border-4 border-[#d4af37]/30 border-t-[#d4af37] animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-3 text-white">
              Processing Payment...
            </h1>
            <p className="text-zinc-400">
              Please wait while we verify your payment.
            </p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-white">
              Payment Successful!
            </h1>
            <p className="text-zinc-400 mb-6">
              {user?.onboarding_completed 
                ? "Your plan has been upgraded. You now have access to all premium features."
                : "Welcome to ColdIQ! Let's set up your profile to get started."}
            </p>
            <Button
              onClick={handleContinue}
              className="bg-[#d4af37] hover:bg-[#c4a030] text-black font-semibold px-8"
              data-testid="continue-btn"
            >
              {user?.onboarding_completed ? "Go to Dashboard" : "Continue Setup"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-red-400">!</span>
            </div>
            <h1 className="text-2xl font-bold mb-3 text-white">
              Payment Issue
            </h1>
            <p className="text-zinc-400 mb-6">
              There was an issue verifying your payment. If you were charged, please contact support.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/pricing")}
                className="bg-[#d4af37] hover:bg-[#c4a030] text-black"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="border-zinc-700 text-white"
              >
                Go Home
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default BillingSuccess;
