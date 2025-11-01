# DBR V2 - AI Agent Prompt System

**Project:** Database Reactivation Platform V2
**Created:** 2025-11-01
**Status:** Architecture Complete

---

## Overview

The Prompt System is the **core intelligence layer** of the DBR platform. It defines how the AI agent communicates with leads, handles objections, and achieves campaign goals.

### Key Features:
- ✅ **Q&A Wizard** - Build prompts by answering 10 simple questions
- ✅ **Template Library** - Pre-built prompts for common scenarios
- ✅ **Labeled Sections** - Structured prompt with "WHY" explanations
- ✅ **Sophie Integration** - Lessons automatically update prompts
- ✅ **Version Tracking** - Full history with change summaries
- ✅ **Impact Measurement** - Track performance before/after changes
- ✅ **Copy & Customize** - Reuse successful prompts across datasets

---

## Prompt Creation Methods

### **Method 1: Q&A Wizard** (Recommended for First-Time Users)

Answer 10 questions → AI generates structured prompt

**Questions:**

```
Q1: What product/service are you selling?
   Input: Text area
   Example: "Solar panels and battery storage for UK homes"

Q2: What's your unique selling point?
   Input: Text area
   Example: "25-year warranty, 0% finance, MCS certified installers"

Q3: What's the primary goal?
   Input: Dropdown
   Options: Book survey | Book call | Get quote | Qualify lead | Other
   Example: "Book survey appointment"

Q4: What tone should the AI use?
   Input: Sliders
   - Formality: Casual ←→ Professional
   - Approach: Consultative ←→ Pushy
   Example: Professional + Consultative

Q5: What objections should the AI handle?
   Input: Checkboxes + custom
   - [x] Price/Cost concerns
   - [x] Timing ("Not right now")
   - [x] Already installed
   - [x] Renting property
   - [x] Skepticism about solar
   - [ ] Other: ___________

Q6: What information should the AI gather?
   Input: Checkboxes + custom
   - [x] Property type (house/bungalow/flat)
   - [x] Roof ownership
   - [x] Approximate roof space
   - [x] Current energy bills
   - [x] Installation urgency
   - [ ] Other: ___________

Q7: Company details (for context):
   Input: Form fields
   - Company name: Greenstar Solar
   - Location: Liverpool, UK
   - Website: greenstarsolar.co.uk
   - Years in business: 15
   - Certifications: MCS, NICEIC

Q8: Any specific do's and don'ts?
   Input: Two text areas (Do's | Don'ts)
   Do's:
   - Always mention 25-year warranty
   - Emphasize FREE survey
   - Use UK English spelling

   Don'ts:
   - Don't use emojis
   - Don't quote prices without survey
   - Don't be pushy if they say "not now"

Q9: Example good conversation (optional):
   Input: Text area or skip
   - Paste example conversation
   - OR skip this step

Q10: Booking/Availability details:
   Input: Form fields
   - Booking method: Cal.com link
   - Available days: Monday-Friday
   - Available hours: 9am-5pm
   - Booking lead time: 2 weeks
```

**Output:**
Generates a structured prompt with all sections filled in, ready to review and deploy.

---

### **Method 2: Template Library** (Quick Start)

Choose from pre-built templates:

**1. Solar DBR - Recent Leads (0-3 Months)**
- **Best For:** Leads who inquired within last 3 months
- **Tone:** Warm, familiar
- **Approach:** "Hi [Name], following up on your solar inquiry from [Month]..."
- **Strategy:** More direct, assumes recent interest, aims for quick booking
- **Lessons Included:** 12 (from 200+ successful conversations)

**2. Solar DBR - Old Leads (12+ Months)**
- **Best For:** Dormant database reactivation
- **Tone:** Soft reintroduction
- **Approach:** "Hi [Name], we spoke about solar last year. Lots has changed..."
- **Strategy:** Mentions new incentives, price drops, tech improvements
- **Lessons Included:** 15 (from 300+ reactivations)

**3. Solar DBR - Never Responded (Cold)**
- **Best For:** Cold leads, no previous engagement
- **Tone:** Educational, value-first
- **Approach:** Focuses on benefits, ROI, savings
- **Strategy:** Less pushy, builds interest first
- **Lessons Included:** 10 (from 150+ cold outreach campaigns)

