import React, { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { 
  FileText, Download, Calendar, TrendingUp, Lock, Plus,
  BarChart3, Mail, Users, Eye
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const isAgency = user?.subscription_tier === "agency" || user?.subscription_tier === "growth_agency";

  useEffect(() => {
    if (isAgency) {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [isAgency]);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API}/reports`);
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (clientId = null) => {
    setGenerating(true);
    try {
      const res = await axios.post(`${API}/reports/generate`, { client_id: clientId });
      toast.success("Report generated successfully");
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  // Locked state for non-Agency users
  if (!isAgency) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-zinc-800 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-zinc-600" />
              </div>
              <h1 className="font-serif text-3xl mb-4">White-Label Reports</h1>
              <p className="text-zinc-500 max-w-md mx-auto mb-8">
                Generate beautiful PDF reports for your clients. Show improvement over time, highlight wins, and justify your retainer with data.
              </p>
              
              {/* Preview of what reports look like */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 mb-8 max-w-md mx-auto text-left">
                <p className="text-xs font-mono text-zinc-500 mb-4">REPORT PREVIEW</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Email Performance</span>
                    <span className="text-sm font-mono text-emerald-400">+34%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Response Rate</span>
                    <span className="text-sm font-mono text-emerald-400">2.1% → 4.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Emails Analyzed</span>
                    <span className="text-sm font-mono">127</span>
                  </div>
                </div>
              </div>
              
              <Link to="/pricing">
                <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-4 h-auto">
                  Upgrade to Growth Agency
                </Button>
              </Link>
              <p className="text-xs text-zinc-600 mt-4">Starts at $199/month</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8" data-testid="reports-page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-3">Client Deliverables</p>
              <h1 className="font-serif text-4xl tracking-tight">Reports</h1>
            </div>
            <Button 
              onClick={() => generateReport()}
              disabled={generating}
              className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs"
            >
              <Plus className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>

          {/* Report Templates */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 hover:border-[#d4af37]/30 cursor-pointer transition-colors">
              <FileText className="w-6 h-6 text-[#d4af37] mb-3" />
              <h3 className="font-medium mb-1">Monthly Summary</h3>
              <p className="text-xs text-zinc-500">Overview of all analyses, improvements, and metrics</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 hover:border-[#d4af37]/30 cursor-pointer transition-colors">
              <TrendingUp className="w-6 h-6 text-cyan-400 mb-3" />
              <h3 className="font-medium mb-1">Performance Report</h3>
              <p className="text-xs text-zinc-500">Before/after comparisons and trend analysis</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 hover:border-[#d4af37]/30 cursor-pointer transition-colors">
              <BarChart3 className="w-6 h-6 text-violet-400 mb-3" />
              <h3 className="font-medium mb-1">Campaign Analysis</h3>
              <p className="text-xs text-zinc-500">Deep dive into specific campaigns or sequences</p>
            </div>
          </div>

          {/* Generated Reports */}
          <div className="bg-zinc-900/50 border border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-medium">Generated Reports</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto" />
              </div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">No reports generated yet</p>
                <p className="text-xs text-zinc-600 mt-1">Click "Generate Report" to create your first client report</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {reports.map((report, i) => (
                  <div key={report.id || i} className="p-4 flex items-center justify-between hover:bg-zinc-800/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#d4af37]/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#d4af37]" />
                      </div>
                      <div>
                        <p className="font-medium">{report.title || 'Monthly Report'}</p>
                        <p className="text-xs text-zinc-500">
                          {report.client_name && `${report.client_name} • `}
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-zinc-400">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-zinc-400">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
