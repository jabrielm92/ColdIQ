import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Mail, BarChart3, Plus, TrendingUp, Target, Zap, ChevronRight, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageRes, historyRes] = await Promise.all([
          axios.get(`${API}/user/usage`),
          axios.get(`${API}/analysis/history?page=1&limit=5`)
        ]);
        setUsage(usageRes.data);
        setRecentAnalyses(historyRes.data.analyses);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const stats = [
    { 
      label: "Total Analyses", 
      value: user?.total_analyses || 0, 
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-[#d4af37]"
    },
    { 
      label: "This Month", 
      value: usage?.used || 0, 
      icon: <Clock className="w-5 h-5" />,
      color: "text-theme-muted"
    },
    { 
      label: "Remaining", 
      value: usage?.remaining || 0, 
      icon: <Target className="w-5 h-5" />,
      color: "text-[#a3e635]"
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 space-y-10" data-testid="dashboard-page">
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3">Dashboard</p>
            <h1 className="font-serif text-4xl tracking-tight mb-2">
              Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-theme-muted">Ready to optimize your cold emails?</p>
          </div>
          
          <Button 
            onClick={() => navigate('/analyze')}
            className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-4 h-auto transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            data-testid="new-analysis-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Analyze New Email
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-theme-tertiary">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-theme-secondary p-8"
            >
              <div className={`w-10 h-10 border border-theme flex items-center justify-center ${stat.color} mb-6`}>
                {stat.icon}
              </div>
              <div className="text-4xl font-mono font-bold mb-2">{stat.value}</div>
              <div className="text-xs font-mono tracking-widest uppercase text-theme-dim">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        
        {/* Usage Bar */}
        {usage && (
          <div className="bg-theme-secondary border border-theme p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono tracking-widest uppercase text-theme-dim">Monthly Usage</span>
              <span className="text-sm font-mono text-theme-muted">
                {usage.used} / {usage.limit === 999999 ? '∞' : usage.limit}
              </span>
            </div>
            <div className="h-1 bg-theme-tertiary overflow-hidden">
              <div 
                className="h-full bg-[#d4af37] transition-all"
                style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
              />
            </div>
            {usage.tier === 'free' && (
              <p className="text-xs text-theme-dim mt-4 font-mono">
                <Link to="/pricing" className="text-[#d4af37] hover:text-[#b5952f] transition-colors">Upgrade</Link> for more analyses
              </p>
            )}
          </div>
        )}
        
        {/* Recent Analyses */}
        <div className="bg-theme-secondary border border-theme overflow-hidden">
          <div className="p-6 border-b border-theme flex items-center justify-between">
            <h2 className="text-lg font-sans font-semibold">Recent Analyses</h2>
            <Link to="/history" className="text-xs font-mono tracking-widest uppercase text-[#d4af37] hover:text-[#b5952f] flex items-center gap-2 transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentAnalyses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border border-theme flex items-center justify-center mx-auto mb-6">
                <Mail className="w-6 h-6 text-theme-dim" />
              </div>
              <p className="text-theme-muted mb-6">No analyses yet</p>
              <Button 
                onClick={() => navigate('/analyze')}
                className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-4 h-auto"
                data-testid="empty-state-analyze-btn"
              >
                Analyze Your First Email
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-theme">
              {recentAnalyses.map((analysis, i) => (
                <Link 
                  key={analysis.id}
                  to={`/history?id=${analysis.id}`}
                  className="p-5 hover:bg-theme-tertiary transition-colors flex items-center gap-5 group"
                  data-testid={`recent-analysis-${i}`}
                >
                  <div className={`w-14 h-14 flex items-center justify-center border ${getScoreBgColor(analysis.analysis_score)}`}>
                    <span className={`text-xl font-mono font-bold ${getScoreColor(analysis.analysis_score)}`}>
                      {analysis.analysis_score}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{analysis.original_subject || 'No subject'}</p>
                    <p className="text-sm text-theme-dim truncate font-mono">{analysis.original_body.slice(0, 80)}...</p>
                  </div>
                  <div className="text-xs text-theme-dim font-mono">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </div>
                  <ChevronRight className="w-4 h-4 text-theme-dim group-hover:text-theme-muted transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Quick Tips */}
        <div className="grid md:grid-cols-2 gap-px bg-theme-tertiary">
          <div className="bg-theme-secondary p-8 group hover:bg-theme-tertiary transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-[#d4af37]" />
              <span className="text-xs font-mono tracking-widest uppercase text-theme-muted">Quick Tip</span>
            </div>
            <p className="text-theme-muted">
              Keep your cold emails under 100 words. Short emails get <span className="text-theme">50% more responses</span> than lengthy ones.
            </p>
          </div>
          
          <div className="bg-theme-secondary p-8 group hover:bg-theme-tertiary transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-[#a3e635]" />
              <span className="text-xs font-mono tracking-widest uppercase text-theme-muted">Pro Tip</span>
            </div>
            <p className="text-theme-muted">
              Always end with a specific call-to-action. <span className="text-theme">"Are you free Tuesday at 2pm?"</span> beats "Let me know."
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
