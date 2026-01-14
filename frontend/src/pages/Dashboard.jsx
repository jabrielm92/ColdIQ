import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Mail, LayoutDashboard, History, BarChart3, Settings, LogOut,
  Plus, TrendingUp, Target, Zap, ChevronRight, Clock
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
    if (score >= 71) return "text-emerald-400";
    if (score >= 41) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score) => {
    if (score >= 71) return "bg-emerald-500/10";
    if (score >= 41) return "bg-amber-500/10";
    return "bg-red-500/10";
  };

  const stats = [
    { 
      label: "Total Analyses", 
      value: user?.total_analyses || 0, 
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-indigo-400"
    },
    { 
      label: "This Month", 
      value: usage?.used || 0, 
      icon: <Clock className="w-5 h-5" />,
      color: "text-cyan-400"
    },
    { 
      label: "Remaining", 
      value: usage?.remaining || 0, 
      icon: <Target className="w-5 h-5" />,
      color: "text-emerald-400"
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8" data-testid="dashboard-page">
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1" style={{ fontFamily: 'Manrope' }}>
              Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-zinc-400">Ready to optimize your cold emails?</p>
          </div>
          
          <Button 
            onClick={() => navigate('/analyze')}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary h-11"
            data-testid="new-analysis-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Analyze New Email
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
            >
              <div className={`w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center ${stat.color} mb-4`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold mb-1 mono" style={{ fontFamily: 'JetBrains Mono' }}>{stat.value}</div>
              <div className="text-zinc-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        
        {/* Usage Bar */}
        {usage && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">Monthly Usage</span>
              <span className="text-sm font-medium mono" style={{ fontFamily: 'JetBrains Mono' }}>
                {usage.used} / {usage.limit === 999999 ? '∞' : usage.limit}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
              />
            </div>
            {usage.tier === 'free' && (
              <p className="text-xs text-zinc-500 mt-2">
                <Link to="/pricing" className="text-indigo-400 hover:text-indigo-300">Upgrade</Link> for more analyses
              </p>
            )}
          </div>
        )}
        
        {/* Recent Analyses */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Manrope' }}>Recent Analyses</h2>
            <Link to="/history" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentAnalyses.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-zinc-400 mb-4">No analyses yet</p>
              <Button 
                onClick={() => navigate('/analyze')}
                className="bg-gradient-to-r from-indigo-600 to-violet-600"
                data-testid="empty-state-analyze-btn"
              >
                Analyze Your First Email
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {recentAnalyses.map((analysis, i) => (
                <Link 
                  key={analysis.id}
                  to={`/history?id=${analysis.id}`}
                  className="p-4 hover:bg-zinc-800/50 transition-colors flex items-center gap-4 group"
                  data-testid={`recent-analysis-${i}`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getScoreBgColor(analysis.analysis_score)}`}>
                    <span className={`text-lg font-bold mono ${getScoreColor(analysis.analysis_score)}`} style={{ fontFamily: 'JetBrains Mono' }}>
                      {analysis.analysis_score}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{analysis.original_subject || 'No subject'}</p>
                    <p className="text-sm text-zinc-500 truncate">{analysis.original_body.slice(0, 80)}...</p>
                  </div>
                  <div className="text-sm text-zinc-500">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Quick Tips */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold">Quick Tip</span>
            </div>
            <p className="text-zinc-300 text-sm">
              Keep your cold emails under 100 words. Short emails get 50% more responses than lengthy ones.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold">Pro Tip</span>
            </div>
            <p className="text-zinc-300 text-sm">
              Always end with a specific call-to-action. "Are you free Tuesday at 2pm?" beats "Let me know."
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
