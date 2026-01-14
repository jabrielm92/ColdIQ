import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Target, BarChart3, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
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
    { value: "85%", label: "Score Improvement" },
    { value: "3x", label: "Response Rate" },
    { value: "10k+", label: "Emails Analyzed" }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 overflow-hidden">
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#d4af37] flex items-center justify-center">
              <Mail className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-semibold tracking-tight font-sans">ColdIQ</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium tracking-wide uppercase">
              Pricing
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-transparent text-sm font-medium tracking-wide uppercase rounded-none" data-testid="nav-login-btn">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-6 py-3 h-auto transition-colors" data-testid="nav-signup-btn">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6 lg:px-12 relative">
        {/* Hero Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#d4af37]/10 via-[#d4af37]/5 to-transparent blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left Content - Asymmetric */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 bg-zinc-900/50 mb-10">
                <span className="w-2 h-2 bg-[#a3e635]" />
                <span className="text-xs font-mono tracking-widest uppercase text-zinc-500">AI-Powered Email Intelligence</span>
              </div>
              
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] text-white mb-8">
                Cold Email.
                <br />
                <span className="text-gradient-gold">Perfected.</span>
              </h1>
              
              <p className="text-lg text-zinc-400 leading-relaxed max-w-xl mb-12 font-sans">
                Stop guessing. Start closing. ColdIQ analyzes every element of your outreach with ruthless precision — transforming mediocre emails into revenue-generating machines.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-10 py-5 h-auto transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]" data-testid="hero-cta-btn">
                    Analyze Your First Email
                    <ArrowRight className="w-4 h-4 ml-3" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white hover:bg-transparent rounded-none font-bold uppercase tracking-wider text-xs px-10 py-5 h-auto transition-colors" data-testid="hero-pricing-btn">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            {/* Right Stats - Tetris Grid */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-5 space-y-4"
            >
              {stats.map((stat, i) => (
                <div 
                  key={i}
                  className="bg-[#0a0a0a] border border-zinc-800/50 p-8 group hover:border-[#d4af37]/30 transition-colors"
                >
                  <div className="font-mono text-5xl font-bold text-white tracking-tight mb-2 group-hover:text-[#d4af37] transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs font-mono tracking-widest uppercase text-zinc-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 lg:px-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-4">Capabilities</p>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tight text-zinc-100 max-w-2xl">
              Everything you need to write emails that convert
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-px bg-zinc-800/30">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#050505] p-10 group hover:bg-[#0a0a0a] transition-colors"
              >
                <div className="w-12 h-12 border border-zinc-800 flex items-center justify-center text-[#d4af37] mb-6 group-hover:border-[#d4af37]/50 group-hover:bg-[#d4af37]/5 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-sans font-semibold mb-3 text-zinc-100">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 lg:px-12 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-4">Process</p>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tight text-zinc-100 max-w-2xl">
              Three steps to better outreach
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Paste Your Email", desc: "Enter your subject line and email body. No setup. No complexity." },
              { step: "02", title: "Get AI Analysis", desc: "Claude scores your email, identifies weaknesses, and suggests improvements." },
              { step: "03", title: "Send Optimized", desc: "Copy the rewritten version and watch your response rates climb." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="text-8xl font-serif text-zinc-900 leading-none mb-6">{item.step}</div>
                <h3 className="text-xl font-sans font-semibold mb-3 text-zinc-100">{item.title}</h3>
                <p className="text-zinc-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-12 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-zinc-800 p-12 lg:p-16 relative overflow-hidden"
          >
            {/* Subtle Gold Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 blur-3xl" />
            
            <div className="relative z-10">
              <p className="text-xs font-mono tracking-widest uppercase text-[#d4af37] mb-6">Start Now</p>
              <h2 className="font-serif text-4xl sm:text-5xl tracking-tight text-zinc-100 mb-6">
                Ready to close more deals?
              </h2>
              <p className="text-zinc-400 mb-10 max-w-xl">
                Join thousands of sales professionals who've stopped guessing and started converting. Your first analysis is free.
              </p>
              <Link to="/signup">
                <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-10 py-5 h-auto transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]" data-testid="cta-signup-btn">
                  Start Analyzing for Free
                  <ArrowRight className="w-4 h-4 ml-3" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#d4af37] flex items-center justify-center">
              <Mail className="w-3 h-3 text-black" />
            </div>
            <span className="font-semibold tracking-tight font-sans">ColdIQ</span>
          </div>
          <p className="text-zinc-600 text-sm font-mono">© 2025 ColdIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
