# OTT Platform — Architecture Reference

**One Thousand Tales Photography Studio, Chennai**  
`sapienbuild.vercel.app` · Internal operations platform · Single-tenant

---

## System Overview

The OTT Platform is a custom-built internal operations system for a premium wedding photography studio. It consolidates the entire business lifecycle into one web application: inbound lead capture from Meta ads → CRM management → 9-stage project workflow → quote/invoice/receipt generation with branded PDF → payment tracking → equipment inventory → automated weekly social-media content generation → cross-platform marketing analytics. Primary user is the studio owner (Dilip Kumar); a second role (member) is used for executive/operations staff.

---

## Tech Stack

All versions from `package.json`:

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | **16.2.6** |
| Runtime | React + React DOM | **19.2.4** |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| UI components | shadcn/ui (Radix Nova) | ^4.11.0 (via `radix-ui` ^1.5.0) |
| Animation | Framer Motion | ^12.40.0 |
| Icons | Lucide React | ^1.17.0 |
| Charts | Recharts | ^3.8.1 |
| Drag & Drop | @dnd-kit/core + sortable | ^6.3.1 / ^10.0.0 |
| PDF generation | pdf-lib + @pdf-lib/fontkit | ^1.17.1 / ^1.1.1 |
| Validation | Zod | ^4.4.3 |
| Database + Auth + Realtime | @supabase/supabase-js | ^2.108.1 |
| SSR auth helper | @supabase/ssr | ^0.12.0 |
| Email | Resend (via REST API, no SDK) | — |
| AI | Anthropic Claude (via SDK in lib/agent) | — |
| Hosting | Vercel (serverless + cron) | — |

---

## Directory Structure

```
sapienbuild/
├── app/                        Next.js App Router — pages and API routes
│   ├── api/                    All server-side route handlers (Node.js runtime)
│   │   ├── agent/              AI content agent: trigger, run-weekly, approve, reject, skip, suggestions, settings
│   │   ├── assets/             Equipment CRUD
│   │   ├── auth/               Google and Meta OAuth initiation + callbacks
│   │   ├── calendar/           Google Calendar OAuth + book endpoint
│   │   ├── clients/            Legacy clients CRUD (older data model)
│   │   ├── contacts/           Unified contacts CRUD (lead / client / contractor)
│   │   ├── cron/               Vercel cron targets: asset-service-reminders, clarity-insights
│   │   ├── crm/                CRM-specific actions: convert (lead → project)
│   │   ├── dashboard/          Aggregated dashboard KPI endpoint
│   │   ├── generate-quote/     pdf-lib PDF generation + storage
│   │   ├── gmb/                Google My Business OAuth status
│   │   ├── gsc/                Google Search Console OAuth status
│   │   ├── invoices/           Invoice/quote/receipt CRUD + event history
│   │   ├── leads/              Legacy leads CRUD
│   │   ├── marketing/          Analytics data routes: gsc, gsc-queries, meta-ads, gmb, clarity-insights
│   │   ├── meta-leads/         Meta Lead Ads webhook receiver + test endpoint
│   │   ├── payments/           Payment record CRUD
│   │   ├── projects/           Projects CRUD + stage transitions + payment-summary
│   │   ├── quotes/             Legacy quotes CRUD
│   │   ├── social/             Post-now publishing endpoint
│   │   ├── tasks/              Project task CRUD
│   │   ├── team-assignments/   Project ↔ contractor assignment CRUD
│   │   ├── website-enquiry/    Website contact form handler
│   │   └── youtube/            YouTube OAuth + status
│   ├── accounts/               Accounts page: QuoteBuilder, ProjectPaymentsSection
│   ├── assets/                 Equipment inventory page
│   ├── auth/callback/          Supabase OAuth callback route
│   ├── clients/                Legacy client detail pages
│   ├── crm/                    CRM hub + leads + clients + team sub-pages
│   ├── dashboard/              Executive dashboard (Server Component + client chart widgets)
│   ├── leads/                  Legacy leads page
│   ├── login/                  Auth login page
│   ├── marketing/              Marketing analytics (Traffic / Ads / Social / Local tabs)
│   ├── projects/               Projects list + [id] detail with tasks, team & schedule
│   ├── quotes/                 Legacy quotes page
│   ├── social/                 AI content suggestions page + /settings (admin-gated)
│   └── workflow/               9-stage drag-and-drop Kanban
├── components/
│   └── layout/                 SidebarNav (navigation) + theme-provider
├── lib/
│   ├── agent/                  runContentAgent.ts, generateWeeklyPlan.ts (AI pipeline)
│   ├── drive/                  scanFolder.ts (Google Drive service account access)
│   ├── meta/                   getInsights.ts (Meta Ads API helper)
│   ├── supabase/               server.ts, browser.ts client factories; migrations/
│   │   └── migrations/         All SQL schema migration files (run manually in Supabase SQL Editor)
│   ├── youtube/                refreshToken.ts, postShort.ts
│   ├── auth.ts                 useUserRole() client hook
│   ├── calendar.ts             bookCalendarForProject() — Google Calendar integration
│   ├── services.ts             Photography service catalog (9 predefined services)
│   ├── supabase-admin.ts       Service-role admin client (lazy singleton)
│   ├── supabase.ts             Browser anon client
│   └── workflow.ts             moveProjectToStage() — single source of truth for stage transitions
├── public/templates/           Standard_template_for_quotes.pdf — Canva-designed PDF template
├── middleware.ts               Session refresh + /social/settings admin gate
├── next.config.ts              Minimal Next.js config
├── vercel.json                 Cron job definitions (3 jobs)
└── package.json
```

