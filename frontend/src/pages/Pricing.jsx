import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Mail, Check, Zap, ArrowRight, ArrowLeft, Sparkles
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 overflow-hidden">
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
            {user ? (
              <Link to="/dashboard">
                <Button variant="ghost" className="text-zinc-400 hover:text-white">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-zinc-400 hover:text-white">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-indigo-600 to-violet-600">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Manrope' }}>
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Choose the plan that's right for you. Upgrade or downgrade at any time.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-zinc-500'}`}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-indigo-600"
              data-testid="billing-toggle"
            />
            <span className={`text-sm ${isAnnual ? 'text-white' : 'text-zinc-500'}`}>
              Annual
              <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-6" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => {
              const price = formatPrice(plan.monthlyPrice, plan.annualPrice, plan.annualMonthly);
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative bg-zinc-900/50 border rounded-xl p-6 ${
                    plan.popular 
                      ? 'border-indigo-500 ring-1 ring-indigo-500/50' 
                      : 'border-zinc-800'
                  }`}
                  data-testid={`pricing-card-${plan.id}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 rounded-full text-xs font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope' }}>{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold" style={{ fontFamily: 'JetBrains Mono' }}>{price.display}</span>
                      <span className="text-zinc-500">{price.period}</span>
                    </div>
                    {price.total && (
                      <p className="text-xs text-zinc-500 mt-1">Billed as {price.total}</p>
                    )}
                    {price.savings && (
                      <p className="text-xs text-emerald-400 mt-1">{price.savings}</p>
                    )}
                    <p className="text-zinc-400 text-sm mt-3">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading === plan.id || (user?.subscription_tier === plan.id)}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 glow-primary'
                        : plan.id === 'free'
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                    data-testid={`select-plan-${plan.id}`}
                  >
                    {loading === plan.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
      <section className="py-12 px-6 border-y border-zinc-800 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-8 text-zinc-500">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Secure payment via Stripe</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: 'Manrope' }}>
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {[
              { q: "Can I change plans later?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex) through Stripe's secure payment platform." },
              { q: "Is there a free trial for paid plans?", a: "Our Free plan lets you try the core features with 3 analyses per month. You can upgrade when you're ready for more." },
              { q: "What's the difference between monthly and annual?", a: "Annual billing saves you 20% compared to monthly. You pay upfront for the full year at a discounted rate." },
              { q: "Can I get a refund?", a: "Yes! We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund." }
            ].map((faq, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h4 className="font-medium mb-2">{faq.q}</h4>
                <p className="text-zinc-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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

export default Pricing;
