import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
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

  const isPro = user?.subscription_tier === "pro" || user?.subscription_tier === "agency" || user?.subscription_tier === "growth_agency";
  const isStarter = isPro || user?.subscription_tier === "starter";

  useEffect(() => {
    fetchAnalyses();
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

  const fetchAnalyses = async () => {
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
                  onClick={() => toast.info("Upgrade to Pro for CSV export")}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
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
                {/* Original */}
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
                  <p className="text-sm font-medium text-indigo-400 mb-1">Key Insight</p>
                  <p className="text-zinc-200">{selectedAnalysis.key_insight}</p>
                </div>
                
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-zinc-500 mb-1">Response Rate</p>
                    <p className="font-semibold text-cyan-400" style={{ fontFamily: 'JetBrains Mono' }}>{selectedAnalysis.estimated_response_rate}%</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-zinc-500 mb-1">Open Rate</p>
                    <p className="font-semibold text-violet-400" style={{ fontFamily: 'JetBrains Mono' }}>{selectedAnalysis.estimated_open_rate}%</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-zinc-500 mb-1">Word Count</p>
                    <p className="font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>{selectedAnalysis.email_word_count}</p>
                  </div>
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