---

## Data Model

All tables live in Supabase PostgreSQL. All have Row Level Security enabled. API routes use the **service-role admin client** (bypasses RLS). Browser/server-component clients use the **anon key** (respects RLS). Migrations are `.sql` files run manually in the Supabase SQL Editor — there is no automated migration runner.

### Core business tables

| Table | Purpose | Key columns | FK relationships |
|-------|---------|-------------|-----------------|
| `contacts` | Unified CRM store — leads, clients, contractors | `id`, `type` (lead/client/contractor), `source`, `first_name`, `last_name`, `email`, `phone`, `status`, `notes` | Referenced by projects, invoices, team_assignments |
| `projects` | Photography bookings / events | `id`, `contact_id`, `title`, `workflow_stage`, `event_date`, `event_type`, `budget`, `location`, `notes` | → contacts |
| `project_tasks` | Per-project Kanban tasks | `id`, `project_id`, `title`, `status` (todo/in_progress/review/done), `position`, `due_date` | → projects |
| `project_team_assignments` | Contractor-to-project assignments | `id`, `project_id`, `team_member_id`, `role`, `calendar_event_id`, `synced_at` | → projects, → contacts |
| `workflow_events` | Immutable audit log of stage changes | `id`, `project_id`, `from_stage`, `to_stage`, `changed_by`, `notes`, `created_at` | → projects |
| `invoices` | Quotes, invoices, receipts | `id`, `project_id`, `contact_id`, `type` (quote/invoice/receipt), `status`, `amount`, `pdf_data` (base64), `invoice_number`, `client_name`, `events_list`, `event_dates`, `location`, `discount_type`, `discount_value`, `line_items` (jsonb) | → projects, → contacts |
| `invoice_events` | Named ceremony/function rows within a quote | `id`, `invoice_id`, `event_name`, `event_date`, `sort_order` | → invoices |
| `payments` | Payment installment ledger | `id`, `invoice_id`, `project_id`, `amount`, `payment_type` (advance/partial/balance/full), `payment_date`, `method`, `notes` | → invoices, → projects |
| `assets` | Equipment inventory | `id`, `name`, `category`, `purchase_value`, `purchase_date`, `last_service_date`, `service_interval_days`, `next_service_due`, `service_notes`, `assigned_to` | — |

### Social / content agent tables

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `content_suggestions` | AI-generated content queue | `id`, `week_start`, `day_of_week`, `content_type` (post/reel), `drive_file_id`, `caption`, `hashtags[]`, `status` (pending/approved/edited/skipped/posted/rejected), `approved_at`, `rejected_at`, `facebook_post_id`, `youtube_video_id` |
| `content_agent_runs` | Run history / audit | `id`, `week_start`, `status` (running/completed/failed), `generated_by` (cron/manual), `suggestions_generated`, `error_message` |
| `agent_settings` | Agent config (single row: id = `00000000-0000-0000-0000-000000000001`) | `caption_tone`, `always_include_hashtags[]`, `blackout_days[]`, `min_days_between_same_wedding`, `use_ai_times` |

