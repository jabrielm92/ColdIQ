import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { API } from "@/App";
import axios from "axios";
import { Mail, Check, X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    } else {
      setStatus("error");
      setMessage("No verification token provided");
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const res = await axios.post(`${API}/auth/verify-email`, { token });
      setStatus("success");
      setMessage(res.data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.detail || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px]" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md relative z-10"
      >
        {status === "loading" && (
          <>
            <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
              Verifying your email...
            </h1>
            <p className="text-zinc-400">Please wait</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
              Email Verified!
            </h1>
            <p className="text-zinc-400 mb-8">{message}</p>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary">
                Continue to Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
              Verification Failed
            </h1>
            <p className="text-zinc-400 mb-8">{message}</p>
            <div className="flex flex-col gap-3">
              <Link to="/login">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600">
                  Go to Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" className="w-full border-zinc-700">
                  Create New Account
                </Button>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
