import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Search, Trash2, ChevronLeft, ChevronRight, 
  Copy, Check, Mail, Download, Lock, ArrowRight,
  AlertTriangle, BookOpen, MousePointer, Sparkles, Target, 
  TrendingUp, BarChart3, Lightbulb, Zap, CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const History = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [tierLimit, setTierLimit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPro = user?.subscription_tier === "pro" || user?.subscription_tier === "agency" || user?.subscription_tier === "growth_agency";
  const isStarter = isPro || user?.subscription_tier === "starter";

  useEffect(() => {
    const loadAnalyses = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/analysis/history?page=${page}&limit=10`);
        setAnalyses(res.data.analyses);
        setTotalPages(res.data.total_pages);
        setTotal(res.data.total);
        setTierLimit(res.data.tier_limit);
      } catch (err) {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    loadAnalyses();
  }, [page]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && analyses.length > 0) {
      const found = analyses.find(a => a.id === id);
      if (found) {
        setSelectedAnalysis(found);
      }
    }
  }, [searchParams, analyses]);

  const deleteAnalysis = async (id) => {
    try {
      await axios.delete(`${API}/analysis/${id}`);
      setAnalyses(analyses.filter(a => a.id !== id));
      toast.success("Analysis deleted");
      setSelectedAnalysis(null);
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const exportToCSV = async () => {
    if (!isPro) {
      toast.error("CSV export requires Pro or Agency plan");
      return;
    }
    
    setExporting(true);
    try {
      const response = await axios.get(`${API}/analysis/export/csv`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `coldiq_analyses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Export downloaded!");
    } catch (err) {
      toast.error("Failed to export");
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 71) return "text-emerald-400";
    if (score >= 41) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score) => {
    if (score >= 71) return "bg-emerald-500/10";
    if (score >= 41) return "bg-amber-500/10";
    return "bg-red-500/10";
  };

  const filteredAnalyses = analyses.filter(a => 
    a.original_subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.original_body?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8" data-testid="history-page">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>
                Analysis History
              </h1>
              <p className="text-zinc-400">
                {tierLimit ? `Showing last ${tierLimit} analyses (upgrade for full history)` : `${total} total analyses`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search analyses..."
                  className="pl-10 bg-zinc-900/50 border-zinc-800 w-full md:w-64"
                  data-testid="search-input"
                />
              </div>
              
              {isPro ? (
                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  disabled={exporting || analyses.length === 0}
                  className="border-zinc-700"
                  data-testid="export-csv-btn"
                >
                  {exporting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-500"
                  onClick={() => navigate("/pricing")}
                  data-testid="export-csv-locked-btn"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
          
          {/* Tier Limit Banner */}
          {tierLimit && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400" />
                <p className="text-amber-200">
                  Free tier shows last {tierLimit} analyses only. Upgrade for full history access.
                </p>
              </div>
              <Link to="/pricing">
                <Button size="sm" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400">
                  Upgrade
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
          
          {/* Table */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-12 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredAnalyses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-zinc-500" />
                </div>
                <p className="text-zinc-400 mb-2">No analyses found</p>
                <p className="text-zinc-500 text-sm">
                  {searchTerm ? "Try a different search term" : "Start by analyzing your first email"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left p-4 text-zinc-400 font-medium text-sm">Date</th>
                        <th className="text-left p-4 text-zinc-400 font-medium text-sm">Subject</th>
                        <th className="text-left p-4 text-zinc-400 font-medium text-sm">Score</th>
                        <th className="text-left p-4 text-zinc-400 font-medium text-sm">Response Rate</th>
                        <th className="text-right p-4 text-zinc-400 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {filteredAnalyses.map((analysis) => (
                        <tr 
                          key={analysis.id}
                          className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedAnalysis(analysis)}
                          data-testid={`analysis-row-${analysis.id}`}
                        >
                          <td className="p-4 text-zinc-400 text-sm">
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <p className="font-medium truncate max-w-xs">{analysis.original_subject || 'No subject'}</p>
                          </td>
                          <td className="p-4">
                            <span className={`text-lg font-bold ${getScoreColor(analysis.analysis_score)}`} style={{ fontFamily: 'JetBrains Mono' }}>
                              {analysis.analysis_score}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-cyan-400" style={{ fontFamily: 'JetBrains Mono' }}>
                              {analysis.estimated_response_rate}%
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAnalysis(analysis.id);
                              }}
                              className="text-zinc-400 hover:text-red-400"
                              data-testid={`delete-btn-${analysis.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-zinc-800">
                  {filteredAnalyses.map((analysis) => (
                    <div 
                      key={analysis.id}
                      className="p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedAnalysis(analysis)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.analysis_score)}`} style={{ fontFamily: 'JetBrains Mono' }}>
                          {analysis.analysis_score}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-medium truncate">{analysis.original_subject || 'No subject'}</p>
                      <p className="text-sm text-zinc-500 truncate mt-1">{analysis.original_body.slice(0, 60)}...</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-sm text-zinc-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-zinc-700"
                    data-testid="prev-page-btn"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border-zinc-700"
                    data-testid="next-page-btn"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Analysis Detail Modal */}
      <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
          {selectedAnalysis && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span style={{ fontFamily: 'Manrope' }}>Analysis Details</span>
                  <span className={`text-3xl font-bold ${getScoreColor(selectedAnalysis.analysis_score)}`} style={{ fontFamily: 'JetBrains Mono' }}>
                    {selectedAnalysis.analysis_score}
                  </span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Original Email */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-zinc-400">Original Email</h4>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <p className="text-sm text-zinc-500 mb-1">Subject:</p>
                    <p className="font-medium mb-3">{selectedAnalysis.original_subject}</p>
                    <p className="text-sm text-zinc-500 mb-1">Body:</p>
                    <p className="text-sm whitespace-pre-wrap">{selectedAnalysis.original_body}</p>
                  </div>
                </div>
                
                {/* Key Insight */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-400">Key Insight</span>
                  </div>
                  <p className="text-zinc-200">{selectedAnalysis.key_insight}</p>
                </div>
                
                {/* Core Metrics */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-zinc-500 mb-1">Response</p>
                    <p className="font-semibold text-cyan-400" style={{ fontFamily: 'JetBrains Mono' }}>{selectedAnalysis.estimated_response_rate}%</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-zinc-500 mb-1">Open Rate</p>
                    <p className="font-semibold text-violet-400" style={{ fontFamily: 'JetBrains Mono' }}>{selectedAnalysis.estimated_open_rate}%</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-zinc-500 mb-1">Words</p>
                    <p className="font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>{selectedAnalysis.email_word_count}</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-zinc-500 mb-1">Personal</p>
                    <p className="font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>{selectedAnalysis.personalization_score}/10</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-zinc-500 mb-1">Value Prop</p>
                    <p className="font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>{selectedAnalysis.value_proposition_clarity}/10</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-zinc-500 mb-1">CTA</p>
                    <p className="font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>{selectedAnalysis.cta_score}/10</p>
                  </div>
                </div>
                
                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {selectedAnalysis.strengths?.map((s, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      Weaknesses
                    </h4>
                    <ul className="space-y-2">
                      {selectedAnalysis.weaknesses?.map((w, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Improvements */}
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    Specific Improvements
                  </h4>
                  <ul className="space-y-2">
                    {selectedAnalysis.improvements?.map((imp, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                        <span className="text-cyan-400 font-medium">{i + 1}.</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Starter+ Metrics - Show to all, locked for free tier */}
                <div className="border-t border-zinc-800 pt-6">
                  <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-4">
                    Starter+ Metrics
                    {!isStarter && <span className="ml-2 text-amber-400">(Upgrade to unlock)</span>}
                  </p>
                  
                  {isStarter ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Readability */}
                      {selectedAnalysis.readability_score !== null && selectedAnalysis.readability_score !== undefined && (
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-medium">Readability</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-mono font-bold" style={{ color: selectedAnalysis.readability_score >= 70 ? '#a3e635' : selectedAnalysis.readability_score >= 50 ? '#d4af37' : '#ef4444' }}>
                              {selectedAnalysis.readability_score}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                              selectedAnalysis.readability_level === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                              selectedAnalysis.readability_level === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {selectedAnalysis.readability_level}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Spam Risk */}
                      {selectedAnalysis.spam_risk_score !== null && selectedAnalysis.spam_risk_score !== undefined && (
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium">Spam Risk</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-mono font-bold" style={{ color: selectedAnalysis.spam_risk_score <= 30 ? '#a3e635' : selectedAnalysis.spam_risk_score <= 60 ? '#d4af37' : '#ef4444' }}>
                              {selectedAnalysis.spam_risk_score}%
                            </span>
                            {selectedAnalysis.spam_keywords?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {selectedAnalysis.spam_keywords.slice(0, 3).map((kw, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-mono rounded">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Subject Line Analysis */}
                      {selectedAnalysis.subject_line_analysis && (
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Mail className="w-4 h-4 text-violet-400" />
                            <span className="text-sm font-medium">Subject Line</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-zinc-500">Length:</span> <span className="font-mono">{selectedAnalysis.subject_line_analysis.length} chars</span></div>
                            <div><span className="text-zinc-500">Effectiveness:</span> <span className="font-mono">{selectedAnalysis.subject_line_analysis.effectiveness}/10</span></div>
                            <div className="flex items-center gap-1">
                              <span className={selectedAnalysis.subject_line_analysis.hasPersonalization ? 'text-emerald-400' : 'text-zinc-600'}>
                                {selectedAnalysis.subject_line_analysis.hasPersonalization ? '✓' : '✗'}
                              </span>
                              <span className="text-zinc-400">Personalized</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={selectedAnalysis.subject_line_analysis.hasCuriosity ? 'text-emerald-400' : 'text-zinc-600'}>
                                {selectedAnalysis.subject_line_analysis.hasCuriosity ? '✓' : '✗'}
                              </span>
                              <span className="text-zinc-400">Curiosity</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* CTA Analysis */}
                      {selectedAnalysis.cta_analysis && (
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <MousePointer className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium">CTA Analysis</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-zinc-500">Present:</span> <span className={selectedAnalysis.cta_analysis.ctaPresent ? 'text-emerald-400' : 'text-red-400'}>{selectedAnalysis.cta_analysis.ctaPresent ? 'Yes' : 'No'}</span></div>
                            <div><span className="text-zinc-500">Clarity:</span> <span className="font-mono">{selectedAnalysis.cta_analysis.ctaClarity}/10</span></div>
                            <div><span className="text-zinc-500">Type:</span> <span className="capitalize">{selectedAnalysis.cta_analysis.ctaType}</span></div>
                            <div><span className="text-zinc-500">Friction:</span> <span className={`capitalize ${selectedAnalysis.cta_analysis.frictionLevel === 'low' ? 'text-emerald-400' : selectedAnalysis.cta_analysis.frictionLevel === 'medium' ? 'text-amber-400' : 'text-red-400'}`}>{selectedAnalysis.cta_analysis.frictionLevel}</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="grid md:grid-cols-2 gap-4 blur-sm opacity-50 pointer-events-none">
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-medium">Readability</span>
                          </div>
                          <span className="text-2xl font-mono font-bold text-zinc-500">72</span>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium">Spam Risk</span>
                          </div>
                          <span className="text-2xl font-mono font-bold text-zinc-500">15%</span>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Link to="/pricing" className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-colors rounded">
                          <Lock className="w-4 h-4" />
                          <span className="font-medium">Upgrade to Starter</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {/* Fix Suggestions - only show if starter+ and has data */}
                  {isStarter && selectedAnalysis.fix_suggestions?.length > 0 && (
                    <div className="mt-4 bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium">Fix This ({selectedAnalysis.fix_suggestions.length} issues)</span>
                      </div>
                      <div className="space-y-2">
                        {selectedAnalysis.fix_suggestions.map((sug, i) => (
                          <div key={i} className={`p-2 rounded border-l-2 ${
                            sug.priority === 'high' ? 'bg-red-500/10 border-red-500' :
                            sug.priority === 'medium' ? 'bg-amber-500/10 border-amber-500' :
                            'bg-blue-500/10 border-blue-500'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs uppercase font-mono ${
                                sug.priority === 'high' ? 'text-red-400' :
                                sug.priority === 'medium' ? 'text-amber-400' :
                                'text-blue-400'
                              }`}>{sug.priority}</span>
                              <span className="text-sm font-medium">{sug.issue}</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">{sug.fix}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Pro+ Metrics - Show to all, locked for non-pro tiers */}
                <div className="border-t border-zinc-800 pt-6">
                  <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-4">
                    Pro+ Metrics
                    {!isPro && <span className="ml-2 text-cyan-400">(Upgrade to unlock)</span>}
                  </p>
                  
                  {isPro ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Inbox Placement */}
                      {selectedAnalysis.inbox_placement_score !== null && selectedAnalysis.inbox_placement_score !== undefined && (
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-medium">Inbox Placement</span>
                            <span className="px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 rounded font-mono">PRO</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-mono font-bold" style={{ color: selectedAnalysis.inbox_placement_score >= 80 ? '#a3e635' : selectedAnalysis.inbox_placement_score >= 60 ? '#d4af37' : '#ef4444' }}>
                              {selectedAnalysis.inbox_placement_score}%
                            </span>
                            <span className="text-xs text-zinc-500">
                              {selectedAnalysis.inbox_placement_score >= 80 ? 'Excellent deliverability' : selectedAnalysis.inbox_placement_score >= 60 ? 'Good deliverability' : 'At risk'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Emotional Tone */}
                      {selectedAnalysis.emotional_tone && (
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-4 h-4 text-pink-400" />
                            <span className="text-sm font-medium">Emotional Tone</span>
                            <span className="px-2 py-0.5 text-[10px] bg-pink-500/20 text-pink-300 rounded font-mono">PRO</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-violet-500/20 text-violet-400 text-sm font-bold capitalize rounded">
                              {selectedAnalysis.emotional_tone.primary}
                            </span>
                            <span className="text-xs text-zinc-500">Score: {selectedAnalysis.emotional_tone.score}/10</span>
                          </div>
                          {selectedAnalysis.emotional_tone.persuasionTechniques?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedAnalysis.emotional_tone.persuasionTechniques.map((tech, i) => (
                                <span key={i} className="px-2 py-0.5 bg-zinc-700 text-zinc-400 text-xs rounded">{tech}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Industry Benchmark */}
                      {selectedAnalysis.industry_benchmark && (
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-medium">Industry Benchmark</span>
                            <span className="px-2 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-300 rounded font-mono">PRO</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-zinc-500">Avg Open:</span> <span className="font-mono">{selectedAnalysis.industry_benchmark.avgOpenRate}%</span></div>
                            <div><span className="text-zinc-500">Avg Response:</span> <span className="font-mono">{selectedAnalysis.industry_benchmark.avgResponseRate}%</span></div>
                          </div>
                          <div className={`mt-2 text-sm font-medium ${
                            selectedAnalysis.industry_benchmark.yourVsAvg === 'above' ? 'text-emerald-400' :
                            selectedAnalysis.industry_benchmark.yourVsAvg === 'below' ? 'text-amber-400' : 'text-zinc-400'
                          }`}>
                            {selectedAnalysis.industry_benchmark.yourVsAvg === 'above' && '✓ Above average'}
                            {selectedAnalysis.industry_benchmark.yourVsAvg === 'at' && '≈ At average'}
                            {selectedAnalysis.industry_benchmark.yourVsAvg === 'below' && '↓ Below average'}
                          </div>
                        </div>
                      )}
                      
                      {/* A/B Test Suggestions */}
                      {selectedAnalysis.ab_test_suggestions?.length > 0 && (
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium">A/B Test Ideas</span>
                            <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-mono">PRO</span>
                          </div>
                          <div className="space-y-2">
                            {selectedAnalysis.ab_test_suggestions.slice(0, 2).map((sug, i) => (
                              <div key={i} className="text-xs">
                                <span className="text-amber-400 font-mono uppercase">{sug.element}:</span>
                                <span className="text-zinc-300 ml-1">{sug.testIdea}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Alternative Subject Lines */}
                    {selectedAnalysis.alternative_subjects?.length > 0 && (
                      <div className="mt-4 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-violet-400" />
                          <span className="text-sm font-medium">AI Subject Line Variants</span>
                          <span className="px-2 py-0.5 text-[10px] bg-violet-500/20 text-violet-300 rounded font-mono">PRO</span>
                        </div>
                        <div className="space-y-2">
                          {selectedAnalysis.alternative_subjects.map((subj, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-zinc-900/50 border border-zinc-800 hover:border-violet-500/30 cursor-pointer transition-colors"
                              onClick={() => copyToClipboard(subj)}>
                              <span className="w-5 h-5 flex items-center justify-center bg-violet-500/20 text-violet-400 text-xs font-mono">{i + 1}</span>
                              <span className="flex-1 text-sm font-mono truncate">{subj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                  ) : (
                    <div className="relative">
                      <div className="grid md:grid-cols-2 gap-4 blur-sm opacity-50 pointer-events-none">
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-medium">Inbox Placement</span>
                          </div>
                          <span className="text-2xl font-mono font-bold text-zinc-500">85%</span>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-4 h-4 text-pink-400" />
                            <span className="text-sm font-medium">Emotional Tone</span>
                          </div>
                          <span className="text-lg font-bold text-zinc-500">Professional</span>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium">A/B Test Ideas</span>
                          </div>
                          <span className="text-sm text-zinc-500">3 suggestions</span>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-violet-400" />
                            <span className="text-sm font-medium">AI Subject Variants</span>
                          </div>
                          <span className="text-sm text-zinc-500">5 alternatives</span>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Link to="/pricing" className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-colors rounded">
                          <Lock className="w-4 h-4" />
                          <span className="font-medium">Upgrade to Pro</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Optimized Version */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-zinc-400">Optimized Version</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(`Subject: ${selectedAnalysis.rewritten_subject}\n\n${selectedAnalysis.rewritten_body}`)}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <p className="text-sm text-zinc-500 mb-1">Subject:</p>
                    <p className="font-medium mb-3 text-emerald-400">{selectedAnalysis.rewritten_subject}</p>
                    <p className="text-sm text-zinc-500 mb-1">Body:</p>
                    <p className="text-sm whitespace-pre-wrap text-emerald-400/90">{selectedAnalysis.rewritten_body}</p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => deleteAnalysis(selectedAnalysis.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default History;
