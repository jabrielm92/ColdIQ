from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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

# ================= MODELS =================

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

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
    feedback: str  # "helpful" or "not_helpful"

class CheckoutRequest(BaseModel):
    plan_tier: str  # "starter", "pro", "agency"
    origin_url: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    target_industry: Optional[str] = None
    monthly_email_volume: Optional[str] = None

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

# ================= SUBSCRIPTION LIMITS =================

SUBSCRIPTION_LIMITS = {
    "free": 3,
    "starter": 50,
    "pro": 999999,  # unlimited
    "agency": 999999  # unlimited
}

SUBSCRIPTION_PRICES = {
    "starter": 29.00,
    "pro": 79.00,
    "agency": 199.00
}

# ================= AUTH ROUTES =================

@api_router.post("/auth/signup")
async def signup(data: UserSignup):
    # Check if user exists
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
        "onboarding_completed": False
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_jwt_token(user_id, data.email)
    
    # Remove password and _id from response
    del user_doc["password_hash"]
    if "_id" in user_doc:
        del user_doc["_id"]
    
    return {"token": token, "user": user_doc}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["id"], user["email"])
    
    # Remove sensitive data
    user_response = {k: v for k, v in user.items() if k not in ["password_hash", "_id"]}
    
    return {"token": token, "user": user_response}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return user

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
    return {"message": "Onboarding completed", "user": updated_user}

# ================= EMAIL ANALYSIS ROUTES =================

@api_router.post("/analysis/analyze", response_model=AnalysisResponse)
async def analyze_email(data: EmailAnalysisRequest, user: dict = Depends(get_current_user)):
    # Check subscription limits
    limit = SUBSCRIPTION_LIMITS.get(user["subscription_tier"], 3)
    if user["analyses_used_this_month"] >= limit:
        raise HTTPException(
            status_code=403, 
            detail=f"Monthly analysis limit reached ({limit}). Please upgrade your plan."
        )
    
    # Get LLM key
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    # Prepare context
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
        
        # Parse JSON from response
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
    
    # Create analysis record
    analysis_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    word_count = len(data.body.split())
    
    analysis_doc = {
        "id": analysis_id,
        "user_id": user["id"],
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
    
    # Update user stats
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
    skip = (page - 1) * limit
    
    # Free users can only see last 3
    if user["subscription_tier"] == "free":
        limit = min(limit, 3)
    
    cursor = db.analyses.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit)
    
    analyses = await cursor.to_list(length=limit)
    total = await db.analyses.count_documents({"user_id": user["id"]})
    
    return {
        "analyses": analyses,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
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

# ================= INSIGHTS ROUTES =================

@api_router.get("/insights/dashboard")
async def get_insights_dashboard(user: dict = Depends(get_current_user)):
    # Check subscription
    if user["subscription_tier"] == "free":
        return {
            "available": False,
            "message": "Upgrade to Starter or Pro to access insights"
        }
    
    user_id = user["id"]
    
    # Get all analyses for the user
    analyses = await db.analyses.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(1000)
    
    if not analyses:
        return {
            "available": True,
            "has_data": False,
            "message": "Complete your first analysis to see insights"
        }
    
    # Calculate metrics
    total_analyses = len(analyses)
    avg_score = sum(a.get("analysis_score", 0) for a in analyses) / total_analyses
    best_score = max(a.get("analysis_score", 0) for a in analyses)
    avg_response_rate = sum(a.get("estimated_response_rate", 0) for a in analyses) / total_analyses
    
    # Word count analysis
    word_counts = [a.get("email_word_count", 0) for a in analyses]
    avg_word_count = sum(word_counts) / len(word_counts)
    
    # Score by word count buckets
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
    
    # Recent trends (last 30 days)
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    recent = [a for a in analyses if a.get("created_at", "") >= thirty_days_ago]
    
    # Build trend data
    trend_data = []
    for a in sorted(recent, key=lambda x: x.get("created_at", "")):
        trend_data.append({
            "date": a.get("created_at", "")[:10],
            "score": a.get("analysis_score", 0)
        })
    
    # Recommendations based on patterns
    recommendations = []
    if avg_score < 60:
        recommendations.append("Focus on improving your value proposition clarity")
    if avg_word_count > 120:
        recommendations.append("Try shorter emails - aim for 60-100 words")
    if avg_word_count < 40:
        recommendations.append("Add more context to your emails - aim for 60-100 words")
    
    avg_personalization = sum(a.get("personalization_score", 0) for a in analyses) / total_analyses
    if avg_personalization < 5:
        recommendations.append("Include more personalized elements in your emails")
    
    avg_cta = sum(a.get("cta_score", 0) for a in analyses) / total_analyses
    if avg_cta < 5:
        recommendations.append("Strengthen your call-to-action with specific next steps")
    
    return {
        "available": True,
        "has_data": True,
        "summary": {
            "total_analyses": total_analyses,
            "average_score": round(avg_score, 1),
            "best_score": best_score,
            "average_response_rate": round(avg_response_rate, 1),
            "average_word_count": round(avg_word_count),
            "avg_personalization_score": round(avg_personalization, 1),
            "avg_cta_score": round(avg_cta, 1)
        },
        "word_count_insights": word_count_insights,
        "trend_data": trend_data[-30:],  # Last 30 data points
        "recommendations": recommendations[:5]
    }

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
    limit = SUBSCRIPTION_LIMITS.get(user["subscription_tier"], 3)
    return {
        "used": user["analyses_used_this_month"],
        "limit": limit,
        "remaining": max(0, limit - user["analyses_used_this_month"]),
        "tier": user["subscription_tier"]
    }

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
    
    # Create payment transaction record
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
    
    webhook_url = ""  # Not needed for status check
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction status
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    
    if transaction and status.payment_status == "paid" and transaction.get("payment_status") != "paid":
        # Update transaction
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Update user subscription
        plan_tier = transaction.get("plan_tier", "starter")
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {
                "subscription_tier": plan_tier,
                "subscription_status": "active"
            }}
        )
    
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
            
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            # Update user subscription
            user_id = metadata.get("user_id")
            plan_tier = metadata.get("plan_tier", "starter")
            
            if user_id:
                await db.users.update_one(
                    {"id": user_id},
                    {"$set": {
                        "subscription_tier": plan_tier,
                        "subscription_status": "active"
                    }}
                )
        
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

# Include the router in the main app
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
