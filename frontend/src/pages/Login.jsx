import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";
import { Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await login(email, password);
      toast.success("Welcome back!");
      
      if (user.onboarding_completed) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      let message = "Invalid credentials";
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
    <div className="min-h-screen bg-theme flex flex-col lg:flex-row transition-colors duration-300">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-theme">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d4af37] flex items-center justify-center">
            <Mail className="w-4 h-4 text-black" />
          </div>
          <span className="text-lg font-semibold tracking-tight font-sans">ColdIQ</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 lg:py-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:mb-10">
            <Link to="/" className="inline-flex items-center gap-2 text-theme-muted hover:text-theme transition-colors mb-6 lg:mb-10 text-sm font-mono tracking-wide uppercase">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            
            <div className="hidden lg:flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#d4af37] flex items-center justify-center">
                <Mail className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-semibold tracking-tight font-sans">ColdIQ</span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl tracking-tight mb-2 sm:mb-3">Welcome back</h1>
            <p className="text-theme-muted text-sm sm:text-base">Sign in to continue analyzing your cold emails</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" data-testid="login-form">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-mono tracking-widest uppercase text-theme-muted">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-transparent border-b border-theme focus:border-[#d4af37] text-theme px-0 py-3 sm:py-4 outline-none transition-colors placeholder:text-theme-dim font-mono text-sm"
                data-testid="login-email-input"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-mono tracking-widest uppercase text-theme-muted">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-b border-theme focus:border-[#d4af37] text-theme px-0 py-3 sm:py-4 pr-10 outline-none transition-colors placeholder:text-theme-dim font-mono text-sm"
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-theme-dim hover:text-theme transition-colors p-2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-4 sm:py-5 h-auto transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] mt-6 sm:mt-8"
              data-testid="login-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          
          <p className="mt-6 sm:mt-8 text-theme-muted text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#d4af37] hover:text-[#b5952f] font-medium transition-colors" data-testid="login-signup-link">
              Sign up
            </Link>
          </p>
          <p className="mt-3">
            <Link to="/forgot-password" className="text-theme-dim hover:text-theme-muted text-sm transition-colors" data-testid="forgot-password-link">
              Forgot your password?
            </Link>
          </p>
        </motion.div>
      </div>
      
      {/* Right Side - Visual (Desktop only) */}
      <div className="hidden lg:flex flex-1 bg-theme-secondary items-center justify-center relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 border border-theme" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 border border-[#d4af37]/20" />
        <div className="relative z-10 text-center px-12">
          <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-6">The Precision Advantage</p>
          <p className="font-serif text-3xl text-theme-muted leading-relaxed">
            "Every word in your cold email either <span className="text-theme">opens doors</span> or <span className="text-theme-dim">closes them</span>."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