### OAuth token tables (server-only, RLS deny-all on browser)

| Table | Purpose | Notable columns |
|-------|---------|----------------|
| `gsc_tokens` | Google Search Console | `access_token`, `refresh_token`, `expiry`, `site_url` (single row) |
| `gmb_tokens` | Google My Business | `access_token`, `refresh_token`, `expiry`, `account_name`, `location_id` (single row) |
| `youtube_tokens` | YouTube Data API | `access_token`, `refresh_token`, `expiry`, `channel_id`, `channel_name` (single row) |
| `google_calendar_tokens` | Google Calendar | `access_token`, `refresh_token`, `expiry`, `calendar_id` (single row) |

### Auth / RBAC

| Table | Purpose | RLS policy |
|-------|---------|------------|
| `profiles` | `id` (= `auth.users.id`), `email`, `role` (admin/member) | `SELECT` own row only; no browser INSERT/UPDATE (auto-created by trigger on sign-up) |
| `clarity_page_insights` | Cached Clarity behavioural metrics (per URL per day) | Deny all browser access — server role only |

**RLS note on business tables:** Most tables use `FOR ALL USING (true)` — allowing any authenticated request through the service-role key. This is intentional for a single-tenant internal tool. See migration comments: *"tighten if multi-tenant."*

---

## API Routes

### CRM

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/contacts` | List (filterable by `?type=`) / create contacts |
| GET/PUT/DELETE | `/api/contacts/[id]` | Contact CRUD |
| POST | `/api/meta-leads/webhook` | Meta Lead Ads webhook — validates token, fetches lead from Graph API, inserts contact + project + workflow_event |
| GET | `/api/meta-leads/webhook` | Webhook verification handshake (GET with hub.challenge) |
| GET | `/api/meta-leads/test` | Test endpoint for webhook integration |
| POST | `/api/crm/convert` | Convert a lead contact into a project — immediately updates `type='client'` and creates project at `workflow_stage='enquiry'` |
| GET/POST | `/api/leads` | Legacy leads (uses contacts table internally) |

### Projects & Workflow

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/projects` | List projects (includes team assignments with `team_member_id`) / create |
| GET/PATCH | `/api/projects/[id]` | Project detail / update fields or trigger stage transition via `moveProjectToStage()` |
| GET | `/api/projects/payment-summary` | Per-project invoiced/paid/balance/documents/quoteStatus aggregation |
| GET/POST | `/api/tasks` | List / create project tasks |
| GET/PUT/DELETE | `/api/tasks/[id]` | Task CRUD |

### Accounts

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/invoices` | List (filterable by `?type=`) / create quote, invoice, or receipt |
| GET/PUT/DELETE | `/api/invoices/[id]` | Invoice CRUD |
| GET | `/api/invoices/[id]/events` | Invoice event (ceremony) history |
| POST | `/api/generate-quote` | pdf-lib PDF generation: reads `public/templates/Standard_template_for_quotes.pdf`, overlays data, groups services by `invoice_events`, stores result in `invoices.pdf_data` |
| GET/POST | `/api/payments` | List / record payments |
| GET/DELETE | `/api/payments/[id]` | Payment detail / delete |

### Team Assignments

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/team-assignments` | List / create contractor-to-project assignments |
| GET/DELETE | `/api/team-assignments/[id]` | Assignment detail / remove |

### Assets

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/assets` | List / create assets |
| GET/PUT/DELETE | `/api/assets/[id]` | Asset CRUD |

### AI Content Agent

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/agent/run-weekly` | Cron target + manual trigger: calls `generateWeeklyPlan()` |
| POST | `/api/agent/run-weekly` | Same handler as GET (for Settings page "Run Agent Now") |
| POST | `/api/agent/trigger` | On-demand trigger: uses Next.js `after()` to run `runContentAgent()` in background after response; prevents concurrent runs via DB check |
| GET/POST | `/api/agent/settings` | Read / update `agent_settings` row |
| GET | `/api/agent/runs` | Recent `content_agent_runs` history |
| GET | `/api/agent/suggestions` | List `content_suggestions` for current week |
| GET | `/api/agent/suggestions/[id]` | Single suggestion detail |
| POST | `/api/agent/approve` | Set `status='approved'` (+ `approve_all` bulk action); does **not** publish — publishing requires a separate "Post Now" call |
| POST | `/api/agent/reject` | Set `status='rejected'` + `rejected_at` timestamp; agent excludes this `drive_file_id` in future runs |
| POST | `/api/agent/skip` | Set `status='skipped'` |

