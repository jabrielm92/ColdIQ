import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Users, BarChart3, TrendingUp, Target, Lock, ArrowRight, Mail, User
} from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts";

const TeamAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAgency = user?.subscription_tier === "agency" || user?.subscription_tier === "growth_agency";

  useEffect(() => {
    if (isAgency) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [isAgency]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API}/team/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to fetch team analytics", err);
    } finally {
      setLoading(false);
    }
  };

  // Not agency tier - locked
  if (!isAgency) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-10" data-testid="team-analytics-page">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 border border-theme flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-theme-dim" />
            </div>
            <h1 className="font-serif text-3xl tracking-tight mb-3">
              Team Analytics
            </h1>
            <p className="text-theme-muted mb-6 max-w-md mx-auto">
              Upgrade to Agency to access team performance analytics, member insights, and collaborative features.
            </p>
            
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8 text-left">
              {[
                "Team performance dashboard",
                "Member analytics",
                "Score comparisons",
                "Activity tracking"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-theme-muted">
                  <div className="w-1.5 h-1.5 bg-[#d4af37]" />
                  {feature}
                </div>
              ))}
            </div>
            
            <Link to="/pricing">
              <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-4 h-auto">
                Upgrade to Agency
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-10 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // No data yet
  if (!analytics?.has_data) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-10" data-testid="team-analytics-page">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 border border-theme flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-theme-dim" />
            </div>
            <h1 className="font-serif text-3xl tracking-tight mb-3">
              No Team Data Yet
            </h1>
            <p className="text-theme-muted mb-8 max-w-md mx-auto">
              Your team hasn't analyzed any emails yet. Start analyzing to see team performance metrics.
            </p>
            <Link to="/analyze">
              <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-4 h-auto">
                Analyze Your First Email
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { team_summary, member_stats } = analytics;
  
  const chartColors = ['#d4af37', '#a3e635', '#22d3ee', '#f472b6', '#fb923c'];
  
  // Prepare data for charts
  const memberChartData = member_stats.map((m, i) => ({
    name: m.name.split(' ')[0],
    analyses: m.analyses_count,
    avgScore: m.avg_score,
    fill: chartColors[i % chartColors.length]
  }));

  const pieData = member_stats.map((m, i) => ({
    name: m.name.split(' ')[0],
    value: m.analyses_count,
    fill: chartColors[i % chartColors.length]
  }));

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 space-y-8" data-testid="team-analytics-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3">Team Performance</p>
            <h1 className="font-serif text-3xl sm:text-4xl tracking-tight mb-2">
              Team Analytics
            </h1>
            <p className="text-theme-muted">Track your team's email performance</p>
          </div>
          <div className="px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] text-sm font-mono">
            Agency Plan
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-theme-tertiary">
          {[
            { label: "Total Team Analyses", value: team_summary.total_analyses, icon: <BarChart3 className="w-5 h-5" />, color: "text-[#d4af37]" },
            { label: "Team Avg Score", value: team_summary.avg_score, icon: <Target className="w-5 h-5" />, color: "text-[#a3e635]" },
            { label: "Team Members", value: team_summary.member_count, icon: <Users className="w-5 h-5" />, color: "text-[#22d3ee]" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-theme-secondary p-6 sm:p-8"
            >
              <div className={`w-10 h-10 border border-theme flex items-center justify-center ${stat.color} mb-4`}>
                {stat.icon}
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold mb-2">{stat.value}</div>
              <div className="text-xs font-mono tracking-widest uppercase text-theme-dim">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Analyses by Member */}
          <div className="bg-theme-secondary border border-theme p-6">
            <h3 className="font-sans font-semibold mb-6">Analyses by Member</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberChartData} layout="vertical">
                  <XAxis type="number" stroke="var(--theme-text-dim)" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="var(--theme-text-dim)" fontSize={12} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--theme-bg-secondary)', 
                      border: '1px solid var(--theme-border)',
                      borderRadius: '0'
                    }}
                    labelStyle={{ color: 'var(--theme-text-muted)' }}
                  />
                  <Bar dataKey="analyses" radius={[0, 4, 4, 0]}>
                    {memberChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Pie Chart */}
          <div className="bg-theme-secondary border border-theme p-6">
            <h3 className="font-sans font-semibold mb-6">Work Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--theme-bg-secondary)', 
                      border: '1px solid var(--theme-border)',
                      borderRadius: '0'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Average Score by Member */}
        <div className="bg-theme-secondary border border-theme p-6">
          <h3 className="font-sans font-semibold mb-6">Average Score by Member</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberChartData}>
                <XAxis dataKey="name" stroke="var(--theme-text-dim)" fontSize={12} />
                <YAxis stroke="var(--theme-text-dim)" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--theme-bg-secondary)', 
                    border: '1px solid var(--theme-border)',
                    borderRadius: '0'
                  }}
                  labelStyle={{ color: 'var(--theme-text-muted)' }}
                />
                <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                  {memberChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Leaderboard */}
        <div className="bg-theme-secondary border border-theme overflow-hidden">
          <div className="p-6 border-b border-theme">
            <h3 className="font-sans font-semibold">Member Leaderboard</h3>
          </div>
          <div className="divide-y divide-theme">
            {member_stats.map((member, i) => (
              <div 
                key={member.user_id}
                className="p-4 sm:p-5 flex items-center gap-4 hover:bg-theme-tertiary transition-colors"
              >
                <div className={`w-8 h-8 flex items-center justify-center font-mono font-bold text-sm ${
                  i === 0 ? 'bg-[#d4af37] text-black' : 
                  i === 1 ? 'bg-zinc-400 text-black' : 
                  i === 2 ? 'bg-amber-700 text-white' : 
                  'bg-theme-tertiary text-theme-muted'
                }`}>
                  {i + 1}
                </div>
                <div className="w-10 h-10 bg-theme-tertiary flex items-center justify-center text-theme-muted font-bold">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{member.name}</p>
                  <p className="text-sm text-theme-dim font-mono truncate">{member.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">{member.analyses_count}</p>
                  <p className="text-xs text-theme-dim">analyses</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-bold ${
                    member.avg_score >= 70 ? 'text-[#a3e635]' : 
                    member.avg_score >= 50 ? 'text-[#d4af37]' : 
                    'text-red-500'
                  }`}>{member.avg_score}</p>
                  <p className="text-xs text-theme-dim">avg score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamAnalytics;
