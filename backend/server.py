from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
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
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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
        "priority_support": False
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
        "priority_support": False
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
        "priority_support": True
    },
    "agency": {
        "analyses_limit": 999999,
        "history_limit": 999999,
        "insights_dashboard": True,
        "advanced_insights": True,
        "recommendations": True,
        "export_csv": True,
        "templates": True,
        "team_seats": 5,
        "api_access": True,
        "priority_support": True
    }
}

SUBSCRIPTION_PRICES = {
    "starter_monthly": 29.00,
    "starter_annual": 278.40,  # 29 * 12 * 0.8 = 20% discount
    "pro_monthly": 79.00,
    "pro_annual": 758.40,  # 79 * 12 * 0.8
    "agency_monthly": 199.00,
    "agency_annual": 1910.40  # 199 * 12 * 0.8
}

# Map price IDs to tiers
PRICE_TO_TIER = {
    "starter_monthly": "starter",
    "starter_annual": "starter",
    "pro_monthly": "pro",
    "pro_annual": "pro",
    "agency_monthly": "agency",
    "agency_annual": "agency"
}

def get_tier_features(tier: str) -> dict:
    return TIER_FEATURES.get(tier, TIER_FEATURES["free"])

# Email templates seed data
SYSTEM_TEMPLATES = [
    {
        "name": "The Personalized Opener",
        "subject": "{{trigger_event}} at {{company}} - quick thought",
        "body": "Hi {{first_name}},\n\nI noticed {{company}} just {{trigger_event}}. Congrats!\n\nWe've helped similar companies in {{industry}} achieve {{specific_result}} by {{value_prop}}.\n\nWould you be open to a quick 15-min call to explore if we could help {{company}} do the same?\n\nBest,\n{{your_name}}",
        "category": "Outreach",
        "avg_score": 78
    },
    {
        "name": "The Problem-Agitate-Solve",
        "subject": "{{pain_point}} costing {{company}} revenue?",
        "body": "Hi {{first_name}},\n\nMost {{role}}s I talk to are struggling with {{pain_point}}. It's frustrating because {{agitate_problem}}.\n\nWe built {{product}} specifically to solve this - our clients typically see {{result}} within {{timeframe}}.\n\nCurious if this resonates with you?\n\nBest,\n{{your_name}}",
        "category": "Pain Point",
        "avg_score": 75
    },
    {
        "name": "The Social Proof Hook",
        "subject": "How {{similar_company}} achieved {{result}}",
        "body": "Hi {{first_name}},\n\n{{similar_company}} was facing {{challenge}} just like {{company}} might be.\n\nAfter implementing our solution, they achieved {{specific_result}} in {{timeframe}}.\n\nI'd love to share how we did it and see if we could replicate similar results for you.\n\nFree for a quick call this week?\n\nBest,\n{{your_name}}",
        "category": "Case Study",
        "avg_score": 82
    },
    {
        "name": "The Direct Ask",
        "subject": "15 min - {{value_prop}} for {{company}}",
        "body": "Hi {{first_name}},\n\nI help {{target_role}}s at {{industry}} companies {{achieve_outcome}}.\n\nWould you be the right person to speak with about this at {{company}}?\n\nIf so, are you free for 15 minutes this Thursday or Friday?\n\nBest,\n{{your_name}}",
        "category": "Direct",
        "avg_score": 71
    },
    {
        "name": "The Permission-Based",
        "subject": "Quick question, {{first_name}}",
        "body": "Hi {{first_name}},\n\nI have an idea that could help {{company}} {{achieve_benefit}}.\n\nWould it be okay if I sent over a few bullet points on how?\n\nBest,\n{{your_name}}",
        "category": "Soft Ask",
        "avg_score": 68
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

def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)

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

async def send_email_notification(to_email: str, subject: str, body: str):
    """Mock email sender - in production, integrate with SendGrid/Resend"""
    logger.info(f"EMAIL TO: {to_email}")
    logger.info(f"SUBJECT: {subject}")
    logger.info(f"BODY: {body}")
    # Store in db for demo purposes
    await db.email_logs.insert_one({
        "id": str(uuid.uuid4()),
        "to": to_email,
        "subject": subject,
        "body": body,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "status": "sent"  # In production: pending -> sent/failed
    })
    return True

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
        "email_verified": False
    }
    
    await db.users.insert_one(user_doc)
    
    # Create email verification token
    verification_token = create_verification_token(user_id, "email_verification")
    await db.verification_tokens.insert_one(verification_token)
    
    # Send verification email
    verify_url = f"{{FRONTEND_URL}}/verify-email?token={verification_token['token']}"
    await send_email_notification(
        data.email,
        "Verify your ColdIQ account",
        f"Hi {data.full_name},\n\nWelcome to ColdIQ! Please verify your email by clicking the link below:\n\n{verify_url}\n\nThis link expires in 24 hours.\n\nBest,\nThe ColdIQ Team"
    )
    
    token = create_jwt_token(user_id, data.email)
    
    del user_doc["password_hash"]
    if "_id" in user_doc:
        del user_doc["_id"]
    
    return {"token": token, "user": user_doc, "verification_sent": True}

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
    
    verify_url = f"{{FRONTEND_URL}}/verify-email?token={verification_token['token']}"
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
    
    reset_url = f"{{FRONTEND_URL}}/reset-password?token={reset_token['token']}"
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
    
    prompt = f"""You are ColdIQ, an expert cold email analyst who has helped generate $100M+ in pipeline.

Analyze this cold email for a {user_role} targeting {industry}:

Subject: {data.subject}
Body: {data.body}

Provide analysis in JSON format ONLY (no markdown, no code blocks, just pure JSON):
{{
  "overallScore": <0-100 integer>,
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
  "callToActionStrength": <0-10 integer>
}}

Be specific, actionable, and focus on what makes cold emails convert."""

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"analysis_{user['id']}_{uuid.uuid4()}",
            system_message="You are ColdIQ, an expert cold email analyzer. Always respond with valid JSON only."
        )
        chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        response_text = response.strip()
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
    
    analysis_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    word_count = len(data.body.split())
    
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
        "user_feedback": None,
        "created_at": now
    }
    
    await db.analyses.insert_one(analysis_doc)
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$inc": {"analyses_used_this_month": 1, "total_analyses": 1}}
    )
    
    return analysis_doc

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
    features = get_tier_features(user.get("subscription_tier", "free"))
    
    if not features["templates"]:
        return {
            "available": False,
            "required_tier": "pro",
            "message": "Upgrade to Pro or higher to access email templates"
        }
    
    # Get user's templates and shared team templates
    query = {"$or": [{"user_id": user["id"]}]}
    
    if user.get("team_id"):
        query["$or"].append({"team_id": user["team_id"], "is_shared": True})
    
    # Also get system templates
    query["$or"].append({"is_system": True})
    
    templates = await db.templates.find(query, {"_id": 0}).to_list(100)
    
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
            f"Hi {existing_user['full_name']},\n\n{user['full_name']} has added you to {team_name} on ColdIQ.\n\nYou now have access to Agency-level features including:\n- Unlimited email analyses\n- Advanced insights & recommendations\n- CSV export\n- Email templates\n- Team analytics\n\nLog in now to get started: {{FRONTEND_URL}}/login\n\nBest,\nThe ColdIQ Team"
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
        invite_url = f"{{FRONTEND_URL}}/join-team?token={invite_token}"
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

