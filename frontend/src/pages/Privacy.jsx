import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-theme transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-theme">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-theme-muted hover:text-theme transition-colors mb-8 text-sm font-mono tracking-wide uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-theme-muted mb-8">Last updated: January 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">1. Introduction</h2>
            <p className="text-theme-muted leading-relaxed">
              ColdIQ ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              AI-powered cold email analysis service. Please read this policy carefully.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">2. Information We Collect</h2>
            
            <h3 className="font-sans text-lg text-theme mt-6 mb-3">2.1 Personal Information</h3>
            <p className="text-theme-muted leading-relaxed">
              When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside text-theme-muted mt-4 space-y-2">
              <li><strong>Contact Information:</strong> Email address, full name</li>
              <li><strong>Phone Number:</strong> For verification purposes only</li>
              <li><strong>Professional Information:</strong> Job role, target industry, email volume</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we don't store card details)</li>
            </ul>

            <h3 className="font-sans text-lg text-theme mt-6 mb-3">2.2 Usage Data</h3>
            <p className="text-theme-muted leading-relaxed">
              We automatically collect:
            </p>
            <ul className="list-disc list-inside text-theme-muted mt-4 space-y-2">
              <li>Email content submitted for analysis (subject lines and body text)</li>
              <li>Analysis results and scores</li>
              <li>Feature usage patterns</li>
              <li>Browser type, device information, and IP address</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">3. SMS/Phone Verification Policy</h2>
            <p className="text-theme-muted leading-relaxed">
              We use phone number verification to ensure account security and prevent abuse. Here's how we handle your phone information:
            </p>
            
            <div className="bg-theme-secondary border border-theme p-6 mt-4">
              <h4 className="font-sans font-medium text-theme mb-3">What We Collect</h4>
              <ul className="list-disc list-inside text-theme-muted space-y-2">
                <li>Your phone number when you sign up</li>
                <li>Verification attempt timestamps</li>
              </ul>
              
              <h4 className="font-sans font-medium text-theme mb-3 mt-6">How We Use It</h4>
              <ul className="list-disc list-inside text-theme-muted space-y-2">
                <li>To send one-time verification codes during signup</li>
                <li>To verify account ownership if you need to recover your account</li>
                <li>To ensure one account per user (fraud prevention)</li>
              </ul>
              
              <h4 className="font-sans font-medium text-theme mb-3 mt-6">What We Don't Do</h4>
              <ul className="list-disc list-inside text-theme-muted space-y-2">
                <li>We do NOT send marketing messages to your phone</li>
                <li>We do NOT sell or share your phone number with third parties</li>
                <li>We do NOT use your phone number for any purpose other than verification</li>
              </ul>
            </div>

            <p className="text-theme-muted leading-relaxed mt-4">
              By providing your phone number, you consent to receiving transactional SMS messages for 
              verification purposes. Standard message and data rates may apply based on your carrier. 
              You can request deletion of your phone number by contacting support, though this may 
              require closing your account.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">4. How We Use Your Information</h2>
            <p className="text-theme-muted leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-theme-muted mt-4 space-y-2">
              <li>Provide, operate, and maintain our Service</li>
              <li>Process your email analyses using AI</li>
              <li>Manage your account and subscription</li>
              <li>Send transactional emails (verification, password reset, billing)</li>
              <li>Improve our AI models and analysis accuracy (using anonymized data)</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-theme-muted leading-relaxed">
              We do NOT sell your personal information. We may share data with:
            </p>
            <ul className="list-disc list-inside text-theme-muted mt-4 space-y-2">
              <li><strong>Service Providers:</strong> Stripe (payments), AWS (cloud hosting), Resend (emails), AI providers (analysis)</li>
              <li><strong>Team Members:</strong> If you're on an Agency plan, team admins can view team analytics</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">6. Data Security</h2>
            <p className="text-theme-muted leading-relaxed">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc list-inside text-theme-muted mt-4 space-y-2">
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication for internal systems</li>
            </ul>
            <p className="text-theme-muted leading-relaxed mt-4">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee 
              absolute security of your data.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">7. Data Retention</h2>
            <p className="text-theme-muted leading-relaxed">
              We retain your data as follows:
            </p>
            <ul className="list-disc list-inside text-theme-muted mt-4 space-y-2">
              <li><strong>Account Data:</strong> Retained while your account is active</li>
              <li><strong>Email Analyses:</strong> Retained based on your subscription tier (Free: last 3, Paid: unlimited)</li>
              <li><strong>Phone Numbers:</strong> Retained while your account is active</li>
              <li><strong>Anonymized Analytics:</strong> May be retained indefinitely for service improvement</li>
            </ul>
            <p className="text-theme-muted leading-relaxed mt-4">
              You can request deletion of your account and associated data by contacting support.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">8. Your Rights</h2>
            <p className="text-theme-muted leading-relaxed">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-theme-muted mt-4 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-theme-muted leading-relaxed mt-4">
              To exercise these rights, contact us at coldiq@arisolutionsinc.com.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">9. Cookies and Tracking</h2>
            <p className="text-theme-muted leading-relaxed">
              We use essential cookies to maintain your session and preferences (like dark/light mode). 
              We do not use third-party advertising cookies. You can manage cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">10. Children's Privacy</h2>
            <p className="text-theme-muted leading-relaxed">
              ColdIQ is not intended for users under 18 years of age. We do not knowingly collect 
              information from children. If you believe a child has provided us with personal information, 
              please contact us.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">11. International Data Transfers</h2>
            <p className="text-theme-muted leading-relaxed">
              Your data may be processed in countries outside your residence, including the United States. 
              We ensure appropriate safeguards are in place for international transfers.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">12. Changes to This Policy</h2>
            <p className="text-theme-muted leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">13. Contact Us</h2>
            <p className="text-theme-muted leading-relaxed">
              For questions about this Privacy Policy or our data practices, contact us at:
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-[#d4af37]">privacy@coldiq.io</p>
              <p className="text-theme-muted">ColdIQ Support Team</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-theme py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-theme-dim text-sm">© 2025 ColdIQ. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-[#d4af37] text-sm">
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

export default Privacy;
