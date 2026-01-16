# ColdIQ - Product Requirements Document

## Original Problem Statement
Build a full-stack SaaS platform named "ColdIQ" that uses AI to analyze cold emails, provide feedback, and track user performance. Multi-tiered subscription model with universal feature visibility.

## Tiers & Pricing
- **Free:** Limited analyses, basic features
- **Starter ($29/mo):** Individual users, basic mistake flagging
- **Pro ($79/mo):** Advanced AI analysis, sequence analysis, performance tracking  
- **Growth Agency ($199/mo):** Client management, reports, API access

## What's Been Implemented ✅

### Core Features
- [x] User authentication (JWT-based)
- [x] Email OTP verification (Resend) - Fixed duplicate OTP issue
- [x] Onboarding flow
- [x] Email analyzer with AI (Claude via Emergent LLM Key)
- [x] Performance tracking dashboard
- [x] Sequence analyzer (Pro+)
- [x] Analysis history with details view
- [x] Template library with AI generation
- [x] Stripe payments (test mode configured)

### UI/UX & Routing
- [x] "Midnight Architect" theme with dark mode
- [x] Universal feature visibility (locked states with upgrade CTAs)
- [x] Mobile responsive layout
- [x] Landing page with agency mockups
- [x] **NEW:** Logged-in users redirected from Landing/Pricing/Login/Signup to Dashboard
- [x] **NEW:** History modal shows locked features with upgrade prompts (consistent with Analyzer)

### Agency Features (Scaffolded)
- [x] Clients page (UI + backend endpoints)
- [x] Campaigns page (UI + backend endpoints)
- [x] Reports page (UI + backend endpoints)
- [x] API Access page (UI + backend endpoints)

## Recent Bug Fixes (Dec 2025)
- [x] **P0 Fixed:** Signup sending duplicate emails (old link + new OTP)
- [x] **P0 Fixed:** Email OTP verification flow not working
- [x] **P0 Fixed:** Duplicate OTP emails due to React StrictMode (useRef fix)
- [x] **P0 Fixed:** Checkout allowed before email verification
- [x] **P2 Fixed:** History modal hiding locked features instead of showing locked state

## Pending Issues
- [ ] **P1:** AI model inconsistent JSON responses for Pro analysis (consider switching to OpenAI)

## In Progress
- [ ] **P1:** Complete Growth Agency features (functional UI for clients, campaigns, reports, API)

## Future/Backlog
- [ ] **P2:** Live Amazon SNS phone verification
- [ ] **P2:** Progressive Web App (PWA)
- [ ] **P2:** Admin dashboard for viewing users/data

## Technical Stack
- **Frontend:** React, Tailwind CSS, Recharts, Framer Motion
- **Backend:** FastAPI, MongoDB (motor), Pydantic, JWT
- **Integrations:** Stripe (payments), Resend (email), Anthropic Claude (AI)

## Test Accounts
- free@test.com / Test1234!
- starter@test.com / Test1234!
- pro@test.com / Test1234!
- agency@test.com / Test1234!

## Stripe Test Card
- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits

## Stripe Webhook URL
https://coldiq-dashboard.preview.emergentagent.com/api/webhook/stripe
