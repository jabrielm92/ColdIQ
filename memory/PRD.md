# ColdIQ - Product Requirements Document

## Original Problem Statement
Build a full-stack SaaS platform named "ColdIQ" that uses AI to analyze cold emails, provide feedback, and track user performance.

## Subscription Tiers
| Tier | Price | Key Features |
|------|-------|--------------|
| Free | $0 | 3 analyses/month, basic feedback |
| Starter | $29/mo | 50 analyses/month, spam detection, readability, CTA analysis |
| Pro | $79/mo | Unlimited analyses, AI rewrites, performance tracking, benchmarks |
| Growth Agency | $199/mo | Everything + client workspaces, API access, white-label reports |

## ✅ COMPLETED FEATURES

### Core Platform
- [x] User authentication (JWT)
- [x] Email OTP verification (Resend)
- [x] Onboarding flow
- [x] Dashboard with analytics
- [x] Email analyzer with AI (Claude)
- [x] Analysis history with full details
- [x] Template library with 30+ templates
- [x] AI template generation

### Tier-Specific Features
- [x] **Free:** Basic analysis, limited history (3)
- [x] **Starter:** Spam detection, readability score, CTA analysis, subject line analysis
- [x] **Pro:** AI rewrites, inbox placement, emotional tone, A/B test ideas, performance tracking, industry benchmarks, sequence analyzer
- [x] Agency features scaffolded (not functional - on hold)

### Payments & Billing
- [x] Stripe integration (test mode)
- [x] Checkout flow with email verification requirement
- [x] Subscription tier upgrades

### UI/UX
- [x] "Midnight Architect" dark theme
- [x] Light/dark mode toggle
- [x] Mobile responsive
- [x] Locked feature states with upgrade CTAs
- [x] Consistent locked states in History modal

### Admin Dashboard
- [x] Platform statistics (users, analyses, payments)
- [x] User management (view, create, edit, delete)
- [x] Subscription tier management
- [x] Payment transaction history
- [x] Database collection stats
- [x] Hidden admin login on landing page

### Routing
- [x] Public-only routes (Landing, Pricing, Login, Signup redirect logged-in users)
- [x] Protected routes for dashboard features
- [x] Admin route

## 🔴 KNOWN ISSUES
- [ ] AI model sometimes doesn't return all Pro-level JSON fields (emotional_tone, ab_test_suggestions)

## 🟡 ON HOLD (Growth Agency Features)
- Client workspaces
- Campaign analytics
- White-label PDF reports
- API key management

## 🔵 FUTURE ENHANCEMENTS
- [ ] Live phone verification (Amazon SNS)
- [ ] PWA conversion
- [ ] Email notifications for analysis results
- [ ] Team collaboration features
- [ ] Webhook integrations

## Test Accounts
| Email | Password | Tier |
|-------|----------|------|
| free@test.com | Test1234! | Free |
| starter@test.com | Test1234! | Starter |
| pro@test.com | Test1234! | Pro |
| agency@test.com | Test1234! | Agency |

## Admin Access
- **Email:** jabriel@arisolutionsinc.com
- **Password:** Finao028!
- **Access:** Click shield icon in footer of landing page, or go to /admin when logged in

## Stripe (Test Mode)
- **Webhook URL:** https://coldiq-launch.preview.emergentagent.com/api/webhook/stripe
- **Test Card:** 4242 4242 4242 4242

## Technical Stack
- Frontend: React, Tailwind CSS, Recharts, Framer Motion
- Backend: FastAPI, MongoDB, Pydantic
- Integrations: Stripe, Resend, Anthropic Claude