**4. Solar Follow-Up - Quote Sent (Warm)**
- **Best For:** Leads who received quotes but didn't book
- **Tone:** Helpful, consultative
- **Approach:** "Saw you requested a quote. Any questions?"
- **Strategy:** Addresses objections proactively, offers to discuss
- **Lessons Included:** 18 (from 400+ quote follow-ups)

**5. General DBR - Service Business**
- **Best For:** Non-solar businesses (plumbing, HVAC, roofing, etc.)
- **Tone:** Customizable
- **Approach:** Adaptable structure for any service business
- **Lessons Included:** 8 (generic best practices)

**Using a Template:**
1. Select template
2. Customize company details (5-10 fields)
3. Review generated prompt
4. Edit if needed
5. Deploy

---

### **Method 3: Copy Existing Prompt**

- Select any previous prompt
- Duplicate it
- Modify for new dataset
- Keeps lessons, version history references

---

### **Method 4: Manual Creation**

- Start from blank slate
- Build each section manually
- For advanced users who know exactly what they want

---

## Prompt Structure (Labeled Sections)

Every prompt is divided into **labeled sections**. Each section includes:
- **Content** - The actual prompt text
- **Source** - Where it came from (wizard, manual, lesson)
- **WHY** - Explanation of why this section exists

### **Section Breakdown:**

```markdown
# AI Agent Prompt - [Campaign Name]

## [CONTEXT] Company Information
You are an AI assistant representing Greenstar Solar, a UK-based solar panel
installation company with 15 years experience and MCS certification.

[WHY: From wizard Q7 - Company details]

## [GOAL] Primary Objective
Your goal is to book a FREE home survey appointment via our Cal.com booking system.
Secondary goal: Qualify the lead and gather key information about their property.

[WHY: From wizard Q3 - Primary goal]

## [TONE] Communication Style
- Friendly and professional (not casual, not corporate)
- Consultative approach (ask questions, don't push)
- Use UK English (colour, not color; licence, not license)
- NO emojis

[WHY: From wizard Q4 - Tone sliders + Q8 - Don'ts]

## [KNOWLEDGE] Key Information
- 25-year warranty on all installations (industry-leading)
- 0% finance available (subject to credit check)
- MCS certified installers (government-backed scheme)
- Average installation: 2 days (minimal disruption)
- FREE survey, no obligation (emphasis on FREE)

[WHY: From wizard Q2 - Unique selling points]

## [OBJECTION HANDLING] Common Concerns

### Price Objection
Lead says: "I'm worried about the cost"

Response approach:
"I completely understand cost is a concern. That's exactly why we offer a FREE survey
first - no obligation. This allows us to assess your property and give you an accurate
quote based on YOUR specific needs. Many of our customers are also surprised to learn
about our 0% finance options, which make it very affordable. Would a survey this week
or next work better for you?"

[WHY: Lesson #7 - Never discuss price without survey, emphasize FREE assessment]

### Timing Objection
Lead says: "Not the right time" or "Maybe later"

Response approach:
"No problem at all - I completely understand timing is important. We can book your
survey for 2-3 weeks out, or even later if that suits you better. That way, when
you ARE ready, you'll already have your personalized quote and you can move quickly.
Does a survey in [2-3 weeks] work, or would you prefer [later month]?"

[WHY: Lesson #12 - Flexibility increases booking rate by 23%]

### Already Installed
Lead says: "We already have solar panels"

Response approach:
"That's great that you're already benefiting from solar! Are you happy with your current
system? We've recently helped several customers who had older systems upgrade to newer,
more efficient panels - often doubling their energy production. We also specialize in
battery storage additions, which can save another 30-40% on bills. Would you be interested
in a FREE assessment to see if there's any improvement opportunities?"

[WHY: Lesson #22 - Don't end conversation, offer upgrade assessment]

## [INFORMATION GATHERING] Key Questions

Try to naturally gather during conversation:
- Property type: House / Bungalow / Flat / Other
- Roof ownership: Do they own the roof? (Renting = can't install)
- Approximate roof space: Large / Medium / Small
- Current energy bills: Approximate monthly cost
- Installation urgency: When looking to install? (This month, few months, just exploring)

[WHY: Lesson #5 - Property type and roof ownership are survey prerequisites]

## [BOOKING PROCESS] How to Book

1. Confirm interest ("Would you like to book a survey?")
2. Gather basic info (property type, roof ownership, rough timeframe)
3. Check availability: "We have appointments available [date 1], [date 2], or [date 3]. Any of those work for you?"
4. Confirm chosen time: "Perfect, I'll book you in for [date] at [time]"
5. Use Cal.com link to book: [INSERT CAL.COM LINK]
6. Send confirmation: "Great! I've sent you a confirmation SMS with the details and a calendar invite. Looking forward to helping you with your solar journey!"

[WHY: Manual instruction - Standard booking process]

## [BOUNDARIES] What NOT to Do

- ❌ Don't use emojis (reduces response rate by 15%)
- ❌ Don't quote prices without survey (inaccurate, sets wrong expectations)
- ❌ Don't be pushy if they say "not now" (damages brand, low conversion)
- ❌ Don't book appointments outside Mon-Fri 9am-5pm (operational hours)
- ❌ Don't make promises you can't keep (warranty details, installation timelines)
- ❌ Don't continue if they ask to be removed (GDPR compliance, immediate stop)

[WHY: Lesson #1, #3, #8 + Manual rules]

---

Last updated: 2025-11-01
Version: 1.3
Lessons applied: 12
Manual edits: 3
Performance: 16% booking rate (+4% vs previous version)
```

