# DBR V2 - Sophie Intelligence System Architecture

**The AI That Teaches AI**

**Project:** Database Reactivation Platform V2
**AI Model:** Claude 3.5 Sonnet (Anthropic)
**Purpose:** Real-time conversation analysis, learning, and AI agent improvement
**Created:** 2025-10-31

---

## 🧠 What is Sophie?

Sophie is an **AI conversation coach** that:
1. **Analyzes** every message in real-time (both AI-generated and lead responses)
2. **Identifies** issues, patterns, and opportunities for improvement
3. **Suggests** lessons based on successful/failed conversations
4. **Learns** from your feedback (agree/disagree/teach)
5. **Evolves** the AI agent's behavior by updating prompts with learned lessons
6. **Monitors** campaign performance and provides insights

**Sophie is NOT the customer-facing AI agent.**
**Sophie is the intelligence layer that IMPROVES the customer-facing AI agent.**

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   SOPHIE INTELLIGENCE                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         REAL-TIME ANALYSIS ENGINE              │    │
│  │                                                 │    │
│  │  ┌──────────────┐     ┌──────────────┐        │    │
│  │  │   Message    │     │ Conversation │        │    │
│  │  │   Analyzer   │────▶│   Analyzer   │        │    │
│  │  └──────────────┘     └──────────────┘        │    │
│  │         │                      │               │    │
│  │         └──────────┬───────────┘               │    │
│  │                    ▼                           │    │
│  │           ┌──────────────┐                     │    │
│  │           │   Pattern    │                     │    │
│  │           │  Recognition │                     │    │
│  │           └──────────────┘                     │    │
│  └────────────────────────────────────────────────┘    │
│                         │                               │
│                         ▼                               │
│  ┌────────────────────────────────────────────────┐    │
│  │          INSIGHT GENERATION                    │    │
│  │                                                 │    │
│  │  • Flag critical issues                        │    │
│  │  • Identify improvement opportunities          │    │
│  │  • Suggest new lessons                         │    │
│  │  • Detect conversation patterns                │    │
│  └────────────────────────────────────────────────┘    │
│                         │                               │
│                         ▼                               │
│  ┌────────────────────────────────────────────────┐    │
│  │           LEARNING SYSTEM                      │    │
│  │                                                 │    │
│  │  User Reviews Insight:                         │    │
│  │  • Agree & Learn → Create lesson               │    │
│  │  • Disagree & Teach → Update understanding     │    │
│  │  • Dismiss → No action                         │    │
│  └────────────────────────────────────────────────┘    │
│                         │                               │
│                         ▼                               │
│  ┌────────────────────────────────────────────────┐    │
│  │           LESSONS LIBRARY                      │    │
│  │                                                 │    │
│  │  • Client-specific lessons                     │    │
│  │  • Universal lessons                           │    │
│  │  • Linked methodology                          │    │
│  │  • Success tracking                            │    │
│  └────────────────────────────────────────────────┘    │
│                         │                               │
│                         ▼                               │
│  ┌────────────────────────────────────────────────┐    │
│  │         PROMPT EVOLUTION                       │    │
│  │                                                 │    │
│  │  Base Prompt + Lessons → Live AI Agent         │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Real-Time Analysis Engine

### **Message Analyzer**

Analyzes EVERY message (AI-generated and lead responses) individually.

**Analysis Criteria:**

```typescript
interface MessageAnalysis {
  message_id: string;

  // Quality Checks
  grammar_score: number; // 0.0 - 1.0
  clarity_score: number; // 0.0 - 1.0
  tone_score: number; // 0.0 - 1.0
  professionalism_score: number; // 0.0 - 1.0

  // Compliance Checks
  compliance_issues: ComplianceIssue[];
  // Examples:
  // - Emojis detected
  // - Unverified claims
  // - Spelling/grammar errors
  // - Blacklisted words used
  // - UK regulation violations

  // Strategic Assessment
  message_intent: 'greeting' | 'qualification' | 'objection_handling' |
                  'info_providing' | 'soft_close' | 'hard_close' | 'nurture';
  intent_achieved: boolean;

  // Call-to-Action Analysis (if applicable)
  cta_present: boolean;
  cta_type: 'soft_close' | 'hard_close' | 'info_request' | 'none';
  cta_effectiveness: number; // 0.0 - 1.0

  // Response Timing (for AI messages)
  response_time: number; // seconds since lead's last message
  timing_appropriateness: 'too_fast' | 'optimal' | 'too_slow';

  // Flags
  severity: 'info' | 'suggestion' | 'warning' | 'critical' | 'urgent';
  requires_immediate_attention: boolean;

  // Recommendations
  suggested_improvements: string[];
  alternative_phrasing?: string;
}
```

