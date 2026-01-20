from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import json
import csv
import io
import secrets
import resend
import stripe
from analysis_utils import run_server_side_analysis

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize Resend
resend.api_key = os.environ.get('RESEND_API_KEY')

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'coldiq_default_secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ================= TIER CONFIGURATION =================

TIER_FEATURES = {
    "free": {
        "analyses_limit": 3,
        "history_limit": 3,
        "insights_dashboard": False,
        "advanced_insights": False,
        "recommendations": False,
        "export_csv": False,
        "templates": False,
        "team_seats": 0,
        "api_access": False,
        "priority_support": False,
        # New features
        "spam_detection": False,
        "readability_score": False,
        "cta_analysis": False,
        "subject_analysis": False,
        "ai_rewrites": False,
        "multiple_variants": False,
        "inbox_placement": False,
        "personalization_score": False,
        "emotional_tone": False,
        "performance_tracking": False,
        "industry_benchmarks": False,
        "sequence_analysis": False,
        "ab_test_suggestions": False,
        "client_workspaces": False,
        "white_label_reports": False,
        "approval_workflows": False,
        "ai_voice_profiles": False
    },
    "starter": {
        "analyses_limit": 50,
        "history_limit": 999999,
        "insights_dashboard": True,
        "advanced_insights": False,
        "recommendations": False,
        "export_csv": False,
        "templates": False,
        "team_seats": 0,
        "api_access": False,
        "priority_support": False,
        # New features - Starter gets basic analysis
        "spam_detection": True,
        "readability_score": True,
        "cta_analysis": True,
        "subject_analysis": True,
        "ai_rewrites": False,
        "multiple_variants": False,
        "inbox_placement": False,
        "personalization_score": False,
        "emotional_tone": False,
        "performance_tracking": False,
        "industry_benchmarks": False,
        "sequence_analysis": False,
        "ab_test_suggestions": False,
        "client_workspaces": False,
        "white_label_reports": False,
        "approval_workflows": False,
        "ai_voice_profiles": False
    },
    "pro": {
        "analyses_limit": 999999,
        "history_limit": 999999,
        "insights_dashboard": True,
        "advanced_insights": True,
        "recommendations": True,
        "export_csv": True,
        "templates": True,
        "team_seats": 0,
        "api_access": False,
        "priority_support": True,
        # New features - Pro gets full optimization
        "spam_detection": True,
        "readability_score": True,
        "cta_analysis": True,
        "subject_analysis": True,
        "ai_rewrites": True,
        "multiple_variants": True,
        "inbox_placement": True,
        "personalization_score": True,
        "emotional_tone": True,
        "performance_tracking": True,
        "industry_benchmarks": True,
        "sequence_analysis": True,
        "ab_test_suggestions": True,
        "client_workspaces": False,
        "white_label_reports": False,
        "approval_workflows": False,
        "ai_voice_profiles": False
    },
    "growth_agency": {
        "analyses_limit": 999999,
        "history_limit": 999999,
        "insights_dashboard": True,
        "advanced_insights": True,
        "recommendations": True,
        "export_csv": True,
        "templates": True,
        "team_seats": 5,
        "api_access": True,
        "priority_support": True,
        # New features - Growth Agency gets everything
        "spam_detection": True,
        "readability_score": True,
        "cta_analysis": True,
        "subject_analysis": True,
        "ai_rewrites": True,
        "multiple_variants": True,
        "inbox_placement": True,
        "personalization_score": True,
        "emotional_tone": True,
        "performance_tracking": True,
        "industry_benchmarks": True,
        "sequence_analysis": True,
        "ab_test_suggestions": True,
        "client_workspaces": True,
        "white_label_reports": True,
        "approval_workflows": True,
        "ai_voice_profiles": True
    }
}

# Backwards compatibility - map old "agency" to new "growth_agency"
TIER_FEATURES["agency"] = TIER_FEATURES["growth_agency"]

SUBSCRIPTION_PRICES = {
    "starter_monthly": 29.00,
    "starter_annual": 278.40,  # 29 * 12 * 0.8 = 20% discount
    "pro_monthly": 79.00,
    "pro_annual": 758.40,  # 79 * 12 * 0.8
    "growth_agency_monthly": 199.00,
    "growth_agency_annual": 1910.40,  # 199 * 12 * 0.8
    # Backwards compatibility
    "agency_monthly": 199.00,
    "agency_annual": 1910.40
}

# Map price IDs to tiers
PRICE_TO_TIER = {
    "starter_monthly": "starter",
    "starter_annual": "starter",
    "pro_monthly": "pro",
    "pro_annual": "pro",
    "growth_agency_monthly": "growth_agency",
    "growth_agency_annual": "growth_agency",
    # Backwards compatibility
    "agency_monthly": "growth_agency",
    "agency_annual": "growth_agency"
}

def get_tier_features(tier: str) -> dict:
    return TIER_FEATURES.get(tier, TIER_FEATURES["free"])

# Email templates seed data
SYSTEM_TEMPLATES = [
    # General Outreach Templates
    {
        "name": "The Personalized Opener",
        "subject": "{{trigger_event}} at {{company}} - quick thought",
        "body": "Hi {{first_name}},\n\nI noticed {{company}} just {{trigger_event}}. Congrats!\n\nWe've helped similar companies in {{industry}} achieve {{specific_result}} by {{value_prop}}.\n\nWould you be open to a quick 15-min call to explore if we could help {{company}} do the same?\n\nBest,\n{{your_name}}",
        "category": "Outreach",
        "industry": "General",
        "avg_score": 78
    },
    {
        "name": "The Problem-Agitate-Solve",
        "subject": "{{pain_point}} costing {{company}} revenue?",
        "body": "Hi {{first_name}},\n\nMost {{role}}s I talk to are struggling with {{pain_point}}. It's frustrating because {{agitate_problem}}.\n\nWe built {{product}} specifically to solve this - our clients typically see {{result}} within {{timeframe}}.\n\nCurious if this resonates with you?\n\nBest,\n{{your_name}}",
        "category": "Pain Point",
        "industry": "General",
        "avg_score": 75
    },
    {
        "name": "The Social Proof Hook",
        "subject": "How {{similar_company}} achieved {{result}}",
        "body": "Hi {{first_name}},\n\n{{similar_company}} was facing {{challenge}} just like {{company}} might be.\n\nAfter implementing our solution, they achieved {{specific_result}} in {{timeframe}}.\n\nI'd love to share how we did it and see if we could replicate similar results for you.\n\nFree for a quick call this week?\n\nBest,\n{{your_name}}",
        "category": "Case Study",
        "industry": "General",
        "avg_score": 82
    },
    {
        "name": "The Direct Ask",
        "subject": "15 min - {{value_prop}} for {{company}}",
        "body": "Hi {{first_name}},\n\nI help {{target_role}}s at {{industry}} companies {{achieve_outcome}}.\n\nWould you be the right person to speak with about this at {{company}}?\n\nIf so, are you free for 15 minutes this Thursday or Friday?\n\nBest,\n{{your_name}}",
        "category": "Direct",
        "industry": "General",
        "avg_score": 71
    },
    {
        "name": "The Permission-Based",
        "subject": "Quick question, {{first_name}}",
        "body": "Hi {{first_name}},\n\nI have an idea that could help {{company}} {{achieve_benefit}}.\n\nWould it be okay if I sent over a few bullet points on how?\n\nBest,\n{{your_name}}",
        "category": "Soft Ask",
        "industry": "General",
        "avg_score": 68
    },
    # SaaS Industry Templates
    {
        "name": "SaaS - Product-Led Growth",
        "subject": "Noticed your team trialing {{your_product}}",
        "body": "Hi {{first_name}},\n\nI saw {{company}} has been exploring {{your_product}} - thanks for giving us a shot!\n\nTeams like yours in the {{industry}} space typically get the most value from {{key_feature}}. Would a quick walkthrough help?\n\nI've helped similar companies cut their {{pain_point}} by 40% in the first month.\n\n15 mins this week?\n\nBest,\n{{your_name}}",
        "category": "PLG",
        "industry": "SaaS",
        "avg_score": 81
    },
    {
        "name": "SaaS - Competitive Displacement",
        "subject": "{{competitor}} vs. us - honest comparison",
        "body": "Hi {{first_name}},\n\nI noticed {{company}} is using {{competitor}}. Makes sense - they're solid.\n\nThat said, {{company_type}} companies have been switching to us because {{differentiator}}.\n\n{{customer_example}} made the switch and saw {{result}}.\n\nWorth a 10-min comparison call?\n\nBest,\n{{your_name}}",
        "category": "Competitive",
        "industry": "SaaS",
        "avg_score": 76
    },
    # E-commerce Templates
    {
        "name": "E-commerce - BFCM Prep",
        "subject": "{{company}}'s Q4 revenue potential",
        "body": "Hi {{first_name}},\n\nWith BFCM approaching, I wanted to reach out.\n\nWe helped {{similar_brand}} increase their holiday revenue by {{percentage}} last year through {{solution}}.\n\nGiven {{company}}'s growth, you could be leaving {{estimated_revenue}} on the table.\n\nQuick call to see if there's a fit?\n\nBest,\n{{your_name}}",
        "category": "Seasonal",
        "industry": "E-commerce",
        "avg_score": 79
    },
    {
        "name": "E-commerce - Cart Abandonment",
        "subject": "Recovering {{company}}'s lost revenue",
        "body": "Hi {{first_name}},\n\nE-commerce brands typically lose 70% of carts to abandonment. For {{company}}'s traffic, that could be {{estimated_loss}}/month.\n\nWe've built an AI-powered recovery system that's helping brands like {{example}} recover {{recovery_rate}}% of those carts.\n\nWorth exploring?\n\nBest,\n{{your_name}}",
        "category": "Pain Point",
        "industry": "E-commerce",
        "avg_score": 77
    },
    # Healthcare Templates
    {
        "name": "Healthcare - Compliance First",
        "subject": "HIPAA-compliant {{solution_type}} for {{company}}",
        "body": "Hi {{first_name}},\n\nI know compliance is non-negotiable in healthcare. That's why I wanted to introduce our HIPAA-compliant {{solution}}.\n\n{{healthcare_client}} recently implemented it and reduced {{metric}} by {{percentage}} while maintaining full compliance.\n\nWould you be open to seeing how it works?\n\nBest,\n{{your_name}}",
        "category": "Compliance",
        "industry": "Healthcare",
        "avg_score": 74
    },
    {
        "name": "Healthcare - Patient Outcomes",
        "subject": "Improving patient outcomes at {{company}}",
        "body": "Hi {{first_name}},\n\n{{similar_org}} was struggling with {{challenge}} affecting patient care.\n\nAfter implementing our {{solution}}, they saw {{outcome_improvement}} in patient outcomes and {{efficiency_gain}} in staff efficiency.\n\nI'd love to share how this could work for {{company}}.\n\n15 minutes this week?\n\nBest,\n{{your_name}}",
        "category": "Outcomes",
        "industry": "Healthcare",
        "avg_score": 80
    },
    # Financial Services Templates
    {
        "name": "FinTech - Security Focus",
        "subject": "SOC 2 compliant solution for {{company}}",
        "body": "Hi {{first_name}},\n\nI understand security and compliance are critical in financial services.\n\nOur SOC 2 Type II certified {{solution}} has helped {{client_example}} {{achieve_result}} without compromising security.\n\nWould you be interested in a brief demo?\n\nBest,\n{{your_name}}",
        "category": "Security",
        "industry": "Financial Services",
        "avg_score": 73
    },
    {
        "name": "FinTech - ROI Driven",
        "subject": "3.2x ROI for {{company}}'s {{department}}",
        "body": "Hi {{first_name}},\n\n{{similar_company}} in financial services was skeptical about our {{solution}} too.\n\n6 months later: 3.2x ROI, {{hours_saved}} hours saved monthly, and {{additional_benefit}}.\n\nI've put together a quick analysis of what this could look like for {{company}}.\n\nWorth 15 minutes?\n\nBest,\n{{your_name}}",
        "category": "ROI",
        "industry": "Financial Services",
        "avg_score": 78
    },
    # Agency/Marketing Templates
    {
        "name": "Agency - White Label Pitch",
        "subject": "White-label {{service}} for {{agency_name}}",
        "body": "Hi {{first_name}},\n\nI noticed {{agency_name}} offers {{current_service}}. Have you considered adding {{complementary_service}} to your stack?\n\nWe provide white-label {{solution}} that agencies like {{example_agency}} use to {{benefit}}.\n\nIt's helped them increase client retainers by {{percentage}}.\n\nWant to see how it works?\n\nBest,\n{{your_name}}",
        "category": "Partnership",
        "industry": "Agency",
        "avg_score": 75
    },
    {
        "name": "Agency - Client Results",
        "subject": "How {{agency_name}} could 3x client results",
        "body": "Hi {{first_name}},\n\nI've been following {{agency_name}}'s work with {{client_type}} clients. Impressive stuff.\n\n{{similar_agency}} was delivering similar results until they added our {{solution}} - now they're seeing {{improved_metric}} for clients.\n\nWould a quick walkthrough be helpful?\n\nBest,\n{{your_name}}",
        "category": "Results",
        "industry": "Agency",
        "avg_score": 77
    },
    # Real Estate Templates
    {
        "name": "Real Estate - Market Data",
        "subject": "{{market}} insights for {{company}}",
        "body": "Hi {{first_name}},\n\nWith {{market}} showing {{trend}}, I thought you'd find this interesting.\n\nWe're helping brokerages like {{example}} leverage market data to {{benefit}}, resulting in {{result}}.\n\nQuick call to discuss?\n\nBest,\n{{your_name}}",
        "category": "Data",
        "industry": "Real Estate",
        "avg_score": 72
    },
    # Recruiting Templates
    {
        "name": "Recruiting - Talent Shortage",
        "subject": "Solving {{company}}'s {{role}} hiring challenge",
        "body": "Hi {{first_name}},\n\nI noticed {{company}} has had {{role}} positions open for {{duration}}. The market for {{skill}} talent is brutal right now.\n\nWe've helped {{similar_company}} fill similar roles in {{timeframe}} through {{approach}}.\n\nWorth a quick chat?\n\nBest,\n{{your_name}}",
        "category": "Pain Point",
        "industry": "Recruiting",
        "avg_score": 76,
        "tier": "free"
    },
    # PRO TEMPLATES - Advanced strategies
    {
        "name": "PRO: Multi-Touch Sequence Opener",
        "subject": "{{first_name}}, thought of you when I saw this",
        "body": "Hi {{first_name}},\n\nI came across {{trigger}} and immediately thought of {{company}}.\n\nWe specialize in helping {{industry}} companies {{outcome}} - typically seeing {{metric}} improvement in {{timeframe}}.\n\nI have a few ideas specific to {{company}} I'd love to share.\n\nBest,\n{{your_name}}\n\nP.S. I'll follow up next week with a case study from {{similar_company}}.",
        "category": "Sequence",
        "industry": "General",
        "avg_score": 84,
        "tier": "pro"
    },
    {
        "name": "PRO: The Challenger Approach",
        "subject": "Most {{role}}s get this wrong, {{first_name}}",
        "body": "Hi {{first_name}},\n\nMost {{role}}s I talk to are focused on {{common_approach}}. The data shows that's actually hurting results.\n\n{{contrarian_insight}}\n\nWe've helped {{count}} companies pivot their approach and see {{result}}.\n\nWorth 10 minutes to challenge some assumptions?\n\nBest,\n{{your_name}}",
        "category": "Challenger",
        "industry": "General",
        "avg_score": 81,
        "tier": "pro"
    },
    {
        "name": "PRO: Executive-Level Outreach",
        "subject": "Board-level priority for {{company}}?",
        "body": "{{first_name}},\n\n{{executive_trigger}} caught my attention. Based on {{company}}'s {{strategic_initiative}}, I suspect {{topic}} is a board-level priority.\n\nWe've helped {{similar_exec}} at {{peer_company}} navigate this - resulting in {{outcome}}.\n\nWorth a brief conversation?\n\n{{your_name}}",
        "category": "Executive",
        "industry": "General",
        "avg_score": 79,
        "tier": "pro"
    },
    {
        "name": "PRO: Video Placeholder Email",
        "subject": "Made you a quick video, {{first_name}}",
        "body": "Hi {{first_name}},\n\nI recorded a 90-second video specifically for you about {{topic}} at {{company}}.\n\n[VIDEO THUMBNAIL PLACEHOLDER]\n\nIn it, I cover:\n• {{point_1}}\n• {{point_2}}\n• A specific idea for {{company}}\n\nWorth 90 seconds?\n\nBest,\n{{your_name}}",
        "category": "Video",
        "industry": "General",
        "avg_score": 86,
        "tier": "pro"
    },
    {
        "name": "PRO: Account-Based Warm Up",
        "subject": "Research on {{company}}'s {{initiative}}",
        "body": "Hi {{first_name}},\n\nI've been researching {{company}}'s approach to {{initiative}} - really interesting stuff.\n\nI put together a brief analysis comparing your approach to {{peer_1}}, {{peer_2}}, and {{peer_3}}. Some findings might surprise you.\n\nHappy to share it - just reply 'send it' and I'll drop it in.\n\nBest,\n{{your_name}}",
        "category": "ABM",
        "industry": "General",
        "avg_score": 83,
        "tier": "pro"
    },
    {
        "name": "PRO: Post-Event Follow-up",
        "subject": "Great meeting you at {{event}}, {{first_name}}",
        "body": "Hi {{first_name}},\n\nReally enjoyed our conversation at {{event}} about {{topic}}.\n\nYou mentioned {{pain_point}} - I've been thinking about it and have a couple ideas:\n\n1. {{idea_1}}\n2. {{idea_2}}\n\nWould any of these be worth exploring further? Happy to jump on a quick call.\n\nBest,\n{{your_name}}",
        "category": "Event",
        "industry": "General",
        "avg_score": 88,
        "tier": "pro"
    },
    {
        "name": "PRO: Referral Request",
        "subject": "Quick favor, {{first_name}}?",
        "body": "Hi {{first_name}},\n\nHope you're well! I'm reaching out to a few people I respect in {{industry}}.\n\nWe've been getting great results with {{solution}} and I'm looking to connect with {{target_profile}}.\n\nDo you know anyone who might be struggling with {{pain_point}}? Happy to send something their way in return.\n\nThanks!\n{{your_name}}",
        "category": "Referral",
        "industry": "General",
        "avg_score": 80,
        "tier": "pro"
    },
    # AGENCY TEMPLATES - Advanced multi-client strategies
    {
        "name": "AGENCY: Client Onboarding Sequence",
        "subject": "Welcome to {{agency}} - let's get started",
        "body": "Hi {{client_name}},\n\nWelcome aboard! We're excited to start working together.\n\nHere's what happens next:\n\n1. Strategy call (scheduled for {{date}})\n2. Audit of your current {{focus_area}}\n3. Custom roadmap delivery within {{timeframe}}\n\nIn the meantime, could you share access to {{required_tools}}?\n\nTalk soon,\n{{your_name}}\n{{agency}}",
        "category": "Onboarding",
        "industry": "Agency",
        "avg_score": 85,
        "tier": "agency"
    },
    {
        "name": "AGENCY: Monthly Report Teaser",
        "subject": "{{month}} results are in - {{highlight_metric}}",
        "body": "Hi {{client_name}},\n\n{{month}}'s results just came in. Highlight: {{highlight_metric}}.\n\nFull report attached, but here's the TL;DR:\n\n✅ {{win_1}}\n✅ {{win_2}}\n📈 {{key_insight}}\n\nI've also included recommendations for next month on page 3.\n\nLet's schedule a quick call to discuss the {{priority_item}}.\n\nBest,\n{{your_name}}",
        "category": "Reporting",
        "industry": "Agency",
        "avg_score": 82,
        "tier": "agency"
    },
    {
        "name": "AGENCY: Upsell Introduction",
        "subject": "{{first_name}}, noticed something in your data",
        "body": "Hi {{first_name}},\n\nWhile reviewing {{company}}'s performance, I noticed {{observation}}.\n\nThis usually indicates an opportunity for {{complementary_service}}. For context, our clients who add this typically see {{result}}.\n\n{{similar_client}} did this last quarter and {{outcome}}.\n\nWant me to put together a quick proposal?\n\nBest,\n{{your_name}}",
        "category": "Upsell",
        "industry": "Agency",
        "avg_score": 79,
        "tier": "agency"
    },
    {
        "name": "AGENCY: Contract Renewal Nudge",
        "subject": "Your {{contract_type}} renewal + a proposal",
        "body": "Hi {{first_name}},\n\nYour {{contract_type}} is up for renewal next month. Before we discuss terms, I wanted to share some numbers:\n\n📊 Year-to-date: {{ytd_results}}\n📈 vs. last year: {{yoy_comparison}}\n💰 Estimated value delivered: {{value}}\n\nI've also drafted a proposal for Year 2 that includes {{enhancement}}.\n\nLet's find 30 minutes to discuss?\n\nBest,\n{{your_name}}",
        "category": "Renewal",
        "industry": "Agency",
        "avg_score": 81,
        "tier": "agency"
    },
    {
        "name": "AGENCY: Multi-Stakeholder Alignment",
        "subject": "Getting {{team}} aligned on {{project}}",
        "body": "Hi {{first_name}},\n\nAs we kick off {{project}}, I want to make sure we have alignment across {{company}}'s stakeholders.\n\nI've drafted a brief deck covering:\n• Goals & KPIs\n• Timeline & milestones\n• Roles & responsibilities\n• Communication cadence\n\nCould you loop in {{stakeholder_names}} for a 30-min alignment call this week?\n\nBest,\n{{your_name}}",
        "category": "Kickoff",
        "industry": "Agency",
        "avg_score": 77,
        "tier": "agency"
    },
    {
        "name": "AGENCY: Competitor Intelligence",
        "subject": "{{competitor}} just made a move - thoughts",
        "body": "Hi {{first_name}},\n\nHeads up: {{competitor}} just {{competitor_action}}.\n\nMy take:\n• {{analysis_point_1}}\n• {{analysis_point_2}}\n• Potential impact on {{company}}: {{impact}}\n\nI have a few ideas on how to respond. Want to jump on a call today or tomorrow?\n\nBest,\n{{your_name}}",
        "category": "Intelligence",
        "industry": "Agency",
        "avg_score": 84,
        "tier": "agency"
    },
    {
        "name": "AGENCY: QBR Scheduling",
        "subject": "Q{{quarter}} Review - {{company}}",
        "body": "Hi {{first_name}},\n\nIt's that time again! Let's schedule our Q{{quarter}} business review.\n\nAgenda will cover:\n1. Performance vs. goals\n2. What worked / what didn't\n3. Q{{next_quarter}} strategy & priorities\n4. Budget discussion\n\nPlease bring: {{attendees}}\nTime needed: 60 minutes\n\nWhat works better - early or late next week?\n\nBest,\n{{your_name}}",
        "category": "QBR",
        "industry": "Agency",
        "avg_score": 76,
        "tier": "agency"
    },
    {
        "name": "AGENCY: Crisis Communication",
        "subject": "URGENT: {{issue}} - action plan",
        "body": "Hi {{first_name}},\n\nI wanted to address {{issue}} immediately.\n\nHere's what we know:\n• {{fact_1}}\n• {{fact_2}}\n\nActions we've taken:\n• {{action_1}}\n• {{action_2}}\n\nNext steps:\n• {{next_step}} (by {{deadline}})\n\nI'm available for a call anytime today. Let's connect ASAP.\n\n{{your_name}}",
        "category": "Crisis",
        "industry": "Agency",
        "avg_score": 73,
        "tier": "agency"
    }
]