---

## Version Tracking & Change Management

### **Version History View:**

```
📋 Prompt Version 1.3 (LIVE) ⚡
   Performance: 16% booking rate | 127 conversations
   Deployed: 2025-10-28 by Oliver
   ↓
   🆕 Lesson #12 Applied: "Flexibility increases booking rate"
       Changed: [OBJECTION HANDLING] > Timing Objection
       Impact: +4% booking rate (12% → 16%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Prompt Version 1.2
   Performance: 12% booking rate | 116 conversations
   Deployed: 2025-10-15 by Oliver
   ↓
   🆕 Lesson #7 Applied: "Price objection handling"
       Changed: [OBJECTION HANDLING] > Price Objection
       Impact: +2% booking rate (10% → 12%)
   ↓
   ✏️ Manual Edit: Updated company certifications
       Changed: [CONTEXT] > Company Information

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Prompt Version 1.1
   Performance: 10% booking rate | 87 conversations
   Deployed: 2025-10-08 by Oliver
   ↓
   🆕 Lesson #5 Applied: "Property type questions essential"
       Changed: [INFORMATION GATHERING]
       Impact: +2% booking rate (8% → 10%)
   ↓
   🆕 Lesson #3 Applied: "Mention warranty early"
       Changed: [KNOWLEDGE] > Key Information
       Impact: +1% response rate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Prompt Version 1.0 (Original)
   Performance: 8% booking rate | 42 conversations
   Deployed: 2025-10-01 by Oliver
   ↓
   🧙 Generated from Q&A Wizard
```

---

### **Change Summary (When Applying Lesson):**

When Sophie suggests applying a lesson, you see:

```
🆕 Lesson #12: "Flexibility increases booking rate"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION: [OBJECTION HANDLING] > Timing Objection

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE (Version 1.2):
"We can book your survey within the next week if that works for you?"

AFTER (Version 1.3):
"No problem at all - I completely understand timing is important. We can
book your survey for 2-3 weeks out, or even later if that suits you better.
That way, when you ARE ready, you'll already have your personalized quote
and you can move quickly."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REASONING:
Sophie identified that rigid timing reduces bookings. Analysis of 47
conversations showed 23% higher booking rate when offering flexible
timeframes (2-3 weeks instead of "this week").

Supporting data:
- Conversations analyzed: 47
- "This week" approach: 12% booking rate (6/47)
- Flexible approach: 35% booking rate (7/20) in test group
- Statistical significance: p < 0.05 ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPACT TRACKING:
Will track performance for next 30 conversations

Current performance (Version 1.2):
- Booking rate: 12% (14/116 conversations)
- Response rate: 45%
- Average messages to booking: 3.2

Target performance (Version 1.3):
- Booking rate: 15%+ (improvement target)
- Response rate: 45%+ (maintain)
- Average messages to booking: 3.0 (reduce by 1 message)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Save to Draft] [Preview Full Prompt] [Discard Changes]
```

