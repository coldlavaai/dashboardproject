# DBR V2 - Complete Component Architecture

**Project:** Database Reactivation Platform V2
**Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
**State Management:** React Context + Supabase Realtime
**Created:** 2025-10-31

---

## Application Structure

```
app/
├── (auth)/                    # Authentication routes
│   ├── login/
│   ├── signup/
│   └── forgot-password/
├── (dashboard)/               # Main dashboard (protected)
│   ├── layout.tsx            # Dashboard shell with sidebar
│   ├── page.tsx              # Redirects to /datasets
│   ├── datasets/             # Dataset management
│   │   ├── page.tsx          # List all datasets
│   │   ├── [id]/            # Individual dataset dashboard
│   │   │   ├── page.tsx     # Dataset overview (hot leads, analytics)
│   │   │   ├── leads/       # All leads in dataset
│   │   │   ├── conversations/ # All conversations
│   │   │   └── analytics/   # Deep analytics
│   │   └── new/             # Upload CSV & create dataset
│   ├── sophie/              # Sophie's Intelligence Center
│   │   ├── page.tsx         # Sophie insights dashboard
│   │   ├── insights/        # All pending insights
│   │   ├── lessons/         # Lessons library
│   │   └── prompts/         # Prompt management
│   ├── settings/            # Client settings
│   └── users/               # User management (if admin)
├── api/                     # API routes (see separate doc)
└── layout.tsx              # Root layout
```

---

## Component Tree (Visual Hierarchy)

```
App Shell
│
├── AuthProvider (Supabase auth context)
│   └── UserProvider (user data, role, permissions)
│       └── ClientProvider (client settings, branding)
│           │
│           ├── LoginPage
│           │   └── LoginForm
│           │
│           └── DashboardLayout
│               ├── Sidebar
│               │   ├── ClientLogo
│               │   ├── NavMenu
│               │   └── UserProfile
│               │
│               ├── TopBar
│               │   ├── DatasetSelector
│               │   ├── SearchBar
│               │   ├── NotificationBell
│               │   └── SophieButton (quick access)
│               │
│               └── MainContent
│                   │
│                   ├── DatasetsListPage
│                   │   ├── DatasetCard (multiple)
│                   │   └── UploadButton → UploadModal
│                   │
│                   ├── DatasetDashboard
│                   │   ├── DashboardHeader
│                   │   │   ├── DatasetInfo
│                   │   │   ├── TimeRangeFilter
│                   │   │   └── RefreshButton
│                   │   │
│                   │   ├── AnalyticsOverview
│                   │   │   ├── MetricCard (x4)
│                   │   │   ├── ConversionFunnel
│                   │   │   └── TrendChart
│                   │   │
│                   │   ├── HotLeadsSection
│                   │   │   └── LeadCard (multiple)
│                   │   │       ├── ContactInfo
│                   │   │       ├── MessageTimeline
│                   │   │       ├── SophieBadge (if insight)
│                   │   │       ├── ActionButtons
│                   │   │       └── ConversationPanel
│                   │   │           └── MessageBubble (multiple)
│                   │   │
│                   │   ├── RecentActivity
│                   │   │   └── ActivityItem (multiple)
│                   │   │
│                   │   └── QuickActions
│                   │       ├── BookCallButton → BookCallModal
│                   │       ├── ArchiveButton
│                   │       └── ManualModeToggle
│                   │
│                   ├── SophieDashboard
│                   │   ├── SophieHeader
│                   │   │   ├── SophieAvatar
│                   │   │   └── InsightStats
│                   │   │
│                   │   ├── PendingInsights
│                   │   │   └── InsightCard (multiple)
│                   │   │       ├── SeverityBadge
│                   │   │       ├── InsightContent
│                   │   │       ├── BeforeAfter
│                   │   │       ├── AffectedLeadsCount
│                   │   │       └── ActionButtons
│                   │   │           ├── AgreeAndLearnButton
│                   │   │           ├── DisagreeAndTeachButton
│                   │   │           └── DismissButton
│                   │   │
│                   │   ├── LessonsLibrary
│                   │   │   ├── LibrarySearch
│                   │   │   ├── LessonTypeFilter
│                   │   │   └── LessonCard (multiple)
│                   │   │       ├── LessonContent
│                   │   │       ├── ExampleConversation
│                   │   │       ├── UsageStats
│                   │   │       └── EditButton
│                   │   │
│                   │   └── PromptManagement
│                   │       ├── ActivePrompt
│                   │       │   ├── PromptEditor
│                   │       │   ├── LessonsPreview
│                   │       │   └── VersionHistory
│                   │       └── PushToN8NButton
│                   │
│                   └── SettingsPage
│                       ├── ClientSettings
│                       ├── IntegrationSettings
│                       │   ├── N8NConfig
│                       │   ├── TwilioConfig
│                       │   └── CalComConfig
│                       └── UserManagement (if admin)
```