# ================= BILLING ROUTES =================

@api_router.post("/billing/create-checkout-session")
async def create_checkout_session(data: CheckoutRequest, request: Request, user: dict = Depends(get_current_user)):
    if data.plan_tier not in SUBSCRIPTION_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan tier")
    
    api_key = os.environ.get('STRIPE_API_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    host_url = data.origin_url
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    amount = SUBSCRIPTION_PRICES[data.plan_tier]
    success_url = f"{host_url}/billing/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/pricing"
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["id"],
            "plan_tier": data.plan_tier,
            "user_email": user["email"]
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": user["id"],
        "amount": amount,
        "currency": "usd",
        "plan_tier": data.plan_tier,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/billing/checkout-status/{session_id}")
async def get_checkout_status(session_id: str, user: dict = Depends(get_current_user)):
    api_key = os.environ.get('STRIPE_API_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    status = await stripe_checkout.get_checkout_status(session_id)
    
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    
    if transaction and status.payment_status == "paid" and transaction.get("payment_status") != "paid":
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
        if plan_tier == "agency" and not user.get("team_id"):
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
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    api_key = os.environ.get('STRIPE_API_KEY')
    if not api_key:
        return {"status": "error", "message": "Stripe not configured"}
    
    try:
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            metadata = webhook_response.metadata
            
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            user_id = metadata.get("user_id")
            plan_tier = metadata.get("plan_tier", "starter")
            
            if user_id:
                update_data = {
                    "subscription_tier": plan_tier,
                    "subscription_status": "active"
                }
                
                if plan_tier == "agency":
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
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ================= HEALTH CHECK =================

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
