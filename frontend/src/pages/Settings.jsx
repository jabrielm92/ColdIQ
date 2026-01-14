import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  User, CreditCard, Settings as SettingsIcon, LogOut, Save
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || "",
    role: user?.role || "",
    target_industry: user?.target_industry || "",
    monthly_email_volume: user?.monthly_email_volume || ""
  });

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const res = await axios.patch(`${API}/user/profile`, profileData);
      updateUser(res.data);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const tierInfo = {
    free: { name: "Free", price: "$0", color: "text-zinc-400", bg: "bg-zinc-700" },
    starter: { name: "Starter", price: "$29/mo", color: "text-emerald-400", bg: "bg-emerald-500/20" },
    pro: { name: "Pro", price: "$79/mo", color: "text-indigo-400", bg: "bg-indigo-500/20" },
    agency: { name: "Agency", price: "$199/mo", color: "text-violet-400", bg: "bg-violet-500/20" }
  };

  const currentTier = tierInfo[user?.subscription_tier || "free"];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8" data-testid="settings-page">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>
              Settings
            </h1>
            <p className="text-zinc-400">Manage your account and preferences</p>
          </div>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-zinc-800">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-zinc-800">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-400"
                  />
                  <p className="text-xs text-zinc-500">Email cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-zinc-300">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="bg-zinc-900/50 border-zinc-800 focus:border-indigo-500"
                    data-testid="settings-name-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-zinc-300">Role</Label>
                  <Select 
                    value={profileData.role} 
                    onValueChange={(v) => setProfileData({ ...profileData, role: v })}
                  >
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800" data-testid="settings-role-select">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salesperson">Salesperson</SelectItem>
                      <SelectItem value="founder">Founder / CEO</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="marketer">Marketer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-zinc-300">Target Industry</Label>
                  <Select 
                    value={profileData.target_industry} 
                    onValueChange={(v) => setProfileData({ ...profileData, target_industry: v })}
                  >
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800" data-testid="settings-industry-select">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SaaS / Software">SaaS / Software</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Recruiting / HR">Recruiting / HR</SelectItem>
                      <SelectItem value="Marketing Agency">Marketing Agency</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Finance / Banking">Finance / Banking</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
                  data-testid="save-profile-btn"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
              
              {/* Danger Zone */}
              <div className="bg-zinc-900/50 border border-red-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-red-400 mb-4" style={{ fontFamily: 'Manrope' }}>Danger Zone</h3>
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  data-testid="logout-settings-btn"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </TabsContent>
            
            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4" style={{ fontFamily: 'Manrope' }}>Current Plan</h3>
                
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full ${currentTier.bg} ${currentTier.color} text-sm font-medium`}>
                      {currentTier.name}
                    </div>
                    <span className="text-zinc-400">{currentTier.price}</span>
                  </div>
                  {user?.subscription_tier === 'free' ? (
                    <Link to="/pricing">
                      <Button className="bg-gradient-to-r from-indigo-600 to-violet-600" data-testid="upgrade-btn">
                        Upgrade
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-sm text-zinc-500">Active</span>
                  )}
                </div>
                
                {/* Usage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Monthly Usage</span>
                    <span className="font-medium" style={{ fontFamily: 'JetBrains Mono' }}>
                      {user?.analyses_used_this_month || 0} / {
                        user?.subscription_tier === 'free' ? '3' : 
                        user?.subscription_tier === 'starter' ? '50' : '∞'
                      }
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ 
                        width: `${Math.min(
                          (user?.analyses_used_this_month || 0) / 
                          (user?.subscription_tier === 'free' ? 3 : user?.subscription_tier === 'starter' ? 50 : 100) * 100
                        , 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Plan Comparison */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4" style={{ fontFamily: 'Manrope' }}>Compare Plans</h3>
                <div className="grid grid-cols-4 gap-4 text-center text-sm">
                  {Object.entries(tierInfo).map(([key, tier]) => (
                    <div key={key} className={`p-3 rounded-lg ${user?.subscription_tier === key ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-zinc-800/50'}`}>
                      <p className={`font-medium ${tier.color}`}>{tier.name}</p>
                      <p className="text-zinc-500 text-xs mt-1">{tier.price}</p>
                    </div>
                  ))}
                </div>
                
                <Link to="/pricing" className="block mt-4">
                  <Button variant="outline" className="w-full border-zinc-700" data-testid="view-plans-btn">
                    View All Plan Details
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
