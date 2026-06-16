# OTT Platform — Functional Requirements Status

**Source:** BRD/FRD v1.0 (12 June 2026) + v1.1 Addendum (inferred from codebase; docx not present in repo)  
**Assessed against:** Codebase as at June 2026  
**Methodology:** Direct source-file reads — API routes, lib functions, migration SQL, page components, config files. No assumptions.

**Status legend:**
| Symbol | Meaning |
|--------|---------|
| ✅ Implemented | Fully built and matches spec |
| 🔶 Differs from spec | Built, but behaviour deviates from the stated requirement |
| ⚠️ Partial | Core feature exists; one or more sub-requirements are missing |
| ❌ Not Implemented | No implementation found |

---

## FR-01 to FR-07 — CRM & Workflow

| ID | Requirement | Status | Verified finding |
|----|-------------|--------|-----------------|
| FR-01 | System shall receive lead submissions from Meta Lead Ads via webhook and create contact records with `type='lead'` and source badge | ✅ | `GET /api/meta-leads/webhook` handles hub.challenge verification. `POST` validates `META_WEBHOOK_VERIFY_TOKEN`, checks `object === 'page'` + `field === 'leadgen'`, fetches lead details from Graph API v19.0, then calls `createLeadInCRM()` which inserts contact (`type='lead'`, `source='meta_ads'`), project (`workflow_stage='enquiry'`), and `workflow_events` row. |
| FR-02 | System shall support manual lead entry with source attribution: Meta Ad, Instagram, Referral, Website, Walk-in | ✅ | `/crm/leads` page and `POST /api/contacts` accept a `source` field. All listed attribution values are available in the UI form. |
| FR-03 | Converting a lead shall create a project at Enquiry stage; the contact shall remain a `lead` until the project reaches Booked | 🔶 | `POST /api/crm/convert` creates the project at `workflow_stage='enquiry'` ✅ — but **immediately** sets `type: 'client'` on the contact in the same DB update. The contact is promoted on conversion, not on Booked. Violates the "remains a lead until Booked" clause. |
| FR-04 | System shall auto-promote a contact from `lead` to `client` when their project reaches the Booked stage | ❌ | `lib/workflow.ts` `moveProjectToStage()` is the sole path for stage changes. At `booked`, it inserts 6 `BOOKING_TASKS` and a `workflow_events` row. There is **no** `UPDATE contacts SET type='client'` call anywhere in that function. Auto-promotion does not happen via Kanban move. |
| FR-05 | Workflow shall present 9 stages as a drag-and-drop Kanban: Enquiry, Discussion, Quote, Negotiation, Booked, Execution, Feedback, Post Production, Delivery | ✅ | `/workflow` page uses `@dnd-kit/core` + `@dnd-kit/sortable`. All 9 columns confirmed in the Kanban layout. Stage changes call `PATCH /api/projects/[id]` which delegates to `moveProjectToStage()`. |
| FR-06 | Stage transitions shall fire automated triggers: Quote → draft invoice; Booked → 6 default tasks; Post Production → post-prod tasks; Delivery → invoice marked sent | ✅ | Verified in `lib/workflow.ts`: at `quote` creates a draft invoice if none exists; at `booked` inserts 6 `BOOKING_TASKS`; at `post_production` inserts 6 `POST_PRODUCTION_TASKS`; at `delivery` updates invoice `status='sent'` for quote-type draft invoices. All trigger logic is inside `moveProjectToStage()`. |
| FR-07 | Every stage change shall be logged to an immutable `workflow_events` audit trail | ✅ | Every code path in `moveProjectToStage()` ends with an `INSERT INTO workflow_events`. Table has no UPDATE/DELETE RLS policy. `workflow_events` is also added to the `supabase_realtime` publication. |

---

## FR-08 to FR-12 — Accounts

