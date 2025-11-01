# DBR V2 - Complete Build Plan

**Project:** Database Reactivation Platform V2
**Timeline:** 4 weeks (160 hours)
**Approach:** Build all features, launch with Greenstar as first client
**Created:** 2025-10-31

---

## Vision Statement

**"The functionality of HighLevel and MORE, with the simplicity of an iPhone."**

- **HighLevel:** Comprehensive CRM + automation + SMS + pipelines
- **MORE:** Sophie's AI intelligence layer (unique competitive advantage)
- **iPhone:** Beautiful, intuitive, just works

---

## Build Philosophy

1. **Quality over speed** - Build it right from the start
2. **Test as we go** - Every feature tested before moving on
3. **MVP mindset** - Core features polished, nice-to-haves later
4. **Real data** - Use actual Greenstar data for testing
5. **Daily deployments** - Continuous integration, see progress daily

---

## Tech Stack (Confirmed)

```
Frontend:  Next.js 14 + TypeScript + Tailwind CSS
Backend:   Next.js API Routes (serverless)
Database:  Supabase (PostgreSQL + Auth + Realtime + Storage)
AI:        Claude 3.5 Sonnet (Anthropic)
SMS:       Twilio
Booking:   Cal.com API
Deploy:    Vercel
Queue:     Vercel Queue (for rate limiting)
```

---

## 4-Week Timeline Overview

```
Week 1: Foundation (Database + Auth + Basic UI)
Week 2: Core CRM (Datasets + Leads + Conversations)
Week 3: Automation (M1/M2/M3 + AI Responses + Twilio)
Week 4: Sophie Intelligence + Polish + Launch
```

---

## WEEK 1: Foundation
**Goal:** Database, authentication, and basic dashboard shell working

### Day 1: Project Setup & Database (8 hours)

**Morning (4h):**
- [ ] Create Supabase project
- [ ] Run database schema SQL (from DBR_V2_DATABASE_SCHEMA.md)
- [ ] Set up Row Level Security policies
- [ ] Create Storage buckets (csv_uploads, exports, client_logos)
- [ ] Test database with sample data (10 test leads)

**Afternoon (4h):**
- [ ] Initialize Next.js project in `/dashboardproject`
- [ ] Install dependencies:
  ```bash
  npm install @supabase/supabase-js
  npm install @anthropic-ai/sdk
  npm install twilio
  npm install @tailwindcss/forms @tailwindcss/typography
  npm install react-hook-form zod
  npm install recharts (charts)
  npm install date-fns (date utilities)
  ```