---

## Core Components (Detailed Specifications)

### **1. DashboardLayout**
**File:** `app/(dashboard)/layout.tsx`
**Purpose:** Shell for all dashboard pages

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Features:
// - Sidebar navigation (collapsible on mobile)
// - Top bar with dataset selector
// - Real-time connection status indicator
// - Sophie floating action button
// - Notification system
```

---

### **2. Sidebar**
**File:** `components/layout/Sidebar.tsx`
**Purpose:** Main navigation menu

```typescript
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Navigation items:
// - Home / Datasets
// - Current Dataset (if selected)
//   - Overview
//   - All Leads
//   - Conversations
//   - Analytics
// - Sophie
//   - Insights
//   - Lessons
//   - Prompts
// - Settings
// - Users (if admin)

// Shows:
// - Client logo at top
// - Active dataset indicator
// - Unread insights count badge
// - User profile at bottom
```

---

### **3. DatasetCard**
**File:** `components/datasets/DatasetCard.tsx`
**Purpose:** Display dataset summary on main page

```typescript
interface DatasetCardProps {
  dataset: {
    id: string;
    name: string;
    description?: string;
    total_leads: number;
    hot_leads: number;
    converted_leads: number;
    campaign_status: 'draft' | 'active' | 'paused' | 'completed';
    created_at: string;
  };
  onClick: () => void;
}

// Features:
// - Visual status indicator (color-coded)
// - Key metrics at a glance
// - Last activity timestamp
// - Quick actions menu (edit, duplicate, archive)
// - Click to enter dataset dashboard
// - Hover shows quick preview
```

---

### **4. UploadModal**
**File:** `components/datasets/UploadModal.tsx`
**Purpose:** CSV upload and column mapping interface

```typescript
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

// Steps:
// 1. File Upload
//    - Drag & drop or file picker
//    - Validates CSV format
//    - Shows preview of first 5 rows
//
// 2. Column Mapping
//    - Detects columns automatically
//    - Dropdowns to map to required fields:
//      * First Name (required)
//      * Last Name (optional)
//      * Phone Number (required)
//      * Email (optional)
//      * Postcode (optional)
//      * Inquiry Date (optional)
//      * Notes (optional)
//    - Shows unmapped columns (will be ignored)
//    - Validation warnings
//
// 3. Dataset Info
//    - Name this dataset
//    - Description (optional)
//    - Campaign start date
//
// 4. Confirmation
//    - Review summary
//    - "X leads will be imported"
//    - Create Dataset button
//
// 5. Processing
//    - Progress bar
//    - "Importing leads... 245/1000"
//    - Success message + "Go to Dashboard"
```

---

### **5. LeadCard**
**File:** `components/leads/LeadCard.tsx`
**Purpose:** Individual lead display (hot leads section)

```typescript
interface LeadCardProps {
  lead: {
    id: string;
    first_name: string;
    last_name?: string;
    phone_number: string;
    email?: string;
    postcode?: string;
    contact_status: string;
    lead_sentiment?: string;
    latest_lead_reply?: string;
    reply_received_at?: string;
    call_booked: boolean;
    call_booked_time?: string;
    manual_mode: boolean;
  };
  conversation?: Conversation;
  sophieInsight?: SophieInsight; // If Sophie flagged this
  onExpand: () => void;
  onArchive: () => void;
  onBookCall: () => void;
  onToggleManualMode: () => void;
}

