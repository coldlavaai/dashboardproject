# DBR V2 - Complete API Routes Documentation

**Project:** Database Reactivation Platform V2
**Framework:** Next.js 14 API Routes
**Database:** Supabase (PostgreSQL)
**Created:** 2025-10-31

---

## API Architecture Overview

```
app/api/
├── auth/              # Authentication (Supabase Auth)
├── datasets/          # Dataset management
├── leads/             # Lead management
├── conversations/     # Conversation threads
├── messages/          # Individual messages
├── campaigns/         # M1/M2/M3 automation
├── sophie/            # Sophie intelligence
├── webhooks/          # External integrations
├── analytics/         # Reporting & metrics
├── users/             # User management
├── settings/          # Client settings
└── cron/              # Scheduled jobs (Vercel Cron)
```

---

## Authentication Routes

### **Powered by Supabase Auth**

Supabase handles authentication automatically. We just need to configure:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**Client-side authentication:**
```typescript
// User signs in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

**Row Level Security automatically enforces access control.**

---

## Dataset Routes

### **GET /api/datasets**

Get all datasets for current user's client.

**Auth:** Required
**Permissions:** Any authenticated user

**Query Parameters:**
```typescript
{
  status?: 'draft' | 'active' | 'paused' | 'completed'; // Filter by status
  sort?: 'created' | 'name' | 'leads_count'; // Sort by
  order?: 'asc' | 'desc';
}
```

**Response:**
```typescript
{
  datasets: Array<{
    id: string;
    name: string;
    description: string;
    total_leads: number;
    hot_leads: number;
    converted_leads: number;
    campaign_status: string;
    created_at: string;
    updated_at: string;
  }>;
}
```

---

### **GET /api/datasets/[id]**

Get single dataset details.

**Auth:** Required
**Permissions:** User must belong to dataset's client

**Response:**
```typescript
{
  dataset: {
    id: string;
    name: string;
    description: string;
    source: string;
    uploaded_file_url: string;
    total_leads: number;
    active_leads: number;
    hot_leads: number;
    converted_leads: number;
    campaign_status: string;
    campaign_start_date: string;
    campaign_end_date: string;
    created_at: string;
    updated_at: string;
  };
}
```

---

### **POST /api/datasets**

Create new dataset (without leads - just metadata).

**Auth:** Required
**Permissions:** User with dataset creation permission

**Body:**
```typescript
{
  name: string; // Required
  description?: string;
  campaign_start_date?: string; // ISO 8601
}
```

**Response:**
```typescript
{
  dataset: {
    id: string;
    name: string;
    campaign_status: 'draft';
    created_at: string;
  };
}
```

---

### **POST /api/datasets/upload**

Upload CSV file to Supabase Storage.

**Auth:** Required
**Content-Type:** multipart/form-data

**Body:**
```typescript
FormData {
  file: File; // CSV file
  dataset_id?: string; // Optional: attach to existing dataset
}
```

**Flow:**
1. Validate file type (CSV only)
2. Upload to Supabase Storage (bucket: `csv_uploads`)
3. Parse CSV headers
4. Detect column types
5. Return preview + upload record

**Response:**
```typescript
{
  upload: {
    id: string;
    filename: string;
    file_url: string; // Supabase Storage URL
    rows_detected: number;
    columns: Array<{
      name: string;
      sample_values: string[]; // First 3 values
      suggested_mapping?: 'first_name' | 'last_name' | 'phone_number' | ...;
    }>;
  };
}
```

---

### **POST /api/datasets/map-and-import**

Map CSV columns and import leads into dataset.

**Auth:** Required

**Body:**
```typescript
{
  upload_id: string; // From upload endpoint
  dataset_id: string;
  column_mapping: {
    first_name: string; // CSV column name
    last_name?: string;
    phone_number: string; // Required
    email?: string;
    postcode?: string;
    inquiry_date?: string;
    notes?: string;
  };
  campaign_settings?: {
    m1_delay_hours: number; // Default: 0 (send immediately)
    m2_delay_hours: number; // Default: 48
    m3_delay_hours: number; // Default: 96
    ai_response_delay_seconds: number; // Default: 60
  };
}
```

**Flow:**
1. Validate column mapping
2. Read CSV from Storage
3. Parse and normalize data:
   - Phone numbers → +44 format
   - Dates → ISO 8601
   - Remove duplicates
4. Batch insert into `leads` table (100 at a time)
5. Update dataset stats
6. Schedule M1 campaign (if campaign_status = 'active')

**Response:**
```typescript
{
  success: true;
  imported: {
    total_rows: number;
    successful: number;
    failed: number;
    duplicates: number;
  };
  dataset_id: string;
  errors?: Array<{
    row: number;
    reason: string;
  }>;
}
```

---

### **PUT /api/datasets/[id]**

Update dataset metadata.

**Auth:** Required
**Permissions:** Admin or dataset owner

**Body:**
```typescript
{
  name?: string;
  description?: string;
  campaign_status?: 'draft' | 'active' | 'paused' | 'completed';
  campaign_start_date?: string;
  campaign_end_date?: string;
}
```

---

### **DELETE /api/datasets/[id]**

Delete dataset and all associated leads.

**Auth:** Required
**Permissions:** Admin only

**WARNING:** Cascades to delete all leads, conversations, messages.

---

## Lead Routes

### **GET /api/leads**

Get leads with filtering and pagination.

**Auth:** Required

**Query Parameters:**
```typescript
{
  dataset_id?: string; // Filter by dataset
  status?: 'READY' | 'HOT' | 'WARM' | 'COLD' | 'CALL_BOOKED' | 'CONVERTED' | ...;
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'HOT' | 'UNCLEAR';
  search?: string; // Search names, phone, email
  archived?: boolean; // true, false, or omit for both
  manual_mode?: boolean;
  page?: number; // Default: 1
  limit?: number; // Default: 50, max: 100
  sort?: 'name' | 'status' | 'reply_date' | 'created';
  order?: 'asc' | 'desc';
}
```

**Response:**
```typescript
{
  leads: Array<{
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    postcode: string;
    contact_status: string;
    lead_sentiment: string;
    latest_lead_reply: string;
    reply_received_at: string;
    call_booked: boolean;
    call_booked_time: string;
    manual_mode: boolean;
    archived: boolean;
    created_at: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

---

### **GET /api/leads/[id]**

Get single lead with full details.

**Auth:** Required

**Response:**
```typescript
{
  lead: {
    // All lead fields
    id: string;
    first_name: string;
    // ... (all fields from leads table)

    // Include conversation summary
    conversation: {
      id: string;
      message_count: number;
      last_message_at: string;
      status: string;
      sentiment: string;
    };

    // Sophie's insights for this lead
    sophie_insights: Array<{
      id: string;
      severity: string;
      title: string;
      status: string;
      created_at: string;
    }>;
  };
}
```

---

### **PUT /api/leads/[id]**

Update lead information.

**Auth:** Required

**Body:**
```typescript
{
  first_name?: string;
  last_name?: string;
  email?: string;
  postcode?: string;
  notes?: string;
  contact_status?: string;
  lead_sentiment?: string;
  manual_mode?: boolean;
  archived?: boolean;
  assigned_to?: string; // user_id
}
```

---

### **POST /api/leads/[id]/archive**

Toggle lead archive status.

**Auth:** Required

**Response:**
```typescript
{
  lead_id: string;
  archived: boolean;
  archived_at: string;
}
```

---

### **POST /api/leads/[id]/manual-mode**

Toggle manual mode (AI pauses/resumes).

**Auth:** Required

**Body:**
```typescript
{
  enabled: boolean;
}
```

**Response:**
```typescript
{
  lead_id: string;
  manual_mode: boolean;
  manual_mode_activated_at: string;
}
```

---

## Conversation Routes

### **GET /api/conversations/[id]**

Get full conversation thread with all messages.

**Auth:** Required

**Response:**
```typescript
{
  conversation: {
    id: string;
    lead_id: string;
    started_at: string;
    last_message_at: string;
    message_count: number;
    status: string;
    sentiment: string;
    quality_score: number;
  };
  messages: Array<{
    id: string;
    content: string;
    direction: 'outbound' | 'inbound';
    message_category: string;
    sent_at: string;
    delivered_at: string;
    ai_generated: boolean;
    ai_quality_score: number;
    sophie_feedback: string;
    sophie_feedback_status: string;
  }>;
  lead: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    contact_status: string;
  };
}
```

---

## Message Routes

### **POST /api/messages/send**

Send manual message to lead.

**Auth:** Required
**Note:** Bypasses AI, sends directly via Twilio

**Body:**
```typescript
{
  lead_id: string;
  content: string; // Message text
  message_category: 'human_manual';
}
```

**Flow:**
1. Validate lead exists and user has access
2. Check if manual_mode is enabled (optional - allow sending regardless)
3. Send via Twilio
4. Store in messages table
5. Update conversation
6. Trigger Sophie analysis (async)

**Response:**
```typescript
{
  message: {
    id: string;
    content: string;
    sent_at: string;
    twilio_sid: string;
    status: 'pending' | 'sent' | 'delivered';
  };
}
```

---

### **POST /api/messages/ai-generate**

Generate AI response for lead (preview before sending).

**Auth:** Required

**Body:**
```typescript
{
  lead_id: string;
  conversation_id: string;
  force_regenerate?: boolean; // Ignore cached response
}
```

**Flow:**
1. Get full conversation history
2. Get lead context (status, sentiment, qualification data)
3. Get current active prompt + lessons
4. Call Claude API to generate response
5. Store as draft (not sent yet)
6. Return for user preview/approval

**Response:**
```typescript
{
  generated_message: {
    content: string;
    confidence: number; // 0.0 - 1.0
    reasoning: string; // Why Claude generated this
    lessons_applied: string[]; // lesson_ids used
  };
  preview: true; // Not sent yet
}
```

---

### **POST /api/messages/ai-send**

Send AI-generated message (or approve previewed message).

**Auth:** Required

**Body:**
```typescript
{
  lead_id: string;
  message_id?: string; // If approving previewed message
  content?: string; // If providing custom content
}
```

**Flow:**
1. If message_id: Get draft message
2. If content: Use provided content
3. Send via Twilio
4. Update message status
5. Trigger Sophie analysis (async)

---

## Campaign Automation Routes

### **POST /api/campaigns/start**

Start automated campaign for dataset.

**Auth:** Required
**Permissions:** Admin or campaign manager

**Body:**
```typescript
{
  dataset_id: string;
  settings?: {
    m1_delay_hours: number; // 0 = immediate
    m2_delay_hours: number; // From M1
    m3_delay_hours: number; // From M2
    rate_limit_messages_per_minute: number; // Default: 1
    schedule?: {
      hours_start: number; // 9 (9am)
      hours_end: number; // 21 (9pm)
      days: string[]; // ['mon', 'tue', ...]
    };
  };
}
```

**Flow:**
1. Validate dataset
2. Get all READY leads
3. Queue M1 messages (respecting rate limit)
4. Update dataset campaign_status to 'active'

**Response:**
```typescript
{
  campaign: {
    dataset_id: string;
    status: 'active';
    total_leads: number;
    messages_queued: number;
    estimated_completion: string; // Based on rate limit
  };
}
```

---

### **POST /api/campaigns/pause**

Pause ongoing campaign.

**Auth:** Required
**Permissions:** Admin or campaign manager

**Body:**
```typescript
{
  dataset_id: string;
}
```

---

### **POST /api/campaigns/resume**

Resume paused campaign.

---

## Sophie Intelligence Routes

### **GET /api/sophie/insights**

Get Sophie's pending insights.

**Auth:** Required

**Query Parameters:**
```typescript
{
  status?: 'pending' | 'viewed' | 'approved_and_learned' | 'dismissed' | 'taught_sophie';
  severity?: 'critical' | 'urgent' | 'warning' | 'suggestion' | 'info';
  category?: 'compliance' | 'tone' | 'grammar' | 'strategy' | ...;
  dataset_id?: string; // Filter by dataset
  limit?: number; // Default: 50
}
```

**Response:**
```typescript
{
  insights: Array<{
    id: string;
    severity: string;
    category: string;
    title: string;
    description: string;
    suggestion: string;
    original_text: string;
    suggested_text: string;
    affected_leads_count: number;
    message_id: string;
    conversation_id: string;
    status: string;
    created_at: string;
  }>;
  summary: {
    critical: number;
    urgent: number;
    warning: number;
    suggestion: number;
    info: number;
  };
}
```

---

### **POST /api/sophie/insights/[id]/agree**

User agrees with Sophie's suggestion → Create lesson.

**Auth:** Required
**Permissions:** Admin or user with lesson editing permission

**Body:**
```typescript
{
  learning_note: string; // User's explanation of why this is correct
  lesson_title?: string; // Optional custom title
  lesson_priority?: number; // 1-10
}
```

**Flow:**
1. Get insight
2. Create new lesson based on insight
3. Add user's learning note to lesson reasoning
4. Mark insight as 'approved_and_learned'
5. Link lesson to insight

**Response:**
```typescript
{
  lesson: {
    id: string;
    title: string;
    lesson_type: string;
    status: 'active';
    created_at: string;
  };
  insight_updated: true;
}
```

---

### **POST /api/sophie/insights/[id]/disagree**

User disagrees with Sophie → Teach her.

**Auth:** Required
**Permissions:** Admin or lesson editor

**Body:**
```typescript
{
  teaching_note: string; // Why Sophie is wrong
  correct_approach: string; // What should be done instead
}
```

**Flow:**
1. Get insight
2. Create negative lesson (what NOT to do)
3. Update Sophie's understanding (internal model adjustment)
4. Mark insight as 'taught_sophie'

**Response:**
```typescript
{
  lesson: {
    id: string;
    title: string;
    lesson_type: 'dos_donts'; // Negative example
    status: 'active';
  };
  sophie_updated: true;
}
```

---

### **POST /api/sophie/insights/[id]/dismiss**

Dismiss insight without action.

**Auth:** Required

**Body:**
```typescript
{
  reason?: string; // Optional feedback
}
```

---

### **GET /api/sophie/lessons**

Get all lessons in library.

**Auth:** Required

**Query Parameters:**
```typescript
{
  lesson_type?: 'objection_handling' | 'dos_donts' | ...;
  scope?: 'client_specific' | 'universal';
  status?: 'active' | 'archived' | 'testing';
  search?: string; // Full-text search
  tags?: string[]; // Filter by tags
  sort?: 'created' | 'priority' | 'success_rate' | 'times_applied';
}
```

**Response:**
```typescript
{
  lessons: Array<{
    id: string;
    lesson_type: string;
    scope: string;
    title: string;
    description: string;
    trigger: string;
    correct_response: string;
    tags: string[];
    priority: number;
    times_applied: number;
    success_rate: number;
    status: string;
    created_at: string;
  }>;
}
```

---

### **POST /api/sophie/lessons**

Manually create a lesson.

**Auth:** Required
**Permissions:** Admin or lesson editor

**Body:**
```typescript
{
  lesson_type: 'objection_handling' | 'dos_donts' | ...;
  scope: 'client_specific' | 'universal';
  title: string;
  description: string;
  trigger: string;
  correct_response?: string;
  incorrect_response?: string;
  reasoning: string;
  tags: string[];
  priority: number; // 1-10
  example_conversation?: {
    messages: Array<{
      from: 'ai' | 'lead';
      content: string;
      annotation?: string;
    }>;
  };
}
```

---

### **PUT /api/sophie/lessons/[id]**

Update lesson.

---

### **DELETE /api/sophie/lessons/[id]**

Archive lesson (doesn't delete, sets status to 'archived').

---

### **GET /api/sophie/prompts/[type]**

Get current prompt for message type.

**Auth:** Required

**Path Parameters:**
- `type`: 'master' | 'm1' | 'm2' | 'm3' | 'reply'

**Response:**
```typescript
{
  prompt: {
    id: string;
    name: string;
    prompt_type: string;
    system_prompt: string;
    user_prompt_template: string;
    includes_lessons: boolean;
    lessons_context: string; // Auto-generated from active lessons
    version: number;
    is_active: boolean;
    pushed_to_live: boolean;
    created_at: string;
  };
  lessons_included: number;
  performance: {
    conversations_using: number;
    success_rate: number;
  };
}
```

---

### **PUT /api/sophie/prompts/[type]**

Update prompt (doesn't make it live yet).

**Auth:** Required
**Permissions:** Admin only

**Body:**
```typescript
{
  system_prompt: string;
  user_prompt_template?: string;
}
```

---

### **POST /api/sophie/prompts/[type]/make-live**

Make edited prompt live (updates AI agent behavior).

**Auth:** Required
**Permissions:** Admin only

**Flow:**
1. Get current active prompt
2. Get all active lessons
3. Inject lessons into prompt
4. Create new version
5. Set as active
6. Previous version remains in history

**Response:**
```typescript
{
  prompt: {
    id: string;
    version: number; // Incremented
    is_active: true;
    lessons_included: number;
    made_live_at: string;
  };
  changes_from_previous: {
    lessons_added: string[];
    lessons_removed: string[];
    base_prompt_changed: boolean;
  };
}
```

---

### **POST /api/sophie/analyze-message**

Trigger manual Sophie analysis of a message.

**Auth:** Required

**Body:**
```typescript
{
  message_id: string;
}
```

**Flow:**
1. Get message + conversation context
2. Call Claude API for analysis
3. Store analysis
4. Generate insights if issues found
5. Return results

---

### **POST /api/sophie/analyze-conversation**

Analyze entire conversation.

**Auth:** Required

**Body:**
```typescript
{
  conversation_id: string;
}
```

---

### **POST /api/sophie/detect-patterns**

Run pattern recognition on dataset.

**Auth:** Required

**Body:**
```typescript
{
  dataset_id: string;
  min_occurrences?: number; // Default: 10
}
```

**Flow:**
1. Get all conversations in dataset
2. Call Claude API with batch analysis prompt
3. Identify success/failure patterns
4. Store patterns
5. Suggest lessons

**Response:**
```typescript
{
  patterns: Array<{
    pattern_description: string;
    occurrences: number;
    success_rate: number;
    recommended_action: 'adopt' | 'avoid' | 'test_more';
    suggested_lesson?: string;
  }>;
}
```

---

## Webhook Routes

### **POST /api/webhooks/twilio**

Twilio posts here when SMS received.

**Auth:** Public (but validated via Twilio signature)
**Content-Type:** application/x-www-form-urlencoded

**Body:** (Twilio format)
```typescript
{
  MessageSid: string;
  From: string; // Lead's phone number
  To: string; // Our Twilio number
  Body: string; // Message content
  MessageStatus: string;
}
```

**Flow:**
1. Validate Twilio signature
2. Normalize phone number (+44 format)
3. Find lead by phone number
4. Create message record (direction: 'inbound')
5. Update conversation
6. Trigger AI response (async, queue-based)
   - If manual_mode OFF → Generate and send AI response
   - If manual_mode ON → Just store, notify user
7. Trigger Sophie analysis (async)
8. Update lead status if needed
9. Send notification if lead is HOT

**Response:** (Must respond quickly to Twilio)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>
```

---

### **POST /api/webhooks/calcom**

Cal.com posts here when booking created/updated.

**Auth:** Public (but validated via Cal.com signature)

**Body:**
```typescript
{
  triggerEvent: 'BOOKING_CREATED' | 'BOOKING_CANCELLED';
  payload: {
    uid: string; // Cal.com booking ID
    title: string;
    startTime: string; // ISO 8601
    endTime: string;
    attendees: Array<{
      name: string;
      email: string;
      timeZone: string;
    }>;
    metadata: {
      lead_id: string; // We pass this when creating booking
    };
  };
}
```

**Flow:**
1. Validate webhook signature
2. Get lead from metadata
3. Update lead:
   - call_booked = true
   - call_booked_time = startTime
   - cal_booking_id = uid
   - contact_status = 'CALL_BOOKED'
   - manual_mode = true (auto-enable)
4. Send confirmation notification

---

## Analytics Routes

### **GET /api/analytics/overview**

Get dashboard-wide analytics.

**Auth:** Required

**Query Parameters:**
```typescript
{
  dataset_id?: string; // Filter by dataset, or all datasets
  time_range?: 'today' | 'week' | 'month' | 'all';
}
```

**Response:**
```typescript
{
  metrics: {
    total_leads: number;
    active_leads: number;
    messages_sent: {
      m1: number;
      m2: number;
      m3: number;
      ai_responses: number;
      total: number;
    };
    replies_received: number;
    reply_rate: number; // %
    hot_leads: number;
    calls_booked: number;
    converted: number;
    conversion_rate: number; // %
  };
  sentiment_breakdown: {
    POSITIVE: number;
    NEGATIVE: number;
    NEUTRAL: number;
    HOT: number;
    UNCLEAR: number;
  };
  status_breakdown: {
    CALL_BOOKED: number;
    HOT: number;
    WARM: number;
    // ... all statuses
  };
  trends: {
    daily_messages: Array<{ date: string; count: number }>;
    daily_replies: Array<{ date: string; count: number }>;
    daily_bookings: Array<{ date: string; count: number }>;
  };
}
```

---

### **GET /api/analytics/sophie-impact**

Measure Sophie's impact on performance.

**Auth:** Required

**Response:**
```typescript
{
  sophie_metrics: {
    insights_generated: number;
    insights_approved: number;
    lessons_created: number;
    lessons_active: number;
  };
  performance_improvement: {
    baseline_booking_rate: number; // Before Sophie
    current_booking_rate: number; // With Sophie's lessons
    improvement_percent: number;
    confidence_level: number; // Statistical significance
  };
  top_lessons: Array<{
    lesson_id: string;
    title: string;
    times_applied: number;
    success_rate: number;
    impact_score: number;
  }>;
}
```

---

### **GET /api/analytics/dataset-comparison**

Compare performance across datasets.

**Auth:** Required

**Response:**
```typescript
{
  datasets: Array<{
    dataset_id: string;
    name: string;
    total_leads: number;
    reply_rate: number;
    booking_rate: number;
    conversion_rate: number;
    avg_messages_to_booking: number;
    top_performing_lessons: string[];
  }>;
}
```

---

### **POST /api/analytics/export**

Export analytics data as CSV.

**Auth:** Required

**Body:**
```typescript
{
  export_type: 'leads' | 'conversations' | 'lessons' | 'analytics_summary';
  dataset_id?: string;
  time_range?: string;
  format: 'csv' | 'xlsx';
}
```

**Flow:**
1. Generate export file
2. Store in Supabase Storage (bucket: `exports`)
3. Return download URL (expires in 24h)

**Response:**
```typescript
{
  export: {
    id: string;
    filename: string;
    download_url: string; // Signed URL, expires in 24h
    expires_at: string;
    rows: number;
  };
}
```

---

## User Management Routes

### **GET /api/users**

Get all users for client.

**Auth:** Required
**Permissions:** Admin or company owner

**Response:**
```typescript
{
  users: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
    last_login_at: string;
    created_at: string;
  }>;
}
```

---

### **POST /api/users**

Create new user (invite).

**Auth:** Required
**Permissions:** Admin only

**Body:**
```typescript
{
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'sales_rep' | 'read_only';
  permissions: {
    can_view_all_leads: boolean;
    can_edit_lessons: boolean;
    can_push_to_live: boolean;
    can_manage_users: boolean;
  };
  allowed_dataset_ids?: string[]; // Restrict to specific datasets
}
```

**Flow:**
1. Create user record (status: 'invited')
2. Send invitation email via Supabase Auth
3. User clicks link → sets password → status becomes 'active'

---

### **PUT /api/users/[id]**

Update user permissions.

**Auth:** Required
**Permissions:** Admin only

---

### **DELETE /api/users/[id]**

Deactivate user (doesn't delete, sets status to 'suspended').

---

## Settings Routes

### **GET /api/settings/client**

Get client settings.

**Auth:** Required

**Response:**
```typescript
{
  settings: {
    company_name: string;
    company_email: string;
    company_phone: string;
    logo_url: string;
    primary_color: string;
    timezone: string;
    twilio_phone_number: string;
    n8n_workflow_id: string;
    settings: any; // JSONB field
  };
}
```

---

### **PUT /api/settings/client**

Update client settings.

**Auth:** Required
**Permissions:** Admin or company owner

---

### **GET /api/settings/integrations**

Get integration status (Twilio, Cal.com, etc.).

**Auth:** Required

**Response:**
```typescript
{
  integrations: {
    twilio: {
      connected: boolean;
      phone_number: string;
      last_tested: string;
    };
    calcom: {
      connected: boolean;
      event_type_id: string;
      calendar_name: string;
    };
    claude: {
      connected: boolean;
      model: string;
      last_used: string;
    };
  };
}
```

---

## Cron Jobs (Vercel Cron)

### **GET /api/cron/send-m1**

Triggered by Vercel Cron to send M1 messages.

**Auth:** Vercel Cron (CRON_SECRET)
**Schedule:** Every 1 minute

**Flow:**
1. Get all active campaigns
2. Get leads ready for M1 (contact_status = 'READY', m1_sent_at IS NULL)
3. Respect schedule (hours_start - hours_end)
4. Queue messages (rate limit per client)
5. Send via Twilio
6. Update lead status

---

### **GET /api/cron/send-m2**

Send M2 to leads who didn't reply to M1.

**Schedule:** Every 1 minute

**Flow:**
1. Get leads where:
   - m1_sent_at + m2_delay_hours < NOW
   - m2_sent_at IS NULL
   - reply_received_at IS NULL (no reply to M1)
2. Queue and send M2

---

### **GET /api/cron/send-m3**

Send M3 to leads who didn't reply to M2.

---

### **GET /api/cron/process-ai-responses**

Process queued AI responses.

**Schedule:** Every 30 seconds

**Flow:**
1. Get pending AI response queue
2. For each queued response:
   - Generate AI response (Claude API)
   - Apply rate limit
   - Send via Twilio
   - Update conversation

---

### **GET /api/cron/sophie-analysis**

Batch analyze conversations.

**Schedule:** Every 15 minutes

**Flow:**
1. Get conversations updated in last 15 mins
2. Run Sophie conversation analysis
3. Generate insights
4. Send notifications for CRITICAL/URGENT

---

### **GET /api/cron/pattern-detection**

Run pattern recognition.

**Schedule:** Daily at 3am

**Flow:**
1. For each client
2. Get all conversations from last 7 days
3. Run pattern detection
4. Create insights for significant patterns

---

## Cal.com Integration Routes

### **POST /api/calcom/check-availability**

Check available time slots.

**Auth:** Required

**Body:**
```typescript
{
  date: string; // YYYY-MM-DD
  timezone?: string; // Default: 'Europe/London'
}
```

**Flow:**
1. Call Cal.com API: GET /slots
2. Return available slots

**Response:**
```typescript
{
  slots: Array<{
    time: string; // ISO 8601
    duration: number; // minutes
  }>;
}
```

---

### **POST /api/calcom/create-booking**

Book a call.

**Auth:** Required

**Body:**
```typescript
{
  lead_id: string;
  start_time: string; // ISO 8601
  notes?: string;
}
```

**Flow:**
1. Get lead details
2. Call Cal.com API: POST /bookings
3. Update lead (call_booked, call_booked_time, cal_booking_id)
4. Enable manual_mode
5. Send confirmation notification

**Response:**
```typescript
{
  booking: {
    id: string; // Cal.com booking ID
    start_time: string;
    end_time: string;
    booking_url: string; // Cal.com booking page
    lead_updated: true;
  };
}
```

---

## Notification Routes

### **POST /api/notifications/send**

Send notification to user.

**Auth:** Internal (called by other API routes)

**Body:**
```typescript
{
  user_id: string;
  channels: ('email' | 'sms' | 'in_app')[];
  priority: 'immediate' | 'normal' | 'low';
  title: string;
  message: string;
  link?: string; // Deep link in app
  data?: any; // Additional context
}
```

**Flow:**
1. Get user notification preferences
2. Send via requested channels:
   - Email: Resend or Postmark
   - SMS: Twilio
   - In-app: Supabase Realtime
3. Store notification in database

---

## Real-Time Subscriptions (Supabase)

**Not API routes, but important for real-time features:**

```typescript
// Subscribe to new messages for dataset
supabase
  .channel(`messages:${datasetId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `dataset_id=eq.${datasetId}`
  }, (payload) => {
    // Update UI with new message
  })
  .subscribe();

// Subscribe to Sophie insights
supabase
  .channel(`sophie_insights:${clientId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'sophie_insights',
    filter: `client_id=eq.${clientId}`
  }, (payload) => {
    // Show notification badge
  })
  .subscribe();

// Subscribe to lead status changes
supabase
  .channel(`leads:${datasetId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'leads',
    filter: `dataset_id=eq.${datasetId}`
  }, (payload) => {
    // Update lead card in UI
  })
  .subscribe();
```

---

## Error Handling (All Routes)

**Standardized error responses:**

```typescript
{
  error: {
    code: string; // 'UNAUTHORIZED', 'VALIDATION_ERROR', etc.
    message: string; // Human-readable
    details?: any; // Additional context
  };
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (not logged in)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 429: Too Many Requests (rate limited)
- 500: Internal Server Error

---

## Rate Limiting

**Per-user rate limits:**
```typescript
// Standard routes: 100 requests/minute
// Message sending: 60 messages/hour per client
// Sophie analysis: 1000 requests/hour per client
// Webhooks: Unlimited (validated via signature)
```

---

## Summary

**Total API Routes:** ~60 routes
**Real-time Channels:** 5 primary subscriptions
**Webhooks:** 2 (Twilio, Cal.com)
**Cron Jobs:** 6 scheduled tasks

**Key Technologies:**
- Next.js API Routes (serverless functions)
- Supabase (database + auth + realtime + storage)
- Twilio (SMS)
- Claude API (AI)
- Cal.com API (bookings)
- Vercel Cron (scheduled jobs)

---

**Next:** Build Plan with week-by-week breakdown

