import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  FileText, Plus, Copy, Check, Lock, ArrowRight, Trash2, Search, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Templates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copied, setCopied] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    body: "",
    category: "Outreach",
    is_shared: false
  });

  const isPro = user?.subscription_tier === "pro" || user?.subscription_tier === "agency";

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${API}/templates`);
      if (res.data.available) {
        setTemplates(res.data.templates || []);
      }
    } catch (err) {
      console.error("Failed to fetch templates", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post(`${API}/templates`, newTemplate);
      setTemplates([res.data, ...templates]);
      setShowCreateDialog(false);
      setNewTemplate({ name: "", subject: "", body: "", category: "Outreach", is_shared: false });
      toast.success("Template created!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create template");
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await axios.delete(`${API}/templates/${id}`);
      setTemplates(templates.filter(t => t.id !== id));
      toast.success("Template deleted");
    } catch (err) {
      toast.error("Failed to delete template");
    }
  };

  const copyToClipboard = async (template) => {
    const text = `Subject: ${template.subject}\n\n${template.body}`;
    await navigator.clipboard.writeText(text);
    setCopied(template.id);
    toast.success("Template copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const categories = ["all", ...new Set(templates.map(t => t.category).filter(Boolean))];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = 
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Locked state for non-Pro users
  if (!isPro) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8" data-testid="templates-page">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-zinc-500" />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
              Unlock Email Templates
            </h1>
            <p className="text-zinc-400 mb-4 max-w-md mx-auto">
              Upgrade to Pro or Agency to access high-converting email templates and create your own.
            </p>
            
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8 text-left">
              {[
                "5+ proven templates",
                "Customizable fields",
                "Save your own",
                "Share with team"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-zinc-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {feature}
                </div>
              ))}
            </div>
            
            <Link to="/pricing">
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary">
                Upgrade to Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8" data-testid="templates-page">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>
                Email Templates
              </h1>
              <p className="text-zinc-400">High-converting templates ready to customize</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search templates..."
                  className="pl-10 bg-zinc-900/50 border-zinc-800 w-full md:w-64"
                />
              </div>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-violet-600" data-testid="create-template-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Manrope' }}>Create Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Template Name</Label>
                      <Input
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="e.g., SaaS Outreach"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select 
                        value={newTemplate.category}
                        onValueChange={(v) => setNewTemplate({ ...newTemplate, category: v })}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Outreach">Outreach</SelectItem>
                          <SelectItem value="Follow-up">Follow-up</SelectItem>
                          <SelectItem value="Pain Point">Pain Point</SelectItem>
                          <SelectItem value="Case Study">Case Study</SelectItem>
                          <SelectItem value="Direct">Direct</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subject Line</Label>
                      <Input
                        value={newTemplate.subject}
                        onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                        placeholder="Use {{variables}} for personalization"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Body</Label>
                      <Textarea
                        value={newTemplate.body}
                        onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                        placeholder="Hi {{first_name}},&#10;&#10;..."
                        className="bg-zinc-800 border-zinc-700 min-h-[150px]"
                      />
                    </div>
                    <Button 
                      onClick={handleCreateTemplate}
                      className="w-full bg-gradient-to-r from-indigo-600 to-violet-600"
                    >
                      Create Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat 
                  ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border-indigo-500/30" 
                  : "border-zinc-700 text-zinc-400"
                }
              >
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </div>
          
          {/* Templates Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No templates found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {template.is_system && (
                        <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                        </div>
                      )}
                      <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                        {template.category}
                      </span>
                    </div>
                    {template.avg_score && (
                      <span className="text-xs text-emerald-400 font-medium" style={{ fontFamily: 'JetBrains Mono' }}>
                        {template.avg_score} avg
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold mb-2" style={{ fontFamily: 'Manrope' }}>{template.name}</h3>
                  <p className="text-sm text-zinc-500 mb-1">Subject:</p>
                  <p className="text-sm text-zinc-300 mb-3 truncate">{template.subject}</p>
                  <p className="text-sm text-zinc-500 mb-1">Preview:</p>
                  <p className="text-xs text-zinc-400 line-clamp-3">{template.body}</p>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(template)}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700"
                    >
                      {copied === template.id ? (
                        <><Check className="w-3 h-3 mr-1" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3 mr-1" /> Copy</>
                      )}
                    </Button>
                    {!template.is_system && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Templates;