// Layout:
// ┌─────────────────────────────────────┐
// │ 🔥 John Smith                  [⋮] │ ← Name + Menu
// │ 📱 +44 7700 900123  📧 j@email.com │ ← Contact
// │ 📍 SO15 2AB                         │ ← Postcode (clickable)
// │                                     │
// │ ⚡ Sophie: "Consider mentioning..." │ ← Sophie badge (if insight)
// │                                     │
// │ 💬 Latest: "Yes I'm interested..."  │ ← Latest reply
// │ ⏰ Replied 2 hours ago              │ ← Timestamp
// │                                     │
// │ [📞 Book Call] [🗄️ Archive]        │ ← Actions
// │ [👁️ View Conversation]              │ ← Expand
// └─────────────────────────────────────┘

// When expanded:
// Shows full conversation thread below
```

---

### **6. ConversationPanel**
**File:** `components/conversations/ConversationPanel.tsx`
**Purpose:** Display full message thread

```typescript
interface ConversationPanelProps {
  leadId: string;
  conversationId: string;
  messages: Message[];
  sophieInsights?: SophieInsight[]; // Insights for specific messages
}

// Features:
// - Chronological message list
// - Outbound messages (blue, right-aligned)
// - Inbound messages (green, left-aligned)
// - Timestamps
// - Message status indicators (sent, delivered, read)
// - Sophie annotations (if she flagged a message)
//   - Hover over flagged message shows Sophie's suggestion
//   - Click to review in Sophie dashboard
// - Auto-scroll to latest
// - Copy message button
```

---

### **7. SophieInsightCard**
**File:** `components/sophie/SophieInsightCard.tsx`
**Purpose:** Display Sophie's analysis and suggestions

```typescript
interface SophieInsightCardProps {
  insight: {
    id: string;
    severity: 'info' | 'suggestion' | 'warning' | 'critical';
    category: string;
    title: string;
    description: string;
    suggestion?: string;
    original_text?: string;
    suggested_text?: string;
    affected_leads_count: number;
    created_at: string;
  };
  onAgree: (learningNote: string) => void;
  onDisagree: (teachingNote: string, correctApproach: string) => void;
  onDismiss: () => void;
}

// Layout:
// ┌─────────────────────────────────────────┐
// │ ⚠️ WARNING                              │ ← Severity badge
// │ Emoji Usage Detected                    │ ← Title
// │                                         │
// │ Sophie noticed: The AI used emojis in   │
// │ responses, which violates UK comms...   │ ← Description
// │                                         │
// │ 🔍 Affects 12 leads                     │ ← Impact
// │                                         │
// │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
// │                                         │
// │ Original:                               │
// │ "Great! 😊 Let me book you in..."       │ ← Before
// │                                         │
// │ Suggested:                              │
// │ "Excellent! Let me book you in..."      │ ← After
// │                                         │
// │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
// │                                         │
// │ [✅ Agree & Learn]  [❌ Disagree]       │
// │ [👋 Dismiss]                            │ ← Actions
// └─────────────────────────────────────────┘

