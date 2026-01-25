import React, { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, Plus, Building2, MoreVertical, Trash2, Edit2, 
  BarChart3, Mail, TrendingUp, Lock
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", industry: "", contact_email: "" });

  const isAgency = user?.subscription_tier === "agency" || user?.subscription_tier === "growth_agency" || user?.subscription_tier === "growth_agency";

  useEffect(() => {
    if (isAgency) {
      fetchClients();
    } else {
      setLoading(false);
    }
  }, [isAgency]);

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API}/clients`);
      setClients(res.data.clients || []);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async () => {
    if (!newClient.name.trim()) {
      toast.error("Client name is required");
      return;
    }
    try {
      const res = await axios.post(`${API}/clients`, newClient);
      setClients([...clients, res.data]);
      setNewClient({ name: "", industry: "", contact_email: "" });
      setShowAddModal(false);
      toast.success("Client added successfully");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add client");
    }
  };

  const deleteClient = async (clientId) => {
    if (!confirm("Delete this client? This will also delete all their analyses.")) return;
    try {
      await axios.delete(`${API}/clients/${clientId}`);
      setClients(clients.filter(c => c.id !== clientId));
      toast.success("Client deleted");
    } catch (err) {
      toast.error("Failed to delete client");
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
              <h1 className="font-serif text-3xl mb-4">Multi-Client Workspaces</h1>
              <p className="text-zinc-500 max-w-md mx-auto mb-8">
                Manage multiple clients with separate analysis histories, templates, and performance tracking. Perfect for agencies.
              </p>
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
      <div className="p-6 lg:p-8" data-testid="clients-page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-3">Client Management</p>
              <h1 className="font-serif text-4xl tracking-tight">Your Clients</h1>
            </div>
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Client Name *</Label>
                    <Input 
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      placeholder="Acme Corp"
                      className="bg-zinc-800 border-zinc-700 mt-1"
                    />
                  </div>
                  <div>
                    <Label>Industry</Label>
                    <Input 
                      value={newClient.industry}
                      onChange={(e) => setNewClient({...newClient, industry: e.target.value})}
                      placeholder="SaaS, E-commerce, etc."
                      className="bg-zinc-800 border-zinc-700 mt-1"
                    />
                  </div>
                  <div>
                    <Label>Contact Email</Label>
                    <Input 
                      value={newClient.contact_email}
                      onChange={(e) => setNewClient({...newClient, contact_email: e.target.value})}
                      placeholder="contact@acme.com"
                      className="bg-zinc-800 border-zinc-700 mt-1"
                    />
                  </div>
                  <Button onClick={addClient} className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none">
                    Add Client
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900/50 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-500 mb-1">Total Clients</p>
              <p className="text-2xl font-mono font-bold">{clients.length}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-500 mb-1">Total Analyses</p>
              <p className="text-2xl font-mono font-bold">{clients.reduce((sum, c) => sum + (c.analyses_count || 0), 0)}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-500 mb-1">Avg Score</p>
              <p className="text-2xl font-mono font-bold text-[#d4af37]">
                {clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + (c.avg_score || 0), 0) / clients.length) : '--'}
              </p>
            </div>
          </div>

          {/* Client Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 animate-pulse">
                  <div className="h-6 w-32 bg-zinc-800 rounded mb-4" />
                  <div className="h-4 w-24 bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800">
              <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-2">No clients yet</p>
              <p className="text-sm text-zinc-600">Add your first client to start organizing analyses</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-zinc-900/50 border border-zinc-800 p-6 hover:border-zinc-700 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-bold">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        {client.industry && <p className="text-xs text-zinc-500">{client.industry}</p>}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteClient(client.id)}
                      className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div>
                      <p className="text-lg font-mono font-bold">{client.analyses_count || 0}</p>
                      <p className="text-[10px] text-zinc-500">Analyses</p>
                    </div>
                    <div>
                      <p className="text-lg font-mono font-bold text-[#d4af37]">{client.avg_score || '--'}</p>
                      <p className="text-[10px] text-zinc-500">Avg Score</p>
                    </div>
                    <div>
                      <p className="text-lg font-mono font-bold text-cyan-400">{client.avg_response || '--'}%</p>
                      <p className="text-[10px] text-zinc-500">Response</p>
                    </div>
                  </div>
                  
                  <Link to={`/analyze?client=${client.id}`}>
                    <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 rounded-none text-xs">
                      <Mail className="w-3 h-3 mr-2" />
                      Analyze for {client.name}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
