import React, { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Key, Copy, Check, Eye, EyeOff, RefreshCw, Lock, Code, Webhook
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const ApiAccess = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const isAgency = user?.subscription_tier === "agency" || user?.subscription_tier === "growth_agency" || user?.subscription_tier === "growth_agency";

  useEffect(() => {
    if (isAgency) {
      fetchApiKey();
    } else {
      setLoading(false);
    }
  }, [isAgency]);

  const fetchApiKey = async () => {
    try {
      const res = await axios.get(`${API}/api-key`);
      setApiKey(res.data.api_key);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Failed to fetch API key", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    setRegenerating(true);
    try {
      const res = await axios.post(`${API}/api-key/generate`);
      setApiKey(res.data.api_key);
      setShowKey(true);
      toast.success("API key generated");
    } catch (err) {
      toast.error("Failed to generate API key");
    } finally {
      setRegenerating(false);
    }
  };

  const copyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success("API key copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Locked state for non-Agency users
  if (!isAgency) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-zinc-800 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-zinc-600" />
              </div>
              <h1 className="font-serif text-3xl mb-4">API & Webhooks</h1>
              <p className="text-zinc-500 max-w-md mx-auto mb-8">
                Integrate ColdIQ into your workflow with our REST API. Analyze emails programmatically, set up webhooks, and connect to your CRM.
              </p>
              
              {/* API Preview */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 mb-8 max-w-lg mx-auto text-left font-mono text-xs">
                <p className="text-zinc-500 mb-2"># Analyze an email</p>
                <p className="text-emerald-400">POST /api/v1/analyze</p>
                <pre className="text-zinc-400 mt-2">{`{
  "subject": "Quick question",
  "body": "Hi {{name}}...",
  "client_id": "abc123"
}`}</pre>
              </div>
              
              <Link to="/pricing">
                <Button className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none font-bold uppercase tracking-wider text-xs px-8 py-4 h-auto">
                  Upgrade to Growth Agency
                </Button>
              </Link>
              <p className="text-xs text-zinc-600 mt-4">Starts at $199/month</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8" data-testid="api-access-page">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-3">Developer Tools</p>
            <h1 className="font-serif text-4xl tracking-tight mb-2">API Access</h1>
            <p className="text-zinc-500">Integrate ColdIQ into your workflow</p>
          </div>

          {/* API Key Section */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-5 h-5 text-[#d4af37]" />
              <h3 className="font-medium">Your API Key</h3>
            </div>
            
            {loading ? (
              <div className="h-12 bg-zinc-800 animate-pulse rounded" />
            ) : apiKey ? (
              <div className="flex items-center gap-2">
                <Input 
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  readOnly
                  className="bg-zinc-800 border-zinc-700 font-mono text-sm"
                />
                <Button variant="ghost" onClick={() => setShowKey(!showKey)} className="px-3">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" onClick={copyKey} className="px-3">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={generateApiKey}
                  disabled={regenerating}
                  className="border-zinc-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <p className="text-zinc-500">No API key generated yet</p>
                <Button 
                  onClick={generateApiKey}
                  disabled={regenerating}
                  className="bg-[#d4af37] text-black hover:bg-[#b5952f] rounded-none"
                >
                  {regenerating ? 'Generating...' : 'Generate API Key'}
                </Button>
              </div>
            )}
            <p className="text-xs text-zinc-600 mt-3">Keep your API key secret. Never expose it in client-side code.</p>
          </div>

          {/* API Endpoints */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-5 h-5 text-cyan-400" />
              <h3 className="font-medium">API Endpoints</h3>
            </div>
            
            <div className="space-y-4 font-mono text-sm">
              <div className="p-3 bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs">POST</span>
                  <span className="text-zinc-300">/api/v1/analyze</span>
                </div>
                <p className="text-xs text-zinc-500">Analyze a single email</p>
              </div>
              
              <div className="p-3 bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs">POST</span>
                  <span className="text-zinc-300">/api/v1/analyze/sequence</span>
                </div>
                <p className="text-xs text-zinc-500">Analyze a multi-email sequence</p>
              </div>
              
              <div className="p-3 bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs">GET</span>
                  <span className="text-zinc-300">/api/v1/analyses</span>
                </div>
                <p className="text-xs text-zinc-500">List analysis history</p>
              </div>
              
              <div className="p-3 bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs">GET</span>
                  <span className="text-zinc-300">/api/v1/clients</span>
                </div>
                <p className="text-xs text-zinc-500">List clients (Agency)</p>
              </div>
            </div>
          </div>

          {/* Webhooks */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Webhook className="w-5 h-5 text-violet-400" />
              <h3 className="font-medium">Webhooks</h3>
              <span className="px-2 py-0.5 text-[10px] bg-zinc-700 text-zinc-400 font-mono">COMING SOON</span>
            </div>
            <p className="text-sm text-zinc-500">
              Receive real-time notifications when analyses complete. Perfect for CRM integrations.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApiAccess;