# ================= MODELS =================

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmailVerificationRequest(BaseModel):
    token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    full_name: str
    role: Optional[str] = None
    target_industry: Optional[str] = None
    monthly_email_volume: Optional[str] = None
    subscription_tier: str = "free"
    subscription_status: str = "active"
    analyses_used_this_month: int = 0
    total_analyses: int = 0
    created_at: str
    team_id: Optional[str] = None

class OnboardingData(BaseModel):
    role: str
    target_industry: str
    monthly_email_volume: str

class EmailAnalysisRequest(BaseModel):
    subject: str
    body: str
    target_industry: Optional[str] = None
    target_role: Optional[str] = None

class AnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    original_subject: str
    original_body: str
    analysis_score: int
    estimated_response_rate: float
    estimated_open_rate: float
    strengths: List[str]
    weaknesses: List[str]
    improvements: List[str]
    key_insight: str
    rewritten_subject: str
    rewritten_body: str
    email_word_count: int
    personalization_score: int
    cta_score: int
    value_proposition_clarity: int
    # Starter+ metrics (server-side, guaranteed)
    readability_score: Optional[int] = None
    readability_level: Optional[str] = None
    spam_keywords: Optional[List[str]] = None
    spam_risk_score: Optional[int] = None
    subject_line_analysis: Optional[Dict[str, Any]] = None
    cta_analysis: Optional[Dict[str, Any]] = None
    fix_suggestions: Optional[List[Dict[str, str]]] = None
    inbox_placement_score: Optional[int] = None
    # Pro+ metrics (from AI, may be null)
    alternative_subjects: Optional[List[str]] = None
    emotional_tone: Optional[Dict[str, Any]] = None
    personalization_analysis: Optional[Dict[str, Any]] = None
    industry_benchmark: Optional[Dict[str, Any]] = None
    ab_test_suggestions: Optional[List[Dict[str, Any]]] = None
    user_feedback: Optional[str] = None
    created_at: str

class FeedbackRequest(BaseModel):
    feedback: str

class CheckoutRequest(BaseModel):
    plan_tier: str
    origin_url: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    target_industry: Optional[str] = None
    monthly_email_volume: Optional[str] = None

class TemplateCreate(BaseModel):
    name: str
    subject: str
    body: str
    category: str
    is_shared: bool = False

class TeamMemberInvite(BaseModel):
    email: EmailStr
    role: str = "member"  # "admin" or "member"

# ================= AUTH HELPERS =================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_jwt_token(token)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def verify_api_key(x_api_key: str = Header(None)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    api_key_doc = await db.api_keys.find_one({"key": x_api_key, "is_active": True}, {"_id": 0})
    if not api_key_doc:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    user = await db.users.find_one({"id": api_key_doc["user_id"]}, {"_id": 0})
    if not user or user.get("subscription_tier") != "agency":
        raise HTTPException(status_code=403, detail="API access requires Agency plan")
    
    # Update last used
    await db.api_keys.update_one(
        {"key": x_api_key},
        {"$set": {"last_used": datetime.now(timezone.utc).isoformat()}}
    )
    
    return user

def require_tier(min_tier: str):
    tier_order = ["free", "starter", "pro", "agency"]
    min_index = tier_order.index(min_tier)
    
    async def check_tier(user: dict = Depends(get_current_user)):
        user_tier = user.get("subscription_tier", "free")
        user_index = tier_order.index(user_tier) if user_tier in tier_order else 0
        if user_index < min_index:
            raise HTTPException(
                status_code=403, 
                detail=f"This feature requires {min_tier.title()} plan or higher"
            )
        return user
    return check_tier

# Admin emails list
ADMIN_EMAILS = ["jabriel@arisolutionsinc.com"]

async def require_admin(user: dict = Depends(get_current_user)):
    """Require user to be an admin"""
    if user.get("email") not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)

def generate_phone_otp() -> str:
    """Generate a 6-digit OTP for phone verification"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

def create_verification_token(user_id: str, token_type: str, expires_hours: int = 24) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "token": generate_verification_token(),
        "type": token_type,  # "email_verification" or "password_reset"
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=expires_hours)).isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

async def send_sms_otp(phone_number: str, otp: str) -> bool:
    """
    Send SMS OTP - Currently in MOCK MODE
    TODO: Replace with AWS SNS when approved
    
    For AWS SNS integration:
    import boto3
    client = boto3.client('sns', 
        region_name=os.environ.get('AWS_REGION', 'us-east-1'),
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY')
    )
    response = client.publish(
        PhoneNumber=phone_number,
        Message=f"Your ColdIQ verification code is: {otp}. Valid for 5 minutes.",
        MessageAttributes={
            'AWS.SNS.SMS.SenderID': {'DataType': 'String', 'StringValue': 'ColdIQ'},
            'AWS.SNS.SMS.SMSType': {'DataType': 'String', 'StringValue': 'Transactional'}
        }
    )
    """
    # MOCK MODE - Log OTP to console for testing
    logger.info(f"=" * 50)
    logger.info(f"📱 MOCK SMS TO: {phone_number}")
    logger.info(f"📱 OTP CODE: {otp}")
    logger.info(f"=" * 50)
    
    # Store in mock_sms collection for testing
    await db.mock_sms.insert_one({
        "id": str(uuid.uuid4()),
        "phone_number": phone_number,
        "otp": otp,
        "sent_at": datetime.now(timezone.utc).isoformat()
    })
    
    return True

async def send_email_notification(to_email: str, subject: str, body: str, html_body: str = None):
    """Send email using Resend"""
    logger.info(f"Sending email to: {to_email}, subject: {subject}")
    
    # Convert plain text to simple HTML if no HTML provided
    if not html_body:
        html_body = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #6366f1; margin: 0;">ColdIQ</h1>
                <p style="color: #71717a; font-size: 14px;">AI-Powered Cold Email Analyzer</p>
            </div>
            <div style="background: #18181b; border-radius: 12px; padding: 30px; color: #fafafa;">
                {body.replace(chr(10), '<br/>')}
            </div>
            <div style="text-align: center; margin-top: 30px; color: #71717a; font-size: 12px;">
                <p>© 2025 ColdIQ. All rights reserved.</p>
            </div>
        </div>
        """
    
    params = {
        "from": SENDER_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_body
    }
    
    try:
        # Run sync SDK in thread to keep FastAPI non-blocking
        email_result = await asyncio.to_thread(resend.Emails.send, params)
        
        # Log to database
        await db.email_logs.insert_one({
            "id": str(uuid.uuid4()),
            "resend_id": email_result.get("id") if isinstance(email_result, dict) else str(email_result),
            "to": to_email,
            "subject": subject,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "status": "sent"
        })
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        # Log failed attempt
        await db.email_logs.insert_one({
            "id": str(uuid.uuid4()),
            "to": to_email,
            "subject": subject,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "status": "failed",
            "error": str(e)
        })
        return False

