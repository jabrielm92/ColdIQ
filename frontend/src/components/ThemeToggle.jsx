import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/App";

export const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-10 h-10 flex items-center justify-center border border-theme-subtle hover:border-gold/50 transition-all group ${className}`}
      data-testid="theme-toggle-btn"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun className={`w-4 h-4 absolute transition-all duration-300 ${
        theme === 'light' 
          ? 'opacity-100 rotate-0 text-[#d4af37]' 
          : 'opacity-0 rotate-90 text-zinc-400'
      }`} />
      <Moon className={`w-4 h-4 absolute transition-all duration-300 ${
        theme === 'dark' 
          ? 'opacity-100 rotate-0 text-[#d4af37]' 
          : 'opacity-0 -rotate-90 text-zinc-400'
      }`} />
    </button>
  );
};

export default ThemeToggle;
