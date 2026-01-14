# ColdIQ - Product Requirements Document

## Overview
AI-powered cold email analyzer & optimizer SaaS with tier-specific features.

## Subscription Tiers Implemented

| Feature | Free | Starter ($29) | Pro ($79) | Agency ($199) |
|---------|------|---------------|-----------|---------------|
| Analyses/month | 3 | 50 | Unlimited | Unlimited |
| History access | Last 3 | Full | Full | Full |
| Insights dashboard | ❌ | Basic | Advanced | Advanced |
| AI Recommendations | ❌ | ❌ | ✅ | ✅ |
| CSV Export | ❌ | ❌ | ✅ | ✅ |
| Email Templates | ❌ | ❌ | ✅ | ✅ |
| Team Seats | 0 | 0 | 0 | 5 |
| API Access | ❌ | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ |

## Features Implemented (January 2025)

### Authentication
- JWT-based signup/login
- 3-step onboarding (role, industry, volume)
- Session persistence

### Email Analysis
- AI analysis via Claude Sonnet 4.5
- Score (0-100), response/open rates
- Strengths, weaknesses, improvements
- AI-rewritten optimized emails
- Sub-scores (personalization, CTA, value prop)

### Tier-Specific Features
- **Free**: 3 analyses, 3 history, no insights
- **Starter**: 50 analyses, full history, basic insights
- **Pro**: Unlimited + advanced insights + CSV export + templates
- **Agency**: Everything + team management (5 seats) + API keys

### API Endpoints
- Auth: signup, login, me, onboarding
- Analysis: analyze, history, export/csv
- Insights: dashboard (tier-gated)
- Templates: CRUD (Pro+)
- Team: management, invites, analytics (Agency)
- API Keys: create, list, delete (Agency)
- Billing: Stripe checkout, webhooks

## Tech Stack
- Frontend: React + Tailwind + Framer Motion
- Backend: FastAPI + MongoDB
- AI: Claude via Emergent LLM
- Payments: Stripe via emergentintegrations

## Next Tasks
1. Email verification flow
2. Password reset
3. More email templates
4. Chrome extension
