import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";
import { Mail, ArrowLeft, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import EmailOTPVerification from "@/components/EmailOTPVerification";

const Signup = () => {
  const [step, setStep] = useState("signup"); // "signup" | "verify"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
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
      const result = await signup(email, password, fullName);
      // Get token from localStorage (set by signup)
      const authToken = localStorage.getItem("coldiq_token");
      setToken(authToken);
      toast.success("Account created! Please verify your email.");
      setStep("verify");
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

  const handleEmailVerified = () => {
    toast.success("Email verified! Let's set up your profile.");
    navigate("/onboarding");
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

      {/* Left Side - Visual (Desktop only) */}
      <div className="hidden lg:flex flex-1 bg-theme-secondary items-center justify-center relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <ThemeToggle />
        </div>
        <div className="absolute inset-0 bg-gradient-to-bl from-[#d4af37]/5 to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 border border-theme" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 border border-[#d4af37]/20" />
        <div className="relative z-10 text-center px-12">
          <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-6">Join The Elite</p>
          <p className="font-serif text-3xl text-theme-muted leading-relaxed">
            "The difference between <span className="text-theme">average</span> and <span className="text-[#d4af37]">exceptional</span> is in the details."
          </p>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 lg:py-0">
        <AnimatePresence mode="wait">
          {step === "signup" ? (
            <motion.div 
              key="signup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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
                
                <h1 className="font-serif text-3xl sm:text-4xl tracking-tight mb-2 sm:mb-3">Create your account</h1>
                <p className="text-theme-muted text-sm sm:text-base">Start writing cold emails that convert</p>
                
                {/* Progress indicator */}
                <div className="flex items-center gap-2 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#d4af37] flex items-center justify-center text-black text-sm font-bold">1</div>
                    <span className="text-sm font-medium">Account</span>
                  </div>
                  <div className="flex-1 h-px bg-theme-tertiary" />
                  <div className="flex items-center gap-2 opacity-50">
                    <div className="w-8 h-8 border border-theme flex items-center justify-center text-theme-dim text-sm">2</div>
                    <span className="text-sm text-theme-dim">Verify Email</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" data-testid="signup-form">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-xs font-mono tracking-widest uppercase text-theme-muted">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Smith"
                    required
                    className="w-full bg-transparent border-b border-theme focus:border-[#d4af37] text-theme px-0 py-3 sm:py-4 outline-none transition-colors placeholder:text-theme-dim font-mono text-sm"
                    data-testid="signup-name-input"
                  />
                </div>
                
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
                    data-testid="signup-email-input"
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
                      data-testid="signup-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-theme-dim hover:text-theme transition-colors p-2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4">
                    {passwordChecks.map((check, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 flex items-center justify-center ${check.valid ? 'bg-[#a3e635]/20 text-[#a3e635]' : 'bg-theme-tertiary text-theme-dim'}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className={check.valid ? 'text-theme-muted' : 'text-theme-dim'}>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-theme-dim">
                  By signing up, you agree to our{" "}
                  <Link to="/terms" className="text-[#d4af37] hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-[#d4af37] hover:underline">Privacy Policy</Link>.
                </p>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-4 sm:py-5 h-auto transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] mt-6 sm:mt-8"
                  data-testid="signup-submit-btn"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    "Continue to Phone Verification"
                  )}
                </Button>
              </form>
              
              <p className="mt-6 sm:mt-8 text-theme-muted text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-[#d4af37] hover:text-[#b5952f] font-medium transition-colors" data-testid="signup-login-link">
                  Sign in
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <div className="mb-8">
                <button 
                  onClick={() => setStep("signup")}
                  className="inline-flex items-center gap-2 text-theme-muted hover:text-theme transition-colors mb-6 text-sm font-mono tracking-wide uppercase"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                
                {/* Progress indicator */}
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center gap-2 opacity-50">
                    <div className="w-8 h-8 bg-[#a3e635] flex items-center justify-center text-black text-sm font-bold">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-theme-muted">Account</span>
                  </div>
                  <div className="flex-1 h-px bg-[#a3e635]" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#d4af37] flex items-center justify-center text-black text-sm font-bold">2</div>
                    <span className="text-sm font-medium">Verify Email</span>
                  </div>
                </div>
              </div>
              
              <EmailOTPVerification 
                onVerified={handleEmailVerified}
                token={token}
                userEmail={email}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Signup;
