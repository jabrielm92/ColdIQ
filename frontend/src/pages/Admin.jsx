import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Users, Database, CreditCard, BarChart3, Search, Trash2, 
  Edit, Plus, X, Check, RefreshCw, ChevronLeft, ChevronRight,
  Mail, Shield, Crown, Zap, ArrowLeft, MessageSquare, Building2, ExternalLink, Headphones
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [dbInfo, setDbInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modals
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(null);
  
  // Form states
  const [newUser, setNewUser] = useState({
    email: "", password: "", full_name: "", subscription_tier: "free", email_verified: true
  });
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === "stats") {
          const res = await axios.get(`${API}/admin/stats`);
          setStats(res.data);
        }
        if (activeTab === "users") {
          const params = new URLSearchParams({ page, limit: 15 });
          if (searchTerm) params.append("search", searchTerm);
          if (tierFilter) params.append("tier", tierFilter);
          const res = await axios.get(`${API}/admin/users?${params}`);
          setUsers(res.data.users);
          setTotalPages(res.data.pages);
        }
        if (activeTab === "payments") {
          const res = await axios.get(`${API}/admin/payments?page=${page}&limit=15`);
          setPayments(res.data.payments);
          setTotalPages(res.data.pages);
        }
        if (activeTab === "contacts") {
          const params = new URLSearchParams({ page, limit: 15 });
          if (statusFilter) params.append("status", statusFilter);
          const res = await axios.get(`${API}/admin/contact-requests?${params}`);
          setContactRequests(res.data.requests);
          setTotalPages(res.data.pages);
        }
        if (activeTab === "support") {
          const params = new URLSearchParams({ page, limit: 15 });
          if (statusFilter) params.append("status", statusFilter);
          const res = await axios.get(`${API}/admin/support-messages?${params}`);
          setSupportMessages(res.data.messages);
          setTotalPages(res.data.pages);
        }
        if (activeTab === "database") {
          const res = await axios.get(`${API}/admin/db-info`);
          setDbInfo(res.data.collections);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          toast.error("Admin access required");
          navigate("/dashboard");
        } else {
          toast.error("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeTab, page, searchTerm, tierFilter, statusFilter, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (searchTerm) params.append("search", searchTerm);
      if (tierFilter) params.append("tier", tierFilter);
      
      const res = await axios.get(`${API}/admin/users?${params}`);
      setUsers(res.data.users);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    try {
      const res = await axios.get(`${API}/admin/users/${userId}`);
      setShowUserDetail(res.data);
    } catch (err) {
      toast.error("Failed to fetch user details");
    }
  };

  const handleCreateUser = async () => {
    try {
      await axios.post(`${API}/admin/users`, newUser);
      toast.success("User created");
      setShowCreateUser(false);
      setNewUser({ email: "", password: "", full_name: "", subscription_tier: "free", email_verified: true });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create user");
    }
  };

  const handleUpdateUser = async (userId) => {
    try {
      await axios.patch(`${API}/admin/users/${userId}`, editData);
      toast.success("User updated");
      setShowEditUser(null);
      setEditData({});
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete user");
    }
  };

  const updateContactStatus = async (requestId, newStatus) => {
    try {
      await axios.patch(`${API}/admin/contact-requests/${requestId}?status=${newStatus}`);
      toast.success("Status updated");
      // Refresh the list
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append("status", statusFilter);
      const res = await axios.get(`${API}/admin/contact-requests?${params}`);
      setContactRequests(res.data.requests);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const updateSupportStatus = async (messageId, newStatus) => {
    try {
      await axios.patch(`${API}/admin/support-messages/${messageId}?status=${newStatus}`);
      toast.success("Status updated");
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append("status", statusFilter);
      const res = await axios.get(`${API}/admin/support-messages?${params}`);
      setSupportMessages(res.data.messages);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getSupportStatusBadge = (status) => {
    const styles = {
      new: "bg-emerald-500/20 text-emerald-400",
      in_progress: "bg-amber-500/20 text-amber-400",
      resolved: "bg-cyan-500/20 text-cyan-400",
      closed: "bg-zinc-700 text-zinc-400"
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-bold rounded ${styles[status] || styles.new}`}>
        {status?.replace("_", " ").toUpperCase() || "NEW"}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: "bg-emerald-500/20 text-emerald-400",
      contacted: "bg-amber-500/20 text-amber-400",
      converted: "bg-cyan-500/20 text-cyan-400",
      closed: "bg-zinc-700 text-zinc-400"
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-bold rounded ${styles[status] || styles.new}`}>
        {status?.toUpperCase() || "NEW"}
      </span>
    );
  };

  const getTierBadge = (tier) => {
    const styles = {
      free: "bg-zinc-700 text-zinc-300",
      starter: "bg-amber-500/20 text-amber-400",
      pro: "bg-cyan-500/20 text-cyan-400",
      agency: "bg-violet-500/20 text-violet-400",
      growth_agency: "bg-violet-500/20 text-violet-400"
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-bold rounded ${styles[tier] || styles.free}`}>
        {tier?.toUpperCase() || "FREE"}
      </span>
    );
  };

  const tabs = [
    { id: "stats", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "contacts", label: "Inquiries", icon: MessageSquare },
    { id: "support", label: "Support", icon: Headphones },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "database", label: "Database", icon: Database }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          <div className="text-sm text-zinc-400 flex items-center gap-4">
            <span>Logged in as <span className="text-amber-400">{user?.email}</span></span>
            <button 
              onClick={() => { localStorage.removeItem("coldiq_token"); window.location.href = "/"; }}
              className="text-zinc-500 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? "border-amber-400 text-amber-400" 
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <>
            {/* Stats Tab */}
            {activeTab === "stats" && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-xs uppercase">Total Users</span>
                    </div>
                    <p className="text-3xl font-bold">{stats.users.total}</p>
                    <p className="text-xs text-zinc-500 mt-1">+{stats.users.new_this_week} this week</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs uppercase">Verified</span>
                    </div>
                    <p className="text-3xl font-bold">{stats.users.verified}</p>
                    <p className="text-xs text-zinc-500 mt-1">{Math.round(stats.users.verified / stats.users.total * 100) || 0}% of total</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-xs uppercase">Analyses</span>
                    </div>
                    <p className="text-3xl font-bold">{stats.analyses.total}</p>
                    <p className="text-xs text-zinc-500 mt-1">+{stats.analyses.new_this_week} this week</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-xs uppercase">Payments</span>
                    </div>
                    <p className="text-3xl font-bold">{stats.payments.completed}</p>
                    <p className="text-xs text-zinc-500 mt-1">{stats.payments.pending} pending</p>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Subscription Breakdown</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-zinc-800/50 rounded">
                      <p className="text-2xl font-bold text-zinc-400">{stats.subscriptions.free}</p>
                      <p className="text-xs text-zinc-500 mt-1">Free</p>
                    </div>
                    <div className="text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded">
                      <p className="text-2xl font-bold text-amber-400">{stats.subscriptions.starter}</p>
                      <p className="text-xs text-amber-400/70 mt-1">Starter</p>
                    </div>
                    <div className="text-center p-4 bg-cyan-500/10 border border-cyan-500/20 rounded">
                      <p className="text-2xl font-bold text-cyan-400">{stats.subscriptions.pro}</p>
                      <p className="text-xs text-cyan-400/70 mt-1">Pro</p>
                    </div>
                    <div className="text-center p-4 bg-violet-500/10 border border-violet-500/20 rounded">
                      <p className="text-2xl font-bold text-violet-400">{stats.subscriptions.agency}</p>
                      <p className="text-xs text-violet-400/70 mt-1">Agency</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="pl-9 bg-zinc-900 border-zinc-700 w-64"
                      />
                    </div>
                    <select
                      value={tierFilter}
                      onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
                      className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm"
                    >
                      <option value="">All Tiers</option>
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="growth_agency">Agency</option>
                    </select>
                  </div>
                  <Button onClick={() => setShowCreateUser(true)} className="bg-amber-500 hover:bg-amber-600 text-black">
                    <Plus className="w-4 h-4 mr-2" /> Add User
                  </Button>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-zinc-800/50">
                      <tr>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">User</th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Tier</th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Verified</th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Analyses</th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Joined</th>
                        <th className="text-right text-xs font-medium text-zinc-400 uppercase px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-zinc-800/30">
                          <td className="px-4 py-3">
                            <button onClick={() => fetchUserDetail(u.id)} className="text-left hover:text-amber-400">
                              <p className="font-medium">{u.full_name || "No name"}</p>
                              <p className="text-xs text-zinc-500">{u.email}</p>
                            </button>
                          </td>
                          <td className="px-4 py-3">{getTierBadge(u.subscription_tier)}</td>
                          <td className="px-4 py-3">
                            {u.email_verified ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <X className="w-4 h-4 text-red-400" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-400">{u.analyses_count || 0}</td>
                          <td className="px-4 py-3 text-zinc-400 text-sm">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => { setShowEditUser(u); setEditData({ subscription_tier: u.subscription_tier, email_verified: u.email_verified }); }}
                                className="p-1.5 hover:bg-zinc-700 rounded"
                              >
                                <Edit className="w-4 h-4 text-zinc-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="p-1.5 hover:bg-red-500/20 rounded"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-zinc-400">Page {page} of {totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div className="space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-zinc-800/50">
                      <tr>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">User</th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Plan</th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Amount</th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Status</th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No payments yet</td>
                        </tr>
                      ) : payments.map(p => (
                        <tr key={p.id} className="hover:bg-zinc-800/30">
                          <td className="px-4 py-3">
                            <p className="font-medium">{p.user_name || "Unknown"}</p>
                            <p className="text-xs text-zinc-500">{p.user_email}</p>
                          </td>
                          <td className="px-4 py-3">{getTierBadge(p.plan_tier)}</td>
                          <td className="px-4 py-3 font-mono">${p.amount?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                              p.payment_status === "paid" ? "bg-emerald-500/20 text-emerald-400" :
                              p.payment_status === "pending" ? "bg-amber-500/20 text-amber-400" :
                              "bg-red-500/20 text-red-400"
                            }`}>
                              {p.payment_status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-400 text-sm">
                            {new Date(p.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === "contacts" && (
              <div className="space-y-4">
                <div className="flex gap-3 items-center">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-zinc-800/50">
                      <tr>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Contact</th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Company</th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Team Size</th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Status</th>
                        <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Date</th>
                        <th className="text-right text-xs font-medium text-zinc-400 uppercase px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {contactRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No contact requests yet</td>
                        </tr>
                      ) : contactRequests.map(req => (
                        <tr key={req.id} className="hover:bg-zinc-800/30">
                          <td className="px-4 py-3">
                            <p className="font-medium">{req.name}</p>
                            <a href={`mailto:${req.email}`} className="text-xs text-cyan-400 hover:underline">{req.email}</a>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-zinc-500" />
                              <span>{req.company}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-zinc-400">{req.team_size || '-'}</td>
                          <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                          <td className="px-4 py-3 text-zinc-400 text-sm">
                            {new Date(req.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <a
                                href={`mailto:${req.email}?subject=Re: ColdIQ Growth Agency Inquiry`}
                                className="p-1.5 hover:bg-zinc-700 rounded"
                                title="Reply via Email"
                              >
                                <Mail className="w-4 h-4 text-cyan-400" />
                              </a>
                              <select
                                value={req.status}
                                onChange={(e) => updateContactStatus(req.id, e.target.value)}
                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs"
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="converted">Converted</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-zinc-400">Page {page} of {totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Database Tab */}
            {activeTab === "database" && dbInfo && (
              <div className="space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-amber-400" />
                    Collection Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Object.entries(dbInfo).map(([name, count]) => (
                      <div key={name} className="bg-zinc-800/50 rounded p-4">
                        <p className="text-2xl font-bold font-mono">{count}</p>
                        <p className="text-xs text-zinc-400 mt-1">{name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Modal */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Full Name"
              value={newUser.full_name}
              onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
              className="bg-zinc-800 border-zinc-700"
            />
            <Input
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="bg-zinc-800 border-zinc-700"
            />
            <Input
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="bg-zinc-800 border-zinc-700"
            />
            <select
              value={newUser.subscription_tier}
              onChange={(e) => setNewUser({...newUser, subscription_tier: e.target.value})}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
            >
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="growth_agency">Growth Agency</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newUser.email_verified}
                onChange={(e) => setNewUser({...newUser, email_verified: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">Email Verified</span>
            </label>
            <Button onClick={handleCreateUser} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
              Create User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!showEditUser} onOpenChange={() => setShowEditUser(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle>Edit User: {showEditUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Subscription Tier</label>
              <select
                value={editData.subscription_tier || ""}
                onChange={(e) => setEditData({...editData, subscription_tier: e.target.value})}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="growth_agency">Growth Agency</option>
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editData.email_verified || false}
                onChange={(e) => setEditData({...editData, email_verified: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">Email Verified</span>
            </label>
            <Button onClick={() => handleUpdateUser(showEditUser?.id)} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Detail Modal */}
      <Dialog open={!!showUserDetail} onOpenChange={() => setShowUserDetail(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {showUserDetail && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Name</p>
                  <p className="font-medium">{showUserDetail.user.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Email</p>
                  <p className="font-medium">{showUserDetail.user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Tier</p>
                  {getTierBadge(showUserDetail.user.subscription_tier)}
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Joined</p>
                  <p className="font-medium">{new Date(showUserDetail.user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Recent Analyses ({showUserDetail.recent_analyses.length})</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {showUserDetail.recent_analyses.map(a => (
                    <div key={a.id} className="text-xs bg-zinc-800 p-2 rounded flex justify-between">
                      <span className="truncate flex-1">{a.subject_line || "No subject"}</span>
                      <span className="text-amber-400 ml-2">{a.analysis_score}/100</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {showUserDetail.payments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Payments ({showUserDetail.payments.length})</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {showUserDetail.payments.map(p => (
                      <div key={p.id} className="text-xs bg-zinc-800 p-2 rounded flex justify-between">
                        <span>{p.plan_tier}</span>
                        <span className="font-mono">${p.amount?.toFixed(2) || '0.00'}</span>
                        <span className={p.payment_status === "paid" ? "text-emerald-400" : "text-amber-400"}>
                          {p.payment_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