# ================= AUTH ROUTES =================

@api_router.post("/auth/signup")
async def signup(data: UserSignup):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "full_name": data.full_name,
        "role": None,
        "target_industry": None,
        "monthly_email_volume": None,
        "subscription_tier": "free",
        "subscription_status": "active",
        "stripe_customer_id": None,
        "analyses_used_this_month": 0,
        "total_analyses": 0,
        "created_at": now,
        "onboarding_completed": False,
        "team_id": None,
        "email_verified": False,
        "phone_number": None,
        "phone_verified": False,
        "phone_verified_at": None
    }
    
    await db.users.insert_one(user_doc)
    
    # Note: Email verification is now handled via OTP flow after signup
    # The frontend will trigger /auth/email-otp/send endpoint
    
    token = create_jwt_token(user_id, data.email)
    
    del user_doc["password_hash"]
    if "_id" in user_doc:
        del user_doc["_id"]
    
    return {"token": token, "user": user_doc, "verification_pending": True}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["id"], user["email"])
    user_response = {k: v for k, v in user.items() if k not in ["password_hash", "_id"]}
    
    return {"token": token, "user": user_response}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    features = get_tier_features(user.get("subscription_tier", "free"))
    return {**user, "features": features}

@api_router.post("/auth/onboarding")
async def complete_onboarding(data: OnboardingData, user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "role": data.role,
            "target_industry": data.target_industry,
            "monthly_email_volume": data.monthly_email_volume,
            "onboarding_completed": True
        }}
    )
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    features = get_tier_features(updated_user.get("subscription_tier", "free"))
    return {"message": "Onboarding completed", "user": {**updated_user, "features": features}}

@api_router.post("/auth/verify-email")
async def verify_email(data: EmailVerificationRequest):
    token_doc = await db.verification_tokens.find_one({
        "token": data.token,
        "type": "email_verification",
        "used": False
    })
    
    if not token_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    
    # Check expiration
    expires_at = datetime.fromisoformat(token_doc["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Verification token has expired")
    
    # Mark token as used
    await db.verification_tokens.update_one(
        {"token": data.token},
        {"$set": {"used": True}}
    )
    
    # Update user
    await db.users.update_one(
        {"id": token_doc["user_id"]},
        {"$set": {"email_verified": True}}
    )
    
    return {"message": "Email verified successfully"}

@api_router.post("/auth/resend-verification")
async def resend_verification(data: ResendVerificationRequest):
    user = await db.users.find_one({"email": data.email})
    if not user:
        # Don't reveal if user exists
        return {"message": "If an account exists, a verification email has been sent"}
    
    if user.get("email_verified"):
        return {"message": "Email is already verified"}
    
    # Invalidate old tokens
    await db.verification_tokens.update_many(
        {"user_id": user["id"], "type": "email_verification"},
        {"$set": {"used": True}}
    )
    
    # Create new token
    verification_token = create_verification_token(user["id"], "email_verification")
    await db.verification_tokens.insert_one(verification_token)
    
    verify_url = f"{FRONTEND_URL}/verify-email?token={verification_token['token']}"
    await send_email_notification(
        data.email,
        "Verify your ColdIQ account",
        f"Hi {user['full_name']},\n\nPlease verify your email by clicking the link below:\n\n{verify_url}\n\nThis link expires in 24 hours.\n\nBest,\nThe ColdIQ Team"
    )
    
    return {"message": "Verification email sent"}

@api_router.post("/auth/forgot-password")
async def forgot_password(data: PasswordResetRequest):
    user = await db.users.find_one({"email": data.email})
    
    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If an account exists with this email, a reset link has been sent"}
    
    # Invalidate old reset tokens
    await db.verification_tokens.update_many(
        {"user_id": user["id"], "type": "password_reset"},
        {"$set": {"used": True}}
    )
    
    # Create reset token (expires in 1 hour)
    reset_token = create_verification_token(user["id"], "password_reset", expires_hours=1)
    await db.verification_tokens.insert_one(reset_token)
    
    reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token['token']}"
    await send_email_notification(
        data.email,
        "Reset your ColdIQ password",
        f"Hi {user['full_name']},\n\nYou requested to reset your password. Click the link below:\n\n{reset_url}\n\nThis link expires in 1 hour. If you didn't request this, please ignore this email.\n\nBest,\nThe ColdIQ Team"
    )
    
    return {"message": "If an account exists with this email, a reset link has been sent"}

@api_router.post("/auth/reset-password")
async def reset_password(data: PasswordResetConfirm):
    token_doc = await db.verification_tokens.find_one({
        "token": data.token,
        "type": "password_reset",
        "used": False
    })
    
    if not token_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check expiration
    expires_at = datetime.fromisoformat(token_doc["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    # Mark token as used
    await db.verification_tokens.update_one(
        {"token": data.token},
        {"$set": {"used": True}}
    )
    
    # Update password
    await db.users.update_one(
        {"id": token_doc["user_id"]},
        {"$set": {"password_hash": hash_password(data.new_password)}}
    )
    
    # Send confirmation email
    user = await db.users.find_one({"id": token_doc["user_id"]})
    if user:
        await send_email_notification(
            user["email"],
            "Your ColdIQ password has been reset",
            f"Hi {user['full_name']},\n\nYour password has been successfully reset. If you didn't make this change, please contact support immediately.\n\nBest,\nThe ColdIQ Team"
        )
    
    return {"message": "Password reset successfully"}

# ================= EMAIL OTP VERIFICATION ROUTES =================

class EmailOTPRequest(BaseModel):
    email: str

class EmailOTPVerifyRequest(BaseModel):
    email: str
    otp: str

def generate_email_otp() -> str:
    """Generate a 6-digit OTP"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

@api_router.post("/auth/email-otp/send")
async def send_email_otp(data: EmailOTPRequest, user: dict = Depends(get_current_user)):
    """Send OTP to email for verification"""
    email = data.email.strip().lower()
    
    # Validate email format
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")
    
    # Check rate limiting (max 3 OTPs per email per hour)
    one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    recent_otps = await db.email_otps.count_documents({
        "email": email,
        "created_at": {"$gte": one_hour_ago}
    })
    
    if recent_otps >= 3:
        raise HTTPException(
            status_code=429, 
            detail="Too many verification attempts. Please try again in 1 hour."
        )
    
    # Generate OTP
    otp = generate_email_otp()
    
    # Store OTP with 10-minute expiration
    otp_doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "user_id": user["id"],
        "otp_hash": hash_password(otp),
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
        "attempts": 0,
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.email_otps.insert_one(otp_doc)
    
    # Send OTP via Resend
    try:
        await send_otp_email(email, otp, user.get("full_name", "User"))
        logger.info(f"📧 Email OTP sent to: {email}")
    except Exception as e:
        logger.error(f"Failed to send OTP email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send verification email")
    
    return {
        "message": "Verification code sent",
        "email": email,
        "expires_in_seconds": 600
    }

async def send_otp_email(email: str, otp: str, name: str):
    """Send OTP verification email using Resend"""
    import resend
    resend.api_key = os.environ.get("RESEND_API_KEY")
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px; }}
            .container {{ max-width: 500px; margin: 0 auto; background: #18181b; padding: 40px; border: 1px solid #27272a; }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #d4af37; }}
            .otp-box {{ background: #27272a; border: 2px solid #d4af37; padding: 20px; text-align: center; margin: 30px 0; }}
            .otp-code {{ font-size: 32px; font-family: monospace; letter-spacing: 8px; color: #d4af37; font-weight: bold; }}
            .message {{ color: #a1a1aa; font-size: 14px; line-height: 1.6; }}
            .footer {{ text-align: center; margin-top: 30px; color: #71717a; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">ColdIQ</div>
            </div>
            <p class="message">Hi {name},</p>
            <p class="message">Here's your verification code:</p>
            <div class="otp-box">
                <div class="otp-code">{otp}</div>
            </div>
            <p class="message">This code expires in 10 minutes.</p>
            <p class="message">If you didn't request this code, you can safely ignore this email.</p>
            <div class="footer">
                &copy; 2026 ColdIQ. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """
    
    resend.Emails.send({
        "from": f"ColdIQ <{SENDER_EMAIL}>",
        "to": [email],
        "subject": f"Your ColdIQ verification code: {otp}",
        "html": html_content
    })

@api_router.post("/auth/email-otp/verify")
async def verify_email_otp(data: EmailOTPVerifyRequest, user: dict = Depends(get_current_user)):
    """Verify email OTP and mark email as verified"""
    email = data.email.strip().lower()
    
    # Find valid OTP
    now = datetime.now(timezone.utc).isoformat()
    otp_doc = await db.email_otps.find_one({
        "email": email,
        "user_id": user["id"],
        "used": False,
        "expires_at": {"$gt": now}
    }, sort=[("created_at", -1)])
    
    if not otp_doc:
        raise HTTPException(status_code=400, detail="No valid verification code found. Please request a new one.")
    
    # Check max attempts
    if otp_doc.get("attempts", 0) >= 5:
        await db.email_otps.update_one(
            {"id": otp_doc["id"]},
            {"$set": {"used": True}}
        )
        raise HTTPException(status_code=400, detail="Too many incorrect attempts. Please request a new code.")
    
    # Verify OTP
    if not verify_password(data.otp, otp_doc["otp_hash"]):
        await db.email_otps.update_one(
            {"id": otp_doc["id"]},
            {"$inc": {"attempts": 1}}
        )
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Mark OTP as used
    await db.email_otps.update_one(
        {"id": otp_doc["id"]},
        {"$set": {"used": True}}
    )
    
    # Update user's email verification status
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "email_verified": True,
            "email_verified_at": now
        }}
    )
    
    return {"message": "Email verified successfully", "email": email}

# ================= PHONE VERIFICATION ROUTES (LEGACY - DISABLED) =================

class PhoneVerificationRequest(BaseModel):
    phone_number: str

class PhoneOTPVerifyRequest(BaseModel):
    phone_number: str
    otp: str

@api_router.post("/auth/phone/send-otp")
async def send_phone_otp(data: PhoneVerificationRequest):
    """Send OTP to phone number for verification"""
    phone = data.phone_number.strip()
    
    # Basic phone validation (E.164 format preferred)
    if not phone or len(phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number format")
    
    # Normalize phone number (ensure it starts with +)
    if not phone.startswith('+'):
        # Assume US number if no country code
        if phone.startswith('1'):
            phone = '+' + phone
        else:
            phone = '+1' + phone
    
    # Check if phone is already registered
    existing_user = await db.users.find_one({"phone_number": phone, "phone_verified": True})
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="This phone number is already registered with another account"
        )
    
    # Check rate limiting (max 3 OTPs per phone per hour)
    one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    recent_otps = await db.phone_otps.count_documents({
        "phone_number": phone,
        "created_at": {"$gte": one_hour_ago}
    })
    
    if recent_otps >= 3:
        raise HTTPException(
            status_code=429, 
            detail="Too many verification attempts. Please try again in 1 hour."
        )
    
    # Generate OTP
    otp = generate_phone_otp()
    
    # Store OTP with 5-minute expiration
    otp_doc = {
        "id": str(uuid.uuid4()),
        "phone_number": phone,
        "otp_hash": hash_password(otp),  # Store hashed for security
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(),
        "attempts": 0,
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.phone_otps.insert_one(otp_doc)
    
    # Send OTP via SMS (mock mode for now)
    await send_sms_otp(phone, otp)
    
    return {
        "message": "Verification code sent",
        "phone_number": phone,
        "expires_in_seconds": 300
    }

@api_router.post("/auth/phone/verify-otp")
async def verify_phone_otp(data: PhoneOTPVerifyRequest, user: dict = Depends(get_current_user)):
    """Verify OTP and link phone to user account"""
    phone = data.phone_number.strip()
    
    # Normalize phone number
    if not phone.startswith('+'):
        if phone.startswith('1'):
            phone = '+' + phone
        else:
            phone = '+1' + phone
    
    # Check if phone is already registered to another user
    existing_user = await db.users.find_one({
        "phone_number": phone, 
        "phone_verified": True,
        "id": {"$ne": user["id"]}
    })
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="This phone number is already registered with another account"
        )
    
    # Find the most recent unused OTP for this phone
    otp_doc = await db.phone_otps.find_one(
        {
            "phone_number": phone,
            "used": False
        },
        sort=[("created_at", -1)]
    )
    
    if not otp_doc:
        raise HTTPException(status_code=400, detail="No verification code found. Please request a new one.")
    
    # Check expiration
    expires_at = datetime.fromisoformat(otp_doc["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new one.")
    
    # Check attempts (max 3)
    if otp_doc["attempts"] >= 3:
        raise HTTPException(status_code=400, detail="Too many failed attempts. Please request a new code.")
    
    # Verify OTP
    if not verify_password(data.otp, otp_doc["otp_hash"]):
        # Increment attempts
        await db.phone_otps.update_one(
            {"id": otp_doc["id"]},
            {"$inc": {"attempts": 1}}
        )
        remaining = 2 - otp_doc["attempts"]
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid verification code. {remaining} attempts remaining."
        )
    
    # Mark OTP as used
    await db.phone_otps.update_one(
        {"id": otp_doc["id"]},
        {"$set": {"used": True}}
    )
    
    # Update user with verified phone
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "phone_number": phone,
            "phone_verified": True,
            "phone_verified_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "message": "Phone number verified successfully",
        "phone_number": phone
    }

@api_router.get("/auth/phone/check/{phone_number}")
async def check_phone_availability(phone_number: str):
    """Check if a phone number is already registered"""
    phone = phone_number.strip()
    
    # Normalize
    if not phone.startswith('+'):
        if phone.startswith('1'):
            phone = '+' + phone
        else:
            phone = '+1' + phone
    
    existing = await db.users.find_one({"phone_number": phone, "phone_verified": True})
    
    return {
        "phone_number": phone,
        "available": existing is None
    }

# ================= EMAIL ANALYSIS ROUTES =================

