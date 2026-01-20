import React, { useState } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Zap, AlertTriangle, Clock, Target, Wand2, Users, FileText, 
  PenTool, Copy, Check, ChevronDown, ChevronUp, Lock, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";

const Tools = () => {
  const { user } = useAuth();
  const userTier = user?.subscription_tier || "free";
  const hasStarter = ["starter", "pro", "agency", "growth_agency"].includes(userTier);
  const hasPro = ["pro", "agency", "growth_agency"].includes(userTier);

  // Spam Checker State
  const [spamText, setSpamText] = useState("");
  const [spamResult, setSpamResult] = useState(null);
  const [spamLoading, setSpamLoading] = useState(false);

  // Subject Variants State
  const [variantSubject, setVariantSubject] = useState("");
  const [variants, setVariants] = useState(null);
  const [variantLoading, setVariantLoading] = useState(false);

  // Tone Customizer State
  const [toneText, setToneText] = useState("");
  const [selectedTone, setSelectedTone] = useState("friendly");
  const [toneResult, setToneResult] = useState(null);
  const [toneLoading, setToneLoading] = useState(false);

  // Sequence Builder State
  const [sequenceEmail, setSequenceEmail] = useState("");
  const [sequenceSubject, setSequenceSubject] = useState("");
  const [sequence, setSequence] = useState(null);
  const [sequenceLoading, setSequenceLoading] = useState(false);

  // Competitor Analysis State
  const [competitorEmail, setCompetitorEmail] = useState("");
  const [competitorResult, setCompetitorResult] = useState(null);
  const [competitorLoading, setCompetitorLoading] = useState(false);

  // Signature Analysis State
  const [signature, setSignature] = useState("");
  const [signatureResult, setSignatureResult] = useState(null);
  const [signatureLoading, setSignatureLoading] = useState(false);

  // Send Time State
  const [sendTimeIndustry, setSendTimeIndustry] = useState("saas");
  const [sendTimeResult, setSendTimeResult] = useState(null);

  const [copied, setCopied] = useState(null);

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const checkSpam = async () => {
    if (!spamText.trim()) return toast.error("Enter email text");
    setSpamLoading(true);
    try {
      const res = await axios.post(`${API}/tools/spam-check`, { body: spamText });
      setSpamResult(res.data);
    } catch (err) {
      toast.error("Failed to check spam");
    }
    setSpamLoading(false);
  };

  const generateVariants = async () => {
    if (!variantSubject.trim()) return toast.error("Enter a subject line");
    setVariantLoading(true);
    try {
      const res = await axios.post(`${API}/tools/subject-variants`, { subject: variantSubject });
      setVariants(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to generate variants");
    }
    setVariantLoading(false);
  };

  const customizeTone = async () => {
    if (!toneText.trim()) return toast.error("Enter email text");
    setToneLoading(true);
    try {
      const res = await axios.post(`${API}/tools/customize-tone`, { text: toneText, tone: selectedTone });
      setToneResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to customize tone");
    }
    setToneLoading(false);
  };

  const generateSequence = async () => {
    if (!sequenceEmail.trim() || !sequenceSubject.trim()) return toast.error("Enter email and subject");
    setSequenceLoading(true);
    try {
      const res = await axios.post(`${API}/tools/generate-sequence`, { 
        original_email: sequenceEmail, 
        subject: sequenceSubject,
        num_followups: 3
      });
      setSequence(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to generate sequence");
    }
    setSequenceLoading(false);
  };

  const analyzeCompetitor = async () => {
    if (!competitorEmail.trim()) return toast.error("Enter competitor email");
    setCompetitorLoading(true);
    try {
      const res = await axios.post(`${API}/tools/analyze-competitor`, { email_text: competitorEmail });
      setCompetitorResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to analyze");
    }
    setCompetitorLoading(false);
  };

  const analyzeSignature = async () => {
    if (!signature.trim()) return toast.error("Enter your signature");
    setSignatureLoading(true);
    try {
      const res = await axios.post(`${API}/tools/analyze-signature`, { signature });
      setSignatureResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to analyze");
    }
    setSignatureLoading(false);
  };

  const getBestSendTime = async () => {
    try {
      const res = await axios.get(`${API}/tools/best-send-time?industry=${sendTimeIndustry}`);
      setSendTimeResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to get timing");
    }
  };

  const LockedOverlay = ({ tier }) => (
    <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <div className="text-center">
        <Lock className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
        <p className="text-sm text-zinc-400 mb-2">{tier}+ Feature</p>
        <Link to="/pricing">
          <Button size="sm" className="bg-[#d4af37] text-black hover:bg-[#b5952f] text-xs">
            Upgrade
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 space-y-8">
        <div>
          <h1 className="text-2xl font-serif mb-2">Email Tools</h1>
          <p className="text-zinc-400">Powerful tools to optimize every aspect of your cold outreach</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Spam Word Checker - FREE */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="font-semibold">Spam Word Checker</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">FREE</span>
            </div>
            <textarea
              value={spamText}
              onChange={(e) => setSpamText(e.target.value)}
              placeholder="Paste your email text..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-3 text-sm h-24 mb-3"
            />
            <Button onClick={checkSpam} disabled={spamLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
              {spamLoading ? "Checking..." : "Check for Spam Words"}
            </Button>
            {spamResult && (
              <div className="mt-4 p-4 bg-zinc-800 rounded">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm">Spam Risk:</span>
                  <span className={`font-bold ${spamResult.risk_level === 'high' ? 'text-red-400' : spamResult.risk_level === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {spamResult.risk_level.toUpperCase()}
                  </span>
                </div>
                {spamResult.found_words.length > 0 && (
                  <div className="space-y-2">
                    {spamResult.found_words.map((w, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-red-400">"{w.word}"</span>
                        <span className="text-emerald-400">→ "{w.alternative}"</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subject Line A/B Generator - STARTER */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative">
            {!hasStarter && <LockedOverlay tier="Starter" />}
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2 className="font-semibold">Subject Line A/B Generator</h2>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">STARTER</span>
            </div>
            <Input
              value={variantSubject}
              onChange={(e) => setVariantSubject(e.target.value)}
              placeholder="Enter your subject line..."
              className="bg-zinc-800 border-zinc-700 mb-3"
            />
            <Button onClick={generateVariants} disabled={variantLoading} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black">
              {variantLoading ? "Generating..." : "Generate 5 Variants"}
            </Button>
            {variants && (
              <div className="mt-4 space-y-2">
                {variants.variants.map((v, i) => (
                  <div key={i} className="p-3 bg-zinc-800 rounded flex justify-between items-center">
                    <div className="flex-1 mr-2">
                      <p className="text-sm">{v.subject}</p>
                      <p className="text-xs text-zinc-500">{v.style} • {v.expected_lift > 0 ? '+' : ''}{v.expected_lift}%</p>
                    </div>
                    <button onClick={() => copyText(v.subject, `var-${i}`)} className="p-1 hover:bg-zinc-700 rounded">
                      {copied === `var-${i}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Best Send Time - STARTER */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative">
            {!hasStarter && <LockedOverlay tier="Starter" />}
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-violet-400" />
              <h2 className="font-semibold">Best Send Time</h2>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">STARTER</span>
            </div>
            <select
              value={sendTimeIndustry}
              onChange={(e) => setSendTimeIndustry(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 mb-3"
            >
              <option value="saas">SaaS</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="ecommerce">E-commerce</option>
              <option value="consulting">Consulting</option>
              <option value="real estate">Real Estate</option>
              <option value="marketing">Marketing</option>
            </select>
            <Button onClick={getBestSendTime} className="w-full bg-violet-500 hover:bg-violet-600 text-white">
              Get Recommendation
            </Button>
            {sendTimeResult && (
              <div className="mt-4 p-4 bg-zinc-800 rounded">
                <p className="text-lg font-bold text-[#d4af37]">{sendTimeResult.recommendation.day} at {sendTimeResult.recommendation.time}</p>
                <p className="text-xs text-zinc-400 mt-2">{sendTimeResult.tip}</p>
                <p className="text-xs text-red-400 mt-2">Avoid: {sendTimeResult.avoid}</p>
              </div>
            )}
          </div>

          {/* AI Tone Customizer - PRO */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative">
            {!hasPro && <LockedOverlay tier="Pro" />}
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="w-5 h-5 text-[#d4af37]" />
              <h2 className="font-semibold">AI Tone Customizer</h2>
              <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded">PRO</span>
            </div>
            <textarea
              value={toneText}
              onChange={(e) => setToneText(e.target.value)}
              placeholder="Paste your email..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-3 text-sm h-20 mb-3"
            />
            <div className="flex gap-2 mb-3 flex-wrap">
              {["casual", "formal", "urgent", "friendly", "authoritative"].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTone(t)}
                  className={`px-3 py-1 text-xs rounded ${selectedTone === t ? 'bg-[#d4af37] text-black' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Button onClick={customizeTone} disabled={toneLoading} className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-black">
              {toneLoading ? "Rewriting..." : "Apply Tone"}
            </Button>
            {toneResult && (
              <div className="mt-4 p-4 bg-zinc-800 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-zinc-500">Rewritten ({toneResult.tone_applied})</span>
                  <button onClick={() => copyText(toneResult.rewritten, 'tone')} className="p-1 hover:bg-zinc-700 rounded">
                    {copied === 'tone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                  </button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{toneResult.rewritten}</p>
              </div>
            )}
          </div>

          {/* Follow-up Sequence Builder - PRO */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative lg:col-span-2">
            {!hasPro && <LockedOverlay tier="Pro" />}
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="font-semibold">Follow-up Sequence Builder</h2>
              <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded">PRO</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Initial Subject</label>
                <Input
                  value={sequenceSubject}
                  onChange={(e) => setSequenceSubject(e.target.value)}
                  placeholder="Your initial email subject..."
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Initial Email Body</label>
                <textarea
                  value={sequenceEmail}
                  onChange={(e) => setSequenceEmail(e.target.value)}
                  placeholder="Your initial email..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-3 text-sm h-20"
                />
              </div>
            </div>
            <Button onClick={generateSequence} disabled={sequenceLoading} className="bg-emerald-500 hover:bg-emerald-600 text-black">
              {sequenceLoading ? "Generating..." : "Generate 3 Follow-ups"}
            </Button>
            {sequence && (
              <div className="mt-4 grid md:grid-cols-3 gap-4">
                {sequence.sequence.map((s, i) => (
                  <div key={i} className="p-4 bg-zinc-800 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded">Day +{s.days_after}</span>
                      <button onClick={() => copyText(`Subject: ${s.subject}\n\n${s.body}`, `seq-${i}`)} className="p-1 hover:bg-zinc-700 rounded">
                        {copied === `seq-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                      </button>
                    </div>
                    <p className="text-sm font-medium mb-1">{s.subject}</p>
                    <p className="text-xs text-zinc-400 mb-2">{s.body}</p>
                    <p className="text-[10px] text-emerald-400">{s.strategy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Competitor Email Analyzer - PRO */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative">
            {!hasPro && <LockedOverlay tier="Pro" />}
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-red-400" />
              <h2 className="font-semibold">Competitor Email Analyzer</h2>
              <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded">PRO</span>
            </div>
            <textarea
              value={competitorEmail}
              onChange={(e) => setCompetitorEmail(e.target.value)}
              placeholder="Paste a competitor's cold email..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-3 text-sm h-24 mb-3"
            />
            <Button onClick={analyzeCompetitor} disabled={competitorLoading} className="w-full bg-red-500 hover:bg-red-600 text-white">
              {competitorLoading ? "Analyzing..." : "Analyze Competitor"}
            </Button>
            {competitorResult && !competitorResult.error && (
              <div className="mt-4 p-4 bg-zinc-800 rounded space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Est. Score:</span>
                  <span className="font-bold text-[#d4af37]">{competitorResult.estimated_score}/100</span>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Strengths:</p>
                  <ul className="text-xs text-emerald-400 space-y-1">{competitorResult.strengths?.slice(0, 3).map((s, i) => <li key={i}>• {s}</li>)}</ul>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">What to Steal:</p>
                  <ul className="text-xs text-cyan-400 space-y-1">{competitorResult.what_to_steal?.slice(0, 3).map((s, i) => <li key={i}>• {s}</li>)}</ul>
                </div>
              </div>
            )}
          </div>

          {/* Signature Analyzer - PRO */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative">
            {!hasPro && <LockedOverlay tier="Pro" />}
            <div className="flex items-center gap-2 mb-4">
              <PenTool className="w-5 h-5 text-pink-400" />
              <h2 className="font-semibold">Signature Analyzer</h2>
              <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded">PRO</span>
            </div>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Paste your email signature..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-3 text-sm h-24 mb-3"
            />
            <Button onClick={analyzeSignature} disabled={signatureLoading} className="w-full bg-pink-500 hover:bg-pink-600 text-white">
              {signatureLoading ? "Analyzing..." : "Analyze Signature"}
            </Button>
            {signatureResult && (
              <div className="mt-4 p-4 bg-zinc-800 rounded space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Score:</span>
                  <span className="font-bold text-[#d4af37]">{signatureResult.score}/100</span>
                </div>
                {signatureResult.suggestions && (
                  <div>
                    <p className="text-zinc-500 text-xs mb-1">Suggestions:</p>
                    <ul className="text-xs text-emerald-400 space-y-1">{signatureResult.suggestions?.slice(0, 3).map((s, i) => <li key={i}>• {s}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tools;