- [ ] Configure environment variables (.env.local)
- [ ] Set up Tailwind with custom colors (Greenstar green #8cc63f)
- [ ] Create basic folder structure:
  ```
  app/
  ├── (auth)/
  ├── (dashboard)/
  ├── api/
  components/
  lib/
  types/
  ```

**Deliverable:** Empty Next.js app connected to Supabase database

---

### Day 2: Authentication & User Management (8 hours)

**Morning (4h):**
- [ ] Set up Supabase Auth
- [ ] Create login page (`app/(auth)/login/page.tsx`)
- [ ] Create signup page (admin creates users, so this is invite-only)
- [ ] Create `AuthProvider` context
- [ ] Create `UserProvider` context (user data, role, permissions)
- [ ] Test authentication flow

**Afternoon (4h):**
- [ ] Create `ClientProvider` (client settings, branding)
- [ ] Implement Row Level Security middleware
- [ ] Create permission checking utilities:
  ```typescript
  canEditLessons(user)
  canManageUsers(user)
  canPushToLive(user)
  ```
- [ ] Create protected route wrapper
- [ ] Test with different user roles

**Deliverable:** Full authentication system with role-based permissions

---

### Day 3: Dashboard Shell & Navigation (8 hours)

**Morning (4h):**
- [ ] Create `DashboardLayout` component
- [ ] Create `Sidebar` component with navigation
- [ ] Create `TopBar` component
- [ ] Create `UserProfile` dropdown
- [ ] Implement sidebar collapse (mobile/desktop)
- [ ] Add "Powered by Cold Lava" branding

**Afternoon (4h):**
- [ ] Create shared components:
  - [ ] `Button.tsx`
  - [ ] `Input.tsx`
  - [ ] `Select.tsx`
  - [ ] `Card.tsx`
  - [ ] `Modal.tsx`
  - [ ] `Badge.tsx`
  - [ ] `LoadingSpinner.tsx`
  - [ ] `EmptyState.tsx`
- [ ] Set up Tailwind component library patterns
- [ ] Create design system documentation

**Deliverable:** Beautiful dashboard shell with navigation (no data yet)

---

### Day 4: Dataset Management UI (8 hours)

**Morning (4h):**
- [ ] Create datasets list page (`app/(dashboard)/datasets/page.tsx`)
- [ ] Create `DatasetCard` component
- [ ] Create `NewDatasetButton` → `CreateDatasetModal`
- [ ] Implement GET `/api/datasets` route
- [ ] Implement POST `/api/datasets` route
- [ ] Test creating datasets manually

**Afternoon (4h):**
- [ ] Create individual dataset page (`app/(dashboard)/datasets/[id]/page.tsx`)
- [ ] Create dataset header with stats
- [ ] Create empty state ("No leads yet, upload CSV")
- [ ] Implement GET `/api/datasets/[id]` route
- [ ] Test navigation between datasets

**Deliverable:** Dataset management working (create, view, list)

---

### Day 5: CSV Upload & Column Mapping (8 hours)

**Morning (4h):**
- [ ] Create `UploadModal` component (multi-step wizard)
- [ ] Step 1: File upload (drag & drop)
- [ ] Implement POST `/api/datasets/upload` route
- [ ] Upload CSV to Supabase Storage
- [ ] Parse CSV and detect columns
- [ ] Show preview (first 5 rows)

**Afternoon (4h):**
- [ ] Step 2: Column mapping UI
- [ ] Create dropdown selectors for each required field
- [ ] Auto-detect common column names ("First Name" → first_name)
- [ ] Validation (phone_number and first_name required)
- [ ] Step 3: Dataset naming and settings
- [ ] Step 4: Confirmation and import

**Deliverable:** CSV upload flow complete (UI only, import tomorrow)

---

## WEEK 2: Core CRM
**Goal:** Full lead management, conversations, and manual messaging

### Day 6: CSV Import Processing (8 hours)

**Morning (4h):**
- [ ] Implement POST `/api/datasets/map-and-import` route
- [ ] Read CSV from Storage
- [ ] Parse and validate data:
  - [ ] Phone number normalization (+44 format)
  - [ ] Date parsing (inquiry_date)
  - [ ] Duplicate detection (phone_number per dataset)
- [ ] Batch insert into `leads` table (100 at a time)

**Afternoon (4h):**
- [ ] Show progress bar during import
- [ ] Handle errors gracefully (show which rows failed)
- [ ] Update dataset stats (total_leads, etc.)
- [ ] Success screen with "Go to Dashboard" button
- [ ] Test with real Greenstar CSV (975 leads)

**Deliverable:** Full CSV import working end-to-end

---

### Day 7: Leads Dashboard & Filtering (8 hours)

**Morning (4h):**
- [ ] Create leads list page (`app/(dashboard)/datasets/[id]/leads/page.tsx`)
- [ ] Create `LeadCard` component (collapsed view)
- [ ] Implement GET `/api/leads` route with filters
- [ ] Add filter controls:
  - [ ] Status dropdown
  - [ ] Sentiment dropdown
  - [ ] Search bar (name, phone, email)
  - [ ] Archived toggle
- [ ] Add pagination (50 leads per page)

**Afternoon (4h):**
- [ ] Create "Hot Leads" section on dataset dashboard
- [ ] Create "Warm Leads" section
- [ ] Create "Call Booked" section
- [ ] Implement sorting (most recent reply first)
- [ ] Add lead count badges

**Deliverable:** Lead management dashboard with filtering

---

### Day 8: Lead Details & Editing (8 hours)

**Morning (4h):**
- [ ] Create expandable lead card (full details)
- [ ] Show all lead fields (contact info, status, dates, notes)
- [ ] Add click-to-call phone links
- [ ] Add click-to-email links
- [ ] Add clickable postcodes (Google Maps)
- [ ] Create status badges (color-coded)
- [ ] Create sentiment badges

**Afternoon (4h):**
- [ ] Create edit lead modal
- [ ] Implement PUT `/api/leads/[id]` route
- [ ] Add manual mode toggle
- [ ] Implement POST `/api/leads/[id]/manual-mode` route
- [ ] Add archive button
- [ ] Implement POST `/api/leads/[id]/archive` route
- [ ] Test editing leads

**Deliverable:** Full lead detail view with editing

---

### Day 9: Conversation Display (8 hours)

**Morning (4h):**
- [ ] Create `ConversationPanel` component
- [ ] Create `MessageBubble` component
- [ ] Style outbound messages (blue, right-aligned)
- [ ] Style inbound messages (green, left-aligned)
- [ ] Show timestamps ("2 hours ago")
- [ ] Show message status (sent, delivered, read)
- [ ] Implement GET `/api/conversations/[id]` route

**Afternoon (4h):**
- [ ] Add conversation to lead card (expandable)
- [ ] Auto-scroll to latest message
- [ ] Add "Copy message" button
- [ ] Add conversation metadata (started, message count)
- [ ] Test with mock conversation data

**Deliverable:** Beautiful conversation display

---

### Day 10: Manual Messaging (8 hours)

**Morning (4h):**
- [ ] Set up Twilio account (if not already)
- [ ] Get UK phone number
- [ ] Configure Twilio credentials in Supabase secrets
- [ ] Implement Twilio SDK wrapper (lib/twilio.ts)
- [ ] Test sending SMS manually

**Afternoon (4h):**
- [ ] Create "Send Message" UI in conversation panel
- [ ] Text input with character count
- [ ] Implement POST `/api/messages/send` route
- [ ] Send via Twilio
- [ ] Store in messages table
- [ ] Update conversation
- [ ] Real-time update in UI (Supabase subscription)
- [ ] Test full manual messaging flow

**Deliverable:** Manual SMS sending working

---

## WEEK 3: Automation
**Goal:** M1/M2/M3 campaigns, AI responses, and Twilio webhooks

### Day 11: Campaign Settings & Queue (8 hours)

**Morning (4h):**
- [ ] Create campaign settings UI (on dataset)
- [ ] Configure M1/M2/M3 delays (hours)
- [ ] Configure AI response delay (seconds)
- [ ] Configure rate limit (messages per minute)
- [ ] Configure schedule (hours, days)
- [ ] Save to dataset settings

**Afternoon (4h):**
- [ ] Set up Vercel Queue (or Bull/BullMQ)
- [ ] Create message queue structure
- [ ] Implement rate limiting logic (1 msg/30-60 sec)
- [ ] Create queue processor
- [ ] Test queue with mock messages

**Deliverable:** Campaign settings and message queue working

---

### Day 12: M1/M2/M3 Campaign Logic (8 hours)

**Morning (4h):**
- [ ] Implement POST `/api/campaigns/start` route
- [ ] Get all READY leads
- [ ] Generate M1 messages (static template for now)
- [ ] Queue M1 messages (respecting rate limit)
- [ ] Update lead status (m1_sent_at, contact_status)
- [ ] Test M1 campaign with 10 test leads

**Afternoon (4h):**
- [ ] Implement M2 logic:
  - [ ] Check: m1_sent_at + delay < NOW
  - [ ] Check: reply_received_at IS NULL
  - [ ] Queue M2 messages
- [ ] Implement M3 logic (same as M2)
- [ ] Create "Start Campaign" button in UI
- [ ] Test full M1→M2→M3 flow with accelerated timing

**Deliverable:** Automated campaign flow working

---

### Day 13: Twilio Webhook & Reply Handling (8 hours)

**Morning (4h):**
- [ ] Implement POST `/api/webhooks/twilio` route
- [ ] Validate Twilio signature
- [ ] Parse incoming SMS data
- [ ] Find lead by phone number
- [ ] Store message (direction: 'inbound')
- [ ] Update conversation
- [ ] Update lead (reply_received_at, latest_lead_reply)
- [ ] Configure webhook URL in Twilio dashboard

**Afternoon (4h):**
- [ ] Test receiving SMS
- [ ] Verify message appears in dashboard
- [ ] Verify conversation updates
- [ ] Test with multiple simultaneous replies
- [ ] Implement error handling (lead not found, etc.)

**Deliverable:** SMS receiving working end-to-end

---

### Day 14: AI Response Generation (Claude Integration) (8 hours)

**Morning (4h):**
- [ ] Set up Anthropic API key
- [ ] Create Claude API wrapper (lib/claude.ts)
- [ ] Create base prompt template
- [ ] Test generating simple response
- [ ] Implement POST `/api/messages/ai-generate` route
- [ ] Get conversation history
- [ ] Get lead context
- [ ] Call Claude API
- [ ] Return generated response

**Afternoon (4h):**
- [ ] Create AI response preview UI
- [ ] "Generate Response" button in conversation
- [ ] Show generated message before sending
- [ ] Edit before sending (optional)
- [ ] Approve and send button
- [ ] Implement POST `/api/messages/ai-send` route
- [ ] Test full AI generation → preview → send flow

**Deliverable:** AI message generation working

---

### Day 15: Automatic AI Responses (8 hours)

**Morning (4h):**
- [ ] Modify Twilio webhook to trigger AI response
- [ ] Check if manual_mode is OFF
- [ ] Queue AI response generation (async)
- [ ] Implement queue processor for AI responses
- [ ] Generate → Send → Store → Update conversation
- [ ] Test automatic response to incoming SMS

**Afternoon (4h):**
- [ ] Add AI response delay (60 seconds)
- [ ] Handle concurrent replies (queue properly)
- [ ] Test with multiple leads replying at once
- [ ] Add retry logic for failed generations
- [ ] Add error notifications

**Deliverable:** Fully automatic AI conversation working

---

## WEEK 4: Sophie Intelligence & Polish
**Goal:** Sophie analysis, lessons, prompts, and final polish

### Day 16: Sophie Message Analysis (8 hours)

**Morning (4h):**
- [ ] Create Sophie analysis prompt (from SOPHIE_INTELLIGENCE.md)
- [ ] Implement POST `/api/sophie/analyze-message` route
- [ ] Call Claude API with message + context
- [ ] Parse analysis JSON
- [ ] Store in message_analysis table
- [ ] Test analyzing individual messages

**Afternoon (4h):**
- [ ] Trigger Sophie analysis automatically after each message
- [ ] Async queue (don't block message sending)
- [ ] Create insights if issues found
- [ ] Implement GET `/api/sophie/insights` route
- [ ] Test generating insights

**Deliverable:** Sophie analyzing messages in real-time

---

### Day 17: Sophie Dashboard & Insights UI (8 hours)

**Morning (4h):**
- [ ] Create Sophie dashboard page (`app/(dashboard)/sophie/page.tsx`)
- [ ] Create `SophieInsightCard` component
- [ ] Show pending insights (grouped by severity)
- [ ] Add insight badges (CRITICAL, URGENT, WARNING, etc.)
- [ ] Implement filtering and sorting

**Afternoon (4h):**
- [ ] Create `SophieFloatingButton` (quick access)
- [ ] Show notification badge (pending count)
- [ ] Create Sophie sidebar (overlay on right)
- [ ] Show latest 5 insights
- [ ] Link to full Sophie dashboard

**Deliverable:** Beautiful Sophie UI showing insights

---

### Day 18: Lessons Library & Learning (8 hours)

**Morning (4h):**
- [ ] Create lessons library page (`app/(dashboard)/sophie/lessons/page.tsx`)
- [ ] Create `LessonCard` component
- [ ] Implement GET `/api/sophie/lessons` route
- [ ] Show all lessons with search and filters
- [ ] Add "Create Manual Lesson" button
- [ ] Implement POST `/api/sophie/lessons` route

**Afternoon (4h):**
- [ ] Implement "Agree & Learn" flow:
  - [ ] Modal: "Why is this correct?"
  - [ ] User provides explanation
  - [ ] Create lesson from insight
  - [ ] Implement POST `/api/sophie/insights/[id]/agree` route
- [ ] Implement "Disagree & Teach" flow:
  - [ ] Modal: "Teach Sophie"
  - [ ] User explains why Sophie is wrong
  - [ ] Create negative lesson
  - [ ] Implement POST `/api/sophie/insights/[id]/disagree` route
- [ ] Test full learning flow

**Deliverable:** Sophie learning system working

---

### Day 19: Prompt Management & "Make Live" (8 hours)

**Morning (4h):**
- [ ] Create prompt editor page (`app/(dashboard)/sophie/prompts/page.tsx`)
- [ ] Create `PromptEditor` component (code editor)
- [ ] Show current active prompt
- [ ] Show lessons that will be included
- [ ] Implement GET `/api/sophie/prompts/[type]` route
- [ ] Implement PUT `/api/sophie/prompts/[type]` route

**Afternoon (4h):**
- [ ] Implement lesson injection logic:
  - [ ] Get all active lessons
  - [ ] Generate lessons context string
  - [ ] Inject into prompt
- [ ] Create "Make Live" button
- [ ] Implement POST `/api/sophie/prompts/[type]/make-live` route
- [ ] Create new version
- [ ] Show confirmation modal (diff view)
- [ ] Test making prompt live

**Deliverable:** Full prompt management system

---

### Day 20: Cal.com Integration (8 hours)

**Morning (4h):**
- [ ] Set up Cal.com API key
- [ ] Create Cal.com wrapper (lib/calcom.ts)
- [ ] Implement POST `/api/calcom/check-availability` route
- [ ] Test fetching available slots
- [ ] Create `BookCallModal` component
- [ ] Date picker
- [ ] Time slot selector

**Afternoon (4h):**
- [ ] Implement POST `/api/calcom/create-booking` route
- [ ] Call Cal.com API
- [ ] Update lead (call_booked, call_booked_time, etc.)
- [ ] Enable manual_mode automatically
- [ ] Test booking calls
- [ ] Implement POST `/api/webhooks/calcom` for booking updates
- [ ] Test full booking flow

**Deliverable:** Cal.com integration complete

---

### Day 21: Analytics & Reporting (8 hours)

**Morning (4h):**
- [ ] Implement GET `/api/analytics/overview` route
- [ ] Calculate all metrics:
  - [ ] Total leads, messages sent, reply rate
  - [ ] Hot leads, calls booked, converted
  - [ ] Sentiment breakdown
  - [ ] Status distribution
- [ ] Create `AnalyticsOverview` component
- [ ] Create `MetricCard` components
- [ ] Create `ConversionFunnel` chart

**Afternoon (4h):**
- [ ] Create trend charts (daily messages, replies, bookings)
- [ ] Implement time range filter (Today, Week, Month, All)
- [ ] Create `TrendChart` component (Recharts)
- [ ] Implement GET `/api/analytics/sophie-impact` route
- [ ] Show Sophie's performance metrics
- [ ] Test analytics with real data

**Deliverable:** Full analytics dashboard

---

### Day 22: User Management & Settings (8 hours)

**Morning (4h):**
- [ ] Create user management page (`app/(dashboard)/users/page.tsx`)
- [ ] Implement GET `/api/users` route
- [ ] Show list of users
- [ ] Create "Invite User" button
- [ ] Implement POST `/api/users` route
- [ ] Send invitation email
- [ ] Test user invitation flow

**Afternoon (4h):**
- [ ] Create user edit modal
- [ ] Permission checkboxes (can_edit_lessons, can_manage_users, etc.)
- [ ] Implement PUT `/api/users/[id]` route
- [ ] Create settings page (`app/(dashboard)/settings/page.tsx`)
- [ ] Client settings form (company name, logo, etc.)
- [ ] Implement PUT `/api/settings/client` route

**Deliverable:** User management and settings complete

---

### Day 23: Notifications & Real-Time Updates (8 hours)

**Morning (4h):**
- [ ] Set up Supabase Realtime subscriptions:
  - [ ] New messages
  - [ ] Lead status changes
  - [ ] Sophie insights
  - [ ] Call bookings
- [ ] Create `NotificationBell` component
- [ ] Show unread count badge
- [ ] Notification dropdown
- [ ] Mark as read functionality

**Afternoon (4h):**
- [ ] Implement email notifications:
  - [ ] Call booked
  - [ ] Hot lead (status changed to HOT)
  - [ ] Sophie critical insight
- [ ] Set up Resend or Postmark
- [ ] Create email templates
- [ ] Test notifications

**Deliverable:** Full notification system

---

### Day 24: Cron Jobs & Background Tasks (8 hours)

**Morning (4h):**
- [ ] Set up Vercel Cron
- [ ] Implement GET `/api/cron/send-m1` route
- [ ] Implement GET `/api/cron/send-m2` route
- [ ] Implement GET `/api/cron/send-m3` route
- [ ] Configure cron schedule (every 1 minute)
- [ ] Test cron jobs

**Afternoon (4h):**
- [ ] Implement GET `/api/cron/process-ai-responses` route
- [ ] Implement GET `/api/cron/sophie-analysis` route (batch)
- [ ] Implement GET `/api/cron/pattern-detection` route
- [ ] Test all background tasks
- [ ] Add error logging and monitoring

**Deliverable:** All automated tasks running

---

### Day 25: Polish & Bug Fixes (8 hours)

**Morning (4h):**
- [ ] Test entire flow end-to-end with real data
- [ ] Fix any bugs discovered
- [ ] Improve loading states (skeletons)
- [ ] Add error boundaries
- [ ] Improve empty states

**Afternoon (4h):**
- [ ] Mobile responsiveness check (all pages)
- [ ] Fix any mobile layout issues
- [ ] Accessibility audit (keyboard navigation, ARIA labels)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Final UI polish

**Deliverable:** Polished, bug-free application

---

### Day 26: Testing & Documentation (8 hours)

**Morning (4h):**
- [ ] Create user guide (for Greenstar)
- [ ] Create video walkthrough
- [ ] Create admin guide (how to manage users, settings)
- [ ] Create troubleshooting guide
- [ ] Update README.md

**Afternoon (4h):**
- [ ] Final end-to-end testing:
  - [ ] Upload CSV
  - [ ] Start campaign
  - [ ] Receive SMS
  - [ ] AI responds
  - [ ] Sophie analyzes
  - [ ] Review insights
  - [ ] Create lessons
  - [ ] Update prompt
  - [ ] Book call
- [ ] Fix any remaining issues

**Deliverable:** Production-ready application with documentation

---

### Day 27: Deployment & Launch (8 hours)

**Morning (4h):**
- [ ] Create production Supabase project
- [ ] Migrate database schema
- [ ] Import Greenstar data (975 leads)
- [ ] Configure production environment variables
- [ ] Deploy to Vercel
- [ ] Configure custom domain (if applicable)

**Afternoon (4h):**
- [ ] Final production testing
- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry or similar)
- [ ] Set up analytics (Vercel Analytics)
- [ ] Create Greenstar admin user
- [ ] Onboard Greenstar team (live walkthrough)

**Deliverable:** Live in production with Greenstar

---

### Day 28: Handoff & Iteration (8 hours)

**Morning (4h):**
- [ ] Monitor first day of usage
- [ ] Gather feedback from Greenstar
- [ ] Fix any urgent issues
- [ ] Create backlog for improvements

**Afternoon (4h):**
- [ ] Plan next features (based on feedback)
- [ ] Create roadmap for V2.1
- [ ] Document lessons learned
- [ ] Celebrate launch! 🎉

**Deliverable:** Successful launch + feedback loop established

---

## Daily Workflow

Each day:
1. **Morning standup** (5 min)
   - What did we accomplish yesterday?
   - What are we building today?
   - Any blockers?

2. **Build** (6-7 hours)
   - Follow day's checklist
   - Commit frequently (atomic commits)
   - Deploy to staging

3. **Test** (1 hour)
   - Manual testing of new features
   - Automated tests where applicable
   - Document any bugs

4. **Review** (30 min)
   - What worked well?
   - What needs improvement?
   - Update plan if needed

---

## Testing Strategy

### Unit Tests (Optional but Recommended)
```bash
npm install --save-dev jest @testing-library/react
```

- API route handlers
- Utility functions (phone normalization, date parsing)
- Permission checking logic

### Integration Tests
- CSV upload → import → display
- Send message → Twilio → receive reply → AI response
- Create insight → agree → lesson created → prompt updated

### Manual Testing
- Every feature tested manually before marking complete
- Test on real devices (mobile, tablet, desktop)
- Test with real data (Greenstar CSV)

---

## Deployment Strategy

### Continuous Deployment
- Push to GitHub → Auto-deploy to Vercel
- Staging branch → staging.dashboardproject.com
- Main branch → production (dashboardproject.com)

### Environment Variables
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Anthropic (Claude)
ANTHROPIC_API_KEY

# Twilio
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER

# Cal.com
CALCOM_API_KEY

# Vercel
CRON_SECRET (for cron job authentication)

# Other
NEXT_PUBLIC_APP_URL (for webhooks)
```

---

## Success Metrics (First 30 Days)

**Technical:**
- 99% uptime
- < 500ms API response time
- < 3s page load time
- Zero critical bugs

**Business (Greenstar):**
- 975 leads imported successfully
- M1/M2/M3 campaigns running
- AI response rate: 100% (all replies get responses)
- Sophie generating insights daily
- At least 10 lessons created
- Call booking rate: Target 5-10% (50-100 calls booked)

---

## Risk Mitigation

### Technical Risks

**Risk:** Claude API rate limits
**Mitigation:** Queue requests, implement exponential backoff

**Risk:** Twilio delivery failures
**Mitigation:** Retry logic, error logging, fallback to manual

**Risk:** Database performance with 10,000+ leads
**Mitigation:** Proper indexes (already designed), pagination, query optimization

**Risk:** Real-time updates slow with many users
**Mitigation:** Supabase scales automatically, use row-level subscriptions

### Business Risks

**Risk:** Greenstar feedback requires major changes
**Mitigation:** Daily check-ins, show progress frequently

**Risk:** Sophie generates too many false positives
**Mitigation:** Tunable severity thresholds, dismissal tracking

---

## Post-Launch Roadmap (V2.1 - V2.5)

### V2.1 (Month 2)
- WhatsApp integration
- Voice calling (Retell AI or VAPI)
- Advanced reporting (PDF exports)

### V2.2 (Month 3)
- Multi-client support (fully operational)
- White-label branding per client
- Client billing/subscriptions

### V2.3 (Month 4)
- Predictive lead scoring
- A/B testing for prompts
- Automatic lesson creation (Sophie goes fully auto)

### V2.4 (Month 5)
- CRM integrations (HubSpot, Pipedrive)
- Email campaigns
- Advanced workflow builder

### V2.5 (Month 6)
- API marketplace (other developers can extend)
- Mobile app (React Native)
- Voice of customer analysis

---

## Cost Projections (Monthly)

### Development (First 4 Weeks)
- Your time: 160 hours

### Operating Costs (Per Month)
```
Supabase:       £20-50  (Pro plan, scales with usage)
Vercel:         £20     (Pro plan, $20/month)
Anthropic:      £50-150 (based on usage calculations)
Twilio:         £50-200 (SMS costs, varies by volume)
Cal.com:        £0-15   (free tier or pro)
Domain:         £10/year (one-time)

Total: ~£150-450/month operating cost
```

### Revenue (When Selling to Clients)
```
Pricing recommendation:
- Starter:  £99/month  (1 dataset, 1,000 leads)
- Pro:      £299/month (5 datasets, 10,000 leads)
- Enterprise: £999/month (unlimited)

Break-even: 2-3 clients on Pro plan
```

---

## Summary

**What We're Building:**
A revolutionary AI-powered CRM that:
- Automates database reactivation
- Uses AI for conversations (Claude)
- Has an AI coach that improves the AI (Sophie)
- Simple as iPhone, powerful as HighLevel+

**Timeline:** 4 weeks (28 days)
**Confidence:** HIGH - All pieces proven, clear plan
**First Client:** Greenstar Solar (975 leads ready to import)

**Unique Selling Point:**
No competitor has Sophie - the AI that teaches AI.

---

**Ready to build?** ✅

Let's review all the architecture documents and start Week 1, Day 1.