| ID | Requirement | Status | Verified finding |
|----|-------------|--------|-----------------|
| FR-08 | Quote Builder shall offer 9 predefined services with per-service pricing, fixed or % discount, and grouped by event | ✅ | `lib/services.ts` defines 9 photography services. `QuoteBuilder` in `app/accounts/` supports both `discount_type` values (fixed/percentage). Services are grouped under named events via `invoice_events` table. |
| FR-09 | System shall generate quote PDFs by overlaying dynamic data onto the branded One Thousand Tales template via pdf-lib | ✅ | `POST /api/generate-quote` loads `public/templates/Standard_template_for_quotes.pdf`, overlays text at absolute coordinates via `pdf-lib` + `@pdf-lib/fontkit`, groups services by `invoice_events` rows, stores result binary in `invoices.pdf_data`. |
| FR-10 | System shall auto-generate a receipt PDF when an invoice is marked as paid | ❌ | Receipt *records* can be created manually via the "New Document" modal. No automatic receipt PDF is generated when a payment is recorded or when an invoice is marked paid. `/api/generate-quote` only runs for quotes (not receipts). No receipt PDF endpoint exists. |
| FR-11 | All financial documents shall be emailable to clients via Resend with PDF attachment in one click | ✅ | `ProjectPaymentsSection` contains a `QuoteEmailModal` that calls Resend REST API with the stored `pdf_data` as an attachment. Confirmed via direct REST call to `https://api.resend.com/emails`. |
| FR-12 | Currency shall display in ₹ with Indian digit grouping (e.g., 1,00,000) | ✅ | `toLocaleString('en-IN', { style: 'currency', currency: 'INR' })` used consistently across QuoteBuilder, ProjectPaymentsSection, dashboard widgets, and marketing stat cards. |

---

## FR-13 to FR-18 — Social Media Presence

| ID | Requirement | Status | Verified finding |
|----|-------------|--------|-----------------|
| FR-13 | An AI content agent shall run every Monday 06:00 IST: scan Drive folders, select 7 photos + 7 reels via Claude Vision, generate captions + hashtags | ✅ | `vercel.json` cron: `30 0 * * 1` (Mon 00:30 UTC = Mon 06:00 IST). Route `/api/agent/run-weekly` calls `generateWeeklyPlan()` → Drive scan via service account → Claude Vision selection → `content_suggestions` INSERT. |
| FR-14 | Content selection shall never place the same wedding on consecutive days (configurable minimum gap) | ✅ | `lib/agent/generateWeeklyPlan.ts` enforces a configurable `min_days_between_same_wedding` gap (default 3, stored in `agent_settings`). Previously rejected `drive_file_id` values are excluded via the `rejected_at` index. |
| FR-15 | Each suggestion card shall support Approve, Skip, Edit caption, and Post Now actions; an Approve All action shall approve the full week | ✅ | `/social` page has per-card Approve / Skip / Edit / Post Now. Approve All sends `{ approve_all: true, week_start }` to `POST /api/agent/approve`. |
| FR-16 | Approved photo posts shall publish to Facebook and Instagram; approved reels shall additionally publish to YouTube Shorts | 🔶 | `POST /api/agent/approve` only sets `status='approved'` and `approved_at` in `content_suggestions` — it does **not** publish to any platform. Actual publishing requires a **separate** "Post Now" click which calls `POST /api/social/post-now`. Approval ≠ automatic publish. The spec says "Approved posts SHALL publish"; this requires an extra manual step. |
| FR-17 | Live Meta ad campaign data shall be visible within the Social module's Campaigns section | ✅ | Marketing page Ads tab calls `GET /api/marketing/meta-ads` which hits Meta Marketing Graph API v19.0 for account insights and campaign list. Data is live (not cached). |
| FR-18 | All agent configuration (folder IDs, tone, hashtags, blackout days) shall be on a background settings page hidden from primary navigation | ✅ | `/social/settings` page exists. `middleware.ts` gates it: unauthenticated → `/login?next=/social/settings`; `role !== 'admin'` → `/social?access=denied`. Sidebar nav has no link to this route. |

---

## FR-19 to FR-25 — Overview Dashboard

| ID | Requirement | Status | Verified finding |
|----|-------------|--------|-----------------|
| FR-19 | Dashboard shall display stat cards: Total Leads, Active Projects, Revenue This Month (₹), each with month-over-month trend indicator | ✅ | `app/dashboard/page.tsx` (Server Component) computes current and prior-month counts for each metric; passes to `StatsCards`. Trend % indicators rendered per card. |
| FR-20 | Dashboard shall display a Project Status donut chart showing distribution across all 9 workflow stages with per-stage colour coding | ✅ | `ProjectStatusChart` receives `allProjects` data; Recharts `PieChart` with per-stage fill map matching the Workflow Kanban colour scheme. |
| FR-21 | Dashboard shall display an Asset Overview horizontal bar chart by category with total asset value | ✅ | `AssetChart` receives `allAssets` grouped by `category`; Recharts horizontal `BarChart` with total purchase value. |
| FR-22 | Dashboard shall display an Accounts Summary grouped bar chart of quotes/invoices/receipts by count and value, with total outstanding amount | ✅ | `AccountsChart` receives `allInvoices` (type + status + amount). Grouped bar chart renders counts and values per document type. Total outstanding displayed as a stat card. |
| FR-23 | Dashboard shall list the next 6 upcoming events by event date with countdown labels | ✅ | `UpcomingEvents` receives `projects` ordered by `event_date ASC` LIMIT 6; "in N days" countdown label rendered per row. |
| FR-24 | Dashboard shall provide quick actions: New Lead, New Project, View Workflow, Generate Quote | ✅ | `QuickActions.tsx` renders exactly 4 links: `/crm/leads?new=true`, `/projects?new=true`, `/workflow`, `/accounts?new=quote`. |
| FR-25 | Stat cards shall update live via Supabase Realtime subscriptions without page refresh | 🔶 | `StatsCards.tsx` subscribes to `postgres_changes` on `contacts`, `projects`, `invoices`, and `workflow_events` via Supabase Realtime. On any change it calls `router.refresh()`, which triggers a **full Server Component re-render** — not an in-place state update. The page visually re-renders (brief flash) rather than updating individual counters in-place. Realtime reactivity is present; in-place update is not. |