### Social Publishing

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/social/post-now` | Publish to Meta (FB/IG via Graph API) and conditionally to YouTube Shorts; updates `facebook_post_id` / `youtube_video_id` on suggestion row |

### Marketing Analytics

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/marketing/gsc` | GSC clicks + impressions via OAuth refresh token (live API call) |
| GET | `/api/marketing/gsc-queries` | GSC top search queries |
| GET | `/api/marketing/meta-ads` | Meta Marketing API: account-level insights + campaign list |
| GET | `/api/marketing/gmb` | Google My Business performance metrics via OAuth |
| GET | `/api/marketing/clarity-insights` | Reads from `clarity_page_insights` table (not a live API call — data is from daily cron) |

### Google OAuth flows (GSC / GMB / Calendar)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/gsc/auth`, `/api/gsc/callback`, `/api/gsc/status` | GSC OAuth connect flow + status |
| GET | `/api/gmb/auth`, `/api/gmb/callback`, `/api/gmb/status` | GMB OAuth connect flow + status |
| GET | `/api/youtube/auth`, `/api/youtube/callback`, `/api/youtube/status` | YouTube OAuth connect flow + status |
| GET | `/api/calendar/auth`, `/api/calendar/callback`, `/api/calendar/status` | Google Calendar OAuth connect flow + status |
| POST | `/api/calendar/book` | Create/update Google Calendar events for all team members assigned to a project |
| GET/POST | `/api/auth/google` | Google OAuth for app sign-in |

---

## Background Jobs (Cron)

Defined in `vercel.json`. All schedules are UTC.

| Path | Schedule | IST equivalent | What it does |
|------|----------|---------------|--------------|
| `/api/agent/run-weekly` | `30 0 * * 1` | Monday 06:00 IST | Scans Google Drive photo + video folders via service account; calls Claude to select 14 items and generate captions/hashtags; inserts `content_suggestions` rows. |
| `/api/cron/asset-service-reminders` | `30 1 * * 1` | Monday 07:00 IST | Queries assets with `next_service_due` within 7 days; sends styled HTML email via Resend REST API. Degrades silently if `RESEND_API_KEY` is not set. |
| `/api/cron/clarity-insights` | `0 6 * * *` | Daily 11:30 IST | Calls Microsoft Clarity Data Export API (1 request/day limit); parses per-URL metrics (traffic, scroll depth, rage clicks, etc.); upserts into `clarity_page_insights`. |

---

## External Integrations

### Connected and actively used

| Integration | Method | Routes/Code | Notes |
|-------------|--------|------------|-------|
| **Meta Lead Ads** | Webhook (incoming POST) | `/api/meta-leads/webhook` | Validates `META_WEBHOOK_VERIFY_TOKEN`; fetches lead details from Graph API with `META_PAGE_ACCESS_TOKEN`. |
| **Meta Marketing API** | REST (system-user token) | `/api/marketing/meta-ads` | Requires `META_AD_ACCOUNT_ID` + `META_PAGE_ACCESS_TOKEN`. Returns account-level insights and campaign list. |
| **Meta Graph API (publishing)** | REST | `/api/social/post-now` | Posts photos to FB/IG (`/{pageId}/photos`, `/{pageId}/videos`). Requires same page access token. |
| **Google Search Console** | OAuth 2.0 (refresh token) | `/api/marketing/gsc`, `/api/gsc/*` | Refresh token stored in `gsc_tokens`; access token refreshed on demand by the route handler. |
| **Google My Business** | OAuth 2.0 (refresh token) | `/api/marketing/gmb`, `/api/gmb/*` | Refresh token stored in `gmb_tokens`. Uses `businessprofileperformance.googleapis.com` API. |
| **YouTube Data API** | OAuth 2.0 (refresh token) | `/api/youtube/*`, `lib/youtube/postShort.ts` | Token in `youtube_tokens`. Used for Shorts upload after social approval. |
| **Google Calendar** | OAuth 2.0 (refresh token) | `/api/calendar/*`, `lib/calendar.ts` | Token in `google_calendar_tokens`. Creates all-day events for each team member's email on a project. |
| **Google Drive** | Service account (JSON key) | `lib/drive/scanFolder.ts` | Scans photo/video folders; makes files temporarily public for Claude Vision. Requires `GOOGLE_SERVICE_ACCOUNT_JSON` (base64). |
| **Anthropic Claude** | API key | `lib/agent/runContentAgent.ts`, `lib/agent/generateWeeklyPlan.ts` | Caption generation, content selection, posting rationale. |
| **Resend** | REST API key | `/api/cron/asset-service-reminders`, `/api/social/post-now` (email for quotes) | No SDK — direct `fetch` to `https://api.resend.com/emails`. Requires `RESEND_API_KEY`. |
| **Microsoft Clarity** | Data Export API (JWT) | `/api/cron/clarity-insights` | One call per day via cron; requires `CLARITY_API_TOKEN`. UI reads cached data from `clarity_page_insights`, not live API. |

