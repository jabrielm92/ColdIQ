import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Mail, Check, ArrowRight, ArrowLeft, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: "free",
      name: "Free",
      monthlyPrice: 0,
      annualPrice: 0,
      description: "Try ColdIQ with basic features",
      features: [
        "3 analyses per month",
        "Basic analysis features",
        "View last 3 analyses",
        "Email support"
      ],
      cta: "Current Plan",
      popular: false
    },
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: 29,
      annualPrice: 278.40,
      annualMonthly: 23.20,
      description: "For individuals sending regular cold emails",
      features: [
        "50 analyses per month",
        "Full analysis features",
        "Complete history access",
        "Basic insights dashboard",
        "Email support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 79,
      annualPrice: 758.40,
      annualMonthly: 63.20,
      description: "For power users who want the best results",
      features: [
        "Unlimited analyses",
        "Advanced insights dashboard",
        "AI recommendations",
        "Performance tracking",
        "A/B test suggestions",
        "Email templates library",
        "Export to CSV",
        "Priority support"
      ],
      cta: "Go Pro",
      popular: true
    },
    {
      id: "agency",
      name: "Agency",
      monthlyPrice: 199,
      annualPrice: 1910.40,
      annualMonthly: 159.20,
      description: "For teams and agencies",
      features: [
        "Everything in Pro",
        "5 team member seats",
        "Shared template library",
        "Team performance dashboard",
        "API access",
        "White-label reports",
        "Dedicated account manager"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const handleUpgrade = async (planId) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    
    if (planId === "free") return;
    
    const priceKey = `${planId}_${isAnnual ? "annual" : "monthly"}`;
    
    setLoading(planId);
    try {
      const res = await axios.post(`${API}/billing/create-checkout-session`, {
        plan_tier: priceKey,
        origin_url: window.location.origin
      });
      
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error("Failed to create checkout session");
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (monthly, annual, annualMonthly) => {
    if (monthly === 0) return { display: "$0", period: "forever", savings: null };
    
    if (isAnnual) {
      return {
        display: `$${annualMonthly.toFixed(0)}`,
        period: "/mo",
        total: `$${annual.toFixed(0)}/year`,
        savings: `Save $${((monthly * 12) - annual).toFixed(0)}/year`
      };
    }
    
    return {
      display: `$${monthly}`,
      period: "/month",
      savings: null
    };
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 overflow-hidden">
      {/* Noise Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#d4af37] flex items-center justify-center">
              <Mail className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-semibold tracking-tight font-sans">ColdIQ</span>
          </Link>
          
          <div className="flex items-center gap-6">
            {user ? (
              <Link to="/dashboard">
                <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-transparent text-sm font-medium tracking-wide uppercase rounded-none">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-transparent text-sm font-medium tracking-wide uppercase rounded-none">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-6 py-3 h-auto">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-36 pb-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 text-sm font-mono tracking-wide uppercase">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          
          <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-4">Pricing</p>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tight mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mb-12">
            Choose the plan that's right for you. Upgrade or downgrade at any time.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center gap-6">
            <span className={`text-sm font-mono tracking-wide ${!isAnnual ? 'text-white' : 'text-zinc-600'}`}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-[#d4af37]"
              data-testid="billing-toggle"
            />
            <span className={`text-sm font-mono tracking-wide ${isAnnual ? 'text-white' : 'text-zinc-600'}`}>
              Annual
              <span className="ml-3 px-2 py-1 bg-[#a3e635]/10 text-[#a3e635] text-xs font-mono">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6 lg:px-12" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-800/30">
            {plans.map((plan, i) => {
              const price = formatPrice(plan.monthlyPrice, plan.annualPrice, plan.annualMonthly);
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative bg-[#050505] p-8 ${
                    plan.popular 
                      ? 'border border-[#d4af37]/50' 
                      : ''
                  }`}
                  data-testid={`pricing-card-${plan.id}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-px left-0 right-0 h-px bg-[#d4af37]" />
                  )}
                  {plan.popular && (
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Popular
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-sans font-semibold mb-3">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-mono font-bold tracking-tight">{price.display}</span>
                      <span className="text-zinc-600 font-mono text-sm">{price.period}</span>
                    </div>
                    {price.total && (
                      <p className="text-xs text-zinc-600 mt-2 font-mono">Billed as {price.total}</p>
                    )}
                    {price.savings && (
                      <p className="text-xs text-[#a3e635] mt-1 font-mono">{price.savings}</p>
                    )}
                    <p className="text-zinc-500 text-sm mt-4">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <Check className="w-4 h-4 text-[#a3e635] flex-shrink-0 mt-0.5" />
                        <span className="text-zinc-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading === plan.id || (user?.subscription_tier === plan.id)}
                    className={`w-full rounded-none font-bold uppercase tracking-wider text-xs px-6 py-4 h-auto transition-all ${
                      plan.popular
                        ? 'bg-[#d4af37] text-black hover:bg-[#b5952f] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                        : plan.id === 'free'
                          ? 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 border border-zinc-800'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                    data-testid={`select-plan-${plan.id}`}
                  >
                    {loading === plan.id ? (
                      <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : user?.subscription_tier === plan.id ? (
                      "Current Plan"
                    ) : (
                      <>
                        {plan.cta}
                        {plan.id !== 'free' && <ArrowRight className="w-4 h-4 ml-2" />}
                      </>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-12 px-6 lg:px-12 border-y border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-12 text-zinc-600 text-sm font-mono">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#a3e635]" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#a3e635]" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#a3e635]" />
              <span>Secure payment via Stripe</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-4">FAQ</p>
          <h2 className="font-serif text-4xl tracking-tight mb-12">
            Frequently asked questions
          </h2>
          
          <div className="space-y-px bg-zinc-800/30">
            {[
              { q: "Can I change plans later?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex) through Stripe's secure payment platform." },
              { q: "Is there a free trial for paid plans?", a: "Our Free plan lets you try the core features with 3 analyses per month. You can upgrade when you're ready for more." },
              { q: "What's the difference between monthly and annual?", a: "Annual billing saves you 20% compared to monthly. You pay upfront for the full year at a discounted rate." },
              { q: "Can I get a refund?", a: "Yes! We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund." }
            ].map((faq, i) => (
              <div key={i} className="bg-[#050505] p-6 border-l-2 border-transparent hover:border-[#d4af37]/50 transition-colors">
                <h4 className="font-sans font-medium mb-2">{faq.q}</h4>
                <p className="text-zinc-500 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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

export default Pricing;