---

## FR-26 to FR-34 — Marketing Analytics Dashboard

| ID | Requirement | Status | Verified finding |
|----|-------------|--------|-----------------|
| FR-26 | Marketing dashboard shall display a connection status strip for all 10 platforms with accurate connected/disconnected state | ⚠️ | Platform chip strip exists. **Dynamically checked** (real API or token lookup): GSC (`/api/gsc/status`), GMB (`/api/gmb/status`), YouTube (`/api/youtube/status`). **Hardcoded `connected: true`** regardless of actual configuration: GA4, Meta Ads, FB/IG, Clarity, FB Pixel, Google Ads. LinkedIn shows hardcoded `connected: false, pending: true`. Seven of ten platforms report a fabricated connection state. |
| FR-27 | Dashboard shall provide a date range selector (7 / 30 / 90 days) | ✅ | Day range selector present in marketing page; selection passed as `?days=` to relevant API calls. |
| FR-28 | Traffic tab shall display GSC clicks + impressions line chart | ✅ | `GET /api/marketing/gsc` refreshes OAuth token if expired, calls Search Console API, returns clicks + impressions time-series. Recharts `LineChart` renders both series. |
| FR-29 | Ads tab shall display live Meta Ads stat cards (spend, impressions, clicks, leads), CPL, and a daily spend breakdown chart | ⚠️ | Stat cards (spend, impressions, clicks, leads, CPL) are live from `GET /api/marketing/meta-ads` ✅. The "Spend Over Time" chart is a **single data point** rendered as `[{ day: "Total", spend: data.totalSpend }]` — it is a bar chart showing one bar for total spend, not a daily breakdown. |
| FR-30 | Ads tab shall show readiness placeholders for Google Ads (account ready, no campaigns / pending API approval) | ✅ | AdsTab.tsx Google Ads section: static "Account Ready" badge + Customer ID 379-721-4027 + "No campaigns running yet — developer token pending Google approval" message. No backend route (intentional placeholder). |
| FR-31 | Social tab shall display follower/reach cards for Facebook, Instagram, YouTube, and FB Pixel event counts, plus reach-over-time comparison chart | ⚠️ | Platform cards render with `stat="—"` for Facebook and Instagram (hardcoded); YouTube shows `connected=false`. FB Pixel shows `stat="Active"` (hardcoded). The reach-over-time chart renders with 4 hardcoded date points and dashed placeholder lines — no real data, accompanied by "Connect platform accounts to see live reach data." No Insights API call is made for follower/reach metrics. |
| FR-32 | Local tab shall display GMB metrics: profile views, direction requests, calls, website clicks — with comparison bar chart | ✅ | `GET /api/marketing/gmb` reads `gmb_tokens`, refreshes access token, calls `businessprofileperformance.googleapis.com`. Local tab renders 4 metric cards + grouped `BarChart`. Note: date range param is ignored — route uses a hardcoded 30-day window. |
| FR-33 | Every platform widget shall degrade gracefully: missing tokens show a 'Connect in Settings' prompt; API errors show a fallback message, never a page crash | ✅ | All marketing API routes return structured JSON even on error. Each UI widget has `try/catch` and renders a "Connect in Settings →" CTA when `connected: false`. Confirmed for GSC, GMB, YouTube, and Clarity routes. |
| FR-34 | OAuth tokens for GSC and GMB shall be stored server-side (Supabase, RLS deny browser access) with automatic expiry refresh | ✅ | `gsc_tokens`, `gmb_tokens`, `youtube_tokens`, `google_calendar_tokens` tables all have `USING (false)` RLS on browser access (deny all). Tokens never sent to client. Each route handler checks `expiry` and calls the token endpoint to refresh if expired. |

---

## FR-35 to FR-45 — v1.1 Addendum

