import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Mail, Zap, Copy, Check, ArrowRight, RefreshCw, 
  ThumbsUp, ThumbsDown, Sparkles, AlertCircle, Target, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";

const Analyzer = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState({ subject: false, body: false });
  const [showOptimized, setShowOptimized] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !body.trim()) {
      toast.error("Please enter both subject and body");
      return;
    }
    
    setLoading(true);
    setAnalysis(null);
    
    try {
      const res = await axios.post(`${API}/analysis/analyze`, {
        subject,
        body,
        target_industry: targetIndustry || user?.target_industry || null,
        target_role: user?.role || null
      });
      setAnalysis(res.data);
      toast.success("Analysis complete!");
    } catch (err) {
      const message = err.response?.data?.detail || "Analysis failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    await navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
    toast.success(`${type === 'subject' ? 'Subject' : 'Email'} copied!`);
    setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
  };

  const submitFeedback = async (feedback) => {
    if (!analysis) return;
    try {
      await axios.patch(`${API}/analysis/${analysis.id}/feedback`, { feedback });
      toast.success("Thanks for your feedback!");
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 71) return "text-[#a3e635]";
    if (score >= 41) return "text-[#d4af37]";
    return "text-red-500";
  };

  const getScoreBgColor = (score) => {
    if (score >= 71) return "bg-[#a3e635]/10 border-[#a3e635]/20";
    if (score >= 41) return "bg-[#d4af37]/10 border-[#d4af37]/20";
    return "bg-red-500/10 border-red-500/20";
  };

  const resetForm = () => {
    setSubject("");
    setBody("");
    setAnalysis(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8" data-testid="analyzer-page">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-3">Email Analysis</p>
            <h1 className="font-serif text-4xl tracking-tight mb-2">
              Analyze Your Email
            </h1>
            <p className="text-zinc-500">Paste your cold email to get AI-powered feedback and optimization</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <form onSubmit={handleAnalyze} className="space-y-5" data-testid="analyzer-form">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-zinc-300">Subject Line</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Quick question about {{company}}'s growth..."
                    className="bg-zinc-900/50 border-zinc-800 focus:border-[#d4af37] h-11 rounded-none"
                    disabled={loading}
                    data-testid="email-subject-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="body" className="text-zinc-300">Email Body</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Hi {{first_name}},&#10;&#10;I noticed that..."
                    className="bg-zinc-900/50 border-zinc-800 focus:border-[#d4af37] min-h-[200px] resize-none rounded-none"
                    disabled={loading}
                    data-testid="email-body-input"
                  />
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{body.split(/\s+/).filter(Boolean).length} words</span>
                    <span>Recommended: 60-100 words</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-zinc-300">Target Industry (optional)</Label>
                  <Input
                    id="industry"
                    value={targetIndustry}
                    onChange={(e) => setTargetIndustry(e.target.value)}
                    placeholder="e.g., SaaS, E-commerce, Healthcare"
                    className="bg-zinc-900/50 border-zinc-800 focus:border-[#d4af37] h-11 rounded-none"
                    disabled={loading}
                    data-testid="email-industry-input"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    type="submit"
                    disabled={loading || !subject.trim() || !body.trim()}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary h-11"
                    data-testid="analyze-btn"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze Email
                      </>
                    )}
                  </Button>
                  
                  {analysis && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="border-zinc-700 hover:bg-zinc-800"
                      data-testid="reset-btn"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </form>
            </div>
            
            {/* Results Section */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]"
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4" />
                    <p className="text-zinc-400 text-center">Analyzing your email with AI...</p>
                    <p className="text-zinc-500 text-sm mt-2">This may take a few seconds</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                    data-testid="analysis-results"
                  >
                    {/* Score Card */}
                    <div className={`bg-gradient-to-br ${getScoreBgColor(analysis.analysis_score)} border border-zinc-800 rounded-xl p-6`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg" style={{ fontFamily: 'Manrope' }}>Overall Score</h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => submitFeedback('helpful')}
                            className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-emerald-400 transition-colors"
                            data-testid="feedback-helpful-btn"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => submitFeedback('not_helpful')}
                            className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-red-400 transition-colors"
                            data-testid="feedback-not-helpful-btn"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-end gap-6">
                        <div className={`text-6xl font-bold ${getScoreColor(analysis.analysis_score)}`} style={{ fontFamily: 'JetBrains Mono' }} data-testid="analysis-score">
                          {analysis.analysis_score}
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4 pb-2">
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Est. Response Rate</p>
                            <p className="font-semibold text-cyan-400" style={{ fontFamily: 'JetBrains Mono' }}>{analysis.estimated_response_rate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Est. Open Rate</p>
                            <p className="font-semibold text-violet-400" style={{ fontFamily: 'JetBrains Mono' }}>{analysis.estimated_open_rate}%</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sub-scores */}
                      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
                        <div className="text-center">
                          <p className="text-xs text-zinc-500 mb-1">Personalization</p>
                          <p className="font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>{analysis.personalization_score}/10</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-zinc-500 mb-1">Value Prop</p>
                          <p className="font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>{analysis.value_proposition_clarity}/10</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-zinc-500 mb-1">CTA Strength</p>
                          <p className="font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>{analysis.cta_score}/10</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Key Insight */}
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium text-indigo-400">Key Insight</span>
                      </div>
                      <p className="text-zinc-200" data-testid="key-insight">{analysis.key_insight}</p>
                    </div>
                    
                    {/* Strengths & Weaknesses */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {analysis.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                              <span className="text-emerald-400 mt-1">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          Areas to Improve
                        </h4>
                        <ul className="space-y-2">
                          {analysis.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                              <span className="text-amber-400 mt-1">•</span>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Improvements */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-cyan-400" />
                        Specific Improvements
                      </h4>
                      <ul className="space-y-2">
                        {analysis.improvements.map((imp, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-cyan-400 font-medium">{i + 1}.</span>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Optimized Version */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                        <h4 className="font-medium flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-violet-400" />
                          Optimized Version
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={showOptimized ? "default" : "ghost"}
                            onClick={() => setShowOptimized(true)}
                            className={showOptimized ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30" : "text-zinc-400"}
                          >
                            Optimized
                          </Button>
                          <Button
                            size="sm"
                            variant={!showOptimized ? "default" : "ghost"}
                            onClick={() => setShowOptimized(false)}
                            className={!showOptimized ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30" : "text-zinc-400"}
                          >
                            Original
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-zinc-500 text-xs">Subject</Label>
                            <button
                              onClick={() => copyToClipboard(showOptimized ? analysis.rewritten_subject : subject, 'subject')}
                              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              data-testid="copy-subject-btn"
                            >
                              {copied.subject ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              {copied.subject ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <p className="bg-zinc-800/50 rounded-lg p-3 text-sm" style={{ fontFamily: 'JetBrains Mono' }} data-testid="optimized-subject">
                            {showOptimized ? analysis.rewritten_subject : subject}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-zinc-500 text-xs">Body</Label>
                            <button
                              onClick={() => copyToClipboard(showOptimized ? analysis.rewritten_body : body, 'body')}
                              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              data-testid="copy-body-btn"
                            >
                              {copied.body ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              {copied.body ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <div className="bg-zinc-800/50 rounded-lg p-3 text-sm whitespace-pre-wrap" style={{ fontFamily: 'JetBrains Mono' }} data-testid="optimized-body">
                            {showOptimized ? analysis.rewritten_body : body}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-zinc-500" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'Manrope' }}>Ready to Analyze</h3>
                    <p className="text-zinc-400 text-sm max-w-xs">
                      Enter your cold email subject and body to get AI-powered feedback and optimization suggestions.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analyzer;
