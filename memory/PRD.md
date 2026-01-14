# ColdIQ - Product Requirements Document

## Original Problem Statement
AI-powered cold email analyzer & optimizer SaaS platform that analyzes cold emails, provides actionable feedback, rewrites emails for optimal performance, and tracks user performance over time with personalized insights.

## Architecture
- **Frontend**: React with Tailwind CSS, Framer Motion, Shadcn UI components
- **Backend**: FastAPI (Python) with JWT authentication
- **Database**: MongoDB
- **AI**: Claude Sonnet 4.5 via Emergent LLM integration
- **Payments**: Stripe via emergentintegrations library

## User Personas
1. **Sales Professionals** - Send 50-500+ cold emails/month, need better response rates
2. **Founders/CEOs** - Limited time, need quick optimization
3. **Recruiters** - High volume outreach, need consistency
4. **Marketers** - Cold outreach campaigns, need data-driven insights

## Core Requirements (Implemented)
- [x] User authentication (signup/login with JWT)
- [x] 3-step onboarding flow (role, industry, volume)
- [x] Email analyzer with AI-powered scoring (0-100)
- [x] Detailed analysis (strengths, weaknesses, improvements)
- [x] AI-rewritten optimized email versions
- [x] Sub-scores (personalization, value prop, CTA)
- [x] Analysis history with pagination
- [x] Insights dashboard (trends, patterns, recommendations)
- [x] 4-tier subscription model (Free, Starter, Pro, Agency)
- [x] Stripe payment integration
- [x] User settings/profile management
- [x] Monthly usage tracking and limits

## What's Implemented (January 2025)
### Backend APIs
- `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
- `/api/auth/onboarding`
- `/api/analysis/analyze`, `/api/analysis/history`, `/api/analysis/{id}`
- `/api/insights/dashboard`
- `/api/user/profile`, `/api/user/usage`
- `/api/billing/create-checkout-session`, `/api/billing/checkout-status/{id}`
- `/api/webhook/stripe`

### Frontend Pages
- Landing page with hero, features, stats
- Login/Signup pages with validation
- 3-step onboarding flow
- Dashboard with stats, usage, recent analyses
- Email analyzer with live results
- History page with table and modal details
- Insights dashboard with charts
- Settings page (profile, billing)
- Pricing page with 4 tiers

## Prioritized Backlog
### P0 (Critical)
- [x] Core email analysis functionality
- [x] User authentication
- [x] Basic subscription tiers

### P1 (High Priority)
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Export analyses to CSV

### P2 (Medium Priority)
- [ ] Chrome extension for Gmail
- [ ] Email templates library
- [ ] A/B test suggestions
- [ ] Team collaboration (Agency tier)

### P3 (Future)
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] Mobile app
- [ ] API access for developers
- [ ] ML model trained on user data

## Next Tasks
1. Add email verification for signups
2. Implement password reset flow
3. Add CSV export for analyses
4. Create onboarding email sequence
5. Add feedback submission to improve AI
