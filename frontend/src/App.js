import React, { createContext, useContext, useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Analyzer from "@/pages/Analyzer";
import History from "@/pages/History";
import Insights from "@/pages/Insights";
import Settings from "@/pages/Settings";
import Pricing from "@/pages/Pricing";
import BillingSuccess from "@/pages/BillingSuccess";
import VerifyEmail from "@/pages/VerifyEmail";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Templates from "@/pages/Templates";
import TeamAnalytics from "@/pages/TeamAnalytics";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import SmsOptIn from "@/pages/SmsOptIn";
import Contact from "@/pages/Contact";
import Performance from "@/pages/Performance";
import SequenceAnalyzer from "@/pages/SequenceAnalyzer";
import Clients from "@/pages/Clients";
import Reports from "@/pages/Reports";
import ApiAccess from "@/pages/ApiAccess";
import Campaigns from "@/pages/Campaigns";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Theme Context
const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

// Theme Provider - fixes hydration by initializing with consistent default
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const savedTheme = localStorage.getItem("coldiq_theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem("coldiq_theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Axios interceptor for auth
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("coldiq_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("coldiq_token");
      if (token) {
        try {
          const res = await axios.get(`${API}/auth/me`);
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem("coldiq_token");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem("coldiq_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (email, password, full_name) => {
    const res = await axios.post(`${API}/auth/signup`, { email, password, full_name });
    localStorage.setItem("coldiq_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("coldiq_token");
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-theme flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Onboarding Check Route
const OnboardingRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-theme flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <div className="App min-h-screen bg-theme transition-colors duration-300">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/sms-opt-in" element={<SmsOptIn />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/performance" element={
                <OnboardingRoute><Performance /></OnboardingRoute>
              } />
              <Route path="/sequence" element={
                <OnboardingRoute><SequenceAnalyzer /></OnboardingRoute>
              } />
              <Route path="/clients" element={
                <OnboardingRoute><Clients /></OnboardingRoute>
              } />
              <Route path="/reports" element={
                <OnboardingRoute><Reports /></OnboardingRoute>
              } />
              <Route path="/api-access" element={
                <OnboardingRoute><ApiAccess /></OnboardingRoute>
              } />
              <Route path="/campaigns" element={
                <OnboardingRoute><Campaigns /></OnboardingRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="/onboarding" element={
                <ProtectedRoute><Onboarding /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <OnboardingRoute><Dashboard /></OnboardingRoute>
              } />
              <Route path="/analyze" element={
                <OnboardingRoute><Analyzer /></OnboardingRoute>
              } />
              <Route path="/history" element={
                <OnboardingRoute><History /></OnboardingRoute>
              } />
              <Route path="/insights" element={
                <OnboardingRoute><Insights /></OnboardingRoute>
              } />
              <Route path="/settings" element={
                <OnboardingRoute><Settings /></OnboardingRoute>
              } />
              <Route path="/billing/success" element={
                <OnboardingRoute><BillingSuccess /></OnboardingRoute>
              } />
              <Route path="/templates" element={
                <OnboardingRoute><Templates /></OnboardingRoute>
              } />
              <Route path="/team-analytics" element={
                <OnboardingRoute><TeamAnalytics /></OnboardingRoute>
              } />
            </Routes>
          </BrowserRouter>
          <ToasterWrapper />
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}

// Toaster wrapper to access theme
const ToasterWrapper = () => {
  const { theme } = useTheme();
  return <Toaster position="top-right" theme={theme} />;
};

export default App;
