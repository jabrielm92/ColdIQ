# ColdIQ - Product Requirements Document

## Overview
AI-powered cold email analyzer SaaS with tier-specific features, email verification, password reset, templates library, team management, and annual billing.

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
| Templates | ❌ | ❌ | ✅ | ✅ |
| Team (5 seats) | ❌ | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |

### Annual Billing (20% Discount)
- Starter: $29/mo or $278.40/yr ($23.20/mo)
- Pro: $79/mo or $758.40/yr ($63.20/mo)
- Agency: $199/mo or $1,910.40/yr ($159.20/mo)

### Templates Library - EXPANDED (January 2025)
17 pre-built high-converting templates across 7 industries:

**General Templates (5)**
1. The Personalized Opener (78 avg score)
2. The Problem-Agitate-Solve (75 avg score)
3. The Social Proof Hook (82 avg score)
4. The Direct Ask (71 avg score)
5. The Permission-Based (68 avg score)

**SaaS Templates (2)**
6. Product-Led Growth (81 avg score)
7. Competitive Displacement (76 avg score)

**E-commerce Templates (2)**
8. BFCM Prep (79 avg score)
9. Cart Abandonment (77 avg score)

**Healthcare Templates (2)**
10. Compliance First (74 avg score)
11. Patient Outcomes (80 avg score)

**Financial Services Templates (2)**
12. Security Focus (73 avg score)
13. ROI Driven (78 avg score)

**Agency Templates (2)**
14. White Label Pitch (75 avg score)
15. Client Results (77 avg score)

**Real Estate Templates (1)**
16. Market Data (72 avg score)

**Recruiting Templates (1)**
17. Talent Shortage (76 avg score)

### Team Features (Agency)
- Team creation on subscription
- Invite members via email
- Team analytics dashboard
- Shared templates
- API key management (up to 3 keys)

### UI/UX - "Midnight Architect" Theme (January 2025)
- ✅ Metallic Gold (#d4af37) primary color
- ✅ Acid Green (#a3e635) for success states
- ✅ Obsidian (#050505) dark background
- ✅ Sharp edges (rounded-none) - brutalist style
- ✅ Playfair Display serif for headings
- ✅ Manrope sans-serif for body text
- ✅ JetBrains Mono for code/numbers
- ✅ Asymmetric "Tetris Grid" layouts
- ✅ Split-screen auth pages
- ✅ **Dark/Light Mode Toggle** - persists preference in localStorage

## API Endpoints
- Auth: signup, login, verify-email, resend-verification, forgot-password, reset-password
- Analysis: analyze, history, export/csv
- Insights: dashboard (tier-gated)
- Templates: list, create, delete (with industry filtering)
- Team: get, invite, remove, analytics
- API Keys: list, create, delete
- Billing: create-checkout, prices, webhook

## Tech Stack
- Frontend: React + Tailwind + Framer Motion
- Backend: FastAPI + MongoDB
- AI: Claude via Emergent LLM Key
- Payments: Stripe
- Email: Resend

## Bug Fixes Applied
- ✅ FRONTEND_URL corrected from backend URL to `http://localhost:3000`
- ✅ React hydration warnings addressed through proper useEffect patterns

## Next Tasks (Backlog)
1. **P2** - Chrome Extension for Gmail integration
2. **P2** - Implement actual team analytics charts
3. **P3** - A/B testing suggestions feature
4. **P3** - More template categories (Follow-up sequences, LinkedIn outreach)
