import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Mail, Check, ArrowRight, ArrowLeft, Sparkles, Menu, X
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-theme text-theme overflow-hidden transition-colors duration-300">
      {/* Noise Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-theme-subtle glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#d4af37] flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            </div>
            <span className="text-base sm:text-lg font-semibold tracking-tight font-sans">ColdIQ</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard">
                <Button variant="ghost" className="text-theme-muted hover:text-theme hover:bg-transparent text-sm font-medium tracking-wide uppercase rounded-none">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-theme-muted hover:text-theme hover:bg-transparent text-sm font-medium tracking-wide uppercase rounded-none">
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

          {/* Mobile Nav */}
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
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-theme-muted hover:text-theme text-sm font-medium">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-theme-muted hover:text-theme text-sm font-medium">
                  Log in
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs py-3 h-auto">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Header */}
      <section className="pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-theme-muted hover:text-theme transition-colors mb-8 sm:mb-12 text-sm font-mono tracking-wide uppercase">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          
          <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3 sm:mb-4">Pricing</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-4 sm:mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-base sm:text-lg text-theme-muted max-w-xl mb-8 sm:mb-12">
            Choose the plan that's right for you. Upgrade or downgrade at any time.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center gap-4 sm:gap-6">
            <span className={`text-sm font-mono tracking-wide ${!isAnnual ? 'text-theme' : 'text-theme-dim'}`}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-[#d4af37]"
              data-testid="billing-toggle"
            />
            <span className={`text-sm font-mono tracking-wide flex items-center gap-2 ${isAnnual ? 'text-theme' : 'text-theme-dim'}`}>
              Annual
              <span className="px-2 py-1 bg-[#a3e635]/10 text-[#a3e635] text-[10px] sm:text-xs font-mono">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-12" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-px sm:bg-theme-tertiary">
            {plans.map((plan, i) => {
              const price = formatPrice(plan.monthlyPrice, plan.annualPrice, plan.annualMonthly);
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative bg-theme p-6 sm:p-8 ${
                    plan.popular 
                      ? 'border-2 border-[#d4af37]/50 sm:border' 
                      : 'border border-theme sm:border-0'
                  }`}
                  data-testid={`pricing-card-${plan.id}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-px left-0 right-0 h-px bg-[#d4af37] hidden sm:block" />
                  )}
                  {plan.popular && (
                    <div className="absolute -top-3 left-4 sm:left-6 px-3 py-1 bg-[#d4af37] text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Popular
                    </div>
                  )}
                  
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-sans font-semibold mb-2 sm:mb-3">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight">{price.display}</span>
                      <span className="text-theme-dim font-mono text-sm">{price.period}</span>
                    </div>
                    {price.total && (
                      <p className="text-xs text-theme-dim mt-2 font-mono">Billed as {price.total}</p>
                    )}
                    {price.savings && (
                      <p className="text-xs text-[#a3e635] mt-1 font-mono">{price.savings}</p>
                    )}
                    <p className="text-theme-muted text-sm mt-3 sm:mt-4">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 sm:gap-3 text-sm">
                        <Check className="w-4 h-4 text-[#a3e635] flex-shrink-0 mt-0.5" />
                        <span className="text-theme-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading === plan.id || (user?.subscription_tier === plan.id)}
                    className={`w-full rounded-none font-bold uppercase tracking-wider text-xs px-4 sm:px-6 py-3 sm:py-4 h-auto transition-all ${
                      plan.popular
                        ? 'bg-[#d4af37] text-black hover:bg-[#b5952f] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                        : plan.id === 'free'
                          ? 'bg-theme-tertiary text-theme-muted hover:bg-theme-secondary border border-theme'
                          : 'bg-theme-tertiary text-theme-muted hover:bg-theme-secondary border border-theme'
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
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-12 border-y border-theme">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-12 text-theme-dim text-xs sm:text-sm font-mono">
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-[#a3e635]" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-[#a3e635]" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-[#a3e635]" />
              <span>Secure payment via Stripe</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3 sm:mb-4">FAQ</p>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mb-8 sm:mb-12">
            Frequently asked questions
          </h2>
          
          <div className="space-y-px bg-theme-tertiary">
            {[
              { q: "Can I change plans later?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex) through Stripe's secure payment platform." },
              { q: "Is there a free trial for paid plans?", a: "Our Free plan lets you try the core features with 3 analyses per month. You can upgrade when you're ready for more." },
              { q: "What's the difference between monthly and annual?", a: "Annual billing saves you 20% compared to monthly. You pay upfront for the full year at a discounted rate." },
              { q: "Can I get a refund?", a: "Yes! We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund." }
            ].map((faq, i) => (
              <div key={i} className="bg-theme p-4 sm:p-6 border-l-2 border-transparent hover:border-[#d4af37]/50 transition-colors">
                <h4 className="font-sans font-medium mb-1 sm:mb-2 text-sm sm:text-base">{faq.q}</h4>
                <p className="text-theme-muted text-xs sm:text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
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

export default Pricing;
