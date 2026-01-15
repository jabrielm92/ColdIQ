import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Terms = () => {
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

        <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mb-4">Terms of Service</h1>
        <p className="text-theme-muted mb-8">Last updated: January 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">1. Acceptance of Terms</h2>
            <p className="text-theme-muted leading-relaxed">
              By accessing or using ColdIQ ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our Service. ColdIQ reserves the right 
              to modify these terms at any time, and your continued use of the Service constitutes acceptance 
              of any modifications.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">2. Description of Service</h2>
            <p className="text-theme-muted leading-relaxed">
              ColdIQ is an AI-powered cold email analysis platform that helps users improve their email 
              outreach effectiveness. Our Service includes:
            </p>
            <ul className="list-disc list-inside text-theme-muted mt-4 space-y-2">
              <li>AI-powered email analysis and scoring</li>
              <li>Personalized improvement recommendations</li>
              <li>Optimized email rewrites</li>
              <li>Performance insights and analytics</li>
              <li>Email template library (for applicable subscription tiers)</li>
              <li>Team collaboration features (for Agency tier)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">3. Account Registration</h2>
            <p className="text-theme-muted leading-relaxed">
              To use ColdIQ, you must create an account by providing accurate and complete information. 
              You are responsible for maintaining the confidentiality of your account credentials and for 
              all activities that occur under your account. You must be at least 18 years old to use this Service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">4. Phone Verification</h2>
            <p className="text-theme-muted leading-relaxed">
              ColdIQ requires phone number verification during account registration to prevent fraud and abuse. 
              By providing your phone number and opting in to receive SMS verification codes:
            </p>
            <ul className="list-disc list-inside text-theme-muted mt-4 space-y-2">
              <li>You consent to receive one-time verification codes via SMS</li>
              <li>You confirm that you are the owner or authorized user of the phone number provided</li>
              <li>You understand that standard message and data rates may apply</li>
              <li>You acknowledge that each phone number can only be associated with one ColdIQ account</li>
            </ul>
            <p className="text-theme-muted leading-relaxed mt-4">
              Your phone number will only be used for account verification purposes and will not be shared 
              with third parties for marketing purposes. See our <Link to="/privacy" className="text-[#d4af37] hover:underline">Privacy Policy</Link> for 
              more details on how we handle your personal information.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">5. Subscription and Billing</h2>
            <p className="text-theme-muted leading-relaxed">
              ColdIQ offers various subscription tiers (Free, Starter, Pro, and Agency). Paid subscriptions 
              are billed monthly or annually, with annual plans offering a 20% discount. By subscribing to 
              a paid plan:
            </p>
            <ul className="list-disc list-inside text-theme-muted mt-4 space-y-2">
              <li>You authorize ColdIQ to charge your payment method on a recurring basis</li>
              <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
              <li>Refunds are handled on a case-by-case basis at ColdIQ's discretion</li>
              <li>Price changes will be communicated with at least 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">6. Acceptable Use</h2>
            <p className="text-theme-muted leading-relaxed">
              You agree not to use ColdIQ for:
            </p>
            <ul className="list-disc list-inside text-theme-muted mt-4 space-y-2">
              <li>Sending spam, unsolicited bulk emails, or violating anti-spam laws (CAN-SPAM, GDPR, etc.)</li>
              <li>Creating multiple free accounts to circumvent usage limits</li>
              <li>Scraping, copying, or redistributing our AI-generated content without permission</li>
              <li>Any illegal, fraudulent, or harmful activities</li>
              <li>Attempting to reverse engineer, hack, or exploit our systems</li>
              <li>Harassing, threatening, or discriminating against others</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">7. Intellectual Property</h2>
            <p className="text-theme-muted leading-relaxed">
              ColdIQ and its original content, features, and functionality are owned by ColdIQ and are 
              protected by international copyright, trademark, and other intellectual property laws. 
              You retain ownership of the emails you submit for analysis, but grant ColdIQ a limited 
              license to process them for providing the Service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-theme-muted leading-relaxed">
              ColdIQ is provided "as is" without warranties of any kind. We do not guarantee that our 
              AI analysis will improve your email response rates or that our Service will be uninterrupted 
              or error-free. The estimated response rates and scores are predictions based on AI analysis 
              and should not be considered guarantees of actual performance.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">9. Limitation of Liability</h2>
            <p className="text-theme-muted leading-relaxed">
              To the maximum extent permitted by law, ColdIQ shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including loss of profits, data, 
              or business opportunities, arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">10. Termination</h2>
            <p className="text-theme-muted leading-relaxed">
              ColdIQ reserves the right to suspend or terminate your account at any time for violation 
              of these Terms. You may also cancel your account at any time through the Settings page. 
              Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">11. Changes to Terms</h2>
            <p className="text-theme-muted leading-relaxed">
              We may update these Terms from time to time. We will notify you of any material changes 
              by posting the new Terms on this page and updating the "Last updated" date. Your continued 
              use of the Service after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-theme mb-4">12. Contact Us</h2>
            <p className="text-theme-muted leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-[#d4af37] mt-4">support@coldiq.io</p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-theme py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-theme-dim text-sm">© 2025 ColdIQ. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-theme-muted hover:text-[#d4af37] text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-[#d4af37] text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
