import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth, API } from "@/App";
import { Mail, Briefcase, Building2, MailCheck, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [volume, setVolume] = useState("");
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: "salesperson", label: "Salesperson", icon: <Briefcase className="w-5 h-5" /> },
    { id: "founder", label: "Founder / CEO", icon: <Building2 className="w-5 h-5" /> },
    { id: "recruiter", label: "Recruiter", icon: <Mail className="w-5 h-5" /> },
    { id: "marketer", label: "Marketer", icon: <MailCheck className="w-5 h-5" /> },
    { id: "other", label: "Other", icon: <Briefcase className="w-5 h-5" /> }
  ];

  const industries = [
    "SaaS / Software", "E-commerce", "Recruiting / HR", "Marketing Agency",
    "Consulting", "Finance / Banking", "Healthcare", "Real Estate", "Other"
  ];

  const volumes = [
    { id: "1-50", label: "1-50 emails/month" },
    { id: "50-200", label: "50-200 emails/month" },
    { id: "200-500", label: "200-500 emails/month" },
    { id: "500+", label: "500+ emails/month" }
  ];

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/onboarding`, {
        role,
        target_industry: industry,
        monthly_email_volume: volume
      });
      updateUser(res.data.user);
      toast.success("Setup complete!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to complete setup");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return role !== "";
    if (step === 2) return industry !== "";
    if (step === 3) return volume !== "";
    return false;
  };

  const stepContent = {
    1: {
      title: "What's your role?",
      subtitle: "This helps us personalize your email analysis"
    },
    2: {
      title: "What industry do you target?",
      subtitle: "We'll tailor recommendations for your market"
    },
    3: {
      title: "How many cold emails do you send?",
      subtitle: "We'll recommend the right plan for you"
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
        className="w-full max-w-lg relative z-10"
      >
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                s < step ? 'bg-indigo-500 text-white' :
                s === step ? 'bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500' :
                'bg-zinc-800 text-zinc-500'
              }`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 mx-1 ${s < step ? 'bg-indigo-500' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>{stepContent[step].title}</h1>
          <p className="text-zinc-400">{stepContent[step].subtitle}</p>
        </div>
        
        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 gap-3"
              data-testid="onboarding-step-1"
            >
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    role === r.id 
                      ? 'border-indigo-500 bg-indigo-500/10' 
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                  }`}
                  data-testid={`role-${r.id}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    role === r.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {r.icon}
                  </div>
                  <span className="font-medium">{r.label}</span>
                  {role === r.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          )}
          
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 gap-3"
              data-testid="onboarding-step-2"
            >
              {industries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setIndustry(ind)}
                  className={`p-4 rounded-xl border transition-all text-left text-sm ${
                    industry === ind 
                      ? 'border-indigo-500 bg-indigo-500/10' 
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                  }`}
                  data-testid={`industry-${ind.toLowerCase().replace(/[^a-z]/g, '-')}`}
                >
                  {ind}
                </button>
              ))}
            </motion.div>
          )}
          
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 gap-3"
              data-testid="onboarding-step-3"
            >
              {volumes.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVolume(v.id)}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    volume === v.id 
                      ? 'border-indigo-500 bg-indigo-500/10' 
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                  }`}
                  data-testid={`volume-${v.id}`}
                >
                  <span className="font-medium">{v.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="text-zinc-400"
            data-testid="onboarding-back-btn"
          >
            Back
          </Button>
          
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary"
              data-testid="onboarding-next-btn"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || loading}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary"
              data-testid="onboarding-complete-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
