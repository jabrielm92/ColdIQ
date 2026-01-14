import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  User, CreditCard, Settings as SettingsIcon, LogOut, Save, Key, Users,
  Check, X, Lock, Copy, Trash2, Plus, Eye, EyeOff
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyVisible, setNewKeyVisible] = useState(null);
  const [team, setTeam] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || "",
    role: user?.role || "",
    target_industry: user?.target_industry || "",
    monthly_email_volume: user?.monthly_email_volume || ""
  });

  useEffect(() => {
    fetchFeatures();
    if (user?.subscription_tier === "agency") {
      fetchApiKeys();
      fetchTeam();
    }
  }, [user?.subscription_tier]);

  const fetchFeatures = async () => {
    try {
      const res = await axios.get(`${API}/user/features`);
      setFeatures(res.data);
    } catch (err) {
      console.error("Failed to fetch features", err);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const res = await axios.get(`${API}/api-keys`);
      setApiKeys(res.data.api_keys || []);
    } catch (err) {
      console.error("Failed to fetch API keys", err);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await axios.get(`${API}/team`);
      setTeam(res.data);
    } catch (err) {
      console.error("Failed to fetch team", err);
    }
  };

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

  const handleCreateApiKey = async () => {
    try {
      const res = await axios.post(`${API}/api-keys`);
      setNewKeyVisible(res.data.key);
      fetchApiKeys();
      toast.success("API key created! Copy it now - it won't be shown again.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create API key");
    }
  };

  const handleDeleteApiKey = async (keyId) => {
    try {
      await axios.delete(`${API}/api-keys/${keyId}`);
      fetchApiKeys();
      toast.success("API key deleted");
    } catch (err) {
      toast.error("Failed to delete API key");
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      const res = await axios.post(`${API}/team/invite`, { email: inviteEmail, role: "member" });
      toast.success(res.data.message);
      setInviteEmail("");
      fetchTeam();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to invite member");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axios.delete(`${API}/team/members/${memberId}`);
      toast.success("Member removed");
      fetchTeam();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to remove member");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const tierInfo = {
    free: { name: "Free", price: "$0", color: "text-zinc-400", bg: "bg-zinc-700" },
    starter: { name: "Starter", price: "$29/mo", color: "text-emerald-400", bg: "bg-emerald-500/20" },
    pro: { name: "Pro", price: "$79/mo", color: "text-indigo-400", bg: "bg-indigo-500/20" },
    agency: { name: "Agency", price: "$199/mo", color: "text-violet-400", bg: "bg-violet-500/20" }
  };

  const currentTier = tierInfo[user?.subscription_tier || "free"];
  const isAgency = user?.subscription_tier === "agency";
  const isPro = user?.subscription_tier === "pro" || isAgency;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8" data-testid="settings-page">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>
              Settings
            </h1>
            <p className="text-zinc-400">Manage your account, billing, and team</p>
          </div>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 flex-wrap">
              <TabsTrigger value="profile" className="data-[state=active]:bg-zinc-800">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-zinc-800">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
              {isAgency && (
                <>
                  <TabsTrigger value="team" className="data-[state=active]:bg-zinc-800">
                    <Users className="w-4 h-4 mr-2" />
                    Team
                  </TabsTrigger>
                  <TabsTrigger value="api" className="data-[state=active]:bg-zinc-800">
                    <Key className="w-4 h-4 mr-2" />
                    API
                  </TabsTrigger>
                </>
              )}
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
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800">
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
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800">
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
              
              {/* Logout */}
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
                
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full ${currentTier.bg} ${currentTier.color} text-sm font-medium`}>
                      {currentTier.name}
                    </div>
                    <span className="text-zinc-400">{currentTier.price}</span>
                  </div>
                  {user?.subscription_tier === 'free' && (
                    <Link to="/pricing">
                      <Button className="bg-gradient-to-r from-indigo-600 to-violet-600" data-testid="upgrade-btn">
                        Upgrade
                      </Button>
                    </Link>
                  )}
                </div>
                
                {/* Features List */}
                {features && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-zinc-300">Your Plan Features</h4>
                    <div className="grid gap-2">
                      {[
                        { key: "analyses_limit", label: "Monthly Analyses", value: features.analyses_limit === 999999 ? "Unlimited" : features.analyses_limit },
                        { key: "history_limit", label: "History Access", value: features.history_limit === 999999 ? "Full" : `Last ${features.history_limit}` },
                        { key: "insights_dashboard", label: "Insights Dashboard", bool: true },
                        { key: "advanced_insights", label: "Advanced Analytics", bool: true },
                        { key: "recommendations", label: "AI Recommendations", bool: true },
                        { key: "export_csv", label: "Export to CSV", bool: true },
                        { key: "templates", label: "Email Templates", bool: true },
                        { key: "team_seats", label: "Team Seats", value: features.team_seats || "Not included" },
                        { key: "api_access", label: "API Access", bool: true },
                        { key: "priority_support", label: "Priority Support", bool: true },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                          <span className="text-zinc-400">{item.label}</span>
                          {item.bool ? (
                            features[item.key] ? (
                              <Check className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <X className="w-5 h-5 text-zinc-600" />
                            )
                          ) : (
                            <span className="font-medium" style={{ fontFamily: 'JetBrains Mono' }}>
                              {item.value}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Link to="/pricing" className="block mt-6">
                  <Button variant="outline" className="w-full border-zinc-700">
                    {user?.subscription_tier === 'free' ? 'View Plans & Upgrade' : 'Compare Plans'}
                  </Button>
                </Link>
              </div>
            </TabsContent>
            
            {/* Team Tab (Agency only) */}
            {isAgency && (
              <TabsContent value="team" className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold" style={{ fontFamily: 'Manrope' }}>Team Members</h3>
                      <p className="text-sm text-zinc-500">
                        {team?.seats_used || 1} / {team?.seats_total || 5} seats used
                      </p>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-gradient-to-r from-indigo-600 to-violet-600"
                          disabled={(team?.seats_used || 1) >= 5}
                          data-testid="invite-member-btn"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Invite Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-900 border-zinc-800">
                        <DialogHeader>
                          <DialogTitle>Invite Team Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="colleague@company.com"
                              className="bg-zinc-800 border-zinc-700"
                              data-testid="invite-email-input"
                            />
                          </div>
                          <Button 
                            onClick={handleInviteMember}
                            disabled={inviteLoading || !inviteEmail}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600"
                            data-testid="send-invite-btn"
                          >
                            {inviteLoading ? "Sending..." : "Send Invite"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="space-y-3">
                    {team?.members?.map((member) => (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            {member.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-medium">{member.full_name}</p>
                            <p className="text-sm text-zinc-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            member.team_role === "owner" ? "bg-violet-500/20 text-violet-400" : "bg-zinc-700 text-zinc-400"
                          }`}>
                            {member.team_role || "member"}
                          </span>
                          {member.id !== user?.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-zinc-400 hover:text-red-400"
                              data-testid={`remove-member-${member.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}
            
            {/* API Tab (Agency only) */}
            {isAgency && (
              <TabsContent value="api" className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold" style={{ fontFamily: 'Manrope' }}>API Keys</h3>
                      <p className="text-sm text-zinc-500">
                        Use API keys to integrate ColdIQ with your applications
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleCreateApiKey}
                      disabled={apiKeys.length >= 3}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600"
                      data-testid="create-api-key-btn"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Key
                    </Button>
                  </div>
                  
                  {/* New Key Display */}
                  {newKeyVisible && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <p className="text-sm text-emerald-400 mb-2">New API Key (copy now - shown only once)</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-zinc-900 rounded text-sm font-mono break-all">
                          {newKeyVisible}
                        </code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(newKeyVisible)}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setNewKeyVisible(null)}
                        className="mt-2 text-zinc-400"
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                  
                  {/* Existing Keys */}
                  <div className="space-y-3">
                    {apiKeys.length === 0 ? (
                      <p className="text-zinc-500 text-center py-8">No API keys created yet</p>
                    ) : (
                      apiKeys.map((key) => (
                        <div 
                          key={key.id}
                          className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{key.name}</p>
                            <code className="text-sm text-zinc-500 font-mono">{key.key_preview}</code>
                            {key.last_used && (
                              <p className="text-xs text-zinc-600 mt-1">
                                Last used: {new Date(key.last_used).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteApiKey(key.id)}
                            className="text-zinc-400 hover:text-red-400"
                            data-testid={`delete-key-${key.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* API Documentation */}
                  <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
                    <h4 className="font-medium mb-2">API Usage</h4>
                    <code className="text-sm text-zinc-400 block">
                      POST /api/v1/analyze<br/>
                      Header: X-API-Key: your_api_key<br/>
                      Body: {`{"subject": "...", "body": "..."}`}
                    </code>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
