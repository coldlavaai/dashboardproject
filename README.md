# DBR V2 - AI-Powered Database Reactivation Platform

**"The functionality of HighLevel and MORE, with the simplicity of an iPhone."**

Built by **Cold Lava AI** for **Greenstar Solar** (and future clients)

---

## 🎯 What Is This?

An intelligent CRM that automates lead reactivation using:
- **Automated SMS campaigns** (M1/M2/M3 sequences)
- **AI-powered conversations** (Claude 3.5 Sonnet responds to leads)
- **Sophie Intelligence** (AI that improves the AI by analyzing conversations and learning)
- **Real-time dashboard** (beautiful, intuitive, just works)

### The Unique Advantage: **Sophie**

Sophie is an AI conversation coach that:
1. Analyzes every message in real-time
2. Identifies issues and opportunities
3. Learns from your feedback
4. Evolves the AI agent's prompts automatically
5. Continuously improves conversion rates

**No competitor has this.**

---

## 📚 Complete Documentation

### Architecture & Design
1. **[Database Schema](DBR_V2_DATABASE_SCHEMA.md)** - Complete Supabase/PostgreSQL structure (13 tables)
2. **[Component Architecture](DBR_V2_COMPONENT_ARCHITECTURE.md)** - UI components and frontend structure
3. **[Sophie Intelligence](DBR_V2_SOPHIE_INTELLIGENCE.md)** - AI coaching system design
4. **[Prompt System](PROMPT_SYSTEM.md)** - AI agent prompt builder, templates, and versioning (NEW)
5. **[API Routes](DBR_V2_API_ROUTES.md)** - All backend endpoints and data flows

### Build Plan & Decisions
6. **[4-6 Week Build Plan](DBR_V2_BUILD_PLAN.md)** - Day-by-day development schedule
7. **[Q&A Decisions](Q&A_DECISIONS.md)** - All 50+ architectural decisions documented (NEW)

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- **shadcn/ui** (component library)
- React Hook Form + Zod
- Recharts (analytics)
- **PWA** (Progressive Web App - installable, offline, push notifications)

**Backend:**
- Next.js API Routes (serverless)
- Supabase (PostgreSQL + Auth + Realtime + Storage)
- Row Level Security (multi-tenant isolation)

**AI:**
- Claude 3.5 Sonnet (Anthropic) - Main AI agent
- Claude 3.5 Sonnet (Anthropic) - Sophie analysis

**Integrations:**
- Twilio (SMS sending/receiving)
- Cal.com (call booking)

**Deployment:**
- Vercel (hosting + cron jobs + queues)

---

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────┐
│           DASHBOARD (Next.js)               │
│                                             │
│  ┌───────────────────────────────────┐    │
│  │  Datasets → Leads → Conversations  │    │
│  │  Sophie Intelligence Dashboard     │    │
│  │  Analytics & Reporting             │    │
│  └───────────────────────────────────┘    │
└─────────────────┬───────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ┌────▼────┐      ┌────▼────┐
    │ Supabase│      │   APIs  │
    │   DB    │      │ External│
    └────┬────┘      └────┬────┘
         │                │
         │           ┌────▼────┐
         │           │ Twilio  │ (SMS)
         │           │ Claude  │ (AI)
         │           │ Cal.com │ (Booking)
         │           └─────────┘
         │
    ┌────▼────────────────────────┐
    │  Data Flow:                 │
    │                             │
    │  CSV Upload → Leads         │
    │  M1/M2/M3 → Twilio → Lead   │
    │  Lead Replies → AI Response │
    │  Every Message → Sophie     │
    │  Sophie → Insights          │
    │  Insights → Lessons         │
    │  Lessons → Improved Prompts │
    └─────────────────────────────┘
```

---

## 🚀 Quick Start (Once Built)

### For Development

```bash
# Clone repository
git clone https://github.com/coldlavaai/dashboardproject.git
cd dashboardproject

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Visit: `http://localhost:3000`

### For Production Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## 📋 Current Status

