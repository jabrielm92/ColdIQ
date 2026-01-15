import React from "react";
import { 
  AlertTriangle, CheckCircle, BookOpen, MousePointer, Mail,
  Sparkles, TrendingUp, BarChart3, Lightbulb, Lock, ArrowRight, Target
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Gauge component for scores
const ScoreGauge = ({ score, max = 100, label, color = "#d4af37", size = "md" }) => {
  const percentage = (score / max) * 100;
  const radius = size === "sm" ? 30 : 40;
  const strokeWidth = size === "sm" ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2} className="transform -rotate-90">
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-bold" style={{ fontSize: size === "sm" ? "14px" : "18px" }}>
            {score}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-zinc-500 mt-2">{label}</span>}
    </div>
  );
};

// Spam Keywords Component (Starter+)
export const SpamKeywordsCard = ({ spamKeywords = [], spamRiskScore, tierHasAccess = true }) => {
  if (!tierHasAccess) {
    return (
      <LockedFeatureCard 
        title="Spam Detection"
        description="See which words might trigger spam filters"
        requiredTier="Starter"
      />
    );
  }

  if (!spamKeywords || spamKeywords.length === 0) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">No Spam Triggers</span>
        </div>
        <p className="text-zinc-400 text-sm">Your email doesn't contain common spam keywords.</p>
      </div>
    );
  }

  const riskColor = spamRiskScore > 60 ? "text-red-400" : spamRiskScore > 30 ? "text-amber-400" : "text-emerald-400";
  const riskBg = spamRiskScore > 60 ? "bg-red-500/10 border-red-500/20" : spamRiskScore > 30 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20";

  return (
    <div className={`${riskBg} border p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium">Spam Keywords Detected</span>
        </div>
        {spamRiskScore && (
          <span className={`text-xs font-mono ${riskColor}`}>
            Risk: {spamRiskScore}%
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {spamKeywords.map((keyword, i) => (
          <span 
            key={i} 
            className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-mono rounded"
          >
            {keyword}
          </span>
        ))}
      </div>
      <p className="text-zinc-500 text-xs mt-3">
        Consider rephrasing to avoid spam filters.
      </p>
    </div>
  );
};

// Readability Score Card (Starter+)
export const ReadabilityCard = ({ readabilityScore, readabilityLevel, avgWordsPerSentence, tierHasAccess = true }) => {
  if (!tierHasAccess) {
    return (
      <LockedFeatureCard 
        title="Readability Score"
        description="See how easy your email is to read"
        requiredTier="Starter"
      />
    );
  }

  if (readabilityScore === null || readabilityScore === undefined) return null;

  const getReadabilityColor = (score) => {
    if (score >= 70) return "#a3e635"; // Easy
    if (score >= 50) return "#d4af37"; // Medium
    return "#ef4444"; // Hard
  };

  const color = getReadabilityColor(readabilityScore);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium">Readability</span>
      </div>
      <div className="flex items-center gap-6">
        <ScoreGauge score={readabilityScore} color={color} size="sm" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="px-2 py-0.5 text-xs font-bold rounded"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {readabilityLevel || (readabilityScore >= 70 ? "Easy" : readabilityScore >= 50 ? "Medium" : "Hard")}
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            {readabilityScore >= 70 
              ? "Easy to read. Most people will understand quickly."
              : readabilityScore >= 50 
                ? "Moderately readable. Some simplification may help."
                : "Complex language. Consider simplifying."
            }
          </p>
          {avgWordsPerSentence && (
            <p className="text-xs text-zinc-600 mt-1">
              Avg {avgWordsPerSentence.toFixed(1)} words/sentence
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Subject Line Analysis Card (Starter+)
export const SubjectLineAnalysisCard = ({ subjectAnalysis, tierHasAccess = true }) => {
  if (!tierHasAccess) {
    return (
      <LockedFeatureCard 
        title="Subject Line Analysis"
        description="Get detailed insights on your subject line"
        requiredTier="Starter"
      />
    );
  }

  if (!subjectAnalysis) return null;

  const { length, hasPersonalization, hasUrgency, hasCuriosity, effectiveness } = subjectAnalysis;

  const indicators = [
    { label: "Personalized", value: hasPersonalization, icon: "👤" },
    { label: "Urgency", value: hasUrgency, icon: "⏰" },
    { label: "Curiosity", value: hasCuriosity, icon: "❓" }
  ];

  const lengthStatus = length < 30 ? "short" : length > 60 ? "long" : "optimal";
  const lengthColor = lengthStatus === "optimal" ? "text-emerald-400" : "text-amber-400";

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-medium">Subject Line Analysis</span>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <ScoreGauge 
          score={effectiveness || 5} 
          max={10} 
          label="Effectiveness" 
          color="#8b5cf6" 
          size="sm" 
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Length</span>
            <span className={`font-mono ${lengthColor}`}>
              {length} chars ({lengthStatus})
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${lengthStatus === "optimal" ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${Math.min(length / 60 * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {indicators.map((ind, i) => (
          <span 
            key={i}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
              ind.value 
                ? "bg-emerald-500/20 text-emerald-400" 
                : "bg-zinc-800 text-zinc-500"
            }`}
          >
            <span>{ind.icon}</span>
            {ind.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// CTA Analysis Card (Starter+)
export const CTAAnalysisCard = ({ ctaAnalysis, tierHasAccess = true }) => {
  if (!tierHasAccess) {
    return (
      <LockedFeatureCard 
        title="CTA Analysis"
        description="Understand your call-to-action effectiveness"
        requiredTier="Starter"
      />
    );
  }

  if (!ctaAnalysis) return null;

  const { ctaPresent, ctaClarity, ctaType, ctaPlacement, frictionLevel } = ctaAnalysis;

  if (!ctaPresent) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <MousePointer className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-400">No Clear CTA Found</span>
        </div>
        <p className="text-zinc-400 text-sm">
          Your email lacks a clear call-to-action. Add a specific ask like "Can we chat Thursday?" or "Reply with your thoughts."
        </p>
      </div>
    );
  }

  const frictionColor = frictionLevel === "low" ? "text-emerald-400" : frictionLevel === "medium" ? "text-amber-400" : "text-red-400";

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <MousePointer className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-medium">CTA Analysis</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Clarity</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500"
                style={{ width: `${(ctaClarity || 5) * 10}%` }}
              />
            </div>
            <span className="text-xs font-mono">{ctaClarity}/10</span>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-zinc-500 mb-1">Type</p>
          <span className="text-sm font-mono capitalize">{ctaType || "Unknown"}</span>
        </div>
        
        <div>
          <p className="text-xs text-zinc-500 mb-1">Placement</p>
          <span className="text-sm font-mono capitalize">{ctaPlacement || "End"}</span>
        </div>
        
        <div>
          <p className="text-xs text-zinc-500 mb-1">Friction</p>
          <span className={`text-sm font-mono capitalize ${frictionColor}`}>
            {frictionLevel || "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );
};

// Subject Line Variants Card (Pro+)
export const SubjectVariantsCard = ({ variants = [], onCopy, tierHasAccess = true }) => {
  if (!tierHasAccess) {
    return (
      <LockedFeatureCard 
        title="AI Subject Variants"
        description="Get 3 alternative subject lines optimized for opens"
        requiredTier="Pro"
        highlight
      />
    );
  }

  if (!variants || variants.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-medium">AI Subject Line Variants</span>
        <span className="px-2 py-0.5 text-[10px] bg-violet-500/20 text-violet-300 rounded font-mono">PRO</span>
      </div>
      
      <div className="space-y-2">
        {variants.map((variant, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2 p-2 bg-zinc-900/50 border border-zinc-800 hover:border-violet-500/30 transition-colors group cursor-pointer"
            onClick={() => onCopy?.(variant)}
          >
            <span className="w-5 h-5 flex items-center justify-center bg-violet-500/20 text-violet-400 text-xs font-mono">
              {i + 1}
            </span>
            <span className="flex-1 text-sm font-mono truncate">{variant}</span>
            <span className="text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to copy
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// A/B Test Suggestions Card (Pro+)
export const ABTestSuggestionsCard = ({ suggestions = [], tierHasAccess = true }) => {
  if (!tierHasAccess) {
    return (
      <LockedFeatureCard 
        title="A/B Test Ideas"
        description="Get data-driven suggestions on what to test"
        requiredTier="Pro"
        highlight
      />
    );
  }

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium">A/B Test Suggestions</span>
        <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-mono">PRO</span>
      </div>
      
      <div className="space-y-3">
        {suggestions.slice(0, 3).map((suggestion, i) => (
          <div key={i} className="p-3 bg-zinc-800/50 border-l-2 border-amber-500/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-amber-400 uppercase">{suggestion.element}</span>
            </div>
            <p className="text-sm text-zinc-300 mb-1">{suggestion.testIdea}</p>
            <p className="text-xs text-zinc-500">{suggestion.hypothesis}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inbox Placement Card (Pro+)
export const InboxPlacementCard = ({ score, tierHasAccess = true }) => {
  if (!tierHasAccess) {
    return (
      <LockedFeatureCard 
        title="Inbox Placement Score"
        description="See your estimated deliverability"
        requiredTier="Pro"
      />
    );
  }

  if (score === null || score === undefined) return null;

  const getColor = (s) => s >= 80 ? "#a3e635" : s >= 60 ? "#d4af37" : "#ef4444";
  const getLabel = (s) => s >= 80 ? "Excellent" : s >= 60 ? "Good" : "At Risk";

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium">Inbox Placement</span>
        <span className="px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 rounded font-mono">PRO</span>
      </div>
      
      <div className="flex items-center gap-4">
        <ScoreGauge score={score} color={getColor(score)} />
        <div>
          <span 
            className="text-sm font-bold"
            style={{ color: getColor(score) }}
          >
            {getLabel(score)}
          </span>
          <p className="text-xs text-zinc-500 mt-1">
            {score >= 80 
              ? "High chance of landing in primary inbox"
              : score >= 60 
                ? "May land in promotions or updates tab"
                : "Risk of spam folder placement"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

// Emotional Tone Card (Pro+)
export const EmotionalToneCard = ({ emotionalTone, tierHasAccess = true }) => {
  if (!tierHasAccess) {
    return (
      <LockedFeatureCard 
        title="Emotional Tone Analysis"
        description="Understand the persuasion style of your email"
        requiredTier="Pro"
      />
    );
  }

  if (!emotionalTone) return null;

  const { primary, score, persuasionTechniques = [] } = emotionalTone;

  const toneColors = {
    professional: "#3b82f6",
    friendly: "#a3e635",
    urgent: "#ef4444",
    curious: "#8b5cf6",
    authoritative: "#d4af37"
  };

  const color = toneColors[primary?.toLowerCase()] || "#d4af37";

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-pink-400" />
        <span className="text-sm font-medium">Emotional Tone</span>
        <span className="px-2 py-0.5 text-[10px] bg-pink-500/20 text-pink-300 rounded font-mono">PRO</span>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div 
          className="px-3 py-1.5 text-sm font-bold capitalize rounded"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {primary}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ width: `${(score || 5) * 10}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-xs font-mono">{score}/10</span>
          </div>
        </div>
      </div>
      
      {persuasionTechniques.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 mb-2">Persuasion techniques detected:</p>
          <div className="flex flex-wrap gap-1">
            {persuasionTechniques.map((tech, i) => (
              <span key={i} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Industry Benchmark Card (Pro+)
export const IndustryBenchmarkCard = ({ benchmark, userOpenRate, userResponseRate, tierHasAccess = true }) => {
  if (!tierHasAccess) {
    return (
      <LockedFeatureCard 
        title="Industry Benchmarks"
        description="Compare your email against industry standards"
        requiredTier="Pro"
      />
    );
  }

  if (!benchmark) return null;

  const { avgOpenRate, avgResponseRate, yourVsAvg } = benchmark;
  
  const getComparisonColor = (comparison) => {
    if (comparison === "above") return "text-emerald-400";
    if (comparison === "below") return "text-amber-400";
    return "text-zinc-400";
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium">Industry Benchmark</span>
        <span className="px-2 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-300 rounded font-mono">PRO</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Your Open Rate</p>
          <p className="text-lg font-mono font-bold text-violet-400">{userOpenRate}%</p>
          <p className="text-xs text-zinc-600">Avg: {avgOpenRate}%</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Your Response Rate</p>
          <p className="text-lg font-mono font-bold text-cyan-400">{userResponseRate}%</p>
          <p className="text-xs text-zinc-600">Avg: {avgResponseRate}%</p>
        </div>
      </div>
      
      <div className={`text-sm font-medium ${getComparisonColor(yourVsAvg)}`}>
        {yourVsAvg === "above" && "✓ Above industry average"}
        {yourVsAvg === "at" && "≈ At industry average"}
        {yourVsAvg === "below" && "↓ Below industry average - room to improve"}
      </div>
    </div>
  );
};

// Locked Feature Card
const LockedFeatureCard = ({ title, description, requiredTier, highlight = false }) => {
  return (
    <div className={`relative p-4 border ${highlight ? "bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border-violet-500/20" : "bg-zinc-900/30 border-zinc-800"}`}>
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center p-4">
          <Lock className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
          <p className="text-sm font-medium mb-1">{title}</p>
          <p className="text-xs text-zinc-500 mb-3">{description}</p>
          <Link 
            to="/pricing"
            className="inline-flex items-center gap-1 text-xs text-[#d4af37] hover:underline"
          >
            Unlock with {requiredTier}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
      {/* Blurred placeholder content */}
      <div className="opacity-20 blur-sm pointer-events-none">
        <div className="h-4 w-24 bg-zinc-700 rounded mb-3" />
        <div className="h-12 w-full bg-zinc-700 rounded" />
      </div>
    </div>
  );
};

// Fix Suggestions Card (Starter+) - Rule-based, non-AI
export const FixSuggestionsCard = ({ suggestions = [], tierHasAccess = true }) => {
  if (!tierHasAccess) {
    return (
      <LockedFeatureCard 
        title="Fix This"
        description="Get actionable fixes for your email"
        requiredTier="Starter"
      />
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">Looking Good!</span>
        </div>
        <p className="text-zinc-400 text-sm">No critical issues found. Your email follows best practices.</p>
      </div>
    );
  }

  const priorityColors = {
    high: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", badge: "bg-red-500/20" },
    medium: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/20" },
    low: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20" }
  };

  const typeIcons = {
    subject: "📧",
    spam: "⚠️",
    readability: "📖",
    length: "📏",
    cta: "🎯"
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium">Fix This</span>
        <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-mono">
          {suggestions.length} {suggestions.length === 1 ? 'issue' : 'issues'}
        </span>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, i) => {
          const colors = priorityColors[suggestion.priority] || priorityColors.medium;
          const icon = typeIcons[suggestion.type] || "💡";
          
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${colors.bg} ${colors.border} border p-3`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${colors.text}`}>{suggestion.issue}</span>
                    <span className={`${colors.badge} ${colors.text} text-[10px] px-1.5 py-0.5 rounded uppercase font-mono`}>
                      {suggestion.priority}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{suggestion.fix}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default {
  SpamKeywordsCard,
  ReadabilityCard,
  SubjectLineAnalysisCard,
  CTAAnalysisCard,
  SubjectVariantsCard,
  ABTestSuggestionsCard,
  InboxPlacementCard,
  EmotionalToneCard,
  IndustryBenchmarkCard,
  FixSuggestionsCard
};
