import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Shield, CheckCircle, MessageSquare, ArrowRight, Lock } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const SmsOptIn = () => {
  return (
    <div className="min-h-screen bg-theme transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-theme">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#d4af37] flex items-center justify-center">
              <Mail className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-semibold tracking-tight font-sans">ColdIQ</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-theme-muted hover:text-theme transition-colors mb-8 text-sm font-mono tracking-wide uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mb-4">SMS Opt-In Workflow</h1>
          <p className="text-theme-muted text-lg max-w-2xl mx-auto">
            ColdIQ uses phone verification to ensure account security and prevent fraud. 
            Here's how our opt-in process works.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Step 1 */}
          <div className="bg-theme-secondary border border-theme p-6 relative">
            <div className="absolute -top-4 left-6 w-8 h-8 bg-[#d4af37] flex items-center justify-center text-black font-bold">
              1
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-xl mb-3">Account Creation</h3>
              <p className="text-theme-muted text-sm mb-4">
                User fills out name, email, and password to create an account.
              </p>
              <div className="bg-theme border border-theme-subtle p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-theme-dim">FULL NAME</label>
                  <div className="border-b border-theme-subtle py-2 text-sm text-theme-muted">John Smith</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-theme-dim">EMAIL</label>
                  <div className="border-b border-theme-subtle py-2 text-sm text-theme-muted">john@company.com</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-theme-dim">PASSWORD</label>
                  <div className="border-b border-theme-subtle py-2 text-sm text-theme-muted">••••••••</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-theme-secondary border border-theme p-6 relative">
            <div className="absolute -top-4 left-6 w-8 h-8 bg-[#d4af37] flex items-center justify-center text-black font-bold">
              2
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-xl mb-3">Phone Number Entry</h3>
              <p className="text-theme-muted text-sm mb-4">
                User provides phone number and consents to receive verification SMS.
              </p>
              <div className="bg-theme border border-theme-subtle p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-8 h-8 text-[#d4af37]" />
                  <div>
                    <div className="font-medium">Verify Your Phone</div>
                    <div className="text-xs text-theme-dim">One phone number per account</div>
                  </div>
                </div>
                <div className="bg-theme-secondary border border-theme p-3 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-[#a3e635] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-theme-muted">
                    Your number is kept private and only used for verification.
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-theme-dim">PHONE NUMBER</label>
                  <div className="border-b border-theme-subtle py-2 text-sm text-theme-muted">(555) 123-4567</div>
                </div>
                <p className="text-xs text-theme-dim">
                  By providing your phone number, you agree to receive a one-time verification code via SMS. 
                  Standard rates may apply.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-theme-secondary border border-theme p-6 relative">
            <div className="absolute -top-4 left-6 w-8 h-8 bg-[#d4af37] flex items-center justify-center text-black font-bold">
              3
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-xl mb-3">OTP Verification</h3>
              <p className="text-theme-muted text-sm mb-4">
                User receives 6-digit code via SMS and enters it to verify.
              </p>
              <div className="bg-theme border border-theme-subtle p-4 space-y-4">
                <div className="flex items-center gap-3 justify-center">
                  <MessageSquare className="w-8 h-8 text-[#d4af37]" />
                  <div className="text-center">
                    <div className="font-medium">Enter Verification Code</div>
                    <div className="text-xs text-theme-dim">Sent to +1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                  {['1', '2', '3', '4', '5', '6'].map((digit, i) => (
                    <div 
                      key={i} 
                      className="w-10 h-12 bg-theme-secondary border border-theme flex items-center justify-center text-xl font-mono"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
                <button className="w-full bg-[#d4af37] text-black py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Verify Phone
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Flow Diagram */}
        <div className="bg-theme-secondary border border-theme p-8 mb-12">
          <h2 className="font-serif text-2xl text-center mb-8">Complete Opt-In Flow</h2>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-[#d4af37]/10 border border-[#d4af37] flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#d4af37]" />
              </div>
              <span className="text-xs text-theme-muted text-center">Create Account</span>
            </div>
            
            <ArrowRight className="w-6 h-6 text-theme-dim hidden sm:block" />
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-[#d4af37]/10 border border-[#d4af37] flex items-center justify-center">
                <Phone className="w-8 h-8 text-[#d4af37]" />
              </div>
              <span className="text-xs text-theme-muted text-center">Enter Phone</span>
            </div>
            
            <ArrowRight className="w-6 h-6 text-theme-dim hidden sm:block" />
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-[#d4af37]/10 border border-[#d4af37] flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#d4af37]" />
              </div>
              <span className="text-xs text-theme-muted text-center">View Consent</span>
            </div>
            
            <ArrowRight className="w-6 h-6 text-theme-dim hidden sm:block" />
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-[#d4af37]/10 border border-[#d4af37] flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-[#d4af37]" />
              </div>
              <span className="text-xs text-theme-muted text-center">Receive SMS</span>
            </div>
            
            <ArrowRight className="w-6 h-6 text-theme-dim hidden sm:block" />
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-[#a3e635]/10 border border-[#a3e635] flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-[#a3e635]" />
              </div>
              <span className="text-xs text-theme-muted text-center">Verified</span>
            </div>
          </div>
        </div>

        {/* Key Points for Compliance */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-theme-secondary border border-theme p-6">
            <h3 className="font-serif text-xl mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#d4af37]" />
              Consent Language
            </h3>
            <p className="text-theme-muted text-sm leading-relaxed">
              During the phone entry step (Step 2), users see the following consent text:
            </p>
            <blockquote className="border-l-2 border-[#d4af37] pl-4 mt-4 text-sm italic text-theme-muted">
              "By providing your phone number, you agree to receive a one-time verification code via SMS. 
              Standard message and data rates may apply. See our Privacy Policy and Terms of Service."
            </blockquote>
          </div>
          
          <div className="bg-theme-secondary border border-theme p-6">
            <h3 className="font-serif text-xl mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#a3e635]" />
              Data Protection
            </h3>
            <ul className="text-theme-muted text-sm space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#a3e635] flex-shrink-0 mt-0.5" />
                Phone numbers are only used for verification
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#a3e635] flex-shrink-0 mt-0.5" />
                No marketing SMS messages sent
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#a3e635] flex-shrink-0 mt-0.5" />
                Phone numbers never sold or shared
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#a3e635] flex-shrink-0 mt-0.5" />
                One phone number per account (fraud prevention)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#a3e635] flex-shrink-0 mt-0.5" />
                Users can request phone deletion via support
              </li>
            </ul>
          </div>
        </div>

        {/* Message Format */}
        <div className="bg-theme-secondary border border-theme p-6 mb-12">
          <h3 className="font-serif text-xl mb-4">SMS Message Format</h3>
          <p className="text-theme-muted text-sm mb-4">
            Users receive the following transactional SMS message:
          </p>
          <div className="bg-theme border border-[#d4af37]/30 p-4 max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs text-theme-dim">ColdIQ</span>
            </div>
            <p className="text-sm">
              Your ColdIQ verification code is: <span className="font-mono font-bold text-[#d4af37]">123456</span>. 
              Valid for 5 minutes. Do not share this code.
            </p>
          </div>
        </div>

        {/* Links to Policies */}
        <div className="text-center">
          <h3 className="font-serif text-xl mb-4">Related Policies</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/privacy" 
              className="bg-theme-secondary border border-theme px-6 py-3 hover:border-[#d4af37] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="bg-theme-secondary border border-theme px-6 py-3 hover:border-[#d4af37] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-theme py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-theme-dim text-sm">© 2025 ColdIQ. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-theme-muted hover:text-[#d4af37] text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-theme-muted hover:text-[#d4af37] text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SmsOptIn;
