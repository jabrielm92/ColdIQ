# ColdIQ - Product Requirements Document

## Overview
AI-powered cold email analyzer SaaS with tier-specific features, email verification, password reset, templates library, team management, and annual billing.

## Test Accounts (All Tiers)
| Tier | Email | Password |
|------|-------|----------|
| Free | free@test.com | Test1234! |
| Starter | starter@test.com | Test1234! |
| Pro | pro@test.com | Test1234! |
| Agency | agency@test.com | Test1234! |

## Completed Features (January 2026)

### Email OTP Verification - NEW (January 16, 2026)
- ✅ **Replaced Phone OTP with Email OTP** using Resend
  - `/api/auth/email-otp/send` - Sends 6-digit OTP via Resend
  - `/api/auth/email-otp/verify` - Verifies OTP and marks email as verified
  - Rate limiting: 3 OTPs per email per hour
  - OTP expires in 10 minutes
  - Max 5 verification attempts per OTP
  - Beautiful HTML email template with ColdIQ branding
- ✅ **New EmailOTPVerification component** replaces PhoneVerification
- ✅ **Signup flow updated** to use email verification

### P2/P3 Features - NEW (January 16, 2026)
- ✅ **Report PDF Download** (`/api/reports/{id}/pdf`)
  - HTML-based PDF generation with ColdIQ branding
  - Includes all metrics: total analyses, avg score, response rate, best score
  - Summary section with recommendations
  
- ✅ **AI Template Generation** (`/api/templates/generate`)
  - Pro+ users can describe template requirements in natural language
  - AI generates name, subject, body, and category
  - Templates automatically added to user's library
  - Supports industry and tone customization
  
- ✅ **Expanded Template Library**
  - Added 7 PRO templates (Multi-Touch Sequence, Challenger, Executive, Video, ABM, Post-Event, Referral)
  - Added 8 AGENCY templates (Client Onboarding, Monthly Report, Upsell, Renewal, Multi-Stakeholder, Competitor Intelligence, QBR, Crisis)
  - Templates show tier badges (PRO/AGENCY)
  - Locked templates show blurred preview with "Unlock with [Tier]" CTA
  
- ✅ **Mobile View Fix** for Analyzer page
  - Fixed overflow/stretch issues on mobile after analysis
  - Responsive score display (column on mobile, row on desktop)
  - Added overflow-hidden containers
  - Improved spacing and text sizing

### Growth Agency Tier - NEW (January 16, 2026)
- ✅ **Multi-Client Workspaces** (`/clients`)
  - Add/delete clients with name, industry, contact email
  - Per-client analysis stats (analyses count, avg score, avg response)
  - "Analyze for [Client]" quick action
  - Backend: `/api/clients` CRUD endpoints
  
- ✅ **Campaign Analytics** (`/campaigns`)
  - Top Subject Lines leaderboard with scores and % change
  - Top CTAs leaderboard with response rates
  - Campaign-level stats (email count, avg score, response rate)
  - Backend: `/api/campaigns` endpoints
  
- ✅ **White-Label Reports** (`/reports`)
  - Generate monthly summary reports
  - Report templates: Monthly Summary, Performance Report, Campaign Analysis
  - Metrics: total analyses, avg score, avg response rate, best score
  - Backend: `/api/reports`, `/api/reports/generate` endpoints
  
- ✅ **API Access** (`/api-access`)
  - Generate/regenerate API keys
  - API endpoint documentation
  - Webhooks (coming soon placeholder)
  - Backend: `/api/api-key`, `/api/api-key/generate` endpoints

### Sidebar Update - ALL Features Visible (January 16, 2026)
- ✅ **Every tier sees all features** in sidebar
- ✅ **Locked features** show:
  - Lock icon
  - Grayed out/dimmed text
  - Tier badge (PRO/AGENCY)
  - Toast notification on click: "[Feature] requires [Tier] plan" with Upgrade action
- ✅ **Upgrade CTA** in sidebar for non-Agency users
- ✅ Navigation order: Dashboard, Analyze, History, Templates, Insights, Sequences (PRO), Performance (PRO), Clients (AGENCY), Campaigns (AGENCY), Reports (AGENCY), Team (AGENCY), API (AGENCY), Settings

