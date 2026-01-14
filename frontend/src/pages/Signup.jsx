import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/App";
import { Mail, ArrowLeft, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Contains a number", valid: /\d/.test(password) }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setLoading(true);
    
    try {
      await signup(email, password, fullName);
      toast.success("Account created successfully!");
      navigate("/onboarding");
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to create account";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tighter" style={{ fontFamily: 'Manrope' }}>ColdIQ</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>Create your account</h1>
          <p className="text-zinc-400">Start writing cold emails that convert</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5" data-testid="signup-form">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-zinc-300">Full name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Smith"
              required
              className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 h-11"
              data-testid="signup-name-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 h-11"
              data-testid="signup-email-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 h-11 pr-10"
                data-testid="signup-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-2">
              {passwordChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${check.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className={check.valid ? 'text-zinc-300' : 'text-zinc-500'}>{check.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 h-11 glow-primary"
            data-testid="signup-submit-btn"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create account"
            )}
          </Button>
        </form>
        
        <p className="mt-6 text-center text-zinc-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium" data-testid="signup-login-link">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
