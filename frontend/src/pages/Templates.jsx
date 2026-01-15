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
  const [selectedIndustry, setSelectedIndustry] = useState("all");
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

  // Get unique industries and categories
  const industries = ["all", ...new Set(templates.map(t => t.industry).filter(Boolean))];
  const categories = ["all", ...new Set(templates.map(t => t.category).filter(Boolean))];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = 
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "all" || t.industry === selectedIndustry;
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesIndustry && matchesCategory;
  });

  // Locked state for non-Pro users
  if (!isPro) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-10" data-testid="templates-page">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 border border-theme flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-theme-dim" />
            </div>
            <h1 className="font-serif text-3xl tracking-tight mb-3">
              Unlock Email Templates
            </h1>
            <p className="text-theme-muted mb-6 max-w-md mx-auto">
              Upgrade to Pro or Agency to access 17+ high-converting email templates across multiple industries.
            </p>
            
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8 text-left">
              {[
                "17+ proven templates",
                "Industry-specific",
                "Customizable fields",
                "Save your own"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-theme-muted">
                  <div className="w-1.5 h-1.5 bg-[#d4af37]" />
                  {feature}
                </div>
              ))}
            </div>
            
            <Link to="/pricing">
              <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-4 h-auto">
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
      <div className="p-6 lg:p-10" data-testid="templates-page">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3">Templates</p>
              <h1 className="font-serif text-4xl tracking-tight mb-2">
                Email Templates
              </h1>
              <p className="text-theme-muted">17 high-converting templates across 7 industries</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-dim" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search templates..."
                  className="pl-10 w-full md:w-64 bg-transparent border-b border-theme focus:border-[#d4af37] text-theme px-3 py-3 outline-none transition-colors placeholder:text-theme-dim font-mono text-sm"
                />
              </div>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-6 py-3 h-auto" data-testid="create-template-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg bg-theme-secondary border-theme">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Create Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-mono tracking-widest uppercase text-theme-muted">Template Name</Label>
                      <input
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="e.g., SaaS Outreach"
                        className="w-full bg-transparent border-b border-theme focus:border-[#d4af37] text-theme py-3 outline-none transition-colors placeholder:text-theme-dim"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-mono tracking-widest uppercase text-theme-muted">Category</Label>
                      <Select 
                        value={newTemplate.category}
                        onValueChange={(v) => setNewTemplate({ ...newTemplate, category: v })}
                      >
                        <SelectTrigger className="bg-theme-tertiary border-theme rounded-none">
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
                      <Label className="text-xs font-mono tracking-widest uppercase text-theme-muted">Subject Line</Label>
                      <input
                        value={newTemplate.subject}
                        onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                        placeholder="Use {{variables}} for personalization"
                        className="w-full bg-transparent border-b border-theme focus:border-[#d4af37] text-theme py-3 outline-none transition-colors placeholder:text-theme-dim"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-mono tracking-widest uppercase text-theme-muted">Email Body</Label>
                      <Textarea
                        value={newTemplate.body}
                        onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                        placeholder="Hi {{first_name}},&#10;&#10;..."
                        className="bg-theme-tertiary border-theme min-h-[150px] rounded-none"
                      />
                    </div>
                    <Button 
                      onClick={handleCreateTemplate}
                      className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs py-4 h-auto"
                    >
                      Create Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Industry Filter */}
          <div className="mb-4">
            <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3">Industry</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {industries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-4 py-2 text-xs font-mono tracking-wide uppercase transition-all whitespace-nowrap ${
                    selectedIndustry === ind 
                      ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30' 
                      : 'border border-theme text-theme-muted hover:border-theme-muted'
                  }`}
                >
                  {ind === "all" ? "All Industries" : ind}
                </button>
              ))}
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="mb-8">
            <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3">Category</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-mono tracking-wide uppercase transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/30' 
                      : 'border border-theme text-theme-muted hover:border-theme-muted'
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* Templates Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-16 border border-theme">
              <FileText className="w-12 h-12 text-theme-dim mx-auto mb-4" />
              <p className="text-theme-muted">No templates found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-theme-tertiary">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-theme p-6 hover:bg-theme-secondary transition-colors group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {template.is_system && (
                        <div className="w-6 h-6 bg-[#d4af37]/10 flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-[#d4af37]" />
                        </div>
                      )}
                      {template.industry && (
                        <span className="text-xs px-2 py-1 bg-theme-tertiary text-theme-muted font-mono">
                          {template.industry}
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 bg-theme-tertiary text-theme-muted font-mono">
                        {template.category}
                      </span>
                    </div>
                    {template.avg_score && (
                      <span className="text-xs text-[#a3e635] font-mono font-bold">
                        {template.avg_score}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-sans font-semibold mb-3">{template.name}</h3>
                  <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-1">Subject</p>
                  <p className="text-sm text-theme-muted mb-4 truncate">{template.subject}</p>
                  <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-1">Preview</p>
                  <p className="text-xs text-theme-dim line-clamp-3">{template.body}</p>
                  
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-theme">
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(template)}
                      className="flex-1 bg-theme-tertiary hover:bg-[#d4af37]/10 hover:text-[#d4af37] text-theme-muted rounded-none text-xs font-mono uppercase tracking-wide"
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
                        className="text-red-500 hover:bg-red-500/10 rounded-none"
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
