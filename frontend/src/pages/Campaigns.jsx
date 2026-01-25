import React, { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { 
  Target, TrendingUp, Mail, BarChart3, Lock, Plus, ArrowUp, ArrowDown
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const Campaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAgency = user?.subscription_tier === "agency" || user?.subscription_tier === "growth_agency" || user?.subscription_tier === "growth_agency";

  useEffect(() => {
    if (isAgency) {
      fetchCampaigns();
    } else {
      setLoading(false);
    }
  }, [isAgency]);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get(`${API}/campaigns`);
      setCampaigns(res.data.campaigns || []);
    } catch (err) {
      console.error("Failed to fetch campaigns", err);
    } finally {
      setLoading(false);
    }
  };

  // Locked state for non-Agency users
  if (!isAgency) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-800 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-600" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl mb-3 sm:mb-4">Campaign Analytics</h1>
              <p className="text-zinc-500 text-sm sm:text-base max-w-md mx-auto mb-6 sm:mb-8 px-4">
                Track performance across entire campaigns, not just individual emails. See which angles, subject lines, and CTAs perform best.
              </p>
              
              {/* Preview stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto mb-6 sm:mb-8 px-4">
                <div className="bg-zinc-900/50 border border-zinc-800 p-3 sm:p-4">
                  <p className="text-lg sm:text-2xl font-mono font-bold text-emerald-400">+34%</p>
                  <p className="text-[9px] sm:text-[10px] text-zinc-500">Reply Rate</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-3 sm:p-4">
                  <p className="text-lg sm:text-2xl font-mono font-bold text-[#d4af37]">72</p>
                  <p className="text-[9px] sm:text-[10px] text-zinc-500">Avg Score</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-3 sm:p-4">
                  <p className="text-lg sm:text-2xl font-mono font-bold">24</p>
                  <p className="text-[9px] sm:text-[10px] text-zinc-500">Emails</p>
                </div>
              </div>
              
              <Link to="/pricing">
                <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-6 sm:px-8 py-3 sm:py-4 h-auto">
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
      <div className="p-6 lg:p-8" data-testid="campaigns-page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-3">Campaign Intelligence</p>
              <h1 className="font-serif text-4xl tracking-tight">Campaigns</h1>
            </div>
            <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>

          {/* Leaderboards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Top Subject Lines */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#d4af37]" />
                Top Subject Lines
              </h3>
              <div className="space-y-3">
                {[
                  { subject: "Quick question about {{company}}", score: 82, change: +12 },
                  { subject: "Saw your recent {{trigger}}", score: 78, change: +8 },
                  { subject: "{{name}}, thought of you", score: 74, change: -2 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/30">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-sm truncate max-w-[200px]">{item.subject}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">{item.score}</span>
                      <span className={`text-xs flex items-center ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(item.change)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Top CTAs */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Top CTAs
              </h3>
              <div className="space-y-3">
                {[
                  { cta: "Would Tuesday at 2pm work?", response: 4.2, change: +18 },
                  { cta: "Worth a 15-min chat?", response: 3.8, change: +5 },
                  { cta: "Can I send over a case study?", response: 3.1, change: -3 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/30">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-sm truncate max-w-[200px]">{item.cta}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">{item.response}%</span>
                      <span className={`text-xs flex items-center ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(item.change)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign List */}
          <div className="bg-zinc-900/50 border border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-medium">Active Campaigns</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="p-8 text-center">
                <Target className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">No campaigns yet</p>
                <p className="text-xs text-zinc-600 mt-1">Group your analyses into campaigns to track performance</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {campaigns.map((campaign, i) => (
                  <div key={campaign.id || i} className="p-4 flex items-center justify-between hover:bg-zinc-800/30">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-xs text-zinc-500">{campaign.client_name} • {campaign.email_count} emails</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-mono text-[#d4af37]">{campaign.avg_score}</p>
                        <p className="text-[10px] text-zinc-500">Avg Score</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-cyan-400">{campaign.response_rate}%</p>
                        <p className="text-[10px] text-zinc-500">Response</p>
                      </div>
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

export default Campaigns;