**Phase:** Architecture & Planning ✅
**Next Phase:** Week 1 - Foundation

### ✅ Completed
- [x] Complete database schema designed
- [x] UI component architecture mapped
- [x] Sophie intelligence system designed
- [x] All API routes documented
- [x] 4-week build plan created

### 🔨 Next Steps (Week 1)
- [ ] Day 1: Set up Supabase database
- [ ] Day 2: Implement authentication
- [ ] Day 3: Build dashboard shell
- [ ] Day 4: Dataset management UI
- [ ] Day 5: CSV upload & column mapping

---

## 💡 Key Features

### For End Users (Sales Teams)
- ✅ **PWA (Installable App)** - Install on phone like native app, works offline, push notifications
- ✅ Upload leads via CSV (drag & drop, column mapping, duplicate detection)
- ✅ Automated M1/M2/M3 campaigns (fully customizable timing, sending windows, rate limits)
- ✅ AI responds to every lead reply (configurable response timing)
- ✅ Manual mode (toggle AI off, respond yourself)
- ✅ Click-to-call, click-to-email, clickable postcodes
- ✅ Book calls directly via Cal.com integration
- ✅ Real-time dashboard updates (Supabase Realtime)
- ✅ Beautiful analytics (conversion funnel, trends, Sophie impact)

### For Admins
- ✅ **Prompt Builder** - Q&A wizard or templates to create AI agent prompts
- ✅ **Prompt Versioning** - Track changes, measure impact, rollback if needed
- ✅ Multi-user access with role-based permissions
- ✅ Sophie insights dashboard (AI coaching with priority flags)
- ✅ Lessons library (build institutional knowledge)
- ✅ Campaign settings (25+ customizable parameters per campaign)
- ✅ User management (invite, permissions, roles)
- ✅ Client settings (branding, integrations)

### For Sophie (The Secret Sauce)
- ✅ Analyzes every message in real-time
- ✅ Flags critical issues instantly (compliance, errors)
- ✅ Suggests improvements based on patterns
- ✅ Learns from human feedback (agree/disagree/teach)
- ✅ Builds lessons library automatically
- ✅ Evolves AI prompts continuously
- ✅ Measures impact (before/after Sophie metrics)

---

## 📈 Success Metrics

### Technical KPIs
- **Uptime:** 99%+
- **API Response:** < 500ms
- **Page Load:** < 3s
- **Message Queue:** < 5 min to send all M1s

### Business KPIs (Greenstar - First Client)
- **Leads Imported:** 975
- **Reply Rate:** Target 10-15%
- **Call Booking Rate:** Target 5-10%
- **AI Response Rate:** 100% (all replies answered)
- **Sophie Insights Generated:** 10+ per day

### Sophie KPIs
- **Lessons Created:** 50+ in first month
- **Insight Approval Rate:** > 70%
- **Performance Improvement:** +20% booking rate after Sophie

---

## 🎨 Design Philosophy

### Simplicity (iPhone)
- Intuitive UI - no training required
- One-click actions throughout
- Beautiful, modern design
- Mobile-first responsive

### Power (HighLevel +)
- Full CRM functionality
- Advanced automation
- Real-time everything
- Comprehensive analytics

### Intelligence (Unique)
- Sophie learns and improves
- AI that teaches AI
- Pattern recognition
- Continuous optimization

---

## 🔐 Security

- **Authentication:** Supabase Auth (email/password, SSO ready)
- **Authorization:** Row Level Security (RLS) on all tables
- **Data Isolation:** Multi-tenant architecture
- **API Keys:** Stored in Vercel environment variables
- **Webhooks:** Validated signatures (Twilio, Cal.com)

---

## 💰 Cost Structure

### Development
- **Time:** 4 weeks (160 hours)
- **Cost:** Your time

### Monthly Operating Costs
```
Supabase:   £20-50   (Pro plan)
Vercel:     £20      (Pro plan)
Anthropic:  £50-150  (Claude API usage)
Twilio:     £50-200  (SMS costs)
Cal.com:    £0-15    (Free or Pro)
────────────────────
Total:      £150-450/month
```

