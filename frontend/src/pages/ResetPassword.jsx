import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API } from "@/App";
import axios from "axios";
import { Mail, ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Passwords match", valid: password === confirmPassword && password.length > 0 }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post(`${API}/auth/reset-password`, {
        token,
        new_password: password
      });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to reset password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-3">Invalid Reset Link</h1>
          <p className="text-zinc-400 mb-6">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password">
            <Button className="bg-gradient-to-r from-indigo-600 to-violet-600">
              Request New Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md relative z-10"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
            Password Reset!
          </h1>
          <p className="text-zinc-400 mb-8">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <Link to="/login">
            <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary">
              Go to Login
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px]" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tighter" style={{ fontFamily: 'Manrope' }}>ColdIQ</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>Reset your password</h1>
          <p className="text-zinc-400">Enter your new password below</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5" data-testid="reset-password-form">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 h-11 pr-10"
                data-testid="reset-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-zinc-300">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 h-11"
              data-testid="reset-confirm-input"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            {passwordChecks.map((check, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${check.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className={check.valid ? 'text-zinc-300' : 'text-zinc-500'}>{check.label}</span>
              </div>
            ))}
          </div>
          
          <Button 
            type="submit" 
            disabled={loading || password.length < 8 || password !== confirmPassword}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 h-11 glow-primary"
            data-testid="reset-submit-btn"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