// Actions:
// 1. Agree & Learn:
//    - Opens modal: "Why is this correct?"
//    - User types explanation
//    - Creates lesson in library
//    - Dismisses insight
//
// 2. Disagree & Teach:
//    - Opens modal: "Teach Sophie"
//    - User explains why Sophie is wrong
//    - User provides correct approach
//    - Updates Sophie's understanding
//    - Creates lesson (negative example)
//
// 3. Dismiss:
//    - No action, just remove from view
//    - Doesn't create a lesson
```

---

### **8. LessonsLibrary**
**File:** `components/sophie/LessonsLibrary.tsx`
**Purpose:** Browse and manage all learned lessons

```typescript
interface LessonsLibraryProps {
  clientId: string;
}

// Features:
// - Search bar (full-text search)
// - Filter by lesson_type:
//   * Objection Handling
//   * Do's and Don'ts
//   * Good Examples
//   * Bad Examples
//   * Blacklisted Words
//   * Never Rules
//   * Best Practices
// - Sort by:
//   * Most recent
//   * Most used
//   * Highest priority
//   * Success rate
// - Tag filter (multi-select)
// - Lesson cards showing:
//   * Title
//   * Description
//   * Trigger/Context
//   * Correct response
//   * Times applied
//   * Success rate
//   * Edit/Delete buttons

// Click on lesson → Opens LessonDetailModal
```

---

### **9. PromptEditor**
**File:** `components/sophie/PromptEditor.tsx`
**Purpose:** Edit AI agent prompts before pushing to n8n

```typescript
interface PromptEditorProps {
  clientId: string;
  promptType: 'master' | 'm1' | 'm2' | 'm3' | 'reply';
  currentPrompt: Prompt;
  relevantLessons: Lesson[];
  onSave: (updatedPrompt: string) => void;
  onPushToN8N: () => void;
}

// Layout:
// ┌─────────────────────────────────────────────┐
// │ Master Reply Prompt                         │
// │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
// │                                             │
// │ [System Prompt]                             │
// │ You are Sophie, an AI assistant helping...  │ ← Editable
// │ (Large text area)                           │
// │                                             │
// │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
// │                                             │
// │ 📚 Lessons Included: 23                     │
// │ [View Lessons] ← Opens modal                │
// │                                             │
// │ Lessons will be automatically injected as:  │
// │ "Based on company best practices:"          │
// │ - Never use emojis                          │
// │ - Always mention 25-year warranty           │
// │ - When price objection, mention savings...  │
// │                                             │
// │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
// │                                             │
// │ Version: 3 (view history)                   │
// │ Last pushed to n8n: 2 hours ago             │
// │                                             │
// │ [💾 Save Draft] [🚀 Push to n8n]           │
// └─────────────────────────────────────────────┘

// Push to n8n:
// 1. Confirmation modal
// 2. Shows diff (what's changing)
// 3. "This will update the live AI agent"
// 4. Pushes via n8n API
// 5. Creates new version
// 6. Success notification
```

---

### **10. AnalyticsOverview**
**File:** `components/analytics/AnalyticsOverview.tsx`
**Purpose:** Dashboard analytics (same as current but enhanced)

```typescript
interface AnalyticsOverviewProps {
  datasetId: string;
  timeRange: 'today' | 'week' | 'month' | 'all';
}

// Metrics:
// - Total Leads
// - Messages Sent (M1, M2, M3 breakdown)
// - Reply Rate %
// - Hot Leads
// - Call Bookings
// - Conversion Rate
// - Average Response Time

// Charts:
// - Conversion Funnel (SENT → REPLIED → HOT → BOOKED → CONVERTED)
// - Daily Activity (bar chart)
// - Sentiment Distribution (pie chart)
// - Status Breakdown (grid)
// - Response Time Heatmap

// All clickable → drills down to leads list
```

---

### **11. BookCallModal**
**File:** `components/calls/BookCallModal.tsx`
**Purpose:** Cal.com integration (same as current)

```typescript
interface BookCallModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (booking: CalBooking) => void;
}

