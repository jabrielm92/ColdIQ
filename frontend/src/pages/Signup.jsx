import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
      let message = "Failed to create account";
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail[0]?.msg || "Validation error";
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-[#0a0a0a] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-[#d4af37]/5 to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 border border-zinc-800/50" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 border border-[#d4af37]/20" />
        <div className="relative z-10 text-center px-12">
          <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-6">Join The Elite</p>
          <p className="font-serif text-3xl text-zinc-400 leading-relaxed">
            "The difference between <span className="text-white">average</span> and <span className="text-[#d4af37]">exceptional</span> is in the details."
          </p>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-10 text-sm font-mono tracking-wide uppercase">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#d4af37] flex items-center justify-center">
                <Mail className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-semibold tracking-tight font-sans">ColdIQ</span>
            </div>
            
            <h1 className="font-serif text-4xl tracking-tight mb-3">Create your account</h1>
            <p className="text-zinc-500">Start writing cold emails that convert</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="signup-form">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-xs font-mono tracking-widest uppercase text-zinc-500">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                required
                className="w-full bg-transparent border-b border-zinc-800 focus:border-[#d4af37] text-white px-0 py-4 outline-none transition-colors placeholder:text-zinc-700 font-mono text-sm"
                data-testid="signup-name-input"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-mono tracking-widest uppercase text-zinc-500">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-transparent border-b border-zinc-800 focus:border-[#d4af37] text-white px-0 py-4 outline-none transition-colors placeholder:text-zinc-700 font-mono text-sm"
                data-testid="signup-email-input"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-mono tracking-widest uppercase text-zinc-500">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-b border-zinc-800 focus:border-[#d4af37] text-white px-0 py-4 pr-10 outline-none transition-colors placeholder:text-zinc-700 font-mono text-sm"
                  data-testid="signup-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                {passwordChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 flex items-center justify-center ${check.valid ? 'bg-[#a3e635]/20 text-[#a3e635]' : 'bg-zinc-800 text-zinc-600'}`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className={check.valid ? 'text-zinc-300' : 'text-zinc-600'}>{check.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-5 h-auto transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] mt-8"
              data-testid="signup-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                "Create account"
              )}
            </Button>
          </form>
          
          <p className="mt-8 text-zinc-500 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-[#d4af37] hover:text-[#b5952f] font-medium transition-colors" data-testid="signup-login-link">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