### Landing Page Updates (January 16, 2026)
- ✅ **Realistic Stats** - Changed from exaggerated to realistic numbers:
  - Response Increase: 127% → 47%
  - Emails Analyzed: 2.4M → 125K+
  - Active Users: 18,500+ → 2,400+
- ✅ **Data Points Section** - Updated to realistic before/after metrics:
  - Response Rate: 2.1% → 3.5% (+67%)
  - Open Rate: 18% → 32% (+78%)
  - Avg Score: 45 → 71 (+58%)
  - Days to Reply: 5.2 → 2.8 (-46%)
- ✅ **Product Screenshots Section** - Added "See It In Action" / "AI Analysis in Seconds" section above Testimonials with 3 interactive mockups:
  1. Analysis Score mockup (score 78, response rate 4.2%, key insight)
  2. Deep Metrics mockup (readability, spam risk, subject line, CTA analysis)
  3. AI Rewrite mockup (optimized subject and body with Copy/View Original buttons)

### Tier-Based Feature Visibility (January 16, 2026)
- ✅ **All Features Shown with Locks** - Every tier shows all features, with locked ones displaying:
  - Lock icon
  - Feature description
  - "Unlock with [Tier] →" CTA linking to pricing
- ✅ **Starter User View**: Unlocked Starter features + Locked Pro features
- ✅ **Free User View**: Locked Starter features + Locked Pro features

### Phase 1: Pricing & Tier Expansion (NEW)
- ✅ **Pricing Page Redesign** - New marketing copy ("Cold emails shouldn't be guesswork")
- ✅ **Renamed Agency → Growth Agency** - Better positioning
- ✅ **Feature Comparison Table** - Expandable with all tier differences
- ✅ **ROI Section** - Shows upgrade value (Starter→Pro, Pro→Growth Agency)
- ✅ **Annual Billing Default** - 20% savings prominently displayed
- ✅ **Enhanced Tier Features**:
  - Starter: +spam detection, +readability score, +CTA analysis, +subject analysis
  - Pro: +AI rewrites, +multiple variants, +inbox placement, +emotional tone, +performance tracking, +industry benchmarks, +sequence analysis, +A/B test suggestions
  - Growth Agency: +client workspaces, +white-label reports, +approval workflows, +AI voice profiles

### Authentication & User Management
- ✅ JWT signup/login
- ✅ 3-step onboarding
- ✅ Email verification flow (tokens, confirmation page)
- ✅ Password reset flow (forgot password, reset with token)
- ✅ Email notifications via Resend (verified working)
- ✅ **Phone Verification Flow** (MOCKED - ready for AWS SNS)
  - 2-step signup (Account → Phone)
  - OTP sending and verification
  - Rate limiting (3 OTPs/phone/hour)
  - One phone per account (fraud prevention)

### Policy Pages (For AWS SNS Approval)
- ✅ **Terms of Service** (`/terms`) - 12 sections including Phone Verification
- ✅ **Privacy Policy** (`/privacy`) - SMS/Phone Verification Policy section
- ✅ **SMS Opt-In Workflow** (`/sms-opt-in`) - Visual 3-step flow documentation

### Core Analysis
- ✅ AI analysis via Claude Sonnet 4.5 (Emergent LLM Key)
- ✅ Score (0-100), response/open rates
- ✅ Strengths, weaknesses, improvements
- ✅ AI-rewritten optimized emails

### Subscription Tiers
| Feature | Free | Starter | Pro | Agency |
|---------|------|---------|-----|--------|
| Analyses | 3/mo | 50/mo | ∞ | ∞ |
| History | Last 3 | Full | Full | Full |
| Insights | ❌ | Basic | Advanced | Advanced |
| Recommendations | ❌ | ❌ | ✅ | ✅ |
| CSV Export | ❌ | ❌ | ✅ | ✅ |
| Templates | ❌ | ❌ | ✅ (17) | ✅ (17) |
| Team Analytics | ❌ | ❌ | ❌ | ✅ |
| Team (5 seats) | ❌ | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |

