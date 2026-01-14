# ColdIQ - Product Requirements Document

## Overview
AI-powered cold email analyzer SaaS with tier-specific features, email verification, password reset, templates library, team management, and annual billing.

## Completed Features (January 2025)

### Authentication & User Management
- ✅ JWT signup/login
- ✅ 3-step onboarding
- ✅ Email verification flow (tokens, confirmation page)
- ✅ Password reset flow (forgot password, reset with token)
- ✅ Email notifications (MOCKED - stored in DB)

### Core Analysis
- ✅ AI analysis via Claude Sonnet 4.5
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
| Templates | ❌ | ❌ | ✅ | ✅ |
| Team (5 seats) | ❌ | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |

### Annual Billing (20% Discount)
- Starter: $29/mo or $278.40/yr ($23.20/mo)
- Pro: $79/mo or $758.40/yr ($63.20/mo)
- Agency: $199/mo or $1,910.40/yr ($159.20/mo)

### Templates Library
5 pre-built high-converting templates:
1. The Personalized Opener (78 avg score)
2. The Problem-Agitate-Solve (75 avg score)
3. The Social Proof Hook (82 avg score)
4. The Direct Ask (71 avg score)
5. The Permission-Based (68 avg score)

### Team Features (Agency)
- Team creation on subscription
- Invite members via email
- Team analytics dashboard
- Shared templates
- API key management (up to 3 keys)

## API Endpoints
- Auth: signup, login, verify-email, resend-verification, forgot-password, reset-password
- Analysis: analyze, history, export/csv
- Insights: dashboard (tier-gated)
- Templates: list, create, delete
- Team: get, invite, remove, analytics
- API Keys: list, create, delete
- Billing: create-checkout, prices, webhook

## Tech Stack
- Frontend: React + Tailwind + Framer Motion
- Backend: FastAPI + MongoDB
- AI: Claude via Emergent LLM
- Payments: Stripe

## MOCKED Services
- Email sending (SendGrid/Resend) - logged to `email_logs` collection

## Next Tasks
1. Integrate actual email service (SendGrid/Resend)
2. Add Chrome extension for Gmail
3. Implement actual team analytics charts
4. Add more templates by industry
