import React, { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  TrendingUp, Calendar, BarChart3, Target, ArrowUp, ArrowDown, 
  Minus, ChevronLeft, ChevronRight, Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from "recharts";

const Performance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [timeRange, setTimeRange] = useState("30"); // days
  const [stats, setStats] = useState(null);

  const userTier = user?.subscription_tier || "free";
  const hasProFeatures = ["pro", "agency", "growth_agency"].includes(userTier);

  useEffect(() => {
    fetchHistory();
  }, [timeRange]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/analysis/history?limit=100`);
      const analyses = res.data?.analyses || [];
      
      // Filter by time range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
      
      const filtered = analyses.filter(a => new Date(a.created_at) >= cutoffDate);
      setHistory(filtered);
      
      // Calculate stats
      if (filtered.length > 0) {
        const scores = filtered.map(a => a.analysis_score);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        // Compare first half to second half for trend
        const midpoint = Math.floor(filtered.length / 2);
        const firstHalf = scores.slice(0, midpoint);
        const secondHalf = scores.slice(midpoint);
        
        const firstAvg = firstHalf.length ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
        const secondAvg = secondHalf.length ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
        const trend = secondAvg - firstAvg;
        
        // Best and worst
        const best = Math.max(...scores);
        const worst = Math.min(...scores);
        
        // Response rate trend
        const responseRates = filtered.map(a => a.estimated_response_rate);
        const avgResponse = responseRates.reduce((a, b) => a + b, 0) / responseRates.length;
        
        setStats({
          avgScore: Math.round(avgScore),
          trend: Math.round(trend),
          best,
          worst,
          totalAnalyses: filtered.length,
          avgResponse: avgResponse.toFixed(1)
        });
      } else {
        setStats(null);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data - group by date
  const chartData = React.useMemo(() => {
    if (!history.length) return [];
    
    const groupedByDate = {};
    history.forEach(analysis => {
      const date = new Date(analysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!groupedByDate[date]) {
        groupedByDate[date] = { scores: [], responses: [], opens: [] };
      }
      groupedByDate[date].scores.push(analysis.analysis_score);
      groupedByDate[date].responses.push(analysis.estimated_response_rate);
      groupedByDate[date].opens.push(analysis.estimated_open_rate);
    });
    
    return Object.entries(groupedByDate)
      .map(([date, data]) => ({
        date,
        avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        avgResponse: parseFloat((data.responses.reduce((a, b) => a + b, 0) / data.responses.length).toFixed(1)),
        avgOpen: parseFloat((data.opens.reduce((a, b) => a + b, 0) / data.opens.length).toFixed(1)),
        count: data.scores.length
      }))
      .reverse(); // Oldest first for chart
  }, [history]);

  // Locked state for non-Pro users
  if (!hasProFeatures) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-3">Performance</p>
              <h1 className="font-serif text-4xl tracking-tight mb-2">Performance Tracking</h1>
              <p className="text-zinc-500">Track your email performance over time</p>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 p-12 text-center">
              <Lock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Pro Feature</h2>
              <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                Performance tracking helps you see how your email writing is improving over time. 
                View score trends, compare periods, and identify winning patterns.
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 p-3 text-sm">
          <p className="text-zinc-400 mb-1">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name.includes('Rate') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8" data-testid="performance-page">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-3">Performance</p>
              <h1 className="font-serif text-4xl tracking-tight mb-2">Performance Tracking</h1>
              <p className="text-zinc-500">Track your email performance over time</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 p-1">
              {[
                { value: "7", label: "7D" },
                { value: "30", label: "30D" },
                { value: "90", label: "90D" }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`px-4 py-2 text-xs font-mono transition-colors ${
                    timeRange === option.value 
                      ? "bg-[#d4af37] text-black" 
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 p-12 text-center">
              <BarChart3 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Data Yet</h2>
              <p className="text-zinc-400 mb-6">
                Start analyzing emails to see your performance trends here.
              </p>
              <Link 
                to="/analyze"
                className="inline-flex items-center gap-2 bg-[#d4af37] text-black px-6 py-3 font-bold text-xs uppercase tracking-wider hover:bg-[#b5952f] transition-colors"
              >
                Analyze Your First Email
              </Link>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/50 border border-zinc-800 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-[#d4af37]" />
                      <span className="text-xs text-zinc-500 uppercase tracking-wider">Avg Score</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-mono font-bold">{stats.avgScore}</span>
                      {stats.trend !== 0 && (
                        <span className={`text-xs flex items-center gap-0.5 ${stats.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {stats.trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {Math.abs(stats.trend)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-zinc-900/50 border border-zinc-800 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-zinc-500 uppercase tracking-wider">Avg Response</span>
                    </div>
                    <span className="text-3xl font-mono font-bold">{stats.avgResponse}%</span>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-zinc-900/50 border border-zinc-800 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-zinc-500 uppercase tracking-wider">Best Score</span>
                    </div>
                    <span className="text-3xl font-mono font-bold text-emerald-400">{stats.best}</span>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-zinc-900/50 border border-zinc-800 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-violet-400" />
                      <span className="text-xs text-zinc-500 uppercase tracking-wider">Analyses</span>
                    </div>
                    <span className="text-3xl font-mono font-bold">{stats.totalAnalyses}</span>
                  </motion.div>
                </div>
              )}

              {/* Score Trend Chart */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 mb-6">
                <h3 className="text-sm font-medium mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#d4af37]" />
                  Score Trend
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="date" stroke="#52525b" fontSize={12} />
                      <YAxis stroke="#52525b" fontSize={12} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="avgScore" 
                        name="Score"
                        stroke="#d4af37" 
                        fillOpacity={1}
                        fill="url(#scoreGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Response & Open Rates */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                  <h3 className="text-sm font-medium mb-6 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Response Rate Trend
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="date" stroke="#52525b" fontSize={11} />
                        <YAxis stroke="#52525b" fontSize={11} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="avgResponse" 
                          name="Response Rate"
                          stroke="#22d3ee" 
                          strokeWidth={2}
                          dot={{ fill: '#22d3ee', strokeWidth: 0, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                  <h3 className="text-sm font-medium mb-6 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-violet-400" />
                    Open Rate Trend
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="date" stroke="#52525b" fontSize={11} />
                        <YAxis stroke="#52525b" fontSize={11} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="avgOpen" 
                          name="Open Rate"
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Analyses Table */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 mt-6">
                <h3 className="text-sm font-medium mb-4">Recent Analyses</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-2 text-zinc-500 font-normal">Date</th>
                        <th className="text-left py-2 text-zinc-500 font-normal">Subject</th>
                        <th className="text-center py-2 text-zinc-500 font-normal">Score</th>
                        <th className="text-center py-2 text-zinc-500 font-normal">Response</th>
                        <th className="text-center py-2 text-zinc-500 font-normal">Open</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 10).map((analysis, i) => (
                        <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                          <td className="py-3 text-zinc-400">
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 max-w-[200px] truncate">
                            {analysis.original_subject}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`font-mono font-bold ${
                              analysis.analysis_score >= 70 ? 'text-emerald-400' :
                              analysis.analysis_score >= 50 ? 'text-[#d4af37]' : 'text-red-400'
                            }`}>
                              {analysis.analysis_score}
                            </span>
                          </td>
                          <td className="py-3 text-center text-cyan-400 font-mono">
                            {analysis.estimated_response_rate}%
                          </td>
                          <td className="py-3 text-center text-violet-400 font-mono">
                            {analysis.estimated_open_rate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Performance;