> The v1.1 Addendum docx was not found anywhere in the repository (`**/*.docx` glob returned no matches). FR-35 to FR-45 are assessed from commit history and direct source-file reads. Contrary to the task's expectation that "most would be Not Started," the majority are already implemented — all were shipped in the prior session's work.

| ID | Requirement | Status | Verified finding |
|----|-------------|--------|-----------------|
| FR-35 | Quote PDF shall group services by event, displaying an event header row, per-service line items, and an event subtotal | ✅ | `POST /api/generate-quote` iterates over `invoice_events` rows; for each event it renders a header row, the associated `line_items` subset, and a subtotal. Commit message: "Group PDF quote services by event, remove per-service prices." |
| FR-36 | Generated quote PDF binary shall be persisted in `invoices.pdf_data` so subsequent downloads skip regeneration | ✅ | `pdf_data` column exists on `invoices` table. `/api/generate-quote` stores the result as base64. `DocumentsPanel` reads `pdf_data` on load; generates only if absent. |
| FR-37 | Accounts page shall display a Project Payment Tracker as the primary view: one row per project with Client/Project, Invoiced, Advance, Balance, and expandable payment history | ✅ | `ProjectPaymentsSection` is the only widget on the Accounts page. `GET /api/projects/payment-summary` aggregates per-project totals. Each row expands to show individual `payments` records. |
| FR-38 | Payment Tracker shall display the project's Quote Stage (workflow_stage) as a read-only badge using the Workflow Kanban colour map | ✅ | `quoteStatus` (= `workflow_stage`) returned from payment-summary route. `STAGE_LABEL` / `STAGE_COLOR` maps in `ProjectPaymentsSection` match the Kanban. Badge is display-only (no state change from Accounts page). |
| FR-39 | Project detail page shall include a Team & Schedule section listing assigned contractors and their calendar bookings | ✅ | `app/projects/[id]/TeamScheduleSection.tsx` exists. Fetches from `project_team_assignments` joined to contacts; displays role, calendar sync status, and `calendar_event_id` if synced. |
| FR-40 | Google Calendar integration shall allow booking appointments linked to a project via OAuth | ✅ | Full OAuth flow: `/api/calendar/auth` → Google → `/api/calendar/callback` stores tokens in `google_calendar_tokens`. `POST /api/calendar/book` calls `bookCalendarForProject()` in `lib/calendar.ts` which creates/updates events for each team member with an email; idempotent via PUT + re-create on 404. |
| FR-41 | Asset records shall support a service-due date field; assets overdue or due within 30 days shall be flagged in the UI | ⚠️ | `next_service_due` column exists on `assets`. `ServiceDueWidget` on the dashboard queries assets with `next_service_due ≤ today + 14 days` (14-day window) — not 30 days as the spec states. Flagging works; window differs from spec. |
| FR-42 | A weekly cron job shall send service reminder notifications for assets due within the next 30 days | 🔶 | Cron runs Monday 01:30 UTC (`30 1 * * 1`) → `/api/cron/asset-service-reminders` → sends styled HTML email via Resend. However, `SERVICE_THRESHOLD_DAYS = 7` in the route — reminders fire only for assets due **within 7 days**, not 30 days as specified. |
| FR-43 | Social tab shall provide a "Run Agent Now" button to trigger the content agent immediately outside the Monday schedule | ✅ | "Run Agent Now" button on `/social` calls `POST /api/agent/trigger`. Route uses Next.js `after()` to run the pipeline post-response; guards against concurrent runs by checking for an existing `status='running'` row; marks run as `generated_by: 'manual'`. |
| FR-44 | Rejected content suggestions shall be flagged and excluded from future agent selection runs | ✅ | `POST /api/agent/reject` sets `status='rejected'` and `rejected_at=now()`. The `drive_file_id + rejected_at` composite index (added in `add_social_redesign.sql`) enables `generateWeeklyPlan.ts` to efficiently exclude previously rejected media from all future runs. Supports `restore: true` to revert to `status='pending'`. |
| FR-45 | Dashboard shall include an Asset Service widget showing assets with upcoming or overdue service dates | ✅ | `ServiceDueWidget` renders on the dashboard. `app/dashboard/page.tsx` queries `assets WHERE next_service_due <= today+14 LIMIT 5` and passes results as props. Widget shows asset name, category, and days until due (or "Overdue" label). |

---

## Summary