### Annual Billing (20% Discount)
- Starter: $29/mo or $278.40/yr ($23.20/mo)
- Pro: $79/mo or $758.40/yr ($63.20/mo)
- Agency: $199/mo or $1,910.40/yr ($159.20/mo)

### Templates Library - 17 Templates, 7 Industries
**General (5):** Personalized Opener, Problem-Agitate-Solve, Social Proof Hook, Direct Ask, Permission-Based
**SaaS (2):** Product-Led Growth, Competitive Displacement
**E-commerce (2):** BFCM Prep, Cart Abandonment
**Healthcare (2):** Compliance First, Patient Outcomes
**Financial Services (2):** Security Focus, ROI Driven
**Agency (2):** White Label Pitch, Client Results
**Real Estate (1):** Market Data
**Recruiting (1):** Talent Shortage

### Team Features (Agency)
- ✅ Team creation on subscription
- ✅ Invite members via email
- ✅ **Team Analytics Dashboard** with charts (recharts)
- ✅ Member leaderboard
- ✅ Shared templates
- ✅ API key management (up to 3 keys)

### Landing Page Enhancements
- ✅ **Data-Driven Stats Section**: Before/after comparisons (Response Rate +158%, Open Rate +104%, Score +73%)
- ✅ **Testimonials Carousel**: 5 testimonials with auto-rotate, star ratings, author info, key metrics
- ✅ **Trust Badges**: "18,500+ Active Users", "2.4M Emails Analyzed", "127% Avg Response Increase"
- ✅ **Social Proof**: Company names, roles, specific results

### Chrome Extension (Build-Out Complete)
Located at `/app/chrome-extension/`
- ✅ Manifest v3 configuration with contextMenus
- ✅ Popup with login/dashboard UI
- ✅ Gmail content script injection
- ✅ In-compose "Analyze" button with improved selectors
- ✅ Side panel with analysis results
- ✅ Copy optimized subject/body
- ✅ **One-click "Apply to Email"** - replaces compose content
- ✅ Context menu for quick analysis
- ✅ Token storage via chrome.storage
- ✅ Custom icons (16, 48, 128px)
- ✅ Correct API field mappings
- ✅ Error handling for auth/limits
- ✅ Comprehensive README with testing instructions