After reviewing:
- **Save to Draft** → Prompt v1.3 created in draft mode
- **Preview** → See full compiled prompt
- **Test** (optional) → Run sample conversations through it
- **Push to Live** → Activates v1.3, archives v1.2

---

## Sophie Integration

### **How Sophie Updates Prompts:**

```
1. Sophie analyzes conversations
   ↓
2. Sophie identifies issue or pattern
   ↓
3. Sophie creates Insight:
   "AI responses are too rigid on timing"
   ↓
4. You review and "Agree & Learn"
   ↓
5. Lesson created:
   Title: "Flexibility increases booking rate"
   Trigger: Timing objection
   Correct response: Offer flexible timeframes
   Reasoning: 23% higher booking rate
   ↓
6. Sophie generates prompt update suggestion:
   - Identifies affected section: [OBJECTION HANDLING]
   - Shows before/after
   - Explains reasoning with data
   ↓
7. You review suggestion:
   - Looks good? Save to Draft
   - Needs tweaking? Edit manually
   - Not right? Dismiss
   ↓
8. If saved to Draft:
   - New version created (v1.3)
   - Change summary generated
   - Impact tracking begins
   ↓
9. Test in draft mode (optional)
   ↓
10. Push to Live when confident
   ↓
11. Sophie tracks impact:
   - Monitors next 30 conversations
   - Compares to previous version
   - Reports: "+4% booking rate improvement ✅"
```

---

## Prompt Editor Modes

### **1. Visual Section Editor** (Recommended)

```
┌─────────────────────────────────────────────────┐
│ [CONTEXT] Company Information                   │
│ ┌───────────────────────────────────────────┐  │
│ │ You are an AI assistant representing...   │  │
│ │                                            │  │
│ │ [Edit Section]                            │  │
│ └───────────────────────────────────────────┘  │
│ WHY: From wizard Q7 - Company details          │
│ SOURCE: Wizard                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ [GOAL] Primary Objective                        │
│ ┌───────────────────────────────────────────┐  │
│ │ Your goal is to book a FREE home...      │  │
│ │                                            │  │
│ │ [Edit Section]                            │  │
│ └───────────────────────────────────────────┘  │
│ WHY: From wizard Q3 - Primary goal             │
│ SOURCE: Wizard                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ [OBJECTION HANDLING] Timing Objection           │
│ ┌───────────────────────────────────────────┐  │
│ │ No problem at all - I completely...       │  │
│ │                                            │  │
│ │ [Edit Section]                            │  │
│ └───────────────────────────────────────────┘  │
│ WHY: Lesson #12 - Flexibility increases rate   │
│ SOURCE: Lesson (Applied 2025-10-28)            │
│ IMPACT: +4% booking rate                        │
└─────────────────────────────────────────────────┘

[Add Section] [Reorder Sections] [Preview Full Prompt]
```

**Benefits:**
- Visual, easy to understand
- See which sections come from lessons
- Edit individual sections without affecting others
- Clear source attribution

---

### **2. Raw Text Editor** (Advanced Users)

```
┌─────────────────────────────────────────────────┐
│ # AI Agent Prompt - Greenstar Solar DBR        │
│                                                  │
│ ## [CONTEXT] Company Information                │
│ You are an AI assistant representing...         │
│                                                  │
│ [WHY: From wizard Q7 - Company details]         │
│                                                  │
│ ## [GOAL] Primary Objective                     │
│ Your goal is to book a FREE home survey...      │
│                                                  │
│ [WHY: From wizard Q3 - Primary goal]            │
│                                                  │
│ ... (full prompt in markdown format)            │
└─────────────────────────────────────────────────┘

[Visual Editor] [Preview] [Save Draft] [Push Live]
```

**Benefits:**
- Full control
- Copy/paste friendly
- Can edit WHY labels
- Advanced users

---

## Testing & Impact Measurement

### **Before Pushing to Live:**

**Option A: Quick Deploy**
- Review changes
- Push to Live immediately
- Sophie tracks impact automatically