**Claude Prompt for Message Analysis:**

```typescript
const messageAnalysisPrompt = `
You are Sophie, an AI conversation coach specializing in UK solar panel sales.

Analyze this message in the context of the conversation:

CONVERSATION CONTEXT:
${conversationHistory}

CURRENT MESSAGE:
From: ${direction}
Content: "${messageContent}"
Type: ${messageType}
Goal: ${conversationGoal}
Lead Status: ${leadStatus}

COMPANY GUIDELINES:
${companyGuidelines}

ANALYZE:
1. Quality (grammar, clarity, tone, professionalism)
2. Compliance (UK regulations, company rules, blacklisted terms)
3. Strategic effectiveness (did it achieve its intent?)
4. Call-to-action (if present, is it appropriate and effective?)
5. Timing (too fast/slow?)

RETURN JSON:
{
  "grammar_score": 0.0-1.0,
  "clarity_score": 0.0-1.0,
  "tone_score": 0.0-1.0,
  "professionalism_score": 0.0-1.0,
  "compliance_issues": [
    {
      "issue": "emoji_detected",
      "severity": "warning",
      "description": "Emoji (😊) used - against UK professional standards"
    }
  ],
  "intent_achieved": true/false,
  "cta_effectiveness": 0.0-1.0,
  "timing_appropriateness": "optimal",
  "severity": "info",
  "requires_immediate_attention": false,
  "suggested_improvements": [
    "Remove emoji and use friendly language instead",
    "Consider mentioning 25-year warranty"
  ],
  "alternative_phrasing": "Excellent! I'm delighted to help you..."
}
`;
```

---

### **Conversation Analyzer**

Analyzes the ENTIRE conversation thread as a whole.

**Analysis Criteria:**

```typescript
interface ConversationAnalysis {
  conversation_id: string;

  // Overall Quality
  conversation_quality_score: number; // 0.0 - 1.0
  engagement_level: 'high' | 'medium' | 'low';

  // Flow Assessment
  conversation_flow: 'natural' | 'choppy' | 'stalled' | 'escalating';
  pacing: 'too_fast' | 'optimal' | 'too_slow';

  // Goal Progress
  primary_goal: 'book_call';
  goal_progress: number; // 0.0 - 1.0
  goal_achieved: boolean;
  barriers_to_goal: string[]; // ["price_objection", "timing_concern"]

  // Qualification Assessment
  qualification_completeness: number; // 0.0 - 1.0
  info_gathered: {
    budget?: string;
    timeline?: string;
    property_type?: string;
    decision_maker?: boolean;
  };
  missing_qualification_data: string[];

  // Objection Handling
  objections_raised: Objection[];
  objections_addressed: number;
  objections_resolved: number;
  unaddressed_objections: Objection[];

  // AI Behavior Assessment
  ai_messages_count: number;
  soft_closes_attempted: number;
  hard_closes_attempted: number;
  questions_asked: number;
  info_provided_instances: number;

  // Lead Behavior
  lead_messages_count: number;
  lead_sentiment_progression: string[]; // ["neutral", "positive", "questioning", "hot"]
  lead_engagement_score: number; // 0.0 - 1.0
  lead_response_time_avg: number; // seconds

  // Pattern Recognition
  success_patterns: string[]; // What worked well
  failure_patterns: string[]; // What didn't work

  // Strategic Recommendations
  suggested_next_action: 'soft_close' | 'hard_close' | 'address_objection' |
                         'gather_info' | 'nurture' | 'escalate_to_human';
  confidence_level: number; // 0.0 - 1.0

  // Lessons Identified
  potential_lessons: PotentialLesson[];
}
```

**Claude Prompt for Conversation Analysis:**

```typescript
const conversationAnalysisPrompt = `
You are Sophie, analyzing a complete conversation for a UK solar company.

FULL CONVERSATION:
${fullConversationThread}

CONTEXT:
Lead: ${leadName}
Initial Message: ${initialMessageType} (M1/M2/M3)
Current Status: ${currentStatus}
Goal: ${primaryGoal}

COMPANY KNOWLEDGE:
${companyInfo}
${lessonsLibrary}

