import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth, API } from "@/App";
import axios from "axios";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";

const BillingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [paymentInfo, setPaymentInfo] = useState(null);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      pollPaymentStatus(sessionId);
    } else {
      setStatus("error");
    }
  }, [searchParams]);

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

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]" data-testid="billing-success-page">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          {status === "loading" && (
            <>
              <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
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
              <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
                Payment Successful!
              </h1>
              <p className="text-zinc-400 mb-6">
                Your plan has been upgraded. You now have access to all premium features.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate("/analyze")}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary"
                  data-testid="start-analyzing-btn"
                >
                  Start Analyzing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="border-zinc-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
          
          {status === "error" && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">!</span>
              </div>
              <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
                Payment Issue
              </h1>
              <p className="text-zinc-400 mb-6">
                There was an issue verifying your payment. If you were charged, please contact support.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate("/pricing")}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="border-zinc-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default BillingSuccess;
