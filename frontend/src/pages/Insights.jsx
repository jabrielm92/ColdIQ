import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  BarChart3, TrendingUp, Target, Lightbulb, Lock, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";

const Insights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await axios.get(`${API}/insights/dashboard`);
      setInsights(res.data);
    } catch (err) {
      console.error("Failed to fetch insights", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!insights?.available) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8" data-testid="insights-page">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-zinc-500" />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
              Unlock Personalized Insights
            </h1>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Upgrade to Starter or Pro to access detailed performance analytics, trend charts, and personalized recommendations.
            </p>
            <Link to="/pricing">
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary">
                View Plans
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!insights?.has_data) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8" data-testid="insights-page">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-zinc-500" />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
              No Data Yet
            </h1>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Complete your first analysis to start seeing personalized insights and recommendations.
            </p>
            <Link to="/analyze">
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary">
                Analyze Your First Email
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { summary, word_count_insights, trend_data, recommendations } = insights;

  const chartColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8" data-testid="insights-page">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>
            Your Insights
          </h1>
          <p className="text-zinc-400">Personalized analytics based on your email performance</p>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Analyses", value: summary.total_analyses, icon: <BarChart3 className="w-5 h-5" />, color: "text-indigo-400" },
            { label: "Average Score", value: summary.average_score, icon: <Target className="w-5 h-5" />, color: "text-cyan-400" },
            { label: "Best Score", value: summary.best_score, icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-400" },
            { label: "Avg Response Rate", value: `${summary.average_response_rate}%`, icon: <BarChart3 className="w-5 h-5" />, color: "text-violet-400" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5"
            >
              <div className={`w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center ${stat.color} mb-3`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'JetBrains Mono' }}>{stat.value}</div>
              <div className="text-zinc-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        
        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          {trend_data && trend_data.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4" style={{ fontFamily: 'Manrope' }}>Score Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend_data}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#52525b" 
                      fontSize={12}
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#52525b" fontSize={12} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: '1px solid #27272a',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#a1a1aa' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      dot={{ fill: '#6366f1', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Word Count Insights */}
          {word_count_insights && word_count_insights.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4" style={{ fontFamily: 'Manrope' }}>Score by Email Length</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={word_count_insights}>
                    <XAxis dataKey="category" stroke="#52525b" fontSize={12} />
                    <YAxis stroke="#52525b" fontSize={12} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: '1px solid #27272a',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#a1a1aa' }}
                    />
                    <Bar dataKey="avg_score" radius={[4, 4, 0, 0]}>
                      {word_count_insights.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        
        {/* Additional Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-sm mb-2">Avg Word Count</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono' }}>{summary.average_word_count}</p>
            <p className="text-xs text-zinc-600 mt-1">Recommended: 60-100</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-sm mb-2">Avg Personalization</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono' }}>{summary.avg_personalization_score}/10</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-sm mb-2">Avg CTA Score</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono' }}>{summary.avg_cta_score}/10</p>
          </div>
        </div>
        
        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-lg" style={{ fontFamily: 'Manrope' }}>Personalized Recommendations</h3>
            </div>
            <ul className="space-y-3">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-medium text-indigo-400 flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-zinc-200">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Insights;
