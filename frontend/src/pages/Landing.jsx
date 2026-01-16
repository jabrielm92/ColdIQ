import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Target, BarChart3, Zap, Sparkles, Menu, X, ChevronLeft, ChevronRight, Star, TrendingUp, Users, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "AI-Powered Analysis",
      description: "Claude AI dissects every word, scoring your cold emails with surgical precision."
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Actionable Insights",
      description: "No fluff. Get specific changes that move the needle on response rates."
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Performance Tracking",
      description: "Track your evolution. See patterns emerge across hundreds of emails."
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Instant Rewrites",
      description: "One click. Optimized email. Ready to send to your next prospect."
    }
  ];

  const stats = [
    { value: "47%", label: "Avg Response Increase", icon: <TrendingUp className="w-4 h-4" /> },
    { value: "125K+", label: "Emails Analyzed", icon: <Mail className="w-4 h-4" /> },
    { value: "2,400+", label: "Active Users", icon: <Users className="w-4 h-4" /> }
  ];

  const dataPoints = [
    { before: "2.1%", after: "3.5%", metric: "Response Rate", improvement: "+67%" },
    { before: "18%", after: "32%", metric: "Open Rate", improvement: "+78%" },
    { before: "45", after: "71", metric: "Avg Score", improvement: "+58%" },
    { before: "5.2", after: "2.8", metric: "Days to Reply", improvement: "-46%" }
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
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-theme bg-theme-secondary mb-6 sm:mb-8">
                <span className="w-2 h-2 bg-[#a3e635] animate-pulse" />
                <span className="text-[10px] sm:text-xs font-mono tracking-widest uppercase text-theme-muted">Trusted by 2,400+ Sales Teams</span>
              </div>
              
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl tracking-tight leading-[1.1] sm:leading-[1.05] mb-6 sm:mb-8">
                Stop Sending
                <br />
                <span className="text-gradient-gold">Bad Cold Emails.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-theme-muted leading-relaxed max-w-xl mb-8 sm:mb-10 font-sans">
                ColdIQ uses Claude AI to analyze your cold emails in seconds. Get a score, actionable fixes, and an optimized rewrite that actually gets responses. <strong className="text-theme">Average users see 47% better response rates.</strong>
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
            <p className="text-xs font-mono tracking-widest uppercase text-[#d4af37] mb-3 sm:mb-4">Real Results</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4 sm:mb-6">
              The Numbers Don't Lie
            </h2>
            <p className="text-theme-muted max-w-2xl mx-auto">
              Based on 125,000+ emails analyzed. ColdIQ users consistently outperform industry benchmarks.
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

      {/* Testimonials Carousel */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 bg-theme-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3 sm:mb-4">Testimonials</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              Loved by Sales Teams
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
            <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3 sm:mb-4">Process</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl">
              Three steps to better outreach
            </h2>
          </motion.div>
          
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-12">
            {[
              { step: "01", title: "Paste Your Email", desc: "Enter your subject line and email body. No setup. No complexity. Takes 10 seconds." },
              { step: "02", title: "Get AI Analysis", desc: "Claude AI scores your email 0-100, identifies weaknesses, and suggests specific improvements." },
              { step: "03", title: "Send Optimized", desc: "Copy the AI-rewritten version and watch your response rates climb. It's that simple." }
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
              <p className="text-xs font-mono tracking-widest uppercase text-[#d4af37] mb-4 sm:mb-6">Start Now</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4 sm:mb-6">
                Your Next Cold Email Could Be Your Best
              </h2>
              <p className="text-sm sm:text-base text-theme-muted mb-8 sm:mb-10 max-w-xl mx-auto">
                Join 2,400+ sales professionals who've stopped guessing and started converting. Your first 3 analyses are completely free.
              </p>
              <Link to="/signup">
                <Button className="w-full sm:w-auto bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 sm:px-10 py-4 sm:py-5 h-auto transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]" data-testid="cta-signup-btn">
                  Start Analyzing for Free
                  <ArrowRight className="w-4 h-4 ml-2 sm:ml-3" />
                </Button>
              </Link>
              <p className="mt-4 text-xs text-theme-dim font-mono">No credit card required • 3 free analyses • Setup in 30 seconds</p>
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
          <p className="text-theme-dim text-xs sm:text-sm font-mono">© 2025 ColdIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
