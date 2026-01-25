import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  FileText, Plus, Copy, Check, Lock, ArrowRight, Trash2, Search, Sparkles, Wand2, Loader2
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
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    body: "",
    category: "Outreach",
    is_shared: false
  });
  const [aiRequest, setAiRequest] = useState({
    description: "",
    industry: "General",
    tone: "professional"
  });

  const userTier = user?.subscription_tier || "free";
  const isPro = ["pro", "agency", "growth_agency"].includes(userTier);
  const isAgency = userTier === "agency" || userTier === "growth_agency";
  const isStarter = ["starter", "pro", "agency", "growth_agency"].includes(userTier);
  const hasTemplateAccess = ["pro", "agency", "growth_agency"].includes(userTier);

  useEffect(() => {
    if (hasTemplateAccess) {
      fetchTemplates();
    } else {
      setLoading(false);
    }
  }, [hasTemplateAccess]);

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

  // Only Pro and Agency have access to templates
  if (!hasTemplateAccess) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-zinc-800 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-zinc-600" />
            </div>
            <h1 className="font-serif text-3xl mb-4">Email Templates</h1>
            <p className="text-zinc-500 max-w-md mx-auto mb-8">
              Access our library of proven, high-converting cold email templates. Create custom templates and generate AI-powered emails tailored to your industry.
            </p>
            <Link to="/pricing?highlight=pro">
              <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-4 h-auto">
                Upgrade to Pro to Access Templates
              </Button>
            </Link>
            <p className="text-xs text-zinc-600 mt-4">Available on Pro and Agency plans</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

  const handleGenerateAI = async () => {
    if (!aiRequest.description.trim()) {
      toast.error("Please describe what kind of template you need");
      return;
    }

    setGenerating(true);
    try {
      const res = await axios.post(`${API}/templates/generate`, aiRequest);
      setTemplates([res.data, ...templates]);
      setShowAIDialog(false);
      setAiRequest({ description: "", industry: "General", tone: "professional" });
      toast.success("AI template created and added to your library!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to generate template");
    } finally {
      setGenerating(false);
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

  // Filter and sort templates - show locked ones too
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = 
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "all" || t.industry === selectedIndustry;
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesIndustry && matchesCategory;
  });

  // Check if template is accessible based on tier
  const isTemplateAccessible = (template) => {
    const tier = template.tier || "free";
    if (tier === "free") return true;
    if (tier === "pro" && isPro) return true;
    if (tier === "agency" && isAgency) return true;
    if (!template.is_system) return true; // User's own templates
    return false;
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10" data-testid="templates-page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-2 sm:mb-3">Email Library</p>
              <h1 className="font-serif text-2xl sm:text-4xl tracking-tight">Templates</h1>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {/* AI Generate Button */}
              <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 rounded-none text-xs sm:text-sm"
                    disabled={!isPro}
                  >
                    <Wand2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">AI Generate</span>
                    {!isPro && <Lock className="w-3 h-3 ml-1 sm:ml-2" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-400" />
                      Generate Template with AI
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Describe your template</Label>
                      <Textarea
                        value={aiRequest.description}
                        onChange={(e) => setAiRequest({...aiRequest, description: e.target.value})}
                        placeholder="e.g., A follow-up email for prospects who downloaded our whitepaper but haven't responded to initial outreach..."
                        className="bg-zinc-800 border-zinc-700 mt-1 min-h-[100px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Industry</Label>
                        <Select value={aiRequest.industry} onValueChange={(v) => setAiRequest({...aiRequest, industry: v})}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="SaaS">SaaS</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Financial Services">Financial Services</SelectItem>
                            <SelectItem value="Agency">Agency</SelectItem>
                            <SelectItem value="Real Estate">Real Estate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tone</Label>
                        <Select value={aiRequest.tone} onValueChange={(v) => setAiRequest({...aiRequest, tone: v})}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="consultative">Consultative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={handleGenerateAI} 
                      disabled={generating}
                      className="w-full bg-violet-600 hover:bg-violet-700 rounded-none"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Template
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-zinc-500 text-center">
                      Template will be added to your personal library
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Manual Create Button */}
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs"
                    disabled={!isPro}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                    {!isPro && <Lock className="w-3 h-3 ml-2" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle>Create Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Template Name</Label>
                      <Input 
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                        placeholder="My Cold Email Template"
                        className="bg-zinc-800 border-zinc-700 mt-1"
                      />
                    </div>
                    <div>
                      <Label>Subject Line</Label>
                      <Input 
                        value={newTemplate.subject}
                        onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                        placeholder="Quick question about {'{{company}}'}"
                        className="bg-zinc-800 border-zinc-700 mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email Body</Label>
                      <Textarea
                        value={newTemplate.body}
                        onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})}
                        placeholder="Hi {'{{first_name}}'},\n\n..."
                        className="bg-zinc-800 border-zinc-700 mt-1 min-h-[150px]"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={newTemplate.category} onValueChange={(v) => setNewTemplate({...newTemplate, category: v})}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Outreach">Outreach</SelectItem>
                          <SelectItem value="Follow-up">Follow-up</SelectItem>
                          <SelectItem value="Pain Point">Pain Point</SelectItem>
                          <SelectItem value="Case Study">Case Study</SelectItem>
                          <SelectItem value="Referral">Referral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateTemplate} className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none">
                      Create Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-800 rounded-none"
              />
            </div>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-full md:w-[180px] bg-zinc-900/50 border-zinc-800 rounded-none">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map(ind => (
                  <SelectItem key={ind} value={ind}>{ind === "all" ? "All Industries" : ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px] bg-zinc-900/50 border-zinc-800 rounded-none">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 animate-pulse">
                  <div className="h-4 w-32 bg-zinc-800 rounded mb-4" />
                  <div className="h-3 w-full bg-zinc-800 rounded mb-2" />
                  <div className="h-3 w-2/3 bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800">
              <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-2">No templates found</p>
              <p className="text-sm text-zinc-600">Try adjusting your filters or create a new template</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template, i) => {
                const accessible = isTemplateAccessible(template);
                const tierLabel = template.tier === "pro" ? "PRO" : template.tier === "agency" ? "AGENCY" : null;
                
                return (
                  <motion.div
                    key={template.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`bg-zinc-900/50 border border-zinc-800 p-6 hover:border-zinc-700 transition-colors group ${
                      !accessible ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm truncate">{template.name}</h3>
                          {tierLabel && (
                            <span className={`px-1.5 py-0.5 text-[9px] font-mono ${
                              tierLabel === "PRO" ? "bg-[#d4af37]/20 text-[#d4af37]" : "bg-violet-500/20 text-violet-400"
                            }`}>
                              {tierLabel}
                            </span>
                          )}
                          {template.is_ai_generated && (
                            <span className="px-1.5 py-0.5 text-[9px] bg-violet-500/20 text-violet-400 font-mono">AI</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          {template.industry && <span>{template.industry}</span>}
                          {template.category && (
                            <>
                              <span>•</span>
                              <span>{template.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {!accessible && <Lock className="w-4 h-4 text-zinc-600" />}
                    </div>
                    
                    <div className={`mb-4 ${!accessible ? 'blur-sm select-none' : ''}`}>
                      <p className="text-xs text-zinc-400 mb-1">Subject:</p>
                      <p className="text-sm font-mono truncate">{template.subject}</p>
                    </div>
                    
                    <div className={`mb-4 ${!accessible ? 'blur-sm select-none' : ''}`}>
                      <p className="text-xs text-zinc-400 mb-1">Preview:</p>
                      <p className="text-xs text-zinc-500 line-clamp-2">{template.body}</p>
                    </div>
                    
                    {template.avg_score && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs text-zinc-500">Avg Score:</span>
                        <span className={`text-xs font-mono font-bold ${
                          template.avg_score >= 80 ? 'text-emerald-400' :
                          template.avg_score >= 70 ? 'text-[#d4af37]' :
                          'text-zinc-400'
                        }`}>{template.avg_score}</span>
                      </div>
                    )}
                    
                    {accessible ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(template)}
                          className="flex-1 border-zinc-700 hover:bg-zinc-800 rounded-none text-xs"
                        >
                          {copied === template.id ? (
                            <><Check className="w-3 h-3 mr-1" /> Copied</>
                          ) : (
                            <><Copy className="w-3 h-3 mr-1" /> Copy</>
                          )}
                        </Button>
                        {!template.is_system && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="px-2 text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Link to="/pricing">
                        <Button variant="outline" size="sm" className="w-full border-zinc-700 rounded-none text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Unlock with {tierLabel}
                        </Button>
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Templates;