### Revenue Potential (When Selling)
```
Setup Fee:   £500-1,500 (one-time onboarding)

Monthly Tiers:
Starter:     £149/month (3 datasets, 1,000 leads, 3 users, co-branded)
Pro:         £299/month (10 datasets, 10,000 leads, 10 users, co-branded)
Enterprise:  £999/month (unlimited, white-label, custom domain)

Add-ons:
White-label: +£200/month
Extra users: +£20/user/month

Break-even: 2 Pro clients (£598/month revenue vs £150-450 costs)
Profit Margin: 85%+ (scales with more clients)
```

---

## 🗺️ Roadmap

### V2.0 - MVP (Current - 4-6 Weeks) ← **WE ARE HERE**
**Channel:** SMS Only
**Launch:** Mid-December 2025 with Greenstar Solar

Core Features:
- ✅ Full CRM (datasets, leads, conversations)
- ✅ CSV upload with column mapping & validation
- ✅ M1/M2/M3 SMS automation (Twilio)
- ✅ AI responses (Claude 3.5 Sonnet)
- ✅ Sophie intelligence (real-time analysis, lessons, prompts)
- ✅ **Prompt Builder** (Q&A wizard + templates)
- ✅ **Prompt Versioning** (track changes, measure impact)
- ✅ Campaign Settings (25+ customization parameters)
- ✅ Cal.com booking integration
- ✅ Analytics dashboard with Sophie impact metrics
- ✅ Multi-user with role-based permissions
- ✅ **PWA** (installable, offline, push notifications)
- ✅ Multi-tenant architecture (RLS isolation)

**Why SMS Only:** Prove Sophie works perfectly on one channel before adding complexity.

### V2.1 - Multi-Channel (4-6 Weeks After V2.0)
**Channels:** SMS + WhatsApp + Email
**Launch:** February 2026

New Features:
- WhatsApp integration (Twilio Business API)
- Email campaigns (SendGrid or similar)
- Unified inbox (SMS + WhatsApp + Email in one view)
- Sophie analyzes ALL channels
- Channel preferences per lead
- Multi-channel campaign automation

**Why Now:** SMS working perfectly, client feedback received, ready to expand.

### V2.2 - Voice & Advanced (4-6 Weeks After V2.1)
**Channels:** SMS + WhatsApp + Email + Voice
**Launch:** April 2026

New Features:
- Voice calling integration (Retell AI / VAPI)
- Call recording & transcription
- Sophie analyzes voice calls
- Sophie voice interface (talk to her about insights)
- A/B testing framework (test prompts)
- Advanced reporting (PDF exports)

**Why Now:** All messaging channels proven, voice is premium upsell.

### V2.3 - Scale & Enterprise (Ongoing)
**Launch:** June 2026+

Enterprise Features:
- White-label branding (full customization)
- Custom domains per client
- Billing/subscriptions (Stripe integration)
- Predictive lead scoring
- Multi-language support
- CRM integrations (HubSpot, Salesforce, etc.)
- Native mobile apps (iOS/Android) if PWA insufficient

---

## 👥 Team

**Built by:** Cold Lava AI
**For:** Greenstar Solar (first client)
**With help from:** Claude Code (Anthropic)

**Contact:**
- Email: oliver@coldlava.ai
- Website: https://coldlava.ai
- GitHub: https://github.com/coldlavaai

---

## 📝 License

Private - Cold Lava AI Proprietary

(Will be white-labeled for clients)

---

## 🎉 Vision

**We're building the future of sales automation.**

Not just a CRM. Not just AI automation. But an **intelligent system that learns and improves itself.**

Sophie is the breakthrough - an AI that analyzes conversations, learns from feedback, and continuously evolves the customer-facing AI to be more effective.

**This is revolutionary.**

---

**Ready to start building?**

Next step: [Day 1 - Database Setup](DBR_V2_BUILD_PLAN.md#day-1-project-setup--database-8-hours)

---

**Powered by Cold Lava** 🌋