// Features:
// - Date picker (next 30 days)
// - Time slot selector (fetches from Cal.com)
// - Pre-filled lead details
// - Notes field
// - Booking confirmation
// - Updates lead status to CALL_BOOKED
// - Activates manual mode automatically
```

---

### **12. DatasetSelector**
**File:** `components/layout/DatasetSelector.tsx`
**Purpose:** Quick switch between datasets (top bar)

```typescript
interface DatasetSelectorProps {
  datasets: Dataset[];
  currentDatasetId?: string;
  onChange: (datasetId: string) => void;
}

// Layout:
// ┌────────────────────────────┐
// │ 📊 2024 Facebook Leads  ▼ │ ← Dropdown
// └────────────────────────────┘

// Dropdown shows:
// - All datasets
// - Quick stats (hot leads count)
// - Status indicator
// - "+ New Dataset" option
```

---

### **13. SophieFloatingButton**
**File:** `components/sophie/SophieFloatingButton.tsx`
**Purpose:** Quick access to Sophie from anywhere

```typescript
// Fixed position bottom-right
// Shows Sophie avatar with notification badge
// Click → Opens Sophie insights sidebar
// Sidebar shows:
// - Latest 5 pending insights
// - Quick "Agree" / "Disagree" actions
// - Link to full Sophie dashboard
```

---

## Shared Components

### **Utility Components**
- `MetricCard.tsx` - Display single metric with trend
- `StatusBadge.tsx` - Color-coded status (HOT, WARM, etc.)
- `SentimentBadge.tsx` - Sentiment indicator
- `ConversionFunnel.tsx` - Visual funnel chart
- `TrendChart.tsx` - Line/bar charts
- `SearchBar.tsx` - Global search
- `NotificationBell.tsx` - In-app notifications
- `UserAvatar.tsx` - User profile picture
- `LoadingSpinner.tsx` - Loading states
- `EmptyState.tsx` - No data states
- `ConfirmDialog.tsx` - Confirmation modals

### **Form Components**
- `Input.tsx` - Text input with validation
- `Select.tsx` - Dropdown select
- `DatePicker.tsx` - Date selection
- `TimePicker.tsx` - Time selection
- `TextArea.tsx` - Multi-line text
- `Toggle.tsx` - Boolean toggle
- `Button.tsx` - Primary/secondary buttons
- `FileUpload.tsx` - Drag & drop file upload

---

## State Management Strategy

### **1. Authentication State**
- **Provider:** `AuthProvider` (Supabase)
- **Global:** Current user, session, role
- **Persisted:** Yes (Supabase handles this)

### **2. Client State**
- **Provider:** `ClientProvider`
- **Global:** Current client, settings, branding
- **Persisted:** No (fetched on login)

### **3. Dataset State**
- **Provider:** `DatasetProvider`
- **Global:** Current dataset, leads, conversations
- **Persisted:** No (fetched on dataset selection)
- **Real-time:** Yes (Supabase subscriptions)

### **4. Sophie State**
- **Provider:** `SophieProvider`
- **Global:** Pending insights, lessons library, prompts
- **Persisted:** No (fetched on Sophie dashboard load)
- **Real-time:** Yes (new insights appear instantly)

### **5. UI State**
- **Local only:** Sidebar collapsed, modals open, filters
- **Not persisted**

---

## Real-Time Subscriptions

```typescript
// Subscribe to new messages for current dataset
supabase
  .channel(`messages:${datasetId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `dataset_id=eq.${datasetId}`
  }, (payload) => {
    // Update conversation in real-time
  })
  .subscribe();

// Subscribe to Sophie insights for current client
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
    // Update lead card in dashboard
  })
  .subscribe();
```

---

## Responsive Design Breakpoints

```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape
  xl: '1280px',  // Desktop
  '2xl': '1536px' // Large desktop
};

// Component behavior:
// - Sidebar: Full on desktop, collapsible on mobile, drawer on tablet
// - Lead cards: 1 col mobile, 2 col tablet, 3 col desktop
// - Analytics: Stack on mobile, grid on desktop
// - Sophie insights: Full screen on mobile, sidebar on desktop
```

---

## Accessibility (WCAG 2.1 AA)

- Keyboard navigation for all actions
- Focus indicators on interactive elements
- ARIA labels on icons and buttons
- Color contrast ratio 4.5:1 minimum
- Screen reader friendly
- Form validation with clear error messages

---

## Performance Optimizations

1. **Code Splitting**
   - Lazy load heavy components (charts, Sophie dashboard)
   - Dynamic imports for modals

2. **Data Fetching**
   - React Query for caching
   - Pagination on large lists (leads, conversations)
   - Infinite scroll for messages

3. **Rendering**
   - Virtual scrolling for long lists
   - Memoization on heavy components
   - Debounced search inputs

4. **Bundle Size**
   - Tree-shaking
   - Remove unused Tailwind classes
   - Optimize images (Next.js Image component)

---

## Component File Structure

```
components/
├── layout/
│   ├── DashboardLayout.tsx
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   └── Footer.tsx
├── datasets/
│   ├── DatasetCard.tsx
│   ├── DatasetList.tsx
│   ├── UploadModal.tsx
│   ├── ColumnMapper.tsx
│   └── DatasetSettings.tsx
├── leads/
│   ├── LeadCard.tsx
│   ├── LeadsList.tsx
│   ├── LeadDetails.tsx
│   └── LeadFilters.tsx
├── conversations/
│   ├── ConversationPanel.tsx
│   ├── MessageBubble.tsx
│   └── ConversationList.tsx
├── sophie/
│   ├── SophieInsightCard.tsx
│   ├── SophieFloatingButton.tsx
│   ├── SophieSidebar.tsx
│   ├── LessonsLibrary.tsx
│   ├── LessonCard.tsx
│   ├── PromptEditor.tsx
│   ├── TeachSophieModal.tsx
│   └── AgreeModal.tsx
├── analytics/
│   ├── AnalyticsOverview.tsx
│   ├── MetricCard.tsx
│   ├── ConversionFunnel.tsx
│   ├── TrendChart.tsx
│   └── StatusGrid.tsx
├── calls/
│   ├── BookCallModal.tsx
│   └── CallsList.tsx
├── settings/
│   ├── ClientSettings.tsx
│   ├── IntegrationSettings.tsx
│   └── UserManagement.tsx
├── shared/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Tooltip.tsx
│   ├── SearchBar.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   └── ConfirmDialog.tsx
└── providers/
    ├── AuthProvider.tsx
    ├── ClientProvider.tsx
    ├── DatasetProvider.tsx
    └── SophieProvider.tsx
```

---

## Key Design Principles

1. **Consistency**: Same patterns across all pages
2. **Clarity**: Clear CTAs, obvious actions
3. **Feedback**: Loading states, success/error messages
4. **Efficiency**: Minimize clicks to complete tasks
5. **Sophie Integration**: Always visible but not intrusive
6. **Real-time**: Instant updates without page refresh
7. **Mobile-first**: Works on all devices

---

## Next: Build Components in This Order

**Phase 1: Authentication & Shell**
1. AuthProvider
2. DashboardLayout + Sidebar
3. Login/Signup pages

**Phase 2: Datasets**
4. DatasetList + DatasetCard
5. UploadModal + ColumnMapper
6. Dataset creation flow

**Phase 3: Core Dashboard**
7. LeadCard + ConversationPanel
8. AnalyticsOverview
9. HotLeadsSection

**Phase 4: Sophie**
10. SophieInsightCard
11. LessonsLibrary
12. PromptEditor

**Phase 5: Integrations**
13. BookCallModal (Cal.com)
14. n8n API integration
15. Real-time subscriptions

---

**Total Components:** ~60 components
**Reusable Components:** ~20
**Page Components:** ~15
**Feature Components:** ~25

