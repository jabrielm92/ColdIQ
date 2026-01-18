import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "What is ColdIQ?",
          a: "ColdIQ is an AI-powered cold email analysis platform that helps sales professionals write more effective outreach emails. Our AI analyzes your emails, provides a score from 0-100, identifies weaknesses, and generates optimized rewrites to improve your response rates."
        },
        {
          q: "How does the free plan work?",
          a: "The free plan includes 3 email analyses per month with basic scoring and feedback. It's a great way to try ColdIQ before upgrading. No credit card is required to sign up."
        },
        {
          q: "How accurate is the AI analysis?",
          a: "Our AI is trained on thousands of high-performing cold emails across various industries. While no AI is perfect, users consistently report significant improvements in their response rates after implementing our recommendations. On average, users see a 47% increase in response rates."
        }
      ]
    },
    {
      category: "Features & Plans",
      questions: [
        {
          q: "What's the difference between Starter, Pro, and Agency plans?",
          a: "Starter ($29/mo) includes 50 analyses with basic insights and spam detection. Pro ($79/mo) offers unlimited analyses, AI rewrites, templates, performance tracking, and advanced features. Agency ($199/mo) adds team collaboration, client workspaces, white-label reports, and API access for agencies managing multiple clients."
        },
        {
          q: "What are email templates?",
          a: "Templates are pre-built, high-converting cold email frameworks available on Pro and Agency plans. You can use our proven templates or create custom ones. Our AI can also generate personalized templates based on your industry and goals."
        },
        {
          q: "Can I analyze email sequences?",
          a: "Yes! Pro and Agency plans include sequence analysis, which lets you analyze entire email campaigns (initial outreach + follow-ups) for consistency, timing recommendations, and overall effectiveness."
        },
        {
          q: "What is the Performance Dashboard?",
          a: "The Performance Dashboard (Pro and Agency) tracks your email scores over time, identifies patterns in your best-performing emails, and provides insights to help you continuously improve your outreach."
        }
      ]
    },
    {
      category: "Billing & Subscriptions",
      questions: [
        {
          q: "How does billing work?",
          a: "We offer monthly and annual billing. Annual plans save you 20%. Your subscription renews automatically until canceled. You can upgrade, downgrade, or cancel at any time from your account settings."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe."
        },
        {
          q: "Can I get a refund?",
          a: "We don't offer refunds for subscription fees, but you can cancel your subscription at any time to prevent future charges. Your access will continue until the end of your current billing period."
        },
        {
          q: "Do you offer discounts for startups or nonprofits?",
          a: "Yes! We offer special pricing for qualifying startups and nonprofit organizations. Contact us at coldiq@arisolutionsinc.com with details about your organization."
        }
      ]
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          q: "Is my email content secure?",
          a: "Absolutely. Your email content is processed securely through our AI systems and is not permanently stored after analysis unless you save it to your history. We use industry-standard encryption and never share your content with third parties."
        },
        {
          q: "Do you use my emails to train your AI?",
          a: "No. We do not use your email content to train our AI models. Your data remains private and is only used to provide you with analysis and recommendations."
        },
        {
          q: "Who can see my analysis history?",
          a: "Only you can see your analysis history. For Agency plans with teams, team admins can see aggregated team analytics, but individual email content is only visible to the person who submitted it unless explicitly shared."
        }
      ]
    },
    {
      category: "Technical",
      questions: [
        {
          q: "Do you integrate with email platforms?",
          a: "Currently, ColdIQ works as a standalone platform where you paste your email content for analysis. We're working on integrations with popular email platforms and CRMs for future releases."
        },
        {
          q: "Is there an API?",
          a: "Yes! API access is available on our Agency plan. This allows you to integrate ColdIQ's analysis capabilities directly into your own tools and workflows."
        },
        {
          q: "What browsers are supported?",
          a: "ColdIQ works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for the best experience."
        }
      ]
    }
  ];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let questionIndex = 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <nav className="border-b border-zinc-800 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#d4af37] flex items-center justify-center">
              <Mail className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold">ColdIQ</span>
          </Link>
          <Link to="/" className="text-zinc-400 hover:text-white text-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif mb-4">Frequently Asked Questions</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Find answers to common questions about ColdIQ. Can't find what you're looking for? 
            <Link to="/contact" className="text-[#d4af37] hover:underline ml-1">Contact our support team</Link>.
          </p>
        </div>

        <div className="space-y-12">
          {faqs.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-lg font-semibold text-[#d4af37] mb-4 uppercase tracking-wider">{category.category}</h2>
              <div className="space-y-2">
                {category.questions.map((faq, faqIndex) => {
                  const currentIndex = questionIndex++;
                  const isOpen = openIndex === currentIndex;
                  return (
                    <div key={faqIndex} className="border border-zinc-800 bg-zinc-900/50">
                      <button
                        onClick={() => toggleQuestion(currentIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-800/50 transition-colors"
                      >
                        <span className="font-medium pr-4">{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-zinc-400 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 p-8 border border-zinc-800 bg-zinc-900/50 text-center">
          <MessageSquare className="w-12 h-12 text-[#d4af37] mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
          <p className="text-zinc-400 mb-6">Our support team is here to help you get the most out of ColdIQ.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-3 h-auto">
                Contact Support
              </Button>
            </Link>
            <a href="mailto:coldiq@arisolutionsinc.com">
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-none font-bold uppercase tracking-wider text-xs px-8 py-3 h-auto">
                coldiq@arisolutionsinc.com
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
          <p>ColdIQ is a product of <a href="https://arisolutionsinc.com" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:underline">ARI Solutions Inc.</a></p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