### UI/UX - "Midnight Architect" Theme
- ✅ Metallic Gold (#d4af37) primary color
- ✅ Acid Green (#a3e635) for success states
- ✅ Obsidian (#050505) dark background
- ✅ Sharp edges (rounded-none) - brutalist style
- ✅ Playfair Display serif for headings
- ✅ Manrope sans-serif for body text
- ✅ JetBrains Mono for code/numbers
- ✅ **Dark/Light Mode Toggle** (hydration issue fixed)
- ✅ **Full Mobile Responsiveness**
- ✅ **Removed Emergent Branding**

## API Endpoints
- Auth: signup, login, verify-email, resend-verification, forgot-password, reset-password
- **Phone Verification**: send-otp, verify-otp, check/{phone} (MOCKED)
- Analysis: analyze, history, export/csv
- Insights: dashboard (tier-gated)
- Templates: list, create, delete (with industry filtering)
- Team: get, invite, remove, analytics
- API Keys: list, create, delete
- Billing: create-checkout, prices, webhook
- User: usage

## Tech Stack
- Frontend: React + Tailwind + Framer Motion + Recharts
- Backend: FastAPI + MongoDB
- AI: Claude via Emergent LLM Key
- Payments: Stripe
- Email: Resend
- SMS: AWS SNS (MOCKED - pending production approval)
- Extension: Chrome Manifest v3

## Recently Completed (January 15, 2026)

### Pro Tier Features - 100% Complete
- ✅ **Performance Tracking** (`/performance`) - Full implementation with Recharts
  - Stats cards: Avg Score, Avg Response, Best Score, Total Analyses
  - Score Trend area chart with gradient
  - Response Rate & Open Rate Trend line charts  
  - Recent Analyses table with color-coded scores
  - Time range filters (7D, 30D, 90D)
  - Tier gating: Free users see "Pro Feature" lock screen with upgrade CTA
  - Bug fix: Changed `res.data || []` to `res.data?.analyses || []`

- ✅ **Industry Benchmarks** (`/performance`) - Compare to Industry Benchmarks visualization
  - Email Quality Score bar comparison (User vs Industry 62 avg)
  - Response Rate bar comparison (User vs Industry 2.5% avg)
  - Top Performer Benchmarks panel (Score 75+, Response Rate 5%+, Open Rate 45%+, Readability 70+)
  - Based on top 10% of cold emails in B2B SaaS

- ✅ **Winning Pattern Detection** via `/api/analysis/patterns` endpoint
  - Analyzes top 25% of user's emails to find patterns
  - Word count patterns (short/medium/longer emails)
  - Personalization score correlation
  - CTA strength patterns
  - Readability patterns
  - Top performing elements summary (avg_score, avg_response_rate, avg_word_count)

- ✅ **Follow-up Recommendations** via `/api/analysis/patterns` endpoint
  - Dynamic recommendations based on user's historical analysis
  - Focus on Value Proposition (if avg score < 60)
  - Increase Personalization (if personalization score < 5)
  - Strengthen CTA (if CTA score < 6)
  - Shorten Emails (if avg word count > 120)
  - Test Subject Line Variants (always recommended)

- ✅ **Sequence Analysis** (`/sequence`) - Full implementation
  - Multi-email input form (2-5 emails per sequence)
  - Accordion-style email sections (Initial Outreach, Follow-up #1, etc.)
  - Add/Remove email functionality
  - Backend AI analysis via Claude (holistic sequence review)
  - Results display: Overall Score, Key Insight, Issues, Email-by-Email Scores, Recommendations
  - Tier gating: Free users see "Pro Feature" lock screen with upgrade CTA

- ✅ **Enhanced History Modal** - Full analysis record display
  - Core metrics: Response Rate, Open Rate, Words, Personalization, Value Prop, CTA
  - Strengths & Weaknesses lists
  - Specific Improvements numbered list
  - **Starter+ Metrics Section**:
    - Readability Score with level badge (Easy/Medium/Hard)
    - Spam Risk % with spam keyword tags
    - Subject Line analysis (length, effectiveness, personalization, curiosity)
    - CTA Analysis (present, clarity, type, friction level)
    - Fix This suggestions with priority badges
  - **Pro+ Metrics Section** (all with PRO badges):
    - Inbox Placement score
    - Emotional Tone with persuasion techniques
    - Industry Benchmark comparison
    - A/B Test Ideas
    - AI Subject Line Variants

### Starter Tier Features - 100% Complete
- ✅ Server-side analysis in `/app/backend/analysis_utils.py`
- ✅ Readability score (Flesch reading ease)
- ✅ Spam keyword detection with risk score
- ✅ CTA analysis (presence, clarity, placement)
- ✅ Subject line analysis (length, personalization, urgency, curiosity)
- ✅ Rule-based "Fix This" suggestions
- ✅ Inbox placement score calculation

## Next Tasks (Backlog)

### P1 - Growth Agency Tier
1. **Multi-client workspaces** - Separate analysis histories per client
2. **White-label PDF reports** - Downloadable branded reports
3. **Approval workflows** - Internal review before client delivery
4. **Campaign-level analytics** - Aggregate insights across emails
5. **API & webhook access** - External integrations

### P2 - Infrastructure
1. **Integrate Real AWS SNS** - Once production approval is received, swap mock SMS
2. **Chrome Extension Testing** - Local developer mode testing

### P3 - Enhancement
1. **PWA Conversion** - Better mobile experience and offline capabilities
2. Publish Chrome Extension to Web Store

### P3 - Growth Agency Features
1. Multi-client workspace UI
2. White-label report generator
3. Approval workflow system

### P4 - Future Enhancements
1. A/B testing suggestions feature
2. More template categories (Follow-up sequences, LinkedIn outreach)
3. PWA setup for mobile install
4. Publish Chrome Extension to Web Store

## Notes
- Phone verification is MOCKED - OTPs logged to `/var/log/supervisor/backend.err.log`
- Use `/sms-opt-in` page as screenshot for AWS SNS approval
- FRONTEND_URL in backend .env has been updated to production URL
