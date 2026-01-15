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

## Completed Features (January 2025)

### Authentication & User Management
- ✅ JWT signup/login
- ✅ 3-step onboarding
- ✅ Email verification flow (tokens, confirmation page)
- ✅ Password reset flow (forgot password, reset with token)
- ✅ Email notifications via Resend (verified working)

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

### Chrome Extension (Complete)
Located at `/app/chrome-extension/`
- ✅ Manifest v3 configuration
- ✅ Popup with login/dashboard UI
- ✅ Gmail content script injection
- ✅ In-compose "Analyze" button
- ✅ Side panel with analysis results
- ✅ Copy optimized subject/body
- ✅ Context menu for quick analysis
- ✅ Token storage via chrome.storage
- ✅ Custom icons (16, 48, 128px)

### UI/UX - "Midnight Architect" Theme
- ✅ Metallic Gold (#d4af37) primary color
- ✅ Acid Green (#a3e635) for success states
- ✅ Obsidian (#050505) dark background
- ✅ Sharp edges (rounded-none) - brutalist style
- ✅ Playfair Display serif for headings
- ✅ Manrope sans-serif for body text
- ✅ JetBrains Mono for code/numbers
- ✅ **Dark/Light Mode Toggle**
- ✅ **Full Mobile Responsiveness**
- ✅ **Removed Emergent Branding**

## API Endpoints
- Auth: signup, login, verify-email, resend-verification, forgot-password, reset-password
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
- Extension: Chrome Manifest v3

## Next Tasks (Backlog)
1. **P3** - A/B testing suggestions feature
2. **P3** - More template categories (Follow-up sequences, LinkedIn outreach)
3. **P3** - PWA setup for mobile install
4. **P3** - Publish Chrome Extension to Web Store
