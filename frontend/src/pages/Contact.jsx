import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { API } from "@/App";
import axios from "axios";
import { Mail, ArrowLeft, Send, CheckCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    team_size: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.company) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/contact/growth-agency`, formData);
      setSubmitted(true);
      toast.success("Thanks! We'll be in touch within 24 hours.");
    } catch (err) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-theme text-theme transition-colors duration-300">
        {/* Header */}
        <header className="border-b border-theme">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#d4af37] flex items-center justify-center">
                <Mail className="w-4 h-4 text-black" />
              </div>
              <span className="text-lg font-semibold tracking-tight font-sans">ColdIQ</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 bg-[#a3e635]/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#a3e635]" />
            </div>
            <h1 className="font-serif text-4xl tracking-tight mb-4">Request Received!</h1>
            <p className="text-theme-muted mb-8 max-w-md mx-auto">
              Thanks for your interest in ColdIQ Growth Agency. We'll review your request and get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing">
                <Button variant="outline" className="rounded-none border-theme text-theme-muted hover:text-theme">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Pricing
                </Button>
              </Link>
              <Link to="/">
                <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none">
                  Go to Homepage
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme text-theme transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-theme">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#d4af37] flex items-center justify-center">
              <Mail className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-semibold tracking-tight font-sans">ColdIQ</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link 
          to="/pricing" 
          className="inline-flex items-center gap-2 text-theme-muted hover:text-theme transition-colors mb-8 text-sm font-mono tracking-wide uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left - Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#d4af37] flex items-center justify-center">
                <Users className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="font-serif text-3xl tracking-tight">Growth Agency</h1>
                <p className="text-theme-muted text-sm">Let's scale your outbound together</p>
              </div>
            </div>

            <p className="text-theme-muted mb-8">
              The Growth Agency plan is designed for teams and agencies who want to scale cold email performance across multiple clients and team members.
            </p>

            <div className="space-y-4 mb-8">
              <h3 className="font-medium text-sm uppercase tracking-wider text-theme-dim">What you get:</h3>
              <ul className="space-y-3">
                {[
                  "Everything in Pro",
                  "5 team seats (expandable)",
                  "Multi-client workspaces",
                  "White-label reports",
                  "Campaign-level analytics",
                  "Approval workflows",
                  "API & integrations",
                  "Client AI voice profiles",
                  "Dedicated account support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-[#a3e635]" />
                    <span className="text-theme-muted">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-theme-secondary border border-theme p-4">
              <p className="text-2xl font-mono font-bold text-[#d4af37] mb-1">$199/mo</p>
              <p className="text-xs text-theme-dim">or $159.20/mo billed annually (save 20%)</p>
            </div>
          </div>

          {/* Right - Form */}
          <div className="bg-theme-secondary border border-theme p-6 sm:p-8">
            <h2 className="font-serif text-xl mb-6">Request Access</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                  className="bg-theme border-theme-subtle focus:border-[#d4af37] rounded-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@agency.com"
                  className="bg-theme border-theme-subtle focus:border-[#d4af37] rounded-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company/Agency Name *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Agency"
                  className="bg-theme border-theme-subtle focus:border-[#d4af37] rounded-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_size">Team Size</Label>
                <select
                  id="team_size"
                  value={formData.team_size}
                  onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                  className="w-full h-10 px-3 bg-theme border border-theme-subtle focus:border-[#d4af37] text-theme outline-none"
                >
                  <option value="">Select team size</option>
                  <option value="2-5">2-5 people</option>
                  <option value="6-10">6-10 people</option>
                  <option value="11-25">11-25 people</option>
                  <option value="26-50">26-50 people</option>
                  <option value="50+">50+ people</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">How can we help? (optional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your outbound needs, number of clients, volume, etc."
                  className="bg-theme border-theme-subtle focus:border-[#d4af37] rounded-none min-h-[100px]"
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs py-4 h-auto"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Request Growth Agency Access
                  </>
                )}
              </Button>

              <p className="text-xs text-theme-dim text-center">
                We'll respond within 24 hours to schedule a quick intro call.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
