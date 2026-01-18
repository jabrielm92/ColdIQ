import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Mail, Check, X, ArrowRight, ArrowLeft, Sparkles, Menu, 
  Zap, Users, BarChart3, Shield, Brain, Target, FileText,
  ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [isAnnual, setIsAnnual] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const userTier = user?.subscription_tier || null;
  const tierOrder = ["free", "starter", "pro", "growth_agency", "agency"];
  const userTierIndex = userTier ? tierOrder.indexOf(userTier === "agency" ? "growth_agency" : userTier) : -1;

  const allPlans = [
    {
      id: "free",
      name: "Free",
      tagline: "Test the engine",
      monthlyPrice: 0,
      annualPrice: 0,
      description: "Perfect for trying ColdIQ risk-free.",
      features: [
        "3 analyses/month",
        "Basic email feedback",
        "Limited history (last 3)"
      ],
      limitations: [
        "No export",
        "No historical trends",
        "No optimization suggestions"
      ],
      cta: "Try Free",
      upgradeHint: "Upgrade when results matter",
      popular: false,
      icon: Mail
    },
    {
      id: "starter",
      name: "Starter",
      tagline: "Write better cold emails, faster",
      monthlyPrice: 29,
      annualPrice: 278.40,
      annualMonthly: 23.20,
      description: "For individuals sending cold emails consistently.",
      features: [
        "50 analyses/month",
        "Full email analysis",
        "Subject & CTA clarity scoring",
        "Readability & spam keyword checks",
        "Complete email history"
      ],
      limitations: [
        "No sequence analysis",
        "No AI rewrites",
        "No benchmarking"
      ],
      cta: "Get Started",
      upgradeHint: "Upgrade to optimize for replies, not guesses",
      popular: false,
      icon: Target
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "Optimize for replies, not opinions",
      monthlyPrice: 79,
      annualPrice: 758.40,
      annualMonthly: 63.20,
      description: "For power users who want measurable improvement.",
      features: [
        "Unlimited analyses",
        "Sequence-level insights",
        "AI rewrite & subject variants",
        "Performance tracking & benchmarks",
        "A/B test recommendations",
        "Spam risk & inbox placement scoring",
        "Emotional tone analysis",
        "Template library",
        "CSV export",
        "Priority support"
      ],
      cta: "Go Pro",
      upgradeHint: "Average users see measurable reply rate improvements",
      popular: true,
      icon: Brain
    },
    {
      id: "growth_agency",
      name: "Growth Agency",
      tagline: "Deliver results your clients can see",
      monthlyPrice: 199,
      annualPrice: 1910.40,
      annualMonthly: 159.20,
      description: "Built for agencies, teams, and outbound operators.",
      features: [
        "Everything in Pro",
        "5 team seats",
        "Multi-client workspaces",
        "White-label reports",
        "Campaign-level analytics",
        "Approval workflows",
        "API & integrations",
        "Client-specific AI voice profiles",
        "Dedicated account support"
      ],
      cta: "Contact Us",
      upgradeHint: "ColdIQ becomes part of your service offering",
      popular: false,
      icon: Users,
      isContactForm: true
    }
  ];

  // Filter plans - if user is logged in, only show plans above their current tier
  const plans = user 
    ? allPlans.filter(plan => {
        const planIndex = tierOrder.indexOf(plan.id);
        return planIndex > userTierIndex;
      })
    : allPlans;

  // Feature comparison data
  const comparisonCategories = [
    {
      name: "Analysis",
      features: [
        { name: "Single email analysis", free: true, starter: true, pro: true, agency: true },
        { name: "Subject line analysis", free: false, starter: true, pro: true, agency: true },
        { name: "CTA clarity scoring", free: false, starter: true, pro: true, agency: true },
        { name: "Readability score", free: false, starter: true, pro: true, agency: true },
        { name: "Spam keyword detection", free: false, starter: true, pro: true, agency: true },
        { name: "Sequence analysis", free: false, starter: false, pro: true, agency: true },
        { name: "Inbox placement score", free: false, starter: false, pro: true, agency: true },
        { name: "Personalization scoring", free: false, starter: false, pro: true, agency: true },
        { name: "Emotional tone analysis", free: false, starter: false, pro: true, agency: true }
      ]
    },
    {
      name: "AI Optimization",
      features: [
        { name: "AI rewrite suggestions", free: false, starter: false, pro: true, agency: true },
        { name: "Multiple subject variants", free: false, starter: false, pro: true, agency: true },
        { name: "A/B test recommendations", free: false, starter: false, pro: true, agency: true },
        { name: "Client AI voice profiles", free: false, starter: false, pro: false, agency: true }
      ]
    },
    {
      name: "Insights & Tracking",
      features: [
        { name: "Basic insights dashboard", free: false, starter: true, pro: true, agency: true },
        { name: "Performance tracking", free: false, starter: false, pro: true, agency: true },
        { name: "Industry benchmarks", free: false, starter: false, pro: true, agency: true },
        { name: "Campaign-level analytics", free: false, starter: false, pro: false, agency: true }
      ]
    },
    {
      name: "Team & Clients",
      features: [
        { name: "Team members", free: "–", starter: "–", pro: "–", agency: "5 seats" },
        { name: "Client workspaces", free: false, starter: false, pro: false, agency: true },
        { name: "Approval workflows", free: false, starter: false, pro: false, agency: true },
        { name: "White-label reports", free: false, starter: false, pro: false, agency: true }
      ]
    },
    {
      name: "Export & API",
      features: [
        { name: "CSV export", free: false, starter: false, pro: true, agency: true },
        { name: "Template library", free: false, starter: false, pro: true, agency: true },
        { name: "API access", free: false, starter: false, pro: false, agency: true }
      ]
    }
  ];

  const handleUpgrade = async (planId) => {
    // Growth Agency always goes to contact form (no login required)
    if (planId === "growth_agency") {
      navigate("/contact");
      return;
    }
    
    if (!user) {
      // Pass selected tier to signup page
      navigate(`/signup?plan=${planId}&billing=${isAnnual ? 'annual' : 'monthly'}`);
      return;
    }
    
    // Free tier - no payment needed
    if (planId === "free") return;
    
    // Existing user upgrading - go to Stripe
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
      const message = err.response?.data?.detail || "Failed to create checkout session";
      toast.error(message);
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

  const getUserTier = () => {
    if (!user) return null;
    // Handle both old "agency" and new "growth_agency"
    if (user.subscription_tier === "agency") return "growth_agency";
    return user.subscription_tier;
  };

  const renderFeatureCell = (value) => {
    if (value === true) {
      return <Check className="w-5 h-5 text-[#a3e635]" />;
    } else if (value === false) {
      return <X className="w-4 h-4 text-theme-dim" />;
    } else {
      return <span className="text-sm text-theme-muted">{value}</span>;
    }
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
        <div className="max-w-4xl mx-auto text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-theme-muted hover:text-theme transition-colors mb-8 sm:mb-12 text-sm font-mono tracking-wide uppercase">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          
          <p className="text-xs font-mono tracking-widest uppercase text-[#d4af37] mb-4">Pricing</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-4 sm:mb-6">
            Cold emails shouldn't be guesswork.
          </h1>
          <p className="text-lg sm:text-xl text-theme-muted max-w-2xl mx-auto mb-10">
            ColdIQ turns copy into conversions. Choose the plan that matches your ambition.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <span className={`text-sm font-mono tracking-wide ${!isAnnual ? 'text-theme' : 'text-theme-dim'}`}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-[#d4af37]"
              data-testid="billing-toggle"
            />
            <span className={`text-sm font-mono tracking-wide flex items-center gap-2 ${isAnnual ? 'text-theme' : 'text-theme-dim'}`}>
              Annual
              <span className="px-2 py-1 bg-[#a3e635]/10 text-[#a3e635] text-[10px] sm:text-xs font-mono font-bold">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-12" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => {
              const price = formatPrice(plan.monthlyPrice, plan.annualPrice, plan.annualMonthly);
              const Icon = plan.icon;
              const currentTier = getUserTier();
              const isCurrentPlan = currentTier === plan.id;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex flex-col ${
                    plan.popular 
                      ? 'bg-theme-secondary border-2 border-[#d4af37] lg:scale-105 lg:z-10' 
                      : 'bg-theme border border-theme'
                  }`}
                  data-testid={`pricing-card-${plan.id}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Most Popular
                    </div>
                  )}
                  
                  <div className="p-6 sm:p-8 flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 flex items-center justify-center ${plan.popular ? 'bg-[#d4af37]' : 'bg-theme-tertiary'}`}>
                        <Icon className={`w-5 h-5 ${plan.popular ? 'text-black' : 'text-[#d4af37]'}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-sans font-semibold">{plan.name}</h3>
                        <p className="text-xs text-theme-dim">{plan.tagline}</p>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight">{price.display}</span>
                        <span className="text-theme-dim font-mono text-sm">{price.period}</span>
                      </div>
                      {price.total && (
                        <p className="text-xs text-theme-dim mt-1 font-mono">Billed as {price.total}</p>
                      )}
                      {price.savings && (
                        <p className="text-xs text-[#a3e635] mt-1 font-mono font-medium">{price.savings}</p>
                      )}
                      <p className="text-theme-muted text-sm mt-3">{plan.description}</p>
                    </div>
                    
                    {/* Features */}
                    <ul className="space-y-2.5 mb-6">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 text-[#a3e635] flex-shrink-0 mt-0.5" />
                          <span className="text-theme-muted">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Limitations (for Free/Starter) */}
                    {plan.limitations && (
                      <ul className="space-y-2 mb-6 pt-4 border-t border-theme-subtle">
                        {plan.limitations.map((limitation, j) => (
                          <li key={j} className="flex items-start gap-2.5 text-sm">
                            <X className="w-4 h-4 text-theme-dim flex-shrink-0 mt-0.5" />
                            <span className="text-theme-dim">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* CTA */}
                  <div className="p-6 sm:p-8 pt-0">
                    <Button 
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading === plan.id || isCurrentPlan}
                      className={`w-full rounded-none font-bold uppercase tracking-wider text-xs px-4 py-4 h-auto transition-all ${
                        plan.popular
                          ? 'bg-[#d4af37] text-black hover:bg-[#b5952f] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                          : plan.id === 'free'
                            ? 'bg-transparent text-theme-muted hover:text-theme border border-theme hover:border-theme-muted'
                            : 'bg-theme-tertiary text-theme hover:bg-theme-secondary border border-theme'
                      }`}
                      data-testid={`select-plan-${plan.id}`}
                    >
                      {loading === plan.id ? (
                        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : (
                        <>
                          {plan.cta}
                          {plan.id !== 'free' && <ArrowRight className="w-4 h-4 ml-2" />}
                        </>
                      )}
                    </Button>
                    
                    {/* Upgrade hint */}
                    {plan.upgradeHint && !isCurrentPlan && (
                      <p className="text-[11px] text-theme-dim text-center mt-3 font-mono">
                        {plan.upgradeHint}
                      </p>
                    )}
                  </div>
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
              <Shield className="w-4 h-4 text-[#a3e635]" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-[#a3e635]" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-[#a3e635]" />
              <span>Secure payment via Stripe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-mono tracking-widest uppercase text-theme-dim mb-3">Compare Plans</p>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mb-4">
              Feature Comparison
            </h2>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 text-[#d4af37] text-sm font-mono hover:underline"
            >
              {showComparison ? "Hide comparison" : "Show full comparison"}
              {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-x-auto"
            >
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-theme">
                    <th className="text-left py-4 px-4 text-sm font-mono text-theme-dim">Features</th>
                    <th className="text-center py-4 px-4 text-sm font-mono">Free</th>
                    <th className="text-center py-4 px-4 text-sm font-mono">Starter</th>
                    <th className="text-center py-4 px-4 text-sm font-mono text-[#d4af37]">Pro</th>
                    <th className="text-center py-4 px-4 text-sm font-mono">Growth Agency</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonCategories.map((category, ci) => (
                    <React.Fragment key={ci}>
                      <tr className="bg-theme-secondary">
                        <td colSpan={5} className="py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider text-theme-muted">
                          {category.name}
                        </td>
                      </tr>
                      {category.features.map((feature, fi) => (
                        <tr key={fi} className="border-b border-theme-subtle hover:bg-theme-secondary/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-theme-muted">{feature.name}</td>
                          <td className="py-3 px-4 text-center">{renderFeatureCell(feature.free)}</td>
                          <td className="py-3 px-4 text-center">{renderFeatureCell(feature.starter)}</td>
                          <td className="py-3 px-4 text-center bg-[#d4af37]/5">{renderFeatureCell(feature.pro)}</td>
                          <td className="py-3 px-4 text-center">{renderFeatureCell(feature.agency)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-theme-secondary border-y border-theme">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-mono tracking-widest uppercase text-[#d4af37] mb-4">Why Upgrade</p>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mb-8">
            What Users Actually Pay For
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-8 text-left">
            <div className="p-6 border border-theme bg-theme">
              <h3 className="font-sans font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#d4af37]" />
                Starter → Pro
              </h3>
              <ul className="space-y-2 text-sm text-theme-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a3e635]" />
                  +20–40% higher reply rates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a3e635]" />
                  Faster iteration cycles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a3e635]" />
                  Fewer wasted sends
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a3e635]" />
                  Clear testing direction
                </li>
              </ul>
            </div>
            
            <div className="p-6 border border-theme bg-theme">
              <h3 className="font-sans font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#d4af37]" />
                Pro → Growth Agency
              </h3>
              <ul className="space-y-2 text-sm text-theme-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a3e635]" />
                  Fewer revision cycles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a3e635]" />
                  Faster client approvals
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a3e635]" />
                  Proof for renewals
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a3e635]" />
                  Scalable systems
                </li>
              </ul>
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
              { q: "What's the difference between Pro and Growth Agency?", a: "Pro is for individual power users who want to optimize their own emails. Growth Agency adds team collaboration, client workspaces, white-label reports, and API access for agencies managing multiple accounts." },
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

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-t border-theme">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mb-4">
            Ready to optimize for replies?
          </h2>
          <p className="text-theme-muted mb-8">
            Join thousands of sales professionals writing emails that actually convert.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-4 h-auto">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
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
          <div className="flex items-center gap-6 text-xs text-theme-dim">
            <Link to="/faq" className="hover:text-theme-muted">FAQ</Link>
            <Link to="/support" className="hover:text-theme-muted">Contact</Link>
            <Link to="/terms" className="hover:text-theme-muted">Terms</Link>
            <Link to="/privacy" className="hover:text-theme-muted">Privacy</Link>
          </div>
          <p className="text-theme-dim text-xs sm:text-sm font-mono">© 2025 <a href="https://arisolutionsinc.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37]">ARI Solutions Inc.</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