@api_router.post("/analysis/analyze", response_model=AnalysisResponse)
async def analyze_email(data: EmailAnalysisRequest, user: dict = Depends(get_current_user)):
    features = get_tier_features(user.get("subscription_tier", "free"))
    
    if user["analyses_used_this_month"] >= features["analyses_limit"]:
        raise HTTPException(
            status_code=403, 
            detail=f"Monthly analysis limit reached ({features['analyses_limit']}). Please upgrade your plan."
        )
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    user_role = data.target_role or user.get("role", "sales professional")
    industry = data.target_industry or user.get("target_industry", "B2B")
    tier = user.get("subscription_tier", "free")
    
    # Enhanced prompt with tier-specific features
    base_metrics = """  "overallScore": <0-100 integer>,
  "estimatedResponseRate": <percentage as number 0-100>,
  "estimatedOpenRate": <percentage as number 0-100>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "keyInsight": "<one powerful insight>",
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>", "<improvement 4>"],
  "rewrittenSubject": "<improved subject line>",
  "rewrittenBody": "<complete rewritten email, max 120 words, implements all improvements>",
  "personalizationScore": <0-10 integer>,
  "valuePropositionClarity": <0-10 integer>,
  "callToActionStrength": <0-10 integer>"""
    
    # Starter+ features: Basic analysis metrics
    starter_metrics = ""
    if features.get("readability_score"):
        starter_metrics = """,
  "readabilityScore": <0-100 integer, Flesch reading ease>,
  "readabilityLevel": "<grade level: Easy/Medium/Hard>",
  "sentenceCount": <integer>,
  "avgWordsPerSentence": <number>,
  "spamKeywords": ["<spam word 1>", "<spam word 2>"],
  "spamRiskScore": <0-100 integer, likelihood of hitting spam folder>,
  "subjectLineAnalysis": {
    "length": <character count>,
    "hasPersonalization": <boolean>,
    "hasUrgency": <boolean>,
    "hasCuriosity": <boolean>,
    "effectiveness": <0-10 integer>
  },
  "ctaAnalysis": {
    "ctaPresent": <boolean>,
    "ctaClarity": <0-10 integer>,
    "ctaType": "<meeting/call/reply/link>",
    "ctaPlacement": "<beginning/middle/end>",
    "frictionLevel": "<low/medium/high>"
  }"""
    
    # Pro+ features: Advanced optimization
    pro_metrics = ""
    if features.get("ai_rewrites") and features.get("multiple_variants"):
        pro_metrics = """,
  "alternativeSubjects": ["<variant 1>", "<variant 2>", "<variant 3>"],
  "emotionalTone": {
    "primary": "<professional/friendly/urgent/curious/authoritative>",
    "score": <0-10 integer>,
    "persuasionTechniques": ["<technique 1>", "<technique 2>"]
  },
  "personalizationAnalysis": {
    "score": <0-10 integer>,
    "authenticityLevel": "<generic/templated/personalized/highly-personalized>",
    "suggestions": ["<suggestion 1>", "<suggestion 2>"]
  },
  "inboxPlacementScore": <0-100 integer, estimated deliverability>,
  "industryBenchmark": {
    "avgOpenRate": <industry average>,
    "avgResponseRate": <industry average>,
    "yourVsAvg": "<above/at/below>"
  },
  "abTestSuggestions": [
    {"element": "<subject/opening/cta/length>", "testIdea": "<what to test>", "hypothesis": "<why it might improve>"}
  ]"""
    
    prompt = f"""You are ColdIQ, an expert cold email analyst who has helped generate $100M+ in pipeline.

Analyze this cold email for a {user_role} targeting {industry}:

Subject: {data.subject}
Body: {data.body}

Provide analysis in JSON format ONLY (no markdown, no code blocks, just pure JSON):
{{{base_metrics}{starter_metrics}{pro_metrics}
}}

Be specific, actionable, and focus on what makes cold emails convert. For spam keywords, identify any words that commonly trigger spam filters (like "free", "guarantee", "act now", etc)."""

    try:
        # Use OpenAI GPT-4o-mini
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        completion = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are ColdIQ, an expert cold email analyzer. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        response_text = completion.choices[0].message.content.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        analysis_data = json.loads(response_text)
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}, response: {response}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
    # Run server-side analysis for guaranteed metrics (Starter+)
    server_analysis = run_server_side_analysis(data.subject, data.body)
    
    analysis_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    word_count = len(data.body.split())
    
    # Merge AI results with server-side analysis
    # Server-side takes precedence for Starter metrics (guaranteed to be present)
    analysis_doc = {
        "id": analysis_id,
        "user_id": user["id"],
        "team_id": user.get("team_id"),
        "original_subject": data.subject,
        "original_body": data.body,
        "analysis_score": analysis_data.get("overallScore", 0),
        "estimated_response_rate": analysis_data.get("estimatedResponseRate", 0),
        "estimated_open_rate": analysis_data.get("estimatedOpenRate", 0),
        "strengths": analysis_data.get("strengths", []),
        "weaknesses": analysis_data.get("weaknesses", []),
        "improvements": analysis_data.get("improvements", []),
        "key_insight": analysis_data.get("keyInsight", ""),
        "rewritten_subject": analysis_data.get("rewrittenSubject", ""),
        "rewritten_body": analysis_data.get("rewrittenBody", ""),
        "email_word_count": word_count,
        "personalization_score": analysis_data.get("personalizationScore", 0),
        "cta_score": analysis_data.get("callToActionStrength", 0),
        "value_proposition_clarity": analysis_data.get("valuePropositionClarity", 0),
        # Starter+ metrics - SERVER-SIDE (guaranteed)
        "readability_score": server_analysis["readability_score"],
        "readability_level": server_analysis["readability_level"],
        "spam_keywords": server_analysis["spam_keywords"],
        "spam_risk_score": server_analysis["spam_risk_score"],
        "subject_line_analysis": server_analysis["subject_line_analysis"],
        "cta_analysis": server_analysis["cta_analysis"],
        "fix_suggestions": server_analysis["fix_suggestions"],  # NEW: Rule-based suggestions
        "inbox_placement_score": server_analysis["inbox_placement_score"],
        # Pro+ metrics - from AI (may be null)
        "alternative_subjects": analysis_data.get("alternativeSubjects", []),
        "emotional_tone": analysis_data.get("emotionalTone"),
        "personalization_analysis": analysis_data.get("personalizationAnalysis"),
        "industry_benchmark": analysis_data.get("industryBenchmark"),
        "ab_test_suggestions": analysis_data.get("abTestSuggestions", []),
        "user_feedback": None,
        "created_at": now
    }
    
    await db.analyses.insert_one(analysis_doc)
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$inc": {"analyses_used_this_month": 1, "total_analyses": 1}}
    )
    
    return analysis_doc

# Sequence Analysis Models
class SequenceEmail(BaseModel):
    subject: str
    body: str
    position: int

class SequenceAnalysisRequest(BaseModel):
    emails: List[SequenceEmail]

class SequenceAnalysisResponse(BaseModel):
    overall_score: int
    key_insight: str
    issues: List[str]
    email_scores: List[int]
    recommendations: List[str]

