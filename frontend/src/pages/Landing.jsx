import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Zap, BarChart3, Target, ArrowRight, Mail, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Get instant feedback on your cold emails with our advanced Claude AI analysis."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Actionable Improvements",
      description: "Receive specific, actionable suggestions to improve your response rates."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Performance Tracking",
      description: "Track your email performance over time with personalized insights."
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Instant Rewrites",
      description: "Get optimized versions of your emails ready to send immediately."
    }
  ];

  const stats = [
    { value: "85%", label: "Average Score Improvement" },
    { value: "3x", label: "Higher Response Rates" },
    { value: "10k+", label: "Emails Analyzed" }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 overflow-hidden noise">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter" style={{ fontFamily: 'Manrope' }}>ColdIQ</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-zinc-400 hover:text-white transition-colors text-sm">
              Pricing
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="text-zinc-400 hover:text-white" data-testid="nav-login-btn">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary" data-testid="nav-signup-btn">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-zinc-400">AI-Powered Email Intelligence</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-gradient" style={{ fontFamily: 'Manrope' }}>
              Turn Cold Emails Into
              <span className="block text-indigo-400">Warm Conversations</span>
            </h1>
            
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
              Analyze, optimize, and track your cold emails with AI. Get actionable feedback, instant rewrites, and personalized insights to boost your response rates.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary text-base px-8 h-12" data-testid="hero-cta-btn">
                  Analyze Your First Email Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-base px-8 h-12" data-testid="hero-pricing-btn">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-12 mt-20"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Manrope' }}>{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>
              Everything You Need to Write Better Cold Emails
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Our AI analyzes every aspect of your emails to help you convert more prospects.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Manrope' }}>{feature.title}</h3>
                <p className="text-zinc-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>
              How ColdIQ Works
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Three simple steps to better cold emails
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Paste Your Email", desc: "Enter your subject line and email body into our analyzer." },
              { step: "02", title: "Get AI Analysis", desc: "Our AI scores your email and identifies areas for improvement." },
              { step: "03", title: "Use Optimized Version", desc: "Copy the rewritten email and send it to your prospects." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-zinc-800 mb-4" style={{ fontFamily: 'Manrope' }}>{item.step}</div>
                <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Manrope' }}>{item.title}</h3>
                <p className="text-zinc-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>
                Ready to Improve Your Cold Emails?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                Join thousands of sales professionals who are already using ColdIQ to write better cold emails.
              </p>
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary text-base px-8 h-12" data-testid="cta-signup-btn">
                  Start Analyzing for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Mail className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold tracking-tighter" style={{ fontFamily: 'Manrope' }}>ColdIQ</span>
          </div>
          <p className="text-zinc-500 text-sm">© 2025 ColdIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
