import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";
import {
  Mail, LayoutDashboard, History, BarChart3, Settings, LogOut,
  Plus, Menu, X, FileText, Users, TrendingUp, Layers, Lock,
  Building2, FileBarChart, Code, Target, Shield
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "sonner";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userTier = user?.subscription_tier || "free";
  const isStarter = ["starter", "pro", "agency", "growth_agency"].includes(userTier);
  const isPro = ["pro", "agency", "growth_agency"].includes(userTier);
  const isAgency = userTier === "agency" || userTier === "growth_agency";

  // All nav items - shown to everyone, access controlled by tier
  const navItems = [
    // Core features - available to all
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, tier: "free" },
    { path: "/analyze", label: "Analyze", icon: <Plus className="w-5 h-5" />, tier: "free" },
    { path: "/history", label: "History", icon: <History className="w-5 h-5" />, tier: "free" },
    { path: "/tools", label: "Tools", icon: <Zap className="w-5 h-5" />, tier: "free" },
    
    // Starter features
    { path: "/templates", label: "Templates", icon: <FileText className="w-5 h-5" />, tier: "pro", badge: "PRO" },
    { path: "/insights", label: "Insights", icon: <BarChart3 className="w-5 h-5" />, tier: "starter", badge: "STARTER" },
    
    // Pro features
    { path: "/sequence", label: "Sequences", icon: <Layers className="w-5 h-5" />, tier: "pro", badge: "PRO" },
    { path: "/performance", label: "Performance", icon: <TrendingUp className="w-5 h-5" />, tier: "pro", badge: "PRO" },
    
    // Agency features
    { path: "/clients", label: "Clients", icon: <Building2 className="w-5 h-5" />, tier: "agency", badge: "AGENCY" },
    { path: "/campaigns", label: "Campaigns", icon: <Target className="w-5 h-5" />, tier: "agency", badge: "AGENCY" },
    { path: "/reports", label: "Reports", icon: <FileBarChart className="w-5 h-5" />, tier: "agency", badge: "AGENCY" },
    { path: "/team-analytics", label: "Team", icon: <Users className="w-5 h-5" />, tier: "agency", badge: "AGENCY" },
    { path: "/api-access", label: "API", icon: <Code className="w-5 h-5" />, tier: "agency", badge: "AGENCY" },
    
    // Settings - available to all
    { path: "/settings", label: "Settings", icon: <Settings className="w-5 h-5" />, tier: "free" }
  ];

  const hasAccess = (itemTier) => {
    if (itemTier === "free") return true;
    if (itemTier === "starter") return isStarter;
    if (itemTier === "pro") return isPro;
    if (itemTier === "agency") return isAgency;
    return false;
  };

  const handleNavClick = (e, item) => {
    if (!hasAccess(item.tier)) {
      e.preventDefault();
      // Directly navigate to pricing for locked features
      navigate("/pricing");
    }
  };

  const isActive = (path) => location.pathname === path;

  const tierConfig = {
    free: { label: "Free", bg: "bg-theme-tertiary", text: "text-theme-muted" },
    starter: { label: "Starter", bg: "bg-[#a3e635]/10", text: "text-[#a3e635]" },
    pro: { label: "Pro", bg: "bg-[#d4af37]/10", text: "text-[#d4af37]" },
    agency: { label: "Agency", bg: "bg-[#d4af37]/20", text: "text-[#d4af37]" },
    growth_agency: { label: "Growth", bg: "bg-[#d4af37]/20", text: "text-[#d4af37]" }
  };

  const tier = tierConfig[user?.subscription_tier] || tierConfig.free;
  
  // Admin check
  const isAdmin = user?.email === "jabriel@arisolutionsinc.com";

  return (
    <div className="min-h-screen bg-theme flex transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-theme bg-theme-secondary">
        {/* Logo */}
        <div className="p-6 border-b border-theme flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#d4af37] flex items-center justify-center">
              <Mail className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-semibold tracking-tight font-sans">ColdIQ</span>
          </Link>
          <ThemeToggle />
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const locked = !hasAccess(item.tier);
            return (
              <Link
                key={item.path}
                to={locked ? "#" : item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={`flex items-center gap-3 px-4 py-3 transition-all font-medium text-sm relative ${
                  locked 
                    ? 'text-zinc-600 hover:text-zinc-500 cursor-not-allowed opacity-60'
                    : isActive(item.path) 
                      ? 'bg-[#d4af37]/10 text-[#d4af37] border-l-2 border-[#d4af37]' 
                      : 'text-theme-muted hover:text-theme hover:bg-theme-tertiary border-l-2 border-transparent'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {locked && <Lock className="w-3.5 h-3.5 text-zinc-600" />}
                {item.badge && !locked && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-mono ${
                    item.badge === "STARTER" ? "bg-[#a3e635]/20 text-[#a3e635]" :
                    item.badge === "PRO" ? "bg-[#d4af37]/20 text-[#d4af37]" : 
                    "bg-violet-500/20 text-violet-400"
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.badge && locked && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-zinc-800 text-zinc-500 font-mono">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Upgrade CTA for non-Agency users */}
        {!isAgency && (
          <div className="p-4 border-t border-theme">
            <Link to="/pricing">
              <div className="p-3 bg-gradient-to-r from-[#d4af37]/10 to-violet-500/10 border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors">
                <p className="text-xs font-medium text-[#d4af37] mb-1">Unlock All Features</p>
                <p className="text-[10px] text-zinc-500">
                  {isPro ? "Upgrade to Agency for client management" : isPro ? "Get Pro for sequences & performance" : "Upgrade for advanced analysis"}
                </p>
              </div>
            </Link>
          </div>
        )}
        
        {/* User Section */}
        <div className="p-4 border-t border-theme">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="w-10 h-10 bg-theme-tertiary flex items-center justify-center text-sm font-bold text-theme-muted">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.full_name || 'User'}</p>
              <p className={`text-xs px-2 py-0.5 inline-block ${tier.bg} ${tier.text}`}>
                {tier.label}
              </p>
            </div>
          </div>
          
          {/* Admin Dashboard Button - Only for admin */}
          {isAdmin && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-none mb-1"
              onClick={() => window.location.href = "/admin"}
              data-testid="admin-dashboard-btn"
            >
              <Shield className="w-4 h-4 mr-3" />
              Admin Dashboard
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-theme-muted hover:text-theme hover:bg-theme-tertiary rounded-none"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Log out
          </Button>
        </div>
      </aside>
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-theme-secondary border-b border-theme">
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#d4af37] flex items-center justify-center">
              <Mail className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-semibold tracking-tight font-sans">ColdIQ</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-theme-muted hover:text-theme"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="p-4 space-y-1 border-t border-theme bg-theme-secondary max-h-[70vh] overflow-y-auto">
            {navItems.map((item) => {
              const locked = !hasAccess(item.tier);
              return (
                <Link
                  key={item.path}
                  to={locked ? "#" : item.path}
                  onClick={(e) => {
                    handleNavClick(e, item);
                    if (!locked) setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 transition-all ${
                    locked 
                      ? 'text-zinc-600 opacity-60'
                      : isActive(item.path) 
                        ? 'bg-[#d4af37]/10 text-[#d4af37]' 
                        : 'text-theme-muted hover:text-theme'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {locked && <Lock className="w-3.5 h-3.5" />}
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono ${
                      locked ? "bg-zinc-800 text-zinc-500" : 
                      item.badge === "STARTER" ? "bg-[#a3e635]/20 text-[#a3e635]" :
                      item.badge === "PRO" ? "bg-[#d4af37]/20 text-[#d4af37]" : 
                      "bg-violet-500/20 text-violet-400"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            
            {/* Admin Dashboard Button - Mobile - Only for admin */}
            {isAdmin && (
              <Button 
                variant="ghost" 
                className="w-full justify-start text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 mt-4 rounded-none"
                onClick={() => window.location.href = "/admin"}
              >
                <Shield className="w-4 h-4 mr-3" />
                Admin Dashboard
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-theme-muted hover:text-theme mt-2 rounded-none"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Log out
            </Button>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:mt-0 mt-16">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