ANALYZE:
1. Overall conversation quality and flow
2. Goal progress and barriers
3. Qualification completeness
4. Objection handling effectiveness
5. AI behavior (too pushy? too passive?)
6. Lead engagement and sentiment
7. Patterns (what worked, what didn't)
8. Strategic next steps

IDENTIFY LESSONS:
- What strategies worked?
- What should be avoided?
- Are there patterns worth learning from?

RETURN DETAILED JSON WITH ALL FIELDS ABOVE.
`;
```

---

### **Pattern Recognition**

Identifies patterns across MULTIPLE conversations.

**Pattern Types:**

```typescript
interface Pattern {
  pattern_id: string;
  pattern_type: 'success' | 'failure' | 'neutral';

  // What is the pattern?
  pattern_description: string;
  // Example: "When AI mentions 25-year warranty early, conversion rate is 40% higher"

  // Evidence
  occurrences: number;
  success_rate: number; // 0.0 - 1.0
  sample_conversation_ids: string[];

  // Context
  applies_to_stages: string[]; // ['initial_contact', 'objection_handling', 'closing']
  applies_to_objections?: string[]; // ['price', 'timing']

  // Impact
  impact_on_conversion: number; // -1.0 to 1.0
  statistical_significance: number; // 0.0 - 1.0

  // Recommendation
  recommended_action: 'adopt' | 'avoid' | 'test_more';
  suggested_lesson?: string;
}
```

**Examples of Patterns Sophie Identifies:**

```typescript
// SUCCESS PATTERN
{
  pattern_description: "Mentioning '£1200/year savings' in response to price objections results in 65% positive response",
  occurrences: 23,
  success_rate: 0.65,
  applies_to_objections: ['price'],
  impact_on_conversion: 0.42,
  recommended_action: 'adopt',
  suggested_lesson: "When lead mentions price concern, always quantify annual savings"
}

// FAILURE PATTERN
{
  pattern_description: "Using technical terms like 'photovoltaic cells' in M1 leads to 30% lower reply rate",
  occurrences: 157,
  success_rate: 0.12, // reply rate
  applies_to_stages: ['initial_contact'],
  impact_on_conversion: -0.18,
  recommended_action: 'avoid',
  suggested_lesson: "Use simple language in M1: 'solar panels' not 'photovoltaic cells'"
}

// TIMING PATTERN
{
  pattern_description: "AI responses sent within 60 seconds get 2.3x more engagement",
  occurrences: 892,
  success_rate: 0.78,
  impact_on_conversion: 0.31,
  recommended_action: 'adopt'
}
```

---

## 2. Insight Generation

Sophie generates **actionable insights** that require human review.

### **Insight Severity Levels**

```typescript
type InsightSeverity =
  | 'critical'   // Immediate action required (compliance violation, major error)
  | 'urgent'     // Important (hot lead not closed, opportunity missed)
  | 'warning'    // Should address (tone issue, minor error)
  | 'suggestion' // Nice to have (phrasing improvement)
  | 'info';      // FYI (pattern observed, success noted)
```

### **Insight Structure**

```typescript
interface SophieInsight {
  id: string;
  created_at: string;

  // Severity & Classification
  severity: InsightSeverity;
  category: 'compliance' | 'tone' | 'grammar' | 'strategy' | 'timing' |
            'objection_handling' | 'qualification' | 'closing' | 'pattern';

  // What Sophie Found
  title: string; // "Emoji Used in Professional Context"
  description: string; // Full explanation

  // Where It Occurred
  insight_type: 'message' | 'conversation' | 'campaign' | 'pattern';
  message_id?: string;
  conversation_id?: string;
  dataset_id?: string;

  // Impact Assessment
  affected_leads_count: number;
  potential_impact: 'high' | 'medium' | 'low';

  // The Issue
  original_text?: string; // What was said
  context?: string; // Why it's an issue

  // The Solution
  suggested_text?: string; // What should be said
  suggested_action?: string; // What to do
  reasoning: string; // Why this is better

  // Related Knowledge
  related_lesson_id?: string;
  related_pattern_id?: string;

  // User Response
  status: 'pending' | 'viewed' | 'approved_and_learned' |
          'dismissed' | 'taught_sophie';
  reviewed_by?: string;
  reviewed_at?: string;
  user_feedback?: string; // User's explanation when teaching Sophie

  // If Approved
  lesson_created_id?: string;
  applied_at?: string;
  impact_measured?: number; // Did it actually improve things?
}
```

### **Real-Time Notification Rules**

```typescript
// CRITICAL - Instant notification (email + in-app + SMS)
if (severity === 'critical') {
  sendNotification({
    channels: ['email', 'in_app', 'sms'],
    priority: 'immediate',
    title: 'CRITICAL: Compliance Issue Detected',
    message: insight.description
  });
}

// URGENT - Instant in-app + email
if (severity === 'urgent') {
  sendNotification({
    channels: ['email', 'in_app'],
    priority: 'immediate',
    title: 'Hot Lead Opportunity',
    message: insight.description
  });
}

// WARNING - In-app notification
if (severity === 'warning') {
  sendNotification({
    channels: ['in_app'],
    priority: 'normal',
    title: 'Sophie Suggestion',
    message: insight.title
  });
}

// SUGGESTION & INFO - Dashboard badge only
// (No active notification, just visible in Sophie dashboard)
```

---

## 3. Learning System

### **Review Workflow**

```
Sophie Generates Insight
         ↓
User Reviews in Dashboard
         ↓
    ┌────┴────┐
    │ OPTIONS │
    └────┬────┘
         │
    ┌────┼────────┐
    │    │        │
    ▼    ▼        ▼
 AGREE DISAGREE DISMISS
```

---

### **Option 1: Agree & Learn**

**User Action:** "Yes Sophie, you're right. Let's learn from this."

**Flow:**
1. User clicks "Agree & Learn"
2. Modal opens: "Why is this correct?"
3. User provides explanation/context
4. System creates new lesson in library
5. Lesson is tagged with:
   - Source: This insight
   - Category: Auto-detected from insight
   - Priority: Based on impact
6. Lesson becomes available for prompt injection
7. Insight marked as `approved_and_learned`

**Example:**

```typescript
// Sophie's Insight
{
  title: "Emoji Detected",
  description: "The AI used 😊 emoji in response, which violates UK professional communication standards",
  original_text: "Great! 😊 I'm happy to help...",
  suggested_text: "Excellent! I'm delighted to help...",
  severity: 'warning',
  category: 'compliance'
}

// User: Agree & Learn
// User provides context: "Emojis are too informal for our target demographic (homeowners 45+)"

// Created Lesson
{
  lesson_type: 'never_rule',
  title: "Never Use Emojis in Professional Sales",
  description: "Emojis are too informal for target demographic (homeowners 45+)",
  trigger: "any_message",
  correct_response: "Use enthusiastic language instead",
  incorrect_response: "Messages with emojis 😊 🎉 etc.",
  reasoning: "UK professional standards, target demographic preference",
  tags: ['compliance', 'tone', 'UK', 'professionalism'],
  priority: 8,
  status: 'active'
}
```

---

### **Option 2: Disagree & Teach**

**User Action:** "No Sophie, you're wrong. Here's why..."

**Flow:**
1. User clicks "Disagree & Teach"
2. Modal opens: "Teach Sophie"
3. User explains:
   - Why Sophie is wrong
   - What the correct understanding is
   - Optionally: Provide correct example
4. System creates **negative lesson** (what NOT to do)
5. Sophie's understanding is updated
6. Insight marked as `taught_sophie`

**Example:**

```typescript
// Sophie's Insight
{
  title: "Response Too Long",
  description: "AI response is 180 characters. Recommend max 160 (SMS length)",
  original_text: "Thanks for your interest! Solar panels can save you £1200/year on energy bills. Our team has 35 years experience and we offer a 25-year warranty. Would you like to book a call?",
  suggested_text: "Thanks! Solar saves £1200/year. 25-year warranty. Book a call?",
  severity: 'suggestion'
}

// User: Disagree & Teach
// User's feedback: "Longer messages are fine for conversational AI SMS. We're not limited by SMS length anymore. Quality > brevity."

// Created Lesson (Negative Example)
{
  lesson_type: 'dos_donts',
  title: "Message Length: Quality Over Brevity",
  description: "DO provide complete, helpful information. DON'T sacrifice clarity for character count.",
  trigger: "sophie_suggests_shortening",
  correct_response: "Conversational AI messages should be thorough and helpful",
  incorrect_response: "Cutting messages to arbitrary character limits",
  reasoning: "Modern SMS supports longer messages. Quality communication more important than brevity.",
  tags: ['messaging', 'communication', 'sophie_correction'],
  priority: 5,
  status: 'active'
}

// Sophie's Internal Note
{
  correction_learned: "Do not flag message length unless genuinely unclear or rambling. SMS character limits not relevant for conversational AI."
}
```

---

### **Option 3: Dismiss**

**User Action:** "Not relevant / Not important / False positive"

**Flow:**
1. User clicks "Dismiss"
2. Insight marked as `dismissed`
3. No lesson created
4. Sophie tracks dismissal rate for this insight type
5. If >80% of similar insights dismissed → Sophie stops generating them

**Sophie's Learning:**
```typescript
if (dismissalRate > 0.8 && occurrences > 10) {
  adjustSensitivity({
    category: insight.category,
    trigger: insight.title,
    action: 'reduce_sensitivity'
  });

  // Example: If 9/10 "Response Time Slow" insights are dismissed,
  // Sophie learns that response time of 2-3 minutes is acceptable
}
```

---

## 4. Lessons Library

### **Lesson Types**

```typescript
type LessonType =
  | 'objection_handling'  // How to address specific objections
  | 'dos_donts'           // General rules (do this, don't do that)
  | 'example_good'        // Successful conversation examples
  | 'example_bad'         // Failed conversation examples
  | 'blacklist_word'      // Words to never use
  | 'never_rule'          // Absolute rules (never use emojis)
  | 'best_practice'       // Recommended approaches
  | 'uk_specific'         // UK cultural/regulatory requirements
  | 'company_specific';   // Client-specific info (Greenstar products)
```

### **Lesson Structure**

```typescript
interface Lesson {
  id: string;
  created_at: string;
  updated_at: string;

  // Ownership
  client_id: string; // Greenstar, Company B, etc.
  scope: 'client_specific' | 'universal';
  // client_specific: Only for this client
  // universal: Applies to all clients (UK regs, general sales best practices)

  // Classification
  lesson_type: LessonType;
  category: 'compliance' | 'tone' | 'strategy' | 'objection' | 'qualification' | 'closing';

  // Content
  title: string;
  description: string;

  // The Actual Learning
  trigger: string; // When does this lesson apply?
  // Examples:
  // - "lead_mentions_price"
  // - "initial_message_m1"
  // - "objection_timing"
  // - "any_message"

  correct_response?: string; // What SHOULD be done/said
  incorrect_response?: string; // What should NOT be done/said
  reasoning: string; // Why this is right/wrong

  // Examples
  example_conversation?: {
    messages: Array<{
      from: 'ai' | 'lead';
      content: string;
      annotation?: string; // Why this message is good/bad
    }>;
  };

  // Context & Metadata
  tags: string[]; // ['pricing', 'objection', 'UK', 'greenstar']
  priority: number; // 1-10, higher = more important

  // Linked Lessons
  related_lesson_ids: string[]; // Lessons that work together
  supersedes_lesson_id?: string; // This replaces an older lesson

  // Usage & Performance
  times_applied: number; // How often this lesson influenced AI responses
  success_rate: number; // 0.0 - 1.0 (when applied, how often did it work?)
  conversations_influenced: string[]; // conversation_ids

  // Source
  source: 'sophie_suggestion' | 'user_taught' | 'pattern_recognition' | 'imported';
  source_insight_id?: string;
  source_conversation_id?: string;
  created_by: string; // user_id

  // Status
  status: 'active' | 'archived' | 'testing';
  // testing: A/B test this lesson
  test_results?: {
    conversations_with: number;
    conversations_without: number;
    success_rate_with: number;
    success_rate_without: number;
  };
}
```

### **Example Lessons**

**1. Objection Handling: Price**

```typescript
{
  lesson_type: 'objection_handling',
  title: "Price Objection: Quantify Annual Savings",
  description: "When lead mentions price is high, immediately quantify annual savings in pounds",

  trigger: "lead_mentions_price_high",

  correct_response: "I understand. Let's look at the savings: a typical installation saves £1,200/year on energy bills. That's £30,000 over 25 years, making the £7,000 investment very worthwhile.",

  incorrect_response: "It's worth it though! / Quality costs money / You get what you pay for",

  reasoning: "UK homeowners respond better to concrete numbers than vague value statements. Showing ROI calculation makes the price tangible and justifiable.",

  example_conversation: {
    messages: [
      { from: 'lead', content: "That's quite expensive though" },
      { from: 'ai', content: "I understand. Let's look at the savings: a typical 6kW system saves £1,200/year. That's £30,000 over 25 years, making the £7,000 investment very worthwhile.", annotation: "GOOD: Specific numbers, ROI calculation" },
      { from: 'lead', content: "Oh that actually makes sense" }
    ]
  },

  tags: ['objection', 'price', 'savings', 'ROI'],
  priority: 9,
  success_rate: 0.72
}
```

**2. Never Rule: Emojis**

```typescript
{
  lesson_type: 'never_rule',
  title: "Never Use Emojis",
  description: "Emojis are too informal for UK professional sales context. Use enthusiastic language instead.",

  trigger: "any_message",

  correct_response: "Excellent! / Delighted to help / That's wonderful",
  incorrect_response: "Great! 😊 / Perfect! 🎉 / Thanks! 👍",

  reasoning: "Target demographic (homeowners 45-65) perceive emojis as unprofessional. UK business culture favors formal communication.",

  tags: ['compliance', 'tone', 'UK', 'professionalism'],
  priority: 10,
  status: 'active'
}
```

**3. Best Practice: Early Warranty Mention**

```typescript
{
  lesson_type: 'best_practice',
  title: "Mention 25-Year Warranty Early",
  description: "Mentioning the warranty in first 2-3 messages increases trust and conversion by 40%",

  trigger: "initial_engagement",

  correct_response: "All our installations come with a 25-year performance guarantee, so you're covered for decades.",

  reasoning: "Pattern recognition shows early warranty mention correlates with 40% higher conversion. It addresses unspoken trust concerns before they become objections.",

  example_conversation: {
    messages: [
      { from: 'lead', content: "Tell me more" },
      { from: 'ai', content: "Our solar panels come with a 25-year performance guarantee. They're installed by MCS-certified engineers with 35 years combined experience.", annotation: "GOOD: Warranty + credentials early" },
      { from: 'lead', content: "That sounds solid" }
    ]
  },

  tags: ['trust', 'warranty', 'early_mention', 'conversion'],
  priority: 8,
  source: 'pattern_recognition',
  success_rate: 0.83
}
```

**4. Company-Specific: Greenstar Products**

```typescript
{
  lesson_type: 'company_specific',
  scope: 'client_specific',
  client_id: 'greenstar_uuid',

  title: "Greenstar Product Knowledge",
  description: "Key products and specifications to reference when relevant",

  trigger: "lead_asks_about_products",

  correct_response: "We install AIKO Neostar 3S54 panels (460W each), paired with FoxESS or Sigenergy batteries. Our typical 6kW system has 13 panels and generates 6,000 kWh/year.",

  reasoning: "Specific product names and specs build credibility and demonstrate expertise",

  tags: ['greenstar', 'products', 'specifications'],
  priority: 7,
  status: 'active'
}
```

### **Lesson Linking & Methodology Evolution**

Lessons don't exist in isolation - they **link together** to form a conversation methodology.

```typescript
interface LessonNetwork {
  // Primary Lesson
  lesson_id: string;

  // What lessons work well with this one?
  synergistic_lessons: Array<{
    lesson_id: string;
    synergy_score: number; // 0.0 - 1.0
    // Example: "Price objection" + "ROI calculation" = 0.92 synergy
  }>;

  // What lessons conflict with this one?
  conflicting_lessons: Array<{
    lesson_id: string;
    conflict_reason: string;
  }>;

  // Conversation flow
  typical_sequence: string[]; // lesson_ids in typical order
  // Example: [warranty_mention, qualification, objection_handling, soft_close]
}
```

**Sophie learns conversation "recipes":**

```typescript
// Recipe: High-Intent Lead (replied to M1 positively)
const highIntentRecipe = {
  stage_1: ['greeting_enthusiastic', 'early_warranty_mention'],
  stage_2: ['qualification_budget', 'qualification_timeline'],
  stage_3: ['soft_close'],
  stage_4: ['hard_close_if_qualified']
};

// Recipe: Price-Sensitive Lead
const priceSensitiveRecipe = {
  stage_1: ['acknowledge_concern'],
  stage_2: ['roi_calculation', 'savings_quantification'],
  stage_3: ['warranty_mention_reassurance'],
  stage_4: ['soft_close_with_payment_options']
};

// Sophie tracks which recipes work best for which lead types
```

---

## 5. Prompt Evolution

### **Base Prompt Structure**

```typescript
const basePrompt = `
You are an AI sales assistant for ${companyName}, a UK solar panel installation company.

YOUR ROLE:
- Help leads understand the benefits of solar energy
- Answer questions about products, pricing, and installation
- Address objections professionally
- Guide leads toward booking a consultation call

YOUR PERSONALITY:
- Professional but friendly
- Knowledgeable about solar technology
- Patient and helpful
- British English (colour, favour, etc.)
- Never pushy or aggressive

COMPANY INFORMATION:
${companyInfo}

CURRENT CONVERSATION CONTEXT:
Lead Name: ${leadName}
Lead Status: ${leadStatus}
Conversation Goal: ${conversationGoal}
Previous Messages: ${conversationHistory}

${lessonsLibrary}

INSTRUCTIONS:
${dynamicInstructions}
`;
```

### **Lessons Injection**

When user clicks "Make Prompt Live", lessons are injected:

```typescript
function generateLivePrompt(clientId: string, promptType: string) {
  const basePrompt = getBasePrompt(clientId, promptType);
  const activeLessons = getLessons({
    client_id: clientId,
    status: 'active',
    scope: ['client_specific', 'universal']
  });

  // Group lessons by category
  const neverRules = activeLessons.filter(l => l.lesson_type === 'never_rule');
  const objectionHandling = activeLessons.filter(l => l.lesson_type === 'objection_handling');
  const bestPractices = activeLessons.filter(l => l.lesson_type === 'best_practice');

  // Build lessons section
  const lessonsSection = `
COMPANY GUIDELINES (CRITICAL - ALWAYS FOLLOW):

NEVER DO:
${neverRules.map(l => `- ${l.title}: ${l.description}`).join('\n')}

WHEN LEAD MENTIONS OBJECTIONS:
${objectionHandling.map(l => `
- ${l.trigger}: ${l.correct_response}
  Reasoning: ${l.reasoning}
`).join('\n')}

BEST PRACTICES:
${bestPractices.map(l => `- ${l.title}: ${l.description}`).join('\n')}

SUCCESS PATTERNS:
${getSuccessPatterns(clientId).map(p => `- ${p.description}`).join('\n')}
`;

  return basePrompt + '\n\n' + lessonsSection;
}
```

### **Prompt Versioning**

Every time prompt is updated:

```typescript
interface PromptVersion {
  id: string;
  version: number;
  created_at: string;

  prompt_text: string; // Full generated prompt
  lessons_included: string[]; // lesson_ids
  lessons_count: number;

  // What changed?
  changes_from_previous: {
    lessons_added: string[];
    lessons_removed: string[];
    base_prompt_changed: boolean;
  };

  // Performance tracking
  conversations_using_this_version: number;
  success_rate: number; // 0.0 - 1.0
  avg_messages_to_booking: number;

  is_active: boolean;
  made_live_at: string;
  made_live_by: string; // user_id
}
```

### **A/B Testing (Future)**

```typescript
// Test new prompt version against current
const abTest = {
  test_id: string;
  version_a: promptVersionId; // Current (control)
  version_b: promptVersionId; // New (test)

  split: 0.5; // 50/50 split

  // Metrics to track
  metrics: {
    reply_rate: { a: 0.12, b: 0.15 },
    booking_rate: { a: 0.08, b: 0.11 },
    avg_messages: { a: 8.2, b: 6.5 }
  },

  winner: 'version_b',
  confidence: 0.95
};
```

---

## 6. Sophie's Dashboard UI

### **Main Sophie Dashboard**

```
┌─────────────────────────────────────────────────┐
│  🧠 Sophie Intelligence Dashboard               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  INSIGHTS OVERVIEW                              │
│                                                 │
│  ⚠️ Critical: 2        🔴 Urgent: 5            │
│  ⚡ Warning: 12        💡 Suggestion: 28        │
│                                                 │
│  [View All Pending Insights]                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  PENDING REVIEW (Most Recent)                   │
│                                                 │
│  ⚠️ CRITICAL - Compliance Violation             │
│  AI made unverified claim about savings         │
│  Affects: 1 lead                                │
│  [Review] [Auto-Dismiss Future]                 │
│  ────────────────────────────────────────────── │
│                                                 │
│  🔴 URGENT - Hot Lead Not Closed                │
│  Lead expressed interest but AI didn't attempt  │
│  booking. Conversation stalled.                 │
│  Affects: 1 lead (John Smith)                   │
│  [Review] [View Conversation]                   │
│  ────────────────────────────────────────────── │
│                                                 │
│  ⚡ WARNING - Emoji Detected                    │
│  AI used "😊" in response to lead               │
│  Affects: 1 lead                                │
│  [Agree & Learn] [Disagree] [Dismiss]          │
│  ────────────────────────────────────────────── │
│                                                 │
│  💡 SUGGESTION - Pattern Detected               │
│  Mentioning warranty in M1 increases reply rate │
│  Evidence: 47 conversations                     │
│  [Create Lesson] [View Details]                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  LESSONS LIBRARY                                │
│                                                 │
│  📚 Total Lessons: 47                           │
│  ✅ Active: 42  |  🧪 Testing: 3  |  📦 Archived: 2 │
│                                                 │
│  [Search Lessons]  [Add Manual Lesson]          │
│  [View All]  [Export Library]                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  PROMPT MANAGEMENT                              │
│                                                 │
│  Current Version: 12                            │
│  Last Updated: 2 hours ago                      │
│  Lessons Included: 42                           │
│  Success Rate: 14.2% (booking rate)             │
│                                                 │
│  [Edit Prompt]  [View Lessons]  [Make Live]     │
│  [Version History]  [Performance Comparison]    │
└─────────────────────────────────────────────────┘
```

---

## 7. Integration with Main System

### **Data Flow**

```
Message Sent/Received
       ↓
Stored in Database (messages table)
       ↓
Trigger: Sophie Analysis (async)
       ↓
Claude API Call (message + conversation context)
       ↓
Analysis Result Stored (message_analysis table)
       ↓
If Significant Issue Found
       ↓
Create Insight (sophie_insights table)
       ↓
If Critical/Urgent → Send Notification
       ↓
Dashboard Updates (real-time via Supabase)
       ↓
User Reviews Insight
       ↓
Agree/Disagree/Dismiss
       ↓
Create/Update Lesson (if agreed/taught)
       ↓
Prompt Updated (next time user clicks "Make Live")
       ↓
AI Agent Behavior Improves
```

### **API Routes**

```typescript
// Sophie analysis endpoints
POST /api/sophie/analyze-message
POST /api/sophie/analyze-conversation
POST /api/sophie/detect-patterns

// Insights management
GET  /api/sophie/insights
POST /api/sophie/insights/:id/agree
POST /api/sophie/insights/:id/disagree
POST /api/sophie/insights/:id/dismiss

// Lessons management
GET  /api/sophie/lessons
POST /api/sophie/lessons
PUT  /api/sophie/lessons/:id
DELETE /api/sophie/lessons/:id

// Prompt management
GET  /api/sophie/prompts/:type
PUT  /api/sophie/prompts/:type
POST /api/sophie/prompts/:type/make-live

// Performance tracking
GET  /api/sophie/impact-report
GET  /api/sophie/lesson-performance
```

---

## 8. Performance & Cost

### **Claude API Usage**

**Message Analysis:**
- Input: ~1,000 tokens (conversation context + message)
- Output: ~500 tokens (JSON analysis)
- Cost: $0.003 per message analyzed

**Conversation Analysis:**
- Input: ~5,000 tokens (full thread)
- Output: ~1,500 tokens (comprehensive analysis)
- Cost: $0.015 per conversation

**Pattern Recognition (Batch):**
- Input: ~20,000 tokens (100 conversations summary)
- Output: ~2,000 tokens (patterns identified)
- Cost: $0.06 per batch

**Monthly Cost Estimate (1,000 leads/month):**
- 1,000 M1 messages × $0.003 = $3
- 120 replies (12% reply rate) × $0.003 = $0.36
- 500 AI responses × $0.003 = $1.50
- 120 conversation analyses × $0.015 = $1.80
- 10 pattern recognition batches × $0.06 = $0.60

**Total: ~$7.26/month for 1,000 leads**

Scales linearly. 10,000 leads = ~$73/month.

**Very affordable.**

---

## 9. Key Success Metrics

### **Sophie's Effectiveness**

```typescript
interface SophieMetrics {
  // Insight Quality
  insights_generated: number;
  insights_approved: number; // User agreed
  insights_dismissed: number;
  approval_rate: number; // approved / total

  // Learning Progress
  lessons_created: number;
  lessons_from_sophie: number; // Sophie suggested
  lessons_from_user: number; // User taught Sophie
  lessons_active: number;

  // Impact on AI Performance
  baseline_booking_rate: number; // Before Sophie
  current_booking_rate: number; // With Sophie's lessons
  improvement: number; // % increase

  // Pattern Recognition
  patterns_identified: number;
  patterns_adopted_as_lessons: number;

  // User Engagement
  avg_review_time: number; // How long to review insights
  insights_pending: number;
}
```

---

## 10. Future Enhancements

### **Phase 2 Features**

1. **Automatic Lesson Creation**
   - Sophie creates lessons without approval (after high confidence threshold)
   - Toggle: Manual review vs Auto-apply

2. **Multi-Client Learning**
   - Universal lessons learned from Client A can benefit Client B
   - Privacy-preserving pattern sharing

3. **Conversation Prediction**
   - Sophie predicts conversation outcome after 3 messages
   - Suggests intervention if heading toward failure

4. **Real-Time Coaching**
   - Sophie suggests response improvements BEFORE sending
   - "Try mentioning warranty here" overlay in UI

5. **Voice of Customer Analysis**
   - Analyze lead language patterns
   - Identify emerging objections/concerns
   - Market intelligence gathering

---

## Summary: Why Sophie is Unique

**No other CRM has this:**

1. **Real-time AI coaching** - Every message analyzed as it happens
2. **Self-improving system** - AI that makes AI better
3. **Human-in-the-loop learning** - You teach, Sophie learns, everyone benefits
4. **Conversation methodology evolution** - Lessons link together into proven playbooks
5. **Pattern recognition at scale** - Identifies what works across thousands of conversations

**Sophie is the competitive advantage.**

---

**Next:** API Routes Documentation → Build Plan → Start Building