@api_router.post("/analysis/sequence", response_model=SequenceAnalysisResponse)
async def analyze_sequence(data: SequenceAnalysisRequest, user: dict = Depends(get_current_user)):
    """Analyze a full email sequence (Pro+ feature)"""
    features = get_tier_features(user.get("subscription_tier", "free"))
    
    # Check if user has sequence analysis feature
    if not features.get("sequence_analysis"):
        raise HTTPException(status_code=403, detail="Sequence analysis requires Pro or higher plan")
    
    if len(data.emails) < 2:
        raise HTTPException(status_code=400, detail="Sequence must have at least 2 emails")
    
    if len(data.emails) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 emails per sequence")
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    # Build the sequence for analysis
    sequence_text = "\n\n---\n\n".join([
        f"EMAIL {e.position}:\nSubject: {e.subject}\nBody: {e.body}"
        for e in data.emails
    ])
    
    prompt = f"""Analyze this cold email SEQUENCE (multi-touch outreach):

{sequence_text}

Analyze the entire sequence holistically. Look for:
1. Repetition between emails (same phrases, same value props)
2. Escalation/urgency progression
3. Value variation across touches
4. Follow-up timing logic (based on content)
5. CTA progression (asking for more vs less over time)
6. Narrative flow and story arc

Return JSON only (no markdown):
{{
  "overallScore": <0-100 integer for the full sequence>,
  "keyInsight": "<single most important finding about the sequence>",
  "issues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "emailScores": [<score for email 1>, <score for email 2>, ...],
  "recommendations": ["<rec 1>", "<rec 2>", "<rec 3>"]
}}"""

    try:
        # Use OpenAI GPT-4o-mini
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        completion = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are ColdIQ, an expert cold email sequence analyzer. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        response_text = completion.choices[0].message.content.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        analysis_data = json.loads(response_text)
        
        return SequenceAnalysisResponse(
            overall_score=analysis_data.get("overallScore", 50),
            key_insight=analysis_data.get("keyInsight", ""),
            issues=analysis_data.get("issues", []),
            email_scores=analysis_data.get("emailScores", []),
            recommendations=analysis_data.get("recommendations", [])
        )
        
    except json.JSONDecodeError as e:
        logger.error(f"Sequence analysis JSON parse error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        logger.error(f"Sequence analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Sequence analysis failed: {str(e)}")

# Winning Patterns & Follow-up Recommendations (Pro+ feature)
class WinningPatternsResponse(BaseModel):
    winning_patterns: List[Dict[str, Any]]
    follow_up_recommendations: List[Dict[str, str]]
    top_performing_elements: Dict[str, Any]

@api_router.get("/analysis/patterns", response_model=WinningPatternsResponse)
async def get_winning_patterns(user: dict = Depends(get_current_user)):
    """Analyze user's historical emails to find winning patterns (Pro+ feature)"""
    features = get_tier_features(user.get("subscription_tier", "free"))
    
    if not features.get("performance_tracking"):
        raise HTTPException(status_code=403, detail="Winning patterns requires Pro or higher plan")
    
    # Get user's analyses
    analyses = await db.analyses.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("analysis_score", -1).to_list(100)
    
    if len(analyses) < 3:
        return WinningPatternsResponse(
            winning_patterns=[],
            follow_up_recommendations=[
                {"title": "Analyze More Emails", "description": "Analyze at least 3 emails to see winning patterns."}
            ],
            top_performing_elements={}
        )
    
    # Find top performers (top 25%)
    top_count = max(1, len(analyses) // 4)
    top_performers = analyses[:top_count]
    bottom_performers = analyses[-top_count:] if len(analyses) > top_count else []
    
    winning_patterns = []
    
    # Analyze word count patterns
    top_word_counts = [a.get("email_word_count", 0) for a in top_performers]
    avg_top_words = sum(top_word_counts) / len(top_word_counts) if top_word_counts else 0
    
    if avg_top_words > 0:
        word_range = "short (under 75)" if avg_top_words < 75 else "medium (75-120)" if avg_top_words < 120 else "longer (120+)"
        winning_patterns.append({
            "pattern": f"Your best emails are {word_range} words",
            "metric": f"Avg: {int(avg_top_words)} words",
            "insight": f"Top emails average {int(avg_top_words)} words vs {int(sum(a.get('email_word_count', 0) for a in bottom_performers) / len(bottom_performers)) if bottom_performers else 0} for lower performers",
            "icon": "📏"
        })
    
    # Analyze personalization patterns
    top_personalization = [a.get("personalization_score", 0) for a in top_performers]
    avg_top_personal = sum(top_personalization) / len(top_personalization) if top_personalization else 0
    
    if avg_top_personal >= 6:
        winning_patterns.append({
            "pattern": "High personalization correlates with success",
            "metric": f"Avg: {avg_top_personal:.1f}/10",
            "insight": "Your top emails have personalization scores of 6+ out of 10",
            "icon": "👤"
        })
    
    # Analyze CTA patterns  
    top_cta = [a.get("cta_score", 0) for a in top_performers]
    avg_top_cta = sum(top_cta) / len(top_cta) if top_cta else 0
    
    if avg_top_cta >= 7:
        winning_patterns.append({
            "pattern": "Strong CTAs drive results",
            "metric": f"Avg: {avg_top_cta:.1f}/10",
            "insight": "Your winning emails have clear, specific calls-to-action",
            "icon": "🎯"
        })
    
    # Analyze readability patterns
    top_readability = [a.get("readability_score", 0) for a in top_performers if a.get("readability_score")]
    if top_readability:
        avg_top_read = sum(top_readability) / len(top_readability)
        if avg_top_read >= 60:
            winning_patterns.append({
                "pattern": "Easy-to-read emails perform better",
                "metric": f"Avg readability: {int(avg_top_read)}",
                "insight": "Your best emails score 60+ on readability (easy to understand)",
                "icon": "📖"
            })
    
    # Generate follow-up recommendations based on patterns
    follow_up_recommendations = []
    
    # Based on average scores
    all_scores = [a.get("analysis_score", 0) for a in analyses]
    avg_score = sum(all_scores) / len(all_scores) if all_scores else 0
    
    if avg_score < 60:
        follow_up_recommendations.append({
            "title": "Focus on Value Proposition",
            "description": "Your emails could benefit from clearer benefits. Lead with what's in it for the recipient."
        })
    
    if avg_top_personal < 5:
        follow_up_recommendations.append({
            "title": "Increase Personalization",
            "description": "Reference specific company news, achievements, or challenges to stand out from generic outreach."
        })
    
    if avg_top_cta < 6:
        follow_up_recommendations.append({
            "title": "Strengthen Your CTA",
            "description": "Try specific time slots like 'Tuesday at 2pm' instead of vague asks like 'let me know'."
        })
    
    if avg_top_words > 120:
        follow_up_recommendations.append({
            "title": "Shorten Your Emails",
            "description": "Your best results come from shorter emails. Aim for 60-100 words."
        })
    
    # Add general recommendations
    follow_up_recommendations.append({
        "title": "Test Subject Line Variants",
        "description": "A/B test question-based vs. statement-based subject lines to find what resonates."
    })
    
    # Top performing elements
    top_performing_elements = {
        "avg_score": int(sum(a.get("analysis_score", 0) for a in top_performers) / len(top_performers)) if top_performers else 0,
        "avg_response_rate": round(sum(a.get("estimated_response_rate", 0) for a in top_performers) / len(top_performers), 1) if top_performers else 0,
        "avg_word_count": int(avg_top_words),
        "avg_personalization": round(avg_top_personal, 1),
        "avg_cta_score": round(avg_top_cta, 1),
        "sample_count": len(top_performers)
    }
    
    return WinningPatternsResponse(
        winning_patterns=winning_patterns[:5],  # Max 5 patterns
        follow_up_recommendations=follow_up_recommendations[:4],  # Max 4 recommendations
        top_performing_elements=top_performing_elements
    )

@api_router.get("/analysis/history")
async def get_analysis_history(
    page: int = 1, 
    limit: int = 10,
    user: dict = Depends(get_current_user)
):
    features = get_tier_features(user.get("subscription_tier", "free"))
    skip = (page - 1) * limit
    
    # Apply history limit for free tier
    effective_limit = min(limit, features["history_limit"])
    
    cursor = db.analyses.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(effective_limit)
    
    analyses = await cursor.to_list(length=effective_limit)
    total = await db.analyses.count_documents({"user_id": user["id"]})
    
    # For free tier, cap the total shown
    if features["history_limit"] < 999999:
        total = min(total, features["history_limit"])
    
    return {
        "analyses": analyses,
        "total": total,
        "page": page,
        "limit": effective_limit,
        "total_pages": max(1, (total + effective_limit - 1) // effective_limit),
        "tier_limit": features["history_limit"] if features["history_limit"] < 999999 else None
    }

@api_router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str, user: dict = Depends(get_current_user)):
    analysis = await db.analyses.find_one(
        {"id": analysis_id, "user_id": user["id"]},
        {"_id": 0}
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

@api_router.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str, user: dict = Depends(get_current_user)):
    result = await db.analyses.delete_one({"id": analysis_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"message": "Analysis deleted"}

@api_router.patch("/analysis/{analysis_id}/feedback")
async def submit_feedback(analysis_id: str, data: FeedbackRequest, user: dict = Depends(get_current_user)):
    result = await db.analyses.update_one(
        {"id": analysis_id, "user_id": user["id"]},
        {"$set": {"user_feedback": data.feedback}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"message": "Feedback submitted"}

# ================= EXPORT (Pro+) =================

@api_router.get("/analysis/export/csv")
async def export_analyses_csv(user: dict = Depends(require_tier("pro"))):
    analyses = await db.analyses.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(10000)
    
    if not analyses:
        raise HTTPException(status_code=404, detail="No analyses to export")
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Date", "Subject", "Score", "Response Rate", "Open Rate",
        "Personalization", "CTA Score", "Value Prop", "Word Count",
        "Key Insight", "Optimized Subject", "Feedback"
    ])
    
    for a in analyses:
        writer.writerow([
            a.get("created_at", "")[:10],
            a.get("original_subject", ""),
            a.get("analysis_score", 0),
            a.get("estimated_response_rate", 0),
            a.get("estimated_open_rate", 0),
            a.get("personalization_score", 0),
            a.get("cta_score", 0),
            a.get("value_proposition_clarity", 0),
            a.get("email_word_count", 0),
            a.get("key_insight", ""),
            a.get("rewritten_subject", ""),
            a.get("user_feedback", "")
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=coldiq_analyses_{datetime.now().strftime('%Y%m%d')}.csv"}
    )

# ================= INSIGHTS ROUTES =================

@api_router.get("/insights/dashboard")
async def get_insights_dashboard(user: dict = Depends(get_current_user)):
    features = get_tier_features(user.get("subscription_tier", "free"))
    
    if not features["insights_dashboard"]:
        return {
            "available": False,
            "required_tier": "starter",
            "message": "Upgrade to Starter or higher to access insights dashboard"
        }
    
    user_id = user["id"]
    analyses = await db.analyses.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    if not analyses:
        return {
            "available": True,
            "has_data": False,
            "message": "Complete your first analysis to see insights"
        }
    
    total_analyses = len(analyses)
    avg_score = sum(a.get("analysis_score", 0) for a in analyses) / total_analyses
    best_score = max(a.get("analysis_score", 0) for a in analyses)
    avg_response_rate = sum(a.get("estimated_response_rate", 0) for a in analyses) / total_analyses
    
    word_counts = [a.get("email_word_count", 0) for a in analyses]
    avg_word_count = sum(word_counts) / len(word_counts)
    
    avg_personalization = sum(a.get("personalization_score", 0) for a in analyses) / total_analyses
    avg_cta = sum(a.get("cta_score", 0) for a in analyses) / total_analyses
    
    # Basic insights for Starter
    response = {
        "available": True,
        "has_data": True,
        "tier": user.get("subscription_tier"),
        "summary": {
            "total_analyses": total_analyses,
            "average_score": round(avg_score, 1),
            "best_score": best_score,
            "average_response_rate": round(avg_response_rate, 1),
            "average_word_count": round(avg_word_count),
            "avg_personalization_score": round(avg_personalization, 1),
            "avg_cta_score": round(avg_cta, 1)
        }
    }
    
    # Advanced insights for Pro+
    if features["advanced_insights"]:
        # Word count analysis
        short_emails = [a for a in analyses if a.get("email_word_count", 0) < 50]
        medium_emails = [a for a in analyses if 50 <= a.get("email_word_count", 0) < 100]
        long_emails = [a for a in analyses if a.get("email_word_count", 0) >= 100]
        
        word_count_insights = []
        if short_emails:
            avg_short = sum(a.get("analysis_score", 0) for a in short_emails) / len(short_emails)
            word_count_insights.append({"category": "Short (0-50)", "avg_score": round(avg_short, 1), "count": len(short_emails)})
        if medium_emails:
            avg_med = sum(a.get("analysis_score", 0) for a in medium_emails) / len(medium_emails)
            word_count_insights.append({"category": "Medium (50-100)", "avg_score": round(avg_med, 1), "count": len(medium_emails)})
        if long_emails:
            avg_long = sum(a.get("analysis_score", 0) for a in long_emails) / len(long_emails)
            word_count_insights.append({"category": "Long (100+)", "avg_score": round(avg_long, 1), "count": len(long_emails)})
        
        response["word_count_insights"] = word_count_insights
        
        # Trend data
        thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        recent = [a for a in analyses if a.get("created_at", "") >= thirty_days_ago]
        
        trend_data = []
        for a in sorted(recent, key=lambda x: x.get("created_at", "")):
            trend_data.append({
                "date": a.get("created_at", "")[:10],
                "score": a.get("analysis_score", 0)
            })
        response["trend_data"] = trend_data[-30:]
        
        # Score improvement over time
        if len(analyses) >= 5:
            first_5_avg = sum(a.get("analysis_score", 0) for a in analyses[-5:]) / 5
            last_5_avg = sum(a.get("analysis_score", 0) for a in analyses[:5]) / 5
            improvement = round(last_5_avg - first_5_avg, 1)
            response["improvement_trend"] = {
                "first_5_avg": round(first_5_avg, 1),
                "last_5_avg": round(last_5_avg, 1),
                "improvement": improvement
            }
    
    # Personalized recommendations for Pro+
    if features["recommendations"]:
        recommendations = []
        if avg_score < 60:
            recommendations.append("Focus on improving your value proposition clarity - your emails would benefit from clearer benefits")
        if avg_word_count > 120:
            recommendations.append("Your emails average over 120 words - try shorter emails (60-100 words) for better engagement")
        if avg_word_count < 40:
            recommendations.append("Your emails are quite short - add more context to build credibility")
        if avg_personalization < 5:
            recommendations.append("Include more personalized elements - reference specific company news or achievements")
        if avg_cta < 5:
            recommendations.append("Strengthen your CTAs - use specific times like 'Tuesday at 2pm' instead of 'sometime'")
        
        # A/B test suggestions
        ab_suggestions = []
        if avg_score < 70:
            ab_suggestions.append("Try testing question-based subject lines vs. statement-based ones")
        if avg_response_rate < 5:
            ab_suggestions.append("Test shorter emails (under 75 words) vs. your current length")
        ab_suggestions.append("A/B test your CTA: 'quick call' vs. specific time slots")
        
        response["recommendations"] = recommendations[:5]
        response["ab_suggestions"] = ab_suggestions[:3]
    
    return response

# ================= TEMPLATES (Pro+) =================

@api_router.get("/templates")
async def get_templates(user: dict = Depends(get_current_user)):
    """Get all templates - only available to Pro and Agency tiers"""
    user_tier = user.get("subscription_tier", "free")
    
    # Only Pro and Agency have access to templates
    if user_tier not in ["pro", "agency", "growth_agency"]:
        raise HTTPException(status_code=403, detail="Templates are available on Pro and Agency plans")
    
    # Get user's templates and shared team templates
    query = {"$or": [{"user_id": user["id"]}]}
    
    if user.get("team_id"):
        query["$or"].append({"team_id": user["team_id"], "is_shared": True})
    
    # Also get system templates
    query["$or"].append({"is_system": True})
    
    templates = await db.templates.find(query, {"_id": 0}).to_list(200)
    
    return {"available": True, "templates": templates}

@api_router.post("/templates")
async def create_template(data: TemplateCreate, user: dict = Depends(require_tier("pro"))):
    template_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    template_doc = {
        "id": template_id,
        "user_id": user["id"],
        "team_id": user.get("team_id") if data.is_shared else None,
        "name": data.name,
        "subject": data.subject,
        "body": data.body,
        "category": data.category,
        "is_shared": data.is_shared,
        "is_system": False,
        "created_at": now
    }
    
    await db.templates.insert_one(template_doc)
    return template_doc

class AITemplateRequest(BaseModel):
    description: str
    industry: Optional[str] = "General"
    tone: Optional[str] = "professional"

@api_router.post("/templates/generate")
async def generate_ai_template(data: AITemplateRequest, user: dict = Depends(require_tier("pro"))):
    """Generate a custom email template using AI based on user description"""
    
    prompt = f"""Generate a cold email template based on this description:
"{data.description}"

Industry: {data.industry}
Tone: {data.tone}

Return a JSON object with these exact fields:
{{
    "name": "A descriptive name for this template",
    "subject": "The email subject line (use {{{{variable}}}} placeholders)",
    "body": "The email body (use {{{{variable}}}} placeholders for personalization)",
    "category": "One of: Outreach, Pain Point, Case Study, Direct, Follow-up, Referral"
}}

Make it:
- Concise (under 100 words for body)
- Highly personalized with placeholders
- Have a clear, low-friction CTA
- Professional but conversational

Return ONLY valid JSON, no other text."""

    try:
        # Use OpenAI GPT-4o-mini
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        completion = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are ColdIQ, an expert cold email template creator. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        response = completion.choices[0].message.content
        
        # Parse the AI response
        import json
        try:
            # Clean up the response
            response_text = response.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            template_data = json.loads(response_text.strip())
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
        # Create the template
        template_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        template_doc = {
            "id": template_id,
            "user_id": user["id"],
            "team_id": None,
            "name": template_data.get("name", "AI Generated Template"),
            "subject": template_data.get("subject", ""),
            "body": template_data.get("body", ""),
            "category": template_data.get("category", "Outreach"),
            "industry": data.industry,
            "is_shared": False,
            "is_system": False,
            "is_ai_generated": True,
            "created_at": now
        }
        
        await db.templates.insert_one(template_doc)
        template_doc.pop("_id", None)
        
        return template_doc
        
    except Exception as e:
        logger.error(f"AI template generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Template generation failed: {str(e)}")

@api_router.delete("/templates/{template_id}")
async def delete_template(template_id: str, user: dict = Depends(require_tier("pro"))):
    result = await db.templates.delete_one({"id": template_id, "user_id": user["id"], "is_system": False})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found or cannot be deleted")
    return {"message": "Template deleted"}

# ================= TEAM MANAGEMENT (Agency) =================

@api_router.get("/team")
async def get_team(user: dict = Depends(require_tier("agency"))):
    if not user.get("team_id"):
        # Create team for user
        team_id = str(uuid.uuid4())
        await db.teams.insert_one({
            "id": team_id,
            "owner_id": user["id"],
            "name": f"{user['full_name']}'s Team",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        await db.users.update_one({"id": user["id"]}, {"$set": {"team_id": team_id, "team_role": "owner"}})
        user["team_id"] = team_id
    
    team = await db.teams.find_one({"id": user["team_id"]}, {"_id": 0})
    members = await db.users.find(
        {"team_id": user["team_id"]},
        {"_id": 0, "password_hash": 0}
    ).to_list(10)
    
    return {
        "team": team,
        "members": members,
        "seats_used": len(members),
        "seats_total": 5
    }

@api_router.post("/team/invite")
async def invite_team_member(data: TeamMemberInvite, user: dict = Depends(require_tier("agency"))):
    if not user.get("team_id"):
        raise HTTPException(status_code=400, detail="No team found")
    
    # Check seat limit
    member_count = await db.users.count_documents({"team_id": user["team_id"]})
    if member_count >= 5:
        raise HTTPException(status_code=403, detail="Team seat limit reached (5 members)")
    
    team = await db.teams.find_one({"id": user["team_id"]})
    team_name = team.get("name", "the team") if team else "the team"
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": data.email})
    
    if existing_user:
        if existing_user.get("team_id"):
            raise HTTPException(status_code=400, detail="User is already in a team")
        
        # Add to team
        await db.users.update_one(
            {"id": existing_user["id"]},
            {"$set": {
                "team_id": user["team_id"],
                "team_role": data.role,
                "subscription_tier": "agency"  # Inherit agency tier
            }}
        )
        
        # Send notification email
        await send_email_notification(
            data.email,
            f"You've been added to {team_name} on ColdIQ",
            f"Hi {existing_user['full_name']},\n\n{user['full_name']} has added you to {team_name} on ColdIQ.\n\nYou now have access to Agency-level features including:\n- Unlimited email analyses\n- Advanced insights & recommendations\n- CSV export\n- Email templates\n- Team analytics\n\nLog in now to get started: {FRONTEND_URL}/login\n\nBest,\nThe ColdIQ Team"
        )
        
        return {"message": f"User {data.email} added to team", "status": "added"}
    else:
        # Create invitation
        invite_id = str(uuid.uuid4())
        invite_token = generate_verification_token()
        
        await db.team_invites.insert_one({
            "id": invite_id,
            "team_id": user["team_id"],
            "email": data.email,
            "role": data.role,
            "invited_by": user["id"],
            "token": invite_token,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "status": "pending"
        })
        
        # Send invitation email
        invite_url = f"{FRONTEND_URL}/join-team?token={invite_token}"
        await send_email_notification(
            data.email,
            f"{user['full_name']} invited you to join {team_name} on ColdIQ",
            f"Hi there,\n\n{user['full_name']} has invited you to join {team_name} on ColdIQ - the AI-powered cold email analyzer.\n\nAs a team member, you'll get Agency-level access including:\n- Unlimited email analyses\n- AI-powered recommendations\n- Advanced analytics\n- Team collaboration features\n\nClick here to accept the invitation:\n{invite_url}\n\nThis invitation expires in 7 days.\n\nBest,\nThe ColdIQ Team"
        )
        
        return {"message": f"Invitation sent to {data.email}", "status": "invited", "invite_id": invite_id}

@api_router.delete("/team/members/{member_id}")
async def remove_team_member(member_id: str, user: dict = Depends(require_tier("agency"))):
    if member_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot remove yourself from team")
    
    member = await db.users.find_one({"id": member_id, "team_id": user["team_id"]})
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    await db.users.update_one(
        {"id": member_id},
        {"$set": {"team_id": None, "team_role": None, "subscription_tier": "free"}}
    )
    
    return {"message": "Team member removed"}

@api_router.get("/team/analytics")
async def get_team_analytics(user: dict = Depends(require_tier("agency"))):
    if not user.get("team_id"):
        return {"available": False, "message": "No team found"}
    
    # Get all team members' analyses
    team_members = await db.users.find({"team_id": user["team_id"]}, {"id": 1}).to_list(10)
    member_ids = [m["id"] for m in team_members]
    
    analyses = await db.analyses.find(
        {"user_id": {"$in": member_ids}},
        {"_id": 0}
    ).to_list(10000)
    
    if not analyses:
        return {"available": True, "has_data": False}
    
    # Aggregate by user
    user_stats = {}
    for a in analyses:
        uid = a["user_id"]
        if uid not in user_stats:
            user_stats[uid] = {"count": 0, "total_score": 0}
        user_stats[uid]["count"] += 1
        user_stats[uid]["total_score"] += a.get("analysis_score", 0)
    
    # Get user names
    members_data = []
    for uid, stats in user_stats.items():
        member = await db.users.find_one({"id": uid}, {"full_name": 1, "email": 1})
        members_data.append({
            "user_id": uid,
            "name": member.get("full_name", "Unknown") if member else "Unknown",
            "email": member.get("email", "") if member else "",
            "analyses_count": stats["count"],
            "avg_score": round(stats["total_score"] / stats["count"], 1) if stats["count"] > 0 else 0
        })
    
    total_analyses = len(analyses)
    avg_team_score = sum(a.get("analysis_score", 0) for a in analyses) / total_analyses if total_analyses > 0 else 0
    
    return {
        "available": True,
        "has_data": True,
        "team_summary": {
            "total_analyses": total_analyses,
            "avg_score": round(avg_team_score, 1),
            "member_count": len(member_ids)
        },
        "member_stats": sorted(members_data, key=lambda x: x["analyses_count"], reverse=True)
    }

# ================= API KEYS (Agency) =================

@api_router.get("/api-keys")
async def get_api_keys(user: dict = Depends(require_tier("agency"))):
    keys = await db.api_keys.find(
        {"user_id": user["id"]},
        {"_id": 0, "key": 0}  # Don't return full key
    ).to_list(10)
    
    # Mask keys
    for key in keys:
        key["key_preview"] = key.get("key_prefix", "coldiq_") + "..." + key.get("key_suffix", "****")
    
    return {"api_keys": keys}

@api_router.post("/api-keys")
async def create_api_key(user: dict = Depends(require_tier("agency"))):
    # Check limit (max 3 keys)
    count = await db.api_keys.count_documents({"user_id": user["id"]})
    if count >= 3:
        raise HTTPException(status_code=400, detail="Maximum 3 API keys allowed")
    
    key = f"coldiq_{secrets.token_urlsafe(32)}"
    key_id = str(uuid.uuid4())
    
    await db.api_keys.insert_one({
        "id": key_id,
        "user_id": user["id"],
        "key": key,
        "key_prefix": key[:10],
        "key_suffix": key[-4:],
        "name": f"API Key {count + 1}",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_used": None
    })
    
    # Return full key only on creation
    return {"id": key_id, "key": key, "message": "Save this key - it won't be shown again"}

@api_router.delete("/api-keys/{key_id}")
async def delete_api_key(key_id: str, user: dict = Depends(require_tier("agency"))):
    result = await db.api_keys.delete_one({"id": key_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"message": "API key deleted"}

# ================= PUBLIC API (Agency) =================

@api_router.post("/v1/analyze")
async def api_analyze_email(data: EmailAnalysisRequest, user: dict = Depends(verify_api_key)):
    """Public API endpoint for email analysis (requires API key)"""
    return await analyze_email(data, user)

# ================= USER ROUTES =================

@api_router.patch("/user/profile")
async def update_profile(data: ProfileUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return updated_user

@api_router.get("/user/usage")
async def get_usage(user: dict = Depends(get_current_user)):
    features = get_tier_features(user.get("subscription_tier", "free"))
    return {
        "used": user["analyses_used_this_month"],
        "limit": features["analyses_limit"],
        "remaining": max(0, features["analyses_limit"] - user["analyses_used_this_month"]),
        "tier": user["subscription_tier"],
        "features": features
    }

@api_router.get("/user/features")
async def get_user_features(user: dict = Depends(get_current_user)):
    return get_tier_features(user.get("subscription_tier", "free"))

# ================= CONTACT ROUTES =================

class ContactFormRequest(BaseModel):
    name: str
    email: EmailStr
    company: str
    team_size: Optional[str] = None
    message: Optional[str] = None

# Admin email to receive notifications
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'jabriel@arisolutionsinc.com')

@api_router.post("/contact/growth-agency")
async def submit_growth_agency_contact(data: ContactFormRequest):
    """Submit Growth Agency contact form - stores in DB and sends email notification"""
    contact_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    contact_doc = {
        "id": contact_id,
        "type": "growth_agency_inquiry",
        "name": data.name,
        "email": data.email,
        "company": data.company,
        "team_size": data.team_size,
        "message": data.message,
        "status": "new",
        "created_at": now
    }
    
    await db.contact_requests.insert_one(contact_doc)
    logger.info(f"New Growth Agency inquiry from {data.email} at {data.company}")
    
    # Send email notification to admin
    try:
        resend.Emails.send({
            "from": f"ColdIQ <{SENDER_EMAIL}>",
            "to": [ADMIN_EMAIL],
            "subject": f"🚀 New Growth Agency Inquiry - {data.company}",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #fff; padding: 30px; border-radius: 10px;">
                <h1 style="color: #d4af37; margin-bottom: 20px;">New Growth Agency Inquiry</h1>
                
                <div style="background: #18181b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #d4af37; margin-top: 0;">Contact Details</h3>
                    <p><strong>Name:</strong> {data.name}</p>
                    <p><strong>Email:</strong> <a href="mailto:{data.email}" style="color: #22d3ee;">{data.email}</a></p>
                    <p><strong>Company:</strong> {data.company}</p>
                    <p><strong>Team Size:</strong> {data.team_size or 'Not specified'}</p>
                </div>
                
                {f'<div style="background: #18181b; padding: 20px; border-radius: 8px; margin-bottom: 20px;"><h3 style="color: #d4af37; margin-top: 0;">Message</h3><p>{data.message}</p></div>' if data.message else ''}
                
                <p style="color: #71717a; font-size: 12px; margin-top: 20px;">
                    Submitted at {now}<br>
                    Request ID: {contact_id}
                </p>
                
                <a href="mailto:{data.email}?subject=Re: ColdIQ Growth Agency Inquiry" 
                   style="display: inline-block; background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; margin-top: 10px;">
                    Reply to {data.name}
                </a>
            </div>
            """
        })
        logger.info(f"Email notification sent to {ADMIN_EMAIL}")
    except Exception as e:
        logger.error(f"Failed to send email notification: {e}")
        # Don't fail the request if email fails
    
    return {"message": "Request submitted successfully", "id": contact_id}

# Admin endpoint to view contact requests
@api_router.get("/admin/contact-requests")
async def get_contact_requests(
    page: int = 1, 
    limit: int = 20, 
    status: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """Get all contact requests (admin only)"""
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if status:
        query["status"] = status
    
    skip = (page - 1) * limit
    total = await db.contact_requests.count_documents(query)
    
    requests = await db.contact_requests.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Remove MongoDB _id
    for req in requests:
        req.pop("_id", None)
    
    return {
        "requests": requests,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@api_router.patch("/admin/contact-requests/{request_id}")
async def update_contact_request(
    request_id: str,
    status: str,
    user: dict = Depends(get_current_user)
):
    """Update contact request status (admin only)"""
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if status not in ["new", "contacted", "closed", "converted"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.contact_requests.update_one(
        {"id": request_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return {"message": "Status updated"}

# ================= SUPPORT CONTACT =================

class SupportContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

SUPPORT_EMAIL = "coldiq@arisolutionsinc.com"

@api_router.post("/contact/support")
async def submit_support_contact(data: SupportContactRequest):
    """Submit general support contact form"""
    contact_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    contact_doc = {
        "id": contact_id,
        "type": "support",
        "name": data.name,
        "email": data.email,
        "subject": data.subject,
        "message": data.message,
        "status": "new",
        "created_at": now
    }
    
    await db.support_messages.insert_one(contact_doc)
    logger.info(f"New support message from {data.email}: {data.subject}")
    
    # Send email notification
    try:
        resend.Emails.send({
            "from": f"ColdIQ <{SENDER_EMAIL}>",
            "to": [SUPPORT_EMAIL],
            "subject": f"[Support] {data.subject}",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #fff; padding: 30px; border-radius: 10px;">
                <h2 style="color: #d4af37; margin-bottom: 20px;">New Support Message</h2>
                
                <div style="background: #18181b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p><strong>From:</strong> {data.name}</p>
                    <p><strong>Email:</strong> <a href="mailto:{data.email}" style="color: #22d3ee;">{data.email}</a></p>
                    <p><strong>Subject:</strong> {data.subject}</p>
                </div>
                
                <div style="background: #18181b; padding: 20px; border-radius: 8px;">
                    <h3 style="color: #d4af37; margin-top: 0;">Message</h3>
                    <p style="white-space: pre-wrap;">{data.message}</p>
                </div>
                
                <a href="mailto:{data.email}?subject=Re: {data.subject}" 
                   style="display: inline-block; background: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; margin-top: 20px;">
                    Reply to {data.name}
                </a>
            </div>
            """
        })
    except Exception as e:
        logger.error(f"Failed to send support email notification: {e}")
    
    return {"message": "Message sent successfully", "id": contact_id}

@api_router.get("/admin/support-messages")
async def get_support_messages(
    page: int = 1, 
    limit: int = 20, 
    status: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """Get all support messages (admin only)"""
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if status:
        query["status"] = status
    
    skip = (page - 1) * limit
    total = await db.support_messages.count_documents(query)
    
    messages = await db.support_messages.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for msg in messages:
        msg.pop("_id", None)
    
    return {
        "messages": messages,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@api_router.patch("/admin/support-messages/{message_id}")
async def update_support_message(
    message_id: str,
    status: str,
    user: dict = Depends(get_current_user)
):
    """Update support message status (admin only)"""
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if status not in ["new", "in_progress", "resolved", "closed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.support_messages.update_one(
        {"id": message_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"message": "Status updated"}

# ================= QUICK WINS & NEW FEATURES =================

# Spam trigger words database
SPAM_TRIGGER_WORDS = {
    "urgent": "time-sensitive",
    "free": "complimentary",
    "act now": "when you're ready",
    "limited time": "available now",
    "click here": "learn more",
    "buy now": "get started",
    "earn money": "grow revenue",
    "no obligation": "no commitment required",
    "winner": "selected",
    "congratulations": "great news",
    "guarantee": "committed to",
    "risk-free": "with confidence",
    "discount": "special pricing",
    "lowest price": "competitive rate",
    "order now": "get started today",
    "apply now": "submit your application",
    "call now": "schedule a call",
    "double your": "increase your",
    "extra income": "additional revenue",
    "fast cash": "quick results",
    "make money": "generate revenue",
    "million dollars": "significant value",
    "no fees": "transparent pricing",
    "no cost": "included",
    "100% free": "at no charge",
    "credit card": "payment details",
    "dear friend": "Hi [Name]",
    "incredible deal": "great opportunity"
}

BEST_SEND_TIMES = {
    "saas": {"day": "Tuesday", "time": "10:00 AM", "timezone": "recipient's local time"},
    "finance": {"day": "Wednesday", "time": "8:00 AM", "timezone": "recipient's local time"},
    "healthcare": {"day": "Thursday", "time": "11:00 AM", "timezone": "recipient's local time"},
    "ecommerce": {"day": "Tuesday", "time": "2:00 PM", "timezone": "recipient's local time"},
    "consulting": {"day": "Tuesday", "time": "9:00 AM", "timezone": "recipient's local time"},
    "real estate": {"day": "Thursday", "time": "10:00 AM", "timezone": "recipient's local time"},
    "marketing": {"day": "Wednesday", "time": "10:00 AM", "timezone": "recipient's local time"},
    "default": {"day": "Tuesday", "time": "10:00 AM", "timezone": "recipient's local time"}
}

INDUSTRY_BENCHMARKS = {
    "saas": {"avg_score": 68, "avg_response": 3.2, "avg_open": 24},
    "finance": {"avg_score": 62, "avg_response": 2.1, "avg_open": 21},
    "healthcare": {"avg_score": 58, "avg_response": 1.8, "avg_open": 19},
    "ecommerce": {"avg_score": 65, "avg_response": 2.8, "avg_open": 22},
    "consulting": {"avg_score": 70, "avg_response": 3.5, "avg_open": 26},
    "real estate": {"avg_score": 61, "avg_response": 2.4, "avg_open": 20},
    "marketing": {"avg_score": 72, "avg_response": 3.8, "avg_open": 28},
    "default": {"avg_score": 65, "avg_response": 2.8, "avg_open": 23}
}

@api_router.post("/tools/spam-check")
async def check_spam_words(data: dict, user: dict = Depends(get_current_user)):
    """Check email for spam trigger words - Free tier"""
    text = (data.get("subject", "") + " " + data.get("body", "")).lower()
    found_words = []
    
    for spam_word, alternative in SPAM_TRIGGER_WORDS.items():
        if spam_word in text:
            found_words.append({
                "word": spam_word,
                "alternative": alternative,
                "severity": "high" if spam_word in ["free", "urgent", "act now", "buy now"] else "medium"
            })
    
    spam_score = min(100, len(found_words) * 15)
    
    return {
        "spam_score": spam_score,
        "risk_level": "high" if spam_score > 50 else "medium" if spam_score > 25 else "low",
        "found_words": found_words,
        "total_issues": len(found_words)
    }

@api_router.post("/tools/subject-variants")
async def generate_subject_variants(data: dict, user: dict = Depends(require_tier("starter"))):
    """Generate A/B subject line variants - Starter+"""
    subject = data.get("subject", "")
    industry = data.get("industry", "general")
    
    if not subject:
        raise HTTPException(status_code=400, detail="Subject is required")
    
    from openai import OpenAI
    openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
    
    prompt = f"""Generate 5 A/B test variants of this email subject line for {industry} industry.
Original: "{subject}"

Return JSON array with exactly 5 variants, each with:
- subject: the variant subject line
- style: brief style description (e.g., "question-based", "urgency", "personalized", "benefit-focused", "curiosity")
- expected_lift: estimated % improvement over original (-10 to +30)

Return ONLY valid JSON array, no other text."""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8
    )
    
    try:
        variants = json.loads(response.choices[0].message.content)
    except:
        variants = [{"subject": subject, "style": "original", "expected_lift": 0}]
    
    return {"original": subject, "variants": variants[:5]}

@api_router.get("/tools/best-send-time")
async def get_best_send_time(industry: str = "default", user: dict = Depends(require_tier("starter"))):
    """Get best send time recommendation - Starter+"""
    industry_lower = industry.lower().replace(" ", "_")
    timing = BEST_SEND_TIMES.get(industry_lower, BEST_SEND_TIMES["default"])
    
    return {
        "industry": industry,
        "recommendation": timing,
        "tip": f"Emails sent on {timing['day']} at {timing['time']} in {industry} typically see 15-25% higher open rates.",
        "avoid": "Mondays (inbox overload) and Fridays (weekend mindset)"
    }

@api_router.get("/tools/industry-benchmark")
async def get_industry_benchmark(industry: str = "default", user: dict = Depends(require_tier("pro"))):
    """Get industry benchmark data - Pro+"""
    industry_lower = industry.lower().replace(" ", "_")
    benchmark = INDUSTRY_BENCHMARKS.get(industry_lower, INDUSTRY_BENCHMARKS["default"])
    
    return {
        "industry": industry,
        "benchmarks": benchmark,
        "percentiles": {
            "top_10": {"score": benchmark["avg_score"] + 15, "response": benchmark["avg_response"] * 1.5},
            "top_25": {"score": benchmark["avg_score"] + 8, "response": benchmark["avg_response"] * 1.2},
            "average": {"score": benchmark["avg_score"], "response": benchmark["avg_response"]},
            "bottom_25": {"score": benchmark["avg_score"] - 10, "response": benchmark["avg_response"] * 0.6}
        }
    }

class ToneCustomizeRequest(BaseModel):
    text: str
    tone: str  # casual, formal, urgent, friendly, authoritative
    preserve_key_points: bool = True

@api_router.post("/tools/customize-tone")
async def customize_tone(data: ToneCustomizeRequest, user: dict = Depends(require_tier("pro"))):
    """AI Tone Customizer - Pro+"""
    from openai import OpenAI
    openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
    
    tone_instructions = {
        "casual": "Make it conversational, friendly, use contractions, shorter sentences",
        "formal": "Make it professional, polished, no contractions, business appropriate",
        "urgent": "Add urgency without being pushy, emphasize time-sensitivity",
        "friendly": "Warm, personable, relatable, like talking to a colleague",
        "authoritative": "Confident, expert positioning, data-driven, decisive"
    }
    
    instruction = tone_instructions.get(data.tone, tone_instructions["friendly"])
    
    prompt = f"""Rewrite this email in a {data.tone} tone. {instruction}
{"Keep the core message and key points intact." if data.preserve_key_points else ""}

Original:
{data.text}

Return ONLY the rewritten email, no explanations."""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    return {
        "original": data.text,
        "rewritten": response.choices[0].message.content,
        "tone_applied": data.tone
    }

class FollowUpRequest(BaseModel):
    original_email: str
    subject: str
    context: Optional[str] = None
    num_followups: int = 3

@api_router.post("/tools/generate-sequence")
async def generate_followup_sequence(data: FollowUpRequest, user: dict = Depends(require_tier("pro"))):
    """Generate follow-up email sequence - Pro+"""
    from openai import OpenAI
    openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
    
    prompt = f"""Based on this initial cold email, generate a {data.num_followups}-email follow-up sequence.

Initial Email Subject: {data.subject}
Initial Email Body:
{data.original_email}

{f"Context: {data.context}" if data.context else ""}

For each follow-up, provide:
1. Days after previous email (suggested timing)
2. Subject line
3. Email body (keep short, 50-100 words)
4. Strategy (what angle this follow-up takes)

Return as JSON array with objects containing: days_after, subject, body, strategy

Return ONLY valid JSON array."""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    try:
        sequence = json.loads(response.choices[0].message.content)
    except:
        sequence = []
    
    return {
        "original_subject": data.subject,
        "sequence": sequence[:data.num_followups],
        "total_emails": data.num_followups + 1
    }

class CompetitorAnalysisRequest(BaseModel):
    email_text: str
    your_product: Optional[str] = None

@api_router.post("/tools/analyze-competitor")
async def analyze_competitor_email(data: CompetitorAnalysisRequest, user: dict = Depends(require_tier("pro"))):
    """Analyze competitor email for insights - Pro+"""
    from openai import OpenAI
    openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
    
    prompt = f"""Analyze this competitor's cold email and extract actionable insights:

{data.email_text}

Provide analysis in JSON format:
{{
    "strengths": ["list of what works well"],
    "weaknesses": ["list of what could be improved"],
    "tactics_used": ["specific tactics/techniques they're using"],
    "value_proposition": "their main value prop in one sentence",
    "cta_analysis": "analysis of their call-to-action",
    "tone": "description of their tone/voice",
    "personalization_level": "low/medium/high",
    "estimated_score": 0-100,
    "what_to_steal": ["ideas you could adapt"],
    "what_to_avoid": ["things not to copy"]
}}

Return ONLY valid JSON."""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )
    
    try:
        analysis = json.loads(response.choices[0].message.content)
    except:
        analysis = {"error": "Could not analyze email"}
    
    return analysis

class SignatureAnalysisRequest(BaseModel):
    signature: str

@api_router.post("/tools/analyze-signature")
async def analyze_signature(data: SignatureAnalysisRequest, user: dict = Depends(require_tier("pro"))):
    """Analyze and optimize email signature - Pro+"""
    from openai import OpenAI
    openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
    
    prompt = f"""Analyze this email signature and provide optimization suggestions:

{data.signature}

Return JSON:
{{
    "score": 0-100,
    "issues": ["list of problems"],
    "suggestions": ["list of improvements"],
    "optimized_version": "rewritten signature",
    "best_practices": ["relevant tips"],
    "missing_elements": ["what should be added"],
    "remove_elements": ["what should be removed"]
}}

Return ONLY valid JSON."""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )
    
    try:
        analysis = json.loads(response.choices[0].message.content)
    except:
        analysis = {"score": 50, "suggestions": ["Could not analyze signature"]}
    
    return analysis

class BulkAnalysisRequest(BaseModel):
    emails: List[dict]  # List of {subject, body}

@api_router.post("/tools/bulk-analyze")
async def bulk_analyze_emails(data: BulkAnalysisRequest, user: dict = Depends(require_tier("pro"))):
    """Bulk analyze multiple emails - Pro+"""
    if len(data.emails) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 emails per batch")
    
    results = []
    for i, email in enumerate(data.emails):
        try:
            # Run simplified analysis
            analysis = await run_quick_analysis(email.get("subject", ""), email.get("body", ""))
            results.append({
                "index": i,
                "subject": email.get("subject", "")[:50],
                "score": analysis.get("score", 0),
                "issues": analysis.get("top_issues", []),
                "status": "success"
            })
        except Exception as e:
            results.append({
                "index": i,
                "subject": email.get("subject", "")[:50],
                "score": 0,
                "issues": [],
                "status": "error",
                "error": str(e)
            })
    
    avg_score = sum(r["score"] for r in results if r["status"] == "success") / max(1, len([r for r in results if r["status"] == "success"]))
    
    return {
        "total": len(data.emails),
        "successful": len([r for r in results if r["status"] == "success"]),
        "average_score": round(avg_score, 1),
        "results": results
    }

async def run_quick_analysis(subject: str, body: str) -> dict:
    """Quick analysis for bulk processing"""
    from openai import OpenAI
    openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
    
    prompt = f"""Quickly score this cold email 0-100 and identify top 3 issues.

Subject: {subject}
Body: {body[:500]}

Return JSON: {{"score": number, "top_issues": ["issue1", "issue2", "issue3"]}}
Return ONLY valid JSON."""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=150
    )
    
    try:
        return json.loads(response.choices[0].message.content)
    except:
        return {"score": 50, "top_issues": ["Could not analyze"]}

@api_router.post("/analysis/share")
async def create_share_link(analysis_id: str, user: dict = Depends(require_tier("pro"))):
    """Create shareable link for analysis - Pro+"""
    # Verify user owns this analysis
    analysis = await db.analyses.find_one({"id": analysis_id, "user_id": user["id"]})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    share_token = secrets.token_urlsafe(16)
    
    await db.analyses.update_one(
        {"id": analysis_id},
        {"$set": {"share_token": share_token, "shared_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {
        "share_url": f"{FRONTEND_URL}/shared/{share_token}",
        "expires": "never"
    }

@api_router.get("/shared/{share_token}")
async def get_shared_analysis(share_token: str):
    """Get shared analysis (public)"""
    analysis = await db.analyses.find_one({"share_token": share_token}, {"_id": 0})
    if not analysis:
        raise HTTPException(status_code=404, detail="Shared analysis not found")
    
    # Remove sensitive data
    analysis.pop("user_id", None)
    analysis.pop("share_token", None)
    
    return analysis

# User streak tracking
@api_router.get("/user/streak")
async def get_user_streak(user: dict = Depends(get_current_user)):
    """Get user's analysis streak"""
    # Get analyses from last 30 days
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    
    analyses = await db.analyses.find(
        {"user_id": user["id"], "created_at": {"$gte": thirty_days_ago}},
        {"created_at": 1}
    ).sort("created_at", -1).to_list(100)
    
    if not analyses:
        return {"current_streak": 0, "longest_streak": 0, "total_days_active": 0, "badges": []}
    
    # Calculate streak
    dates = set()
    for a in analyses:
        date = a["created_at"][:10]  # Get just the date part
        dates.add(date)
    
    sorted_dates = sorted(dates, reverse=True)
    current_streak = 1
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    if sorted_dates[0] != today and sorted_dates[0] != (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d"):
        current_streak = 0
    else:
        for i in range(1, len(sorted_dates)):
            prev_date = datetime.strptime(sorted_dates[i-1], "%Y-%m-%d")
            curr_date = datetime.strptime(sorted_dates[i], "%Y-%m-%d")
            if (prev_date - curr_date).days == 1:
                current_streak += 1
            else:
                break
    
    # Calculate badges
    badges = []
    if current_streak >= 3:
        badges.append({"name": "On Fire", "icon": "flame", "description": "3+ day streak"})
    if current_streak >= 7:
        badges.append({"name": "Week Warrior", "icon": "trophy", "description": "7+ day streak"})
    if len(dates) >= 10:
        badges.append({"name": "Dedicated", "icon": "star", "description": "10+ active days"})
    if user.get("total_analyses", 0) >= 50:
        badges.append({"name": "Power User", "icon": "zap", "description": "50+ total analyses"})
    if user.get("total_analyses", 0) >= 100:
        badges.append({"name": "Email Master", "icon": "crown", "description": "100+ total analyses"})
    
    return {
        "current_streak": current_streak,
        "longest_streak": current_streak,  # Simplified
        "total_days_active": len(dates),
        "badges": badges
    }

# ================= BILLING ROUTES =================

@api_router.post("/billing/create-checkout-session")
async def create_checkout_session(data: CheckoutRequest, request: Request, user: dict = Depends(get_current_user)):
    # Require email verification before checkout
    if not user.get("email_verified", False):
        raise HTTPException(status_code=403, detail="Please verify your email before upgrading")
    
    if data.plan_tier not in SUBSCRIPTION_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan tier")
    
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    host_url = data.origin_url
    amount = SUBSCRIPTION_PRICES[data.plan_tier]
    
    # Determine actual tier from price key
    actual_tier = PRICE_TO_TIER.get(data.plan_tier, data.plan_tier.replace("_monthly", "").replace("_annual", ""))
    is_annual = "_annual" in data.plan_tier
    
    success_url = f"{host_url}/billing/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/pricing"
    
    # Create Stripe checkout session
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "unit_amount": int(amount * 100),  # Stripe uses cents
                "product_data": {
                    "name": f"ColdIQ {actual_tier.title()} Plan ({('Annual' if is_annual else 'Monthly')})",
                    "description": f"ColdIQ {actual_tier.title()} subscription"
                }
            },
            "quantity": 1
        }],
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        customer_email=user["email"],
        metadata={
            "user_id": user["id"],
            "plan_tier": actual_tier,
            "billing_period": "annual" if is_annual else "monthly",
            "user_email": user["email"]
        }
    )
    
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.id,
        "user_id": user["id"],
        "amount": amount,
        "currency": "usd",
        "plan_tier": actual_tier,
        "billing_period": "annual" if is_annual else "monthly",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.id}

@api_router.get("/billing/prices")
async def get_prices():
    """Get all available prices with annual discount info"""
    return {
        "plans": [
            {
                "tier": "starter",
                "name": "Starter",
                "monthly_price": 29,
                "annual_price": 278.40,
                "annual_monthly_equivalent": 23.20,
                "discount_percent": 20
            },
            {
                "tier": "pro",
                "name": "Pro",
                "monthly_price": 79,
                "annual_price": 758.40,
                "annual_monthly_equivalent": 63.20,
                "discount_percent": 20
            },
            {
                "tier": "agency",
                "name": "Agency",
                "monthly_price": 199,
                "annual_price": 1910.40,
                "annual_monthly_equivalent": 159.20,
                "discount_percent": 20
            }
        ]
    }

@api_router.get("/billing/checkout-status/{session_id}")
async def get_checkout_status(session_id: str, user: dict = Depends(get_current_user)):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    # Retrieve session from Stripe
    session = stripe.checkout.Session.retrieve(session_id)
    
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    
    payment_status = "paid" if session.payment_status == "paid" else session.payment_status
    
    if transaction and payment_status == "paid" and transaction.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        plan_tier = transaction.get("plan_tier", "starter")
        update_data = {
            "subscription_tier": plan_tier,
            "subscription_status": "active"
        }
        
        # For agency, create team if not exists
        if plan_tier in ["agency", "growth_agency"] and not user.get("team_id"):
            team_id = str(uuid.uuid4())
            await db.teams.insert_one({
                "id": team_id,
                "owner_id": user["id"],
                "name": f"{user['full_name']}'s Team",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            update_data["team_id"] = team_id
            update_data["team_role"] = "owner"
        
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
        logger.info(f"✅ Payment confirmed via status check: {user['id']} -> {plan_tier}")
    
    return {
        "status": session.status,
        "payment_status": payment_status,
        "amount_total": session.amount_total,
        "currency": session.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')
    
    if not stripe.api_key:
        return {"status": "error", "message": "Stripe not configured"}
    
    try:
        # Verify webhook signature if secret is configured
        if webhook_secret:
            event = stripe.Webhook.construct_event(body, signature, webhook_secret)
        else:
            # Parse without verification (not recommended for production)
            import json
            event = json.loads(body)
        
        if event.get("type") == "checkout.session.completed":
            session = event["data"]["object"]
            
            if session.get("payment_status") == "paid":
                session_id = session["id"]
                metadata = session.get("metadata", {})
                
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
                
                user_id = metadata.get("user_id")
                plan_tier = metadata.get("plan_tier", "starter")
                
                if user_id:
                    update_data = {
                        "subscription_tier": plan_tier,
                        "subscription_status": "active",
                        "stripe_customer_id": session.get("customer")
                    }
                    
                    if plan_tier in ["agency", "growth_agency"]:
                        user = await db.users.find_one({"id": user_id})
                        if user and not user.get("team_id"):
                            team_id = str(uuid.uuid4())
                            await db.teams.insert_one({
                                "id": team_id,
                                "owner_id": user_id,
                                "name": f"{user.get('full_name', 'User')}'s Team",
                                "created_at": datetime.now(timezone.utc).isoformat()
                            })
                            update_data["team_id"] = team_id
                            update_data["team_role"] = "owner"
                    
                    await db.users.update_one({"id": user_id}, {"$set": update_data})
                    logger.info(f"✅ Subscription activated: {user_id} -> {plan_tier}")
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ================= CLIENTS (Agency) =================

@api_router.get("/clients")
async def get_clients(user: dict = Depends(require_tier("agency"))):
    clients = await db.clients.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).to_list(100)
    
    # Get stats for each client
    for client in clients:
        analyses = await db.analyses.find(
            {"client_id": client["id"]},
            {"analysis_score": 1, "estimated_response_rate": 1}
        ).to_list(1000)
        
        client["analyses_count"] = len(analyses)
        client["avg_score"] = round(sum(a.get("analysis_score", 0) for a in analyses) / len(analyses), 1) if analyses else 0
        client["avg_response"] = round(sum(a.get("estimated_response_rate", 0) for a in analyses) / len(analyses), 1) if analyses else 0
    
    return {"clients": clients}

class ClientCreate(BaseModel):
    name: str
    industry: Optional[str] = None
    contact_email: Optional[str] = None

@api_router.post("/clients")
async def create_client(data: ClientCreate, user: dict = Depends(require_tier("agency"))):
    client_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    client_doc = {
        "id": client_id,
        "user_id": user["id"],
        "name": data.name,
        "industry": data.industry,
        "contact_email": data.contact_email,
        "created_at": now
    }
    
    await db.clients.insert_one(client_doc)
    client_doc.pop("_id", None)
    return client_doc

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, user: dict = Depends(require_tier("agency"))):
    result = await db.clients.delete_one({"id": client_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Also delete client's analyses
    await db.analyses.delete_many({"client_id": client_id})
    return {"message": "Client deleted"}

# ================= REPORTS (Agency) =================

@api_router.get("/reports")
async def get_reports(user: dict = Depends(require_tier("agency"))):
    reports = await db.reports.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"reports": reports}

class ReportGenerate(BaseModel):
    client_id: Optional[str] = None
    report_type: str = "monthly_summary"

@api_router.post("/reports/generate")
async def generate_report(data: ReportGenerate, user: dict = Depends(require_tier("agency"))):
    report_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Get analyses for the report
    query = {"user_id": user["id"]}
    if data.client_id:
        query["client_id"] = data.client_id
        client = await db.clients.find_one({"id": data.client_id, "user_id": user["id"]})
        client_name = client["name"] if client else "Unknown Client"
    else:
        client_name = None
    
    # Get last 30 days of analyses
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    query["created_at"] = {"$gte": thirty_days_ago}
    
    analyses = await db.analyses.find(query, {"_id": 0}).to_list(1000)
    
    if not analyses:
        raise HTTPException(status_code=400, detail="No analyses found for this period")
    
    # Calculate report metrics
    total = len(analyses)
    avg_score = round(sum(a.get("analysis_score", 0) for a in analyses) / total, 1)
    avg_response = round(sum(a.get("estimated_response_rate", 0) for a in analyses) / total, 2)
    best_score = max(a.get("analysis_score", 0) for a in analyses)
    
    report_doc = {
        "id": report_id,
        "user_id": user["id"],
        "client_id": data.client_id,
        "client_name": client_name,
        "report_type": data.report_type,
        "title": f"Monthly Summary - {datetime.now().strftime('%B %Y')}",
        "metrics": {
            "total_analyses": total,
            "avg_score": avg_score,
            "avg_response_rate": avg_response,
            "best_score": best_score
        },
        "period_start": thirty_days_ago,
        "period_end": now,
        "created_at": now
    }
    
    await db.reports.insert_one(report_doc)
    report_doc.pop("_id", None)
    return report_doc

@api_router.get("/reports/{report_id}/pdf")
async def download_report_pdf(report_id: str, user: dict = Depends(require_tier("agency"))):
    """Generate and return a PDF report"""
    from fastapi.responses import Response
    
    report = await db.reports.find_one(
        {"id": report_id, "user_id": user["id"]},
        {"_id": 0}
    )
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Generate simple HTML-based PDF content
    metrics = report.get("metrics", {})
    client_name = report.get("client_name", "All Clients")
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; padding: 40px; color: #333; }}
            .header {{ text-align: center; margin-bottom: 40px; border-bottom: 2px solid #d4af37; padding-bottom: 20px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #d4af37; }}
            .title {{ font-size: 28px; margin: 20px 0 10px; }}
            .subtitle {{ color: #666; font-size: 14px; }}
            .metrics {{ display: flex; justify-content: space-around; margin: 40px 0; }}
            .metric {{ text-align: center; padding: 20px; background: #f9f9f9; border-radius: 8px; }}
            .metric-value {{ font-size: 36px; font-weight: bold; color: #d4af37; }}
            .metric-label {{ font-size: 12px; color: #666; margin-top: 5px; }}
            .section {{ margin: 30px 0; }}
            .section-title {{ font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }}
            .footer {{ text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">ColdIQ</div>
            <div class="title">{report.get('title', 'Monthly Report')}</div>
            <div class="subtitle">Client: {client_name} | Generated: {datetime.now().strftime('%B %d, %Y')}</div>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">{metrics.get('total_analyses', 0)}</div>
                <div class="metric-label">EMAILS ANALYZED</div>
            </div>
            <div class="metric">
                <div class="metric-value">{metrics.get('avg_score', 0)}</div>
                <div class="metric-label">AVG SCORE</div>
            </div>
            <div class="metric">
                <div class="metric-value">{metrics.get('avg_response_rate', 0)}%</div>
                <div class="metric-label">EST. RESPONSE RATE</div>
            </div>
            <div class="metric">
                <div class="metric-value">{metrics.get('best_score', 0)}</div>
                <div class="metric-label">BEST SCORE</div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Summary</div>
            <p>During this reporting period, {metrics.get('total_analyses', 0)} cold emails were analyzed through ColdIQ.</p>
            <p>The average email quality score was {metrics.get('avg_score', 0)}, with an estimated average response rate of {metrics.get('avg_response_rate', 0)}%.</p>
            <p>The highest-performing email achieved a score of {metrics.get('best_score', 0)}.</p>
        </div>
        
        <div class="section">
            <div class="section-title">Recommendations</div>
            <ul>
                <li>Continue using personalization to maintain high engagement</li>
                <li>A/B test subject lines to further improve open rates</li>
                <li>Focus on clear, specific CTAs to boost response rates</li>
            </ul>
        </div>
        
        <div class="footer">
            Report generated by ColdIQ | coldiq.com
        </div>
    </body>
    </html>
    """
    
    # Return as HTML for now (can be converted to PDF with weasyprint in production)
    return Response(
        content=html_content,
        media_type="text/html",
        headers={
            "Content-Disposition": f'attachment; filename="report_{report_id[:8]}.html"'
        }
    )

# ================= CAMPAIGNS (Agency) =================

@api_router.get("/campaigns")
async def get_campaigns(user: dict = Depends(require_tier("agency"))):
    campaigns = await db.campaigns.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).to_list(100)
    
    return {"campaigns": campaigns}

class CampaignCreate(BaseModel):
    name: str
    client_id: Optional[str] = None

@api_router.post("/campaigns")
async def create_campaign(data: CampaignCreate, user: dict = Depends(require_tier("agency"))):
    campaign_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    client_name = None
    if data.client_id:
        client = await db.clients.find_one({"id": data.client_id})
        client_name = client["name"] if client else None
    
    campaign_doc = {
        "id": campaign_id,
        "user_id": user["id"],
        "client_id": data.client_id,
        "client_name": client_name,
        "name": data.name,
        "email_count": 0,
        "avg_score": 0,
        "response_rate": 0,
        "created_at": now
    }
    
    await db.campaigns.insert_one(campaign_doc)
    campaign_doc.pop("_id", None)
    return campaign_doc

# ================= API KEY (Agency) =================

@api_router.get("/api-key")
async def get_api_key(user: dict = Depends(require_tier("agency"))):
    key_doc = await db.api_keys.find_one(
        {"user_id": user["id"]},
        {"_id": 0}
    )
    
    if not key_doc:
        raise HTTPException(status_code=404, detail="No API key found")
    
    return {"api_key": key_doc.get("key")}

@api_router.post("/api-key/generate")
async def generate_api_key(user: dict = Depends(require_tier("agency"))):
    # Delete existing key
    await db.api_keys.delete_many({"user_id": user["id"]})
    
    # Generate new key
    key = f"coldiq_{secrets.token_urlsafe(32)}"
    key_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    await db.api_keys.insert_one({
        "id": key_id,
        "user_id": user["id"],
        "key": key,
        "created_at": now
    })
    
    return {"api_key": key}

# ================= HEALTH CHECK =================

# ================= ADMIN ROUTES =================

@api_router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(require_admin)):
    """Get overall platform statistics"""
    total_users = await db.users.count_documents({})
    verified_users = await db.users.count_documents({"email_verified": True})
    total_analyses = await db.analyses.count_documents({})
    total_templates = await db.templates.count_documents({})
    
    # Subscription breakdown
    free_users = await db.users.count_documents({"subscription_tier": "free"})
    starter_users = await db.users.count_documents({"subscription_tier": "starter"})
    pro_users = await db.users.count_documents({"subscription_tier": "pro"})
    agency_users = await db.users.count_documents({"$or": [{"subscription_tier": "agency"}, {"subscription_tier": "growth_agency"}]})
    
    # Recent activity (last 7 days)
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    new_users_week = await db.users.count_documents({"created_at": {"$gte": week_ago}})
    new_analyses_week = await db.analyses.count_documents({"created_at": {"$gte": week_ago}})
    
    # Payment stats
    total_payments = await db.payment_transactions.count_documents({"payment_status": "paid"})
    pending_payments = await db.payment_transactions.count_documents({"payment_status": "pending"})
    
    return {
        "users": {
            "total": total_users,
            "verified": verified_users,
            "new_this_week": new_users_week
        },
        "subscriptions": {
            "free": free_users,
            "starter": starter_users,
            "pro": pro_users,
            "agency": agency_users
        },
        "analyses": {
            "total": total_analyses,
            "new_this_week": new_analyses_week
        },
        "templates": total_templates,
        "payments": {
            "completed": total_payments,
            "pending": pending_payments
        }
    }

@api_router.get("/admin/users")
async def get_admin_users(
    page: int = 1,
    limit: int = 20,
    search: str = None,
    tier: str = None,
    user: dict = Depends(require_admin)
):
    """Get all users with pagination and filtering"""
    query = {}
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}}
        ]
    if tier:
        query["subscription_tier"] = tier
    
    skip = (page - 1) * limit
    total = await db.users.count_documents(query)
    
    users = await db.users.find(
        query,
        {"_id": 0, "password_hash": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Add analysis count for each user
    for u in users:
        u["analyses_count"] = await db.analyses.count_documents({"user_id": u["id"]})
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@api_router.get("/admin/users/{user_id}")
async def get_admin_user_detail(user_id: str, user: dict = Depends(require_admin)):
    """Get detailed user information"""
    target_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's analyses
    analyses = await db.analyses.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    # Get user's payments
    payments = await db.payment_transactions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    return {
        "user": target_user,
        "recent_analyses": analyses,
        "payments": payments
    }

class AdminUserUpdate(BaseModel):
    subscription_tier: Optional[str] = None
    email_verified: Optional[bool] = None
    full_name: Optional[str] = None

@api_router.patch("/admin/users/{user_id}")
async def update_admin_user(user_id: str, data: AdminUserUpdate, user: dict = Depends(require_admin)):
    """Update user details (admin only)"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return {"message": "User updated", "user": updated_user}

@api_router.delete("/admin/users/{user_id}")
async def delete_admin_user(user_id: str, user: dict = Depends(require_admin)):
    """Delete a user and their data"""
    target_user = await db.users.find_one({"id": user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow deleting admin users
    if target_user.get("email") in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Cannot delete admin users")
    
    # Delete user's data
    await db.analyses.delete_many({"user_id": user_id})
    await db.templates.delete_many({"user_id": user_id})
    await db.verification_tokens.delete_many({"user_id": user_id})
    await db.email_otps.delete_many({"user_id": user_id})
    await db.payment_transactions.delete_many({"user_id": user_id})
    await db.users.delete_one({"id": user_id})
    
    return {"message": "User and associated data deleted"}

class AdminUserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    subscription_tier: str = "free"
    email_verified: bool = True

@api_router.post("/admin/users")
async def create_admin_user(data: AdminUserCreate, user: dict = Depends(require_admin)):
    """Create a new user (admin only)"""
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    new_user = {
        "id": user_id,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "full_name": data.full_name,
        "role": None,
        "target_industry": None,
        "monthly_email_volume": None,
        "subscription_tier": data.subscription_tier,
        "subscription_status": "active",
        "stripe_customer_id": None,
        "analyses_used_this_month": 0,
        "total_analyses": 0,
        "created_at": now,
        "onboarding_completed": False,
        "team_id": None,
        "email_verified": data.email_verified,
        "phone_number": None,
        "phone_verified": False,
        "phone_verified_at": None
    }
    
    await db.users.insert_one(new_user)
    del new_user["password_hash"]
    if "_id" in new_user:
        del new_user["_id"]
    
    return {"message": "User created", "user": new_user}

@api_router.get("/admin/payments")
async def get_admin_payments(
    page: int = 1,
    limit: int = 20,
    status: str = None,
    user: dict = Depends(require_admin)
):
    """Get all payment transactions"""
    query = {}
    if status:
        query["payment_status"] = status
    
    skip = (page - 1) * limit
    total = await db.payment_transactions.count_documents(query)
    
    payments = await db.payment_transactions.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Add user info to each payment
    for payment in payments:
        payment_user = await db.users.find_one(
            {"id": payment.get("user_id")},
            {"email": 1, "full_name": 1}
        )
        if payment_user:
            payment["user_email"] = payment_user.get("email")
            payment["user_name"] = payment_user.get("full_name")
    
    return {
        "payments": payments,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@api_router.get("/admin/db-info")
async def get_admin_db_info(user: dict = Depends(require_admin)):
    """Get database collection statistics"""
    collections = ["users", "analyses", "templates", "payment_transactions", "verification_tokens", "email_otps", "clients", "campaigns", "reports", "api_keys"]
    
    stats = {}
    for coll_name in collections:
        coll = db[coll_name]
        count = await coll.count_documents({})
        stats[coll_name] = count
    
    return {"collections": stats}

@api_router.get("/")
async def root():
    return {"message": "ColdIQ API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Seed system templates on startup"""
    # Check if system templates need updating (check count and if new templates exist)
    existing_count = await db.templates.count_documents({"is_system": True})
    expected_count = len(SYSTEM_TEMPLATES)
    
    if existing_count < expected_count:
        logger.info(f"Updating system templates... (found {existing_count}, expected {expected_count})")
        # Delete old system templates and re-seed
        await db.templates.delete_many({"is_system": True})
        for template in SYSTEM_TEMPLATES:
            await db.templates.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": None,
                "team_id": None,
                "name": template["name"],
                "subject": template["subject"],
                "body": template["body"],
                "category": template["category"],
                "industry": template.get("industry", "General"),
                "avg_score": template.get("avg_score"),
                "is_shared": False,
                "is_system": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        logger.info(f"Seeded {len(SYSTEM_TEMPLATES)} system templates")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