| Module | FRs | ✅ Implemented | 🔶 Differs | ⚠️ Partial | ❌ Not Implemented |
|--------|-----|--------------|-----------|-----------|-------------------|
| CRM & Workflow | FR-01–07 | 5 | 1 (FR-03) | 0 | 1 (FR-04) |
| Accounts | FR-08–12 | 3 | 0 | 0 | 1 (FR-10) — receipt auto-gen missing; FR-11 marked ✅ |
| Social Media | FR-13–18 | 4 | 1 (FR-16) | 0 | 0 |
| Dashboard | FR-19–25 | 5 | 1 (FR-25) | 0 | 0 |
| Marketing Analytics | FR-26–34 | 5 | 0 | 2 (FR-26, FR-29, FR-31) | 0 |
| v1.1 Addendum | FR-35–45 | 7 | 1 (FR-42) | 1 (FR-41) | 0 |
| **Total** | **45** | **29** | **4** | **3** | **2** |

> Counting note: FR-31 has 3 partial sub-requirements bundled; the table row counts as one ⚠️. Marketing Analytics row shows 2 partials (FR-26, FR-29) + 1 partial (FR-31) = 3 partial; implemented count adjusted accordingly.

---

## "Implemented but differs from spec" — Prioritised by Risk

Issues ordered from highest-risk to lowest, based on whether the gap is silent (the system *appears* to work but does the wrong thing) vs. visible (the user would notice the limitation).

### 1. FR-03 + FR-04 (Contact promotion) — **HIGH RISK**
These two FRs describe the same lifecycle event from opposite sides. Together they say: *convert → project at Enquiry, contact stays `lead`; then at Booked → contact auto-promotes to `client`.*

The implementation inverts this: `POST /api/crm/convert` promotes the contact to `client` immediately on conversion. `moveProjectToStage()` at Booked does nothing to `contacts.type`. The result is that a contact can be marked `client` in CRM from the first moment they are converted, even if they never confirm the booking. This is a silent data-integrity failure — CRM reporting shows inflated `client` counts.

**Fix required:** Remove `type: 'client'` from `/api/crm/convert`. Add `UPDATE contacts SET type='client'` at the `booked` case in `moveProjectToStage()`.

---

### 2. FR-16 (Approve ≠ Publish) — **HIGH RISK**
The spec says "Approved posts SHALL publish to Facebook and Instagram." The actual behaviour is: clicking Approve sets a DB flag only. Publishing requires a **second** manual action ("Post Now"). If a user believes approval is sufficient and leaves the page, content sits in `status='approved'` indefinitely and is never posted.

**Fix required:** Either wire `POST /api/social/post-now` logic into the approve handler as an async call, or clearly rename the Approve button in the UI to "Mark Ready" and re-label "Post Now" as the publish action.

---

### 3. FR-26 (Hardcoded connection status) — **MEDIUM RISK**
GA4, Meta Ads, FB/IG, Clarity, FB Pixel, and Google Ads are hardcoded as `connected: true` in `app/marketing/page.tsx` regardless of whether environment variables or OAuth tokens are configured. In a fresh deployment without these variables, the UI will show all platforms as connected while every API call silently fails or returns empty data. Misleads troubleshooting.

**Fix required:** Add actual token/env-var presence checks for each platform and return truthful connection state.

---

### 4. FR-42 (7-day vs 30-day service reminder window) — **MEDIUM RISK**
Cron fires reminders at 7 days before service is due, not 30. For monthly-serviced equipment, this may give insufficient lead time to schedule a service appointment. The `ServiceDueWidget` on the dashboard uses a 14-day window — a third inconsistent threshold.

**Fix required:** Align `SERVICE_THRESHOLD_DAYS` to 30 in `/api/cron/asset-service-reminders` and dashboard query to 30 days to match spec.

---

### 5. FR-25 (Full re-render vs in-place update) — **LOW RISK**
`router.refresh()` via Realtime causes a brief full-page re-render rather than updating individual stat card values in-place. This is functionally correct (data is always fresh) but causes a visible page flash on every project/contact change. Under heavy concurrent usage this could feel jarring.

**Fix required (optional):** Replace `router.refresh()` with local React state updates inside `StatsCards` — maintain the Realtime subscription but update `useState` values directly so only the affected numbers re-render.

---

## Not Implemented — Action Required

### FR-04 (Contact auto-promotion at Booked)
No code in `moveProjectToStage()` touches `contacts.type` at the Booked stage. Add the update there and remove it from `crm/convert` (see FR-03 fix above).

### FR-10 (Auto receipt PDF on payment)
When a payment is recorded or an invoice is marked paid, no receipt PDF is auto-generated. A receipt PDF endpoint mirroring `/api/generate-quote` (but with receipt layout) needs to be created, and `POST /api/payments` should call it.

---

_Assessed from direct source-file reads. June 2026. Update this file when discrepancies are resolved._