### Configured in UI / hardcoded as "connected", no real backend

| Integration | Status in UI | Reality |
|-------------|-------------|---------|
| **Google Analytics 4** | `connected: true` (hardcoded) | Site tag `G-7D8CV5XJ3P` is embedded; no server-side GA4 Data API route exists. UI shows as always connected. |
| **FB Pixel** | `connected: true` (hardcoded) | Pixel ID `2095033841062445` embedded as a site tag; no Conversions API backend. |
| **Google Ads** | `connected: true` (hardcoded in strip); "Account Ready" placeholder in Ads tab | Customer ID 379-721-4027 registered; no backend route; developer token pending approval from Google. No campaign data served. |
| **FB/IG follower counts** | Platform cards show `stat="—"` | Social tab platform cards show hardcoded dashes; no Insights API call for follower/reach data. |
| **Reach-over-time chart** | Dashed placeholder lines | Chart renders with empty data; "Connect platform accounts to see live reach data" message. |

### Not yet integrated

| Integration | Status |
|-------------|--------|
| **LinkedIn Marketing API** | "Pending Approval" badge in UI; no backend route. |
| **Instagram Business account** | Partially usable via page token (photo/reel publish works via Meta Graph API), but dedicated IG follower/reach insights not pulled. |

---

## Authentication & Authorisation

### Auth flow
1. Supabase Auth handles sign-in (email/password + Google OAuth).
2. JWT stored in HTTP-only cookie managed by `@supabase/ssr`.
3. `middleware.ts` runs **only** on `/social/settings` (via `matcher`). It calls `supabase.auth.getUser()` (server-side JWT validation, not just cookie read), then checks `profiles.role`. Non-admin → redirect to `/social?access=denied`. All other routes are **not** protected by middleware.
4. API routes are protected only by the service-role key being server-side — no per-request user validation in API routes.

### Role model
Two roles in `profiles.role`: `admin` and `member`. Auto-created by a Postgres trigger (`on_auth_user_created`) on first sign-in. `dilipkumarphotography@gmail.com` is seeded as `admin`; all other emails default to `member`. Role changes require direct database access (no UI for this).

### Supabase client variants
| Context | File | Key | Notes |
|---------|------|-----|-------|
| API route handlers | `lib/supabase-admin.ts` | `SUPABASE_SERVICE_ROLE_KEY` | Lazy singleton; bypasses RLS. Used in all `/api/*` routes. |
| Server components | `lib/supabase/server.ts` | Anon key | Creates per-request client from cookies. |
| Client components | `lib/supabase/browser.ts` | Anon key | Singleton browser client. Also `lib/supabase.ts` (legacy). |
| Middleware | Inline in `middleware.ts` | Anon key + `@supabase/ssr` | Cookie read/write on `NextRequest`/`NextResponse`. |

---

## Key Architectural Decisions

### 1. Single source of truth for stage transitions
`lib/workflow.ts` exports `moveProjectToStage()`, which is the **only function authorised to change `projects.workflow_stage`**. All callers — Kanban drag-drop (`PATCH /api/projects/[id]`) — route through this function. This guarantees that side effects (task creation, invoice creation, audit log) always fire and cannot be skipped by a direct DB update. The function is `async` and takes a Supabase client as a parameter, making it testable and usable in both API routes and cron jobs.

