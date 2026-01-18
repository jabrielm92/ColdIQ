import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { API } from "@/App";

const Support = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/contact/support`, form);
      setSubmitted(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
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

        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 rounded-full">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-serif mb-4">Message Sent!</h1>
          <p className="text-zinc-400 mb-8">
            Thank you for reaching out. Our support team will review your message and get back to you within 24-48 hours.
          </p>
          <Link to="/">
            <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-3 h-auto">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4">Contact Support</h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Have a question, feedback, or need help with ColdIQ? We're here for you. Fill out the form below and our team will get back to you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="p-6 border border-zinc-800 bg-zinc-900/50">
              <MessageSquare className="w-8 h-8 text-[#d4af37] mb-4" />
              <h3 className="font-semibold mb-2">Support Email</h3>
              <a href="mailto:coldiq@arisolutionsinc.com" className="text-[#d4af37] hover:underline text-sm">
                coldiq@arisolutionsinc.com
              </a>
            </div>
            <div className="p-6 border border-zinc-800 bg-zinc-900/50">
              <Clock className="w-8 h-8 text-[#d4af37] mb-4" />
              <h3 className="font-semibold mb-2">Response Time</h3>
              <p className="text-zinc-400 text-sm">We typically respond within 24-48 hours</p>
            </div>
            <div className="p-6 border border-zinc-800 bg-zinc-900/50">
              <p className="text-zinc-500 text-sm">
                Looking for answers? Check our <Link to="/faq" className="text-[#d4af37] hover:underline">FAQ page</Link> for quick help.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="p-8 border border-zinc-800 bg-zinc-900/50 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Your Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Smith"
                    className="bg-zinc-800 border-zinc-700 rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Email Address *</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@company.com"
                    className="bg-zinc-800 border-zinc-700 rounded-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Subject *</label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="How can we help?"
                  className="bg-zinc-800 border-zinc-700 rounded-none"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Message *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us more about your question or issue..."
                  rows={6}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-none px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs py-4 h-auto"
              >
                {loading ? "Sending..." : "Send Message"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
          <p>ColdIQ is a product of <a href="https://arisolutionsinc.com" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:underline">ARI Solutions Inc.</a></p>
        </div>
      </div>
    </div>
  );
};

export default Support;