**Option B: Test First** (Recommended for major changes)
- Save to Draft
- Test on sample conversations:
  ```
  Input: Lead says "I'm worried about cost"
  AI Response (v1.3): "I completely understand cost is a concern..."

  vs

  AI Response (v1.2): "We have affordable options..."

  Which is better? → v1.3 addresses concern more directly
  ```
- Run 5-10 test scenarios
- If tests pass → Push to Live

---

### **Impact Tracking (Automatic):**

Once deployed, Sophie tracks:

```
📊 Prompt Version 1.3 - Impact Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Deployed: 2025-10-28
Conversations: 127 (target was 30+ for statistical significance ✅)

PERFORMANCE:
Booking rate: 16% (14% target ✅)
  ↑ +4% vs v1.2 (12% → 16%)
  ↑ +8% vs v1.0 (8% → 16%)

Response rate: 47% (45% target ✅)
  ↑ +2% vs v1.2 (45% → 47%)

Avg messages to booking: 2.9 (3.0 target ✅)
  ↓ Reduced from 3.2 in v1.2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SPECIFIC CHANGES TRACKED:
Lesson #12 (Flexibility on timing):
- Applied to 23 conversations with timing objections
- 14/23 booked (61% booking rate on timing objections)
- vs v1.2: 6/19 booked (32% booking rate)
- Improvement: +29% on timing objections ✅✅✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SOPHIE'S VERDICT:
✅ This change is SUCCESSFUL
✅ Keep Lesson #12 in prompt
✅ Recommend this lesson for other solar DBR campaigns

[Keep This Version] [View Conversations] [Apply Lesson to Other Prompts]
```

---

## Prompt Lifecycle

```
1. CREATE PROMPT
   ├─ Wizard (10 questions)
   ├─ Template (choose & customize)
   ├─ Copy existing
   └─ Manual build

2. DRAFT MODE
   ├─ Edit sections
   ├─ Add/remove lessons
   ├─ Preview compiled prompt
   └─ Test (optional)

3. PUSH TO LIVE
   ├─ Becomes active prompt
   ├─ All new conversations use it
   ├─ Previous version archived
   └─ Impact tracking begins

4. SOPHIE ANALYSIS
   ├─ Monitors conversations
   ├─ Identifies improvements
   ├─ Creates insights
   └─ Suggests lessons

5. APPLY LESSONS
   ├─ Review Sophie's suggestions
   ├─ Agree & Learn → New draft version
   ├─ Edit if needed
   └─ Push to Live

6. MEASURE IMPACT
   ├─ Track 30+ conversations
   ├─ Compare to previous version
   ├─ Sophie reports results
   └─ Keep or rollback

7. CONTINUOUS IMPROVEMENT
   └─ Repeat from step 4
```

---

## Multi-Dataset Prompt Management

### **Scenario 1: Same Prompt, Multiple Datasets**

```
Greenstar Solar has 3 datasets:
- "January Batch" (recent leads)
- "Old Database 2023" (12+ months old)
- "Referrals Q4" (warm referrals)

All use Prompt: "Greenstar Master Prompt v2.1"

When you update the prompt:
→ All 3 datasets automatically use new version
→ Impact measured across all datasets
```

### **Scenario 2: Different Prompts Per Dataset**

```
Dataset: "January Batch"
Prompt: "Solar DBR Recent Leads v1.3"

Dataset: "Old Database 2023"
Prompt: "Solar DBR Old Database v2.0"

Dataset: "Referrals Q4"
Prompt: "Solar Referral Follow-Up v1.1"

Each dataset has its own prompt
Each tracked independently
```

### **Scenario 3: Copy & Customize**

```
1. Copy "Solar DBR Recent Leads v1.3"
2. Customize for new dataset:
   - Change company details
   - Adjust tone slightly
   - Keep all lessons
3. Deploy as "New Client DBR v1.0"
4. Sophie tracks performance
5. Lessons learned feed back to template library
```

---

## Best Practices

### **When Creating Your First Prompt:**

1. ✅ **Use the Wizard** - Quickest way to get started
2. ✅ **Start with a Template** - If your use case matches
3. ✅ **Keep it Simple** - You can add complexity later
4. ✅ **Test Before Deploying** - Run sample conversations
5. ✅ **Monitor First 10 Conversations** - Watch Sophie's insights closely

