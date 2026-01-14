import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";
import {
  Mail, LayoutDashboard, History, BarChart3, Settings, LogOut,
  Plus, CreditCard, Menu, X, ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "/analyze", label: "Analyze", icon: <Plus className="w-5 h-5" /> },
    { path: "/history", label: "History", icon: <History className="w-5 h-5" /> },
    { path: "/insights", label: "Insights", icon: <BarChart3 className="w-5 h-5" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> }
  ];

  const isActive = (path) => location.pathname === path;

  const tierColors = {
    free: "bg-zinc-700 text-zinc-300",
    starter: "bg-emerald-500/20 text-emerald-400",
    pro: "bg-indigo-500/20 text-indigo-400",
    agency: "bg-violet-500/20 text-violet-400"
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800 bg-zinc-900/30">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter" style={{ fontFamily: 'Manrope' }}>ColdIQ</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path) 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        {/* User Section */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.full_name || 'User'}</p>
              <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${tierColors[user?.subscription_tier || 'free']}`}>
                {user?.subscription_tier?.charAt(0).toUpperCase() + user?.subscription_tier?.slice(1) || 'Free'}
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-zinc-400 hover:text-white mt-2"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Log out
          </Button>
        </div>
      </aside>
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tighter" style={{ fontFamily: 'Manrope' }}>ColdIQ</span>
          </Link>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="p-4 space-y-2 border-t border-zinc-800">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path) 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'text-zinc-400'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <Button 
              variant="ghost" 
              className="w-full justify-start text-zinc-400 mt-4"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Log out
            </Button>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:mt-0 mt-14">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