### 2. Server-only OAuth token custody
All OAuth refresh tokens (`gsc_tokens`, `gmb_tokens`, `youtube_tokens`, `google_calendar_tokens`) are stored with a `deny all browser access` RLS policy. Only server-side route handlers (using the service-role admin client) can read or write these rows. This means refresh tokens never reach the browser or the Next.js client bundle. Each marketing route independently refreshes its own access token on demand.

### 3. Dashboard: Server Component + Realtime-triggered refresh
The dashboard page (`app/dashboard/page.tsx`) is a React **Server Component** that fetches all data at request time (no `useEffect`, no API call from the browser). The `StatsCards` client component receives the data as props but also subscribes to four Supabase Realtime channels (`contacts`, `projects`, `invoices`, `workflow_events`). On any change, it calls `router.refresh()`, which re-runs the Server Component data fetch and re-renders the page. This pattern avoids duplicating data-fetching logic while still providing live updates; the trade-off is a full server re-render rather than an in-place state update.

### 4. On-demand vs scheduled agent runs
The weekly cron (`/api/agent/run-weekly`) and the manual trigger (`/api/agent/trigger`) call the same underlying function (`runContentAgent` / `generateWeeklyPlan`). The trigger route uses Next.js `after()` to run the pipeline **after** the HTTP response is sent, so the browser gets an immediate `{ run_id }` and polls `/api/agent/runs` for completion. A concurrent-run guard (query `content_agent_runs WHERE status='running'`) prevents accidental double execution.

### 5. Single-tenant design
There are no organisation, workspace, or tenant columns anywhere in the schema. RLS policies either `USING (true)` (allow all) or deny browser access entirely. This dramatically simplifies queries, removes join complexity, and means every API route can use the service-role key without filtering by tenant. The explicit decision is documented in the BRD: *"single-studio internal tool only."*

### 6. Graceful degradation on integrations
Every marketing analytics route (`/api/marketing/gsc`, `gmb`, `clarity-insights`, `meta-ads`) returns a structured JSON even on failure — never propagates an error that would crash the page. Routes return `{ connected: false }` when tokens are missing, and the UI renders a "Connect in Settings" prompt. This design means all four marketing tabs remain independently functional; one broken integration cannot cascade.

### 7. PDF generation: template overlay, not from scratch
`/api/generate-quote` loads `public/templates/Standard_template_for_quotes.pdf` (a static Canva-designed PDF) and overlays dynamic data using pdf-lib. Text is drawn at absolute coordinates calibrated to the template. The generated binary is stored in `invoices.pdf_data` (base64) so subsequent downloads re-use the stored version rather than re-generating. The template file must be present in the `public/` directory at build time.

---

## Environment Variables

| Variable | Required by |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server component clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin client in all API routes |
| `META_WEBHOOK_VERIFY_TOKEN` | Meta Lead Ads webhook verification |
| `META_PAGE_ACCESS_TOKEN` | Meta Graph API (lead fetch, publish, ad insights) |
| `META_AD_ACCOUNT_ID` | Meta Marketing API (`act_{id}`) |
| `ANTHROPIC_API_KEY` | Content agent — caption generation |
| `GOOGLE_CLIENT_ID` | GSC / GMB / Calendar OAuth token refresh |
| `GOOGLE_CLIENT_SECRET` | GSC / GMB / Calendar OAuth token refresh |
| `GOOGLE_DRIVE_PHOTOS_FOLDER_ID` | Drive scan — photo folder |
| `GOOGLE_DRIVE_VIDEOS_FOLDER_ID` | Drive scan — video folder |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Drive service account (base64 JSON) |
| `YOUTUBE_CLIENT_ID` | YouTube OAuth |
| `YOUTUBE_CLIENT_SECRET` | YouTube OAuth |
| `YOUTUBE_REDIRECT_URI` | YouTube OAuth callback URL |
| `RESEND_API_KEY` | Email — asset service reminders + quote emails |
| `CLARITY_API_TOKEN` | Clarity Data Export API (daily cron) |
| `CRON_SECRET` | Vercel cron authorization header |
| `REMINDER_EMAIL` | Override email address for asset service reminders |

---

_Generated from codebase — verified by reading source files. June 2026._