### **When Applying Lessons:**

1. ✅ **Batch Lessons** - Apply 5-10 lessons at once (better than one-by-one)
2. ✅ **Review Full Prompt** - Make sure lessons don't conflict
3. ✅ **Test Major Changes** - If changing objection handling, test it first
4. ✅ **Wait for Statistical Significance** - Don't judge after 5 conversations, wait for 30+
5. ✅ **Roll Back if Needed** - If performance drops, revert to previous version

### **When Editing Manually:**

1. ✅ **Keep WHY Labels** - Future you will thank you
2. ✅ **Document Changes** - Add change reason when saving
3. ✅ **Don't Break Structure** - Maintain section labels
4. ✅ **Test Thoroughly** - Manual edits bypass Sophie's validation
5. ✅ **Save as Draft First** - Don't push directly to live

---

## Advanced Features

### **A/B Testing (V2.2+)**

```
Version A: Current prompt (v1.3)
Version B: Test prompt (v1.4 with new lesson)

Split: 50/50
Duration: 100 conversations or 7 days

Results:
Version A: 16% booking rate (50 conversations)
Version B: 19% booking rate (50 conversations)

Winner: Version B (+3% improvement) → Deploy as v1.5
```

### **Multi-Language Support (V2.3+)**

```
Base Prompt: English (UK)

Translations:
- Spanish (ES)
- Polish (PL)
- Portuguese (PT)

Lessons apply to all languages
Localized objection handling per culture
```

### **Voice Prompt Adaptation (V2.2+)**

```
SMS Prompt → Voice Script

Converts:
- Written tone → Spoken tone
- Text formatting → Pauses and emphasis
- Links → "I'll send you a link after this call"
- Emoji rules → Voice tone guidelines
```

---

## Database Schema Reference

**Prompts table:** Stores all prompt versions
**Prompt_templates table:** System templates + user-created templates
**Prompt_versions table:** Full version history with change tracking
**Lessons table:** Sophie's learning library (referenced in prompts)

See: `DBR_V2_DATABASE_SCHEMA.md` for full schema.

---

## API Endpoints Reference

**GET /api/prompts** - List all prompts for client
**GET /api/prompts/:id** - Get specific prompt with full history
**POST /api/prompts** - Create new prompt (from wizard, template, or manual)
**PATCH /api/prompts/:id** - Update prompt (save draft or push live)
**POST /api/prompts/:id/apply-lesson** - Apply lesson to prompt
**POST /api/prompts/:id/test** - Test prompt with sample conversations
**GET /api/prompts/:id/impact** - Get impact report for prompt version
**POST /api/prompts/:id/rollback** - Revert to previous version

**GET /api/prompt-templates** - List all available templates
**POST /api/prompts/from-wizard** - Create prompt from wizard answers

See: `DBR_V2_API_ROUTES.md` for full API documentation.

---

## UI Components Reference

**PromptWizard** - 10-question wizard flow
**PromptTemplateSelector** - Template library browser
**PromptEditor** - Visual section editor + raw editor
**PromptVersionHistory** - Timeline of versions with change summaries
**PromptChangePreview** - Before/after comparison when applying lessons
**PromptImpactReport** - Performance metrics and Sophie's verdict
**PromptTestRunner** - Test prompt with sample conversations

See: `DBR_V2_COMPONENT_ARCHITECTURE.md` for full component specs.

---

## Conclusion

The Prompt System is designed to be:
- **Easy to start** - Wizard or templates
- **Powerful to scale** - Version tracking, Sophie integration
- **Self-improving** - Lessons automatically enhance prompts
- **Measurable** - Impact tracking shows what works
- **Flexible** - Copy, customize, and reuse successful prompts

**Result:** AI agents that get better over time, not worse.

---

**Next Steps:**
1. Build prompt wizard UI (Week 4, Day 19)
2. Implement template library (Week 4, Day 19)
3. Build version tracking system (Week 4, Day 19)
4. Integrate with Sophie lesson system (Week 4, Day 18)
5. Add impact measurement dashboard (Week 4, Day 21)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-01
**Status:** Ready for Development
