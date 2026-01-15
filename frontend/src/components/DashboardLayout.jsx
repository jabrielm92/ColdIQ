import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";
import {
  Mail, LayoutDashboard, History, BarChart3, Settings, LogOut,
  Plus, Menu, X, FileText, Users
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isAgency = user?.subscription_tier === "agency";

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "/analyze", label: "Analyze", icon: <Plus className="w-5 h-5" /> },
    { path: "/history", label: "History", icon: <History className="w-5 h-5" /> },
    { path: "/templates", label: "Templates", icon: <FileText className="w-5 h-5" /> },
    { path: "/insights", label: "Insights", icon: <BarChart3 className="w-5 h-5" /> },
    ...(isAgency ? [{ path: "/team-analytics", label: "Team", icon: <Users className="w-5 h-5" /> }] : []),
    { path: "/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> }
  ];

  const isActive = (path) => location.pathname === path;

  const tierConfig = {
    free: { label: "Free", bg: "bg-theme-tertiary", text: "text-theme-muted" },
    starter: { label: "Starter", bg: "bg-[#a3e635]/10", text: "text-[#a3e635]" },
    pro: { label: "Pro", bg: "bg-[#d4af37]/10", text: "text-[#d4af37]" },
    agency: { label: "Agency", bg: "bg-[#d4af37]/20", text: "text-[#d4af37]" }
  };

  const tier = tierConfig[user?.subscription_tier] || tierConfig.free;

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
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 transition-all font-medium text-sm ${
                isActive(item.path) 
                  ? 'bg-[#d4af37]/10 text-[#d4af37] border-l-2 border-[#d4af37]' 
                  : 'text-theme-muted hover:text-theme hover:bg-theme-tertiary border-l-2 border-transparent'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
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
          <div className="p-4 space-y-1 border-t border-theme bg-theme-secondary">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 transition-all ${
                  isActive(item.path) 
                    ? 'bg-[#d4af37]/10 text-[#d4af37]' 
                    : 'text-theme-muted hover:text-theme'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <Button 
              variant="ghost" 
              className="w-full justify-start text-theme-muted hover:text-theme mt-4 rounded-none"
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
