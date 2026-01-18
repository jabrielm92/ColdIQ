import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Target, BarChart3, Zap, Sparkles, Menu, X, ChevronLeft, ChevronRight, Star, TrendingUp, Users, CheckCircle, Copy, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [adminLoading, setAdminLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    // Navigate to login page - admin enters credentials manually
    navigate("/login");
  };

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "AI-Powered Analysis",
      description: "Advanced AI dissects every word, scoring your cold emails with surgical precision. Know exactly what's working and what's costing you deals."
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Revenue-Focused Insights",
      description: "No fluff. Get specific changes that translate directly into booked meetings and closed deals. Every suggestion is tied to conversion."
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Performance Intelligence",
      description: "Track your evolution over time. Identify patterns in your highest-converting emails and replicate success systematically."
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "One-Click Optimization",
      description: "Instant rewrites that transform mediocre emails into compelling outreach. Stop sending emails that get ignored."
    }
  ];

  const stats = [
    { value: "47%", label: "Higher Response Rate", icon: <TrendingUp className="w-4 h-4" /> },
    { value: "3.2x", label: "More Meetings Booked", icon: <Target className="w-4 h-4" /> },
    { value: "<30s", label: "Analysis Time", icon: <Zap className="w-4 h-4" /> }
  ];

  const dataPoints = [
    { before: "Ignored", after: "Replied", metric: "Prospect Response", improvement: "→ DEAL" },
    { before: "2.1%", after: "4.8%", metric: "Reply Rate", improvement: "+129%" },
    { before: "Generic", after: "Personalized", metric: "Email Quality", improvement: "→ TRUST" },
    { before: "$0", after: "$$$", metric: "Pipeline Value", improvement: "↑ ROI" }
  ];

  const testimonials = [
    {
      quote: "ColdIQ transformed our outreach. We went from 8% response rates to 34% in just three weeks. The AI rewrites are genuinely better than what our team was producing.",
      author: "Sarah Chen",
      role: "VP of Sales",
      company: "TechScale",
      avatar: "SC",
      rating: 5,
      metric: "34% response rate"
    },
    {
      quote: "I was skeptical about another AI tool, but ColdIQ actually delivers. My team's email scores improved from an average of 52 to 81. The ROI was immediate.",
      author: "Marcus Johnson",
      role: "Sales Director",
      company: "Vertex Solutions",
      avatar: "MJ",
      rating: 5,
      metric: "56% score increase"
    },
    {
      quote: "The industry-specific templates alone are worth the subscription. Combined with the AI analysis, we've cut our email writing time by 60% while getting better results.",
      author: "Emily Rodriguez",
      role: "Founder",
      company: "GrowthLab Agency",
      avatar: "ER",
      rating: 5,
      metric: "60% time saved"
    },
    {
      quote: "Finally, a tool that actually understands cold email psychology. ColdIQ catches things my team misses - weak CTAs, buried value props, generic openers. Game changer.",
      author: "David Park",
      role: "Head of BD",
      company: "Innovate Finance",
      avatar: "DP",
      rating: 5,
      metric: "3x more meetings"
    },
    {
      quote: "We've tried Lavender, Regie, and others. ColdIQ is the only one that improved our actual results. Our SDR team books 40% more meetings now.",
      author: "Jessica Thompson",
      role: "RevOps Manager",
      company: "CloudSync",
      avatar: "JT",
      rating: 5,
      metric: "40% more meetings"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-theme text-theme overflow-hidden transition-colors duration-300">
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-theme-subtle glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#d4af37] flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            </div>
            <span className="text-base sm:text-lg font-semibold tracking-tight font-sans">ColdIQ</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/pricing" className="text-theme-muted hover:text-theme transition-colors text-sm font-medium tracking-wide uppercase">
              Pricing
            </Link>
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" className="text-theme-muted hover:text-theme hover:bg-transparent text-sm font-medium tracking-wide uppercase rounded-none" data-testid="nav-login-btn">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-4 sm:px-6 py-2.5 sm:py-3 h-auto transition-colors" data-testid="nav-signup-btn">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Mobile Nav Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-theme-muted hover:text-theme"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-theme-subtle bg-theme-secondary p-4 space-y-3">
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-theme-muted hover:text-theme text-sm font-medium">
              Pricing
            </Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-theme-muted hover:text-theme text-sm font-medium">
              Log in
            </Link>
            <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs py-3 h-auto">
                Get Started Free
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-12 relative">
        {/* Hero Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[500px] lg:h-[600px] hero-glow pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-[#d4af37]/30 bg-[#d4af37]/5 mb-6 sm:mb-8">
                <span className="w-2 h-2 bg-[#d4af37] animate-pulse" />
                <span className="text-[10px] sm:text-xs font-mono tracking-widest uppercase text-[#d4af37]">The Unfair Advantage in Cold Outreach</span>
              </div>
              
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl tracking-tight leading-[1.1] sm:leading-[1.05] mb-6 sm:mb-8">
                You Don't Need More
                <br />
                <span className="text-gradient-gold">Cold Emails.</span>
                <br />
                <span className="text-theme-muted text-3xl sm:text-4xl lg:text-5xl">You Need Better Ones.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-theme-muted leading-relaxed max-w-xl mb-8 sm:mb-10 font-sans">
                The difference between a booked meeting and being ignored isn't volume—it's quality. <strong className="text-theme">Every weak email costs you money.</strong> ColdIQ uses AI to transform your outreach from forgettable to irresistible in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-6 sm:px-10 py-4 sm:py-5 h-auto transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]" data-testid="hero-cta-btn">
                    Analyze Your Email Free
                    <ArrowRight className="w-4 h-4 ml-2 sm:ml-3" />
                  </Button>
                </Link>
                <Link to="/pricing" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-theme text-theme-muted hover:border-theme-muted hover:text-theme hover:bg-transparent rounded-none font-bold uppercase tracking-wider text-xs px-6 sm:px-10 py-4 sm:py-5 h-auto transition-colors" data-testid="hero-pricing-btn">
                    See Pricing
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-theme-dim font-mono">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#a3e635]" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#a3e635]" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#a3e635]" />
                  <span>Results in 30 seconds</span>
                </div>
              </div>
            </motion.div>
            
            {/* Right Stats */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-5 grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-4"
            >
              {stats.map((stat, i) => (
                <div 
                  key={i}
                  className="bg-theme-secondary border border-theme p-4 sm:p-6 lg:p-8 group hover:border-[#d4af37]/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2 lg:mb-3">
                    <span className="text-[#d4af37]">{stat.icon}</span>
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-1 sm:mb-2 group-hover:text-[#d4af37] transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-[9px] sm:text-[10px] lg:text-xs font-mono tracking-widest uppercase text-theme-dim">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Data-Driven Results Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-theme-secondary border-y border-theme">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-mono tracking-widest uppercase text-[#d4af37] mb-3 sm:mb-4">The Cost of Bad Emails</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4 sm:mb-6">
              Every Weak Email Costs You Revenue
            </h2>
            <p className="text-theme-muted max-w-2xl mx-auto">
              A poorly written cold email doesn't just get ignored—it burns a prospect forever. See what happens when you stop guessing and start optimizing.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {dataPoints.map((data, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-theme border border-theme p-4 sm:p-6 text-center"
              >
                <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-4">{data.metric}</p>
                <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
                  <div>
                    <p className="text-theme-dim text-xs mb-1">Before</p>
                    <p className="font-mono text-xl sm:text-2xl text-theme-muted">{data.before}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                  <div>
                    <p className="text-[#a3e635] text-xs mb-1">After</p>
                    <p className="font-mono text-xl sm:text-2xl font-bold text-[#a3e635]">{data.after}</p>
                  </div>
                </div>
                <div className="inline-block px-3 py-1 bg-[#a3e635]/10 text-[#a3e635] text-sm font-mono font-bold">
                  {data.improvement}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 sm:mb-16 lg:mb-20"
          >
            <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3 sm:mb-4">Capabilities</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl">
              Everything you need to write emails that convert
            </h2>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 gap-px bg-theme-tertiary">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-theme p-6 sm:p-8 lg:p-10 group hover:bg-theme-secondary transition-colors"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 border border-theme flex items-center justify-center text-[#d4af37] mb-4 sm:mb-6 group-hover:border-[#d4af37]/50 group-hover:bg-[#d4af37]/5 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-sans font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-theme-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Screenshots Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-theme-secondary border-y border-theme">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-mono tracking-widest uppercase text-[#d4af37] mb-3 sm:mb-4">See It In Action</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4 sm:mb-6">
              AI Analysis in Seconds
            </h2>
            <p className="text-theme-muted max-w-2xl mx-auto">
              Get instant feedback, detailed metrics, and optimized rewrites for every email.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Screenshot 1: Multi-Client Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="bg-theme border border-theme overflow-hidden group"
            >
              <div className="p-4 border-b border-theme flex items-center justify-between">
                <p className="text-xs font-mono tracking-widest uppercase text-theme-dim">Client Dashboard</p>
                <span className="px-2 py-0.5 text-[9px] bg-violet-500/20 text-violet-400 font-mono">AGENCY</span>
              </div>
              <div className="p-6">
                {/* Mock Client Cards */}
                <div className="space-y-3">
                  {[
                    { name: "TechScale", score: 78, analyses: 42 },
                    { name: "Acme Corp", score: 65, analyses: 28 },
                    { name: "StartupXYZ", score: 82, analyses: 15 }
                  ].map((client, i) => (
                    <div key={i} className="bg-zinc-800/50 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] text-xs font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{client.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-[#d4af37]">{client.score}</p>
                        <p className="text-[9px] text-zinc-500">{client.analyses} emails</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">3 Clients</span>
                  <span className="text-xs text-[#d4af37]">+ Add Client</span>
                </div>
              </div>
            </motion.div>
            
            {/* Screenshot 2: Campaign Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-theme border border-theme overflow-hidden group"
            >
              <div className="p-4 border-b border-theme flex items-center justify-between">
                <p className="text-xs font-mono tracking-widest uppercase text-theme-dim">Campaign Analytics</p>
                <span className="px-2 py-0.5 text-[9px] bg-violet-500/20 text-violet-400 font-mono">AGENCY</span>
              </div>
              <div className="p-6 space-y-4">
                {/* Top Performing */}
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Top Subject Lines</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 truncate max-w-[140px]">"Quick question about {'{{company}}'}"</span>
                      <span className="font-mono text-[#d4af37]">82</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 truncate max-w-[140px]">"Saw your recent {'{{trigger}}'}"</span>
                      <span className="font-mono text-[#d4af37]">78</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-xs text-zinc-500 mb-2">Top CTAs</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 truncate max-w-[140px]">"Tuesday at 2pm work?"</span>
                      <span className="font-mono text-cyan-400">4.2%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 truncate max-w-[140px]">"Worth a 15-min chat?"</span>
                      <span className="font-mono text-cyan-400">3.8%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="bg-zinc-800/50 p-2">
                    <p className="text-lg font-mono font-bold text-emerald-400">+34%</p>
                    <p className="text-[9px] text-zinc-500">Reply Rate</p>
                  </div>
                  <div className="bg-zinc-800/50 p-2">
                    <p className="text-lg font-mono font-bold text-[#d4af37]">72</p>
                    <p className="text-[9px] text-zinc-500">Avg Score</p>
                  </div>
                  <div className="bg-zinc-800/50 p-2">
                    <p className="text-lg font-mono font-bold">127</p>
                    <p className="text-[9px] text-zinc-500">Emails</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Screenshot 3: White-Label Report */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-theme border border-theme overflow-hidden group"
            >
              <div className="p-4 border-b border-theme flex items-center justify-between">
                <p className="text-xs font-mono tracking-widest uppercase text-theme-dim">Client Report</p>
                <span className="px-2 py-0.5 text-[9px] bg-violet-500/20 text-violet-400 font-mono">AGENCY</span>
              </div>
              <div className="p-6 space-y-4">
                {/* Report Header */}
                <div className="bg-gradient-to-r from-[#d4af37]/10 to-violet-500/10 border border-[#d4af37]/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-[#d4af37] flex items-center justify-center">
                      <Mail className="w-3 h-3 text-black" />
                    </div>
                    <span className="text-xs font-bold">TechScale Monthly Report</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">January 2026 • Generated by ColdIQ</p>
                </div>
                
                {/* Report Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Email Performance</span>
                    <span className="text-xs font-mono text-emerald-400">+47%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Response Rate</span>
                    <span className="text-xs font-mono">2.1% → 4.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Emails Analyzed</span>
                    <span className="text-xs font-mono">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Avg Score</span>
                    <span className="text-xs font-mono text-[#d4af37]">78</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 text-[10px] px-2 py-1.5 bg-[#d4af37] text-black font-bold flex items-center justify-center gap-1">
                    Download PDF
                  </button>
                  <button className="text-[10px] px-3 py-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 bg-theme-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3 sm:mb-4">Success Stories</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              From Cold Outreach to Closed Deals
            </h2>
          </div>
          
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="bg-theme border border-theme p-6 sm:p-10 lg:p-12"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-[#d4af37] text-[#d4af37]" />
                  ))}
                </div>
                
                {/* Quote */}
                <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl leading-relaxed mb-8">
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>
                
                {/* Author */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#d4af37] flex items-center justify-center text-black font-bold">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonials[currentTestimonial].author}</p>
                      <p className="text-sm text-theme-muted">{testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].company}</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-[#a3e635]/10 text-[#a3e635] text-sm font-mono font-bold">
                    {testimonials[currentTestimonial].metric}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2 h-2 transition-all ${
                      i === currentTestimonial ? 'bg-[#d4af37] w-6' : 'bg-theme-tertiary hover:bg-theme-muted'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prevTestimonial}
                  className="w-10 h-10 border border-theme flex items-center justify-center text-theme-muted hover:text-theme hover:border-theme-muted transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="w-10 h-10 border border-theme flex items-center justify-center text-theme-muted hover:text-theme hover:border-theme-muted transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 sm:mb-16 lg:mb-20"
          >
            <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3 sm:mb-4">Simple Process</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl">
              From forgettable to unforgettable in three steps
            </h2>
          </motion.div>
          
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-12">
            {[
              { step: "01", title: "Paste Your Email", desc: "Drop in your subject line and body. No setup, no integrations, no complexity. Takes 10 seconds." },
              { step: "02", title: "Get AI Intelligence", desc: "Receive a score, pinpoint weaknesses, and get specific fixes. Know exactly why your email won't convert—and how to fix it." },
              { step: "03", title: "Send & Close", desc: "Copy the optimized version and watch your calendar fill up. Better emails = more meetings = more revenue." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="text-5xl sm:text-6xl lg:text-8xl font-serif text-theme-tertiary leading-none mb-4 sm:mb-6">{item.step}</div>
                <h3 className="text-lg sm:text-xl font-sans font-semibold mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-sm sm:text-base text-theme-muted">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 border-t border-theme">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-theme p-8 sm:p-12 lg:p-16 relative overflow-hidden bg-theme-secondary"
          >
            {/* Subtle Gold Glow */}
            <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-[#d4af37]/5 blur-3xl" />
            
            <div className="relative z-10 text-center">
              <p className="text-xs font-mono tracking-widest uppercase text-[#d4af37] mb-4 sm:mb-6">Stop Leaving Money on the Table</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4 sm:mb-6">
                Your Competitors Are Already Optimizing
              </h2>
              <p className="text-sm sm:text-base text-theme-muted mb-8 sm:mb-10 max-w-xl mx-auto">
                Every day you send unoptimized cold emails, you're burning prospects that could have become customers. The best sales teams don't guess—they know. <strong className="text-theme">Start your first analysis free.</strong>
              </p>
              <Link to="/signup">
                <Button className="w-full sm:w-auto bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 sm:px-10 py-4 sm:py-5 h-auto transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]" data-testid="cta-signup-btn">
                  Get Your Unfair Advantage
                  <ArrowRight className="w-4 h-4 ml-2 sm:ml-3" />
                </Button>
              </Link>
              <p className="mt-4 text-xs text-theme-dim font-mono">No credit card required • 3 free analyses • Results in 30 seconds</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-12 border-t border-theme">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#d4af37] flex items-center justify-center">
              <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black" />
            </div>
            <span className="font-semibold tracking-tight font-sans text-sm sm:text-base">ColdIQ</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-theme-dim text-xs sm:text-sm font-mono">© 2025 ColdIQ. All rights reserved.</p>
            {/* Hidden admin login */}
            <button
              onClick={handleAdminLogin}
              disabled={adminLoading}
              className="opacity-30 hover:opacity-100 transition-opacity p-1"
              title="Admin"
            >
              <Shield className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
