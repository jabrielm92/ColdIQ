import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Mail, Zap, Plus, Trash2, RefreshCw, Sparkles, Lock,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";

const SequenceAnalyzer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emails, setEmails] = useState([
    { id: 1, subject: "", body: "", label: "Initial Outreach" },
    { id: 2, subject: "", body: "", label: "Follow-up #1" }
  ]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [expandedEmail, setExpandedEmail] = useState(1);

  const userTier = user?.subscription_tier || "free";
  const hasProFeatures = ["pro", "agency", "growth_agency"].includes(userTier);

  // Locked state for non-Pro users
  if (!hasProFeatures) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-3">Sequence Analysis</p>
              <h1 className="font-serif text-4xl tracking-tight mb-2">Analyze Email Sequences</h1>
              <p className="text-zinc-500">Optimize your multi-touch outreach</p>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 p-12 text-center">
              <Lock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Pro Feature</h2>
              <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                Sequence analysis helps you optimize entire email sequences, not just individual emails.
                Find repetition, improve flow, and maximize response rates across your follow-up cadence.
              </p>
              <Link 
                to="/pricing"
                className="inline-flex items-center gap-2 bg-[#d4af37] text-black px-6 py-3 font-bold text-xs uppercase tracking-wider hover:bg-[#b5952f] transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const addEmail = () => {
    const newId = Math.max(...emails.map(e => e.id)) + 1;
    setEmails([...emails, { 
      id: newId, 
      subject: "", 
      body: "", 
      label: `Follow-up #${emails.length}` 
    }]);
    setExpandedEmail(newId);
  };

  const removeEmail = (id) => {
    if (emails.length <= 2) {
      toast.error("Sequence must have at least 2 emails");
      return;
    }
    setEmails(emails.filter(e => e.id !== id));
  };

  const updateEmail = (id, field, value) => {
    setEmails(emails.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleAnalyze = async () => {
    // Validate
    const emptyEmails = emails.filter(e => !e.subject.trim() || !e.body.trim());
    if (emptyEmails.length > 0) {
      toast.error("Please fill in all email subjects and bodies");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const res = await axios.post(`${API}/analysis/sequence`, {
        emails: emails.map(e => ({
          subject: e.subject,
          body: e.body,
          position: emails.indexOf(e) + 1
        }))
      });
      setAnalysis(res.data);
      toast.success("Sequence analysis complete!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8" data-testid="sequence-page">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-3">Sequence Analysis</p>
            <h1 className="font-serif text-4xl tracking-tight mb-2">
              Analyze Email Sequences
            </h1>
            <p className="text-zinc-500">Optimize your multi-touch cold outreach cadence</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
                  Your Sequence ({emails.length} emails)
                </h2>
                <Button
                  onClick={addEmail}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none"
                  disabled={emails.length >= 5}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Email
                </Button>
              </div>

              <div className="space-y-3">
                {emails.map((email, index) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/50 border border-zinc-800 overflow-hidden"
                  >
                    {/* Header */}
                    <div 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-800/50"
                      onClick={() => setExpandedEmail(expandedEmail === email.id ? null : email.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-xs font-mono">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium">{email.label}</span>
                        {email.subject && (
                          <span className="text-xs text-zinc-500 truncate max-w-[150px]">
                            {email.subject}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {emails.length > 2 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeEmail(email.id); }}
                            className="p-1 text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {expandedEmail === email.id ? (
                          <ChevronUp className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedEmail === email.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-zinc-800"
                        >
                          <div className="p-4 space-y-4">
                            <div className="space-y-2">
                              <Label className="text-xs text-zinc-500">Subject Line</Label>
                              <Input
                                value={email.subject}
                                onChange={(e) => updateEmail(email.id, 'subject', e.target.value)}
                                placeholder={index === 0 ? "Initial subject..." : `Follow-up subject...`}
                                className="bg-zinc-800/50 border-zinc-700 focus:border-[#d4af37] rounded-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-zinc-500">Email Body</Label>
                              <Textarea
                                value={email.body}
                                onChange={(e) => updateEmail(email.id, 'body', e.target.value)}
                                placeholder="Write your email..."
                                className="bg-zinc-800/50 border-zinc-700 focus:border-[#d4af37] rounded-none min-h-[120px]"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs h-12"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Sequence...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Full Sequence
                  </>
                )}
              </Button>
            </div>

            {/* Results Section */}
            <div>
              {loading ? (
                <div className="bg-zinc-900/50 border border-zinc-800 p-8 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-16 h-16 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mb-4" />
                  <p className="text-zinc-400">Analyzing your sequence...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className={`p-6 border ${
                    analysis.overall_score >= 70 ? 'bg-emerald-500/10 border-emerald-500/20' :
                    analysis.overall_score >= 50 ? 'bg-[#d4af37]/10 border-[#d4af37]/20' : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Sequence Score</p>
                    <div className="flex items-end gap-4">
                      <span className={`text-5xl font-mono font-bold ${
                        analysis.overall_score >= 70 ? 'text-emerald-400' :
                        analysis.overall_score >= 50 ? 'text-[#d4af37]' : 'text-red-400'
                      }`}>
                        {analysis.overall_score}
                      </span>
                      <div className="pb-2">
                        <p className="text-sm text-zinc-400">
                          {analysis.overall_score >= 70 ? 'Strong sequence' :
                           analysis.overall_score >= 50 ? 'Needs improvement' : 'Major issues found'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Key Insight */}
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-medium text-indigo-400">Sequence Insight</span>
                    </div>
                    <p className="text-zinc-300">{analysis.key_insight}</p>
                  </div>

                  {/* Issues */}
                  {analysis.issues && analysis.issues.length > 0 && (
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Issues Found
                      </h3>
                      <ul className="space-y-2">
                        {analysis.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-amber-400 mt-1">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Email-by-Email Scores */}
                  <div className="bg-zinc-900/50 border border-zinc-800 p-4">
                    <h3 className="text-sm font-medium mb-3">Email-by-Email</h3>
                    <div className="space-y-2">
                      {analysis.email_scores?.map((score, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/50">
                          <span className="text-sm">Email {i + 1}</span>
                          <span className={`font-mono font-bold ${
                            score >= 70 ? 'text-emerald-400' :
                            score >= 50 ? 'text-[#d4af37]' : 'text-red-400'
                          }`}>
                            {score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-emerald-400 font-medium">{i + 1}.</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-900/50 border border-zinc-800 p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                  <Mail className="w-12 h-12 text-zinc-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Ready to Analyze</h3>
                  <p className="text-zinc-400 text-sm max-w-xs">
                    Add your email sequence on the left, then click "Analyze Full Sequence" to get insights.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SequenceAnalyzer;
