# Ballroom Dance Tracker — Development Plan

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Already scaffolded; Server Actions + React 19 |
| Language | TypeScript 5 | Already configured |
| Styling | Tailwind CSS v4 | Already configured |
| Database | Supabase (PostgreSQL) | Hosted Postgres, Row-Level Security, realtime, Storage for avatars |
| ORM | Drizzle ORM | Type-safe, lightweight, pairs well with Supabase Postgres |
| Auth | Better Auth | First-class App Router + Server Action support; social logins built-in |
| Validation | Zod | Server Action form validation; pairs with `useActionState` |
| PDF/Print | `@react-pdf/renderer` | Server-side PDF generation for progress reports |
| Social Cards | `@vercel/og` (via Route Handler) | Dynamic OG image generation for achievement share cards |
| PWA | `next-pwa` | Service worker + manifest for installable PWA |
| Animations | Framer Motion | Achievement unlock celebrations, progress animations |
| Icons | Lucide React | Consistent, tree-shakeable icon set |

---

## Folder Structure

```
ballroom-site/
├── app/
│   ├── (auth)/                      # Public auth pages (no app shell)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx               # Minimal centered layout
│   │
│   ├── (app)/                       # Protected pages (full app shell)
│   │   ├── layout.tsx               # Bottom nav + top bar
│   │   ├── dashboard/
│   │   │   └── page.tsx             # US-110–112
│   │   ├── dances/
│   │   │   ├── page.tsx             # Dance catalog list  US-010
│   │   │   ├── [style]/
│   │   │   │   ├── page.tsx         # Dance detail + level  US-013–016
│   │   │   │   └── patterns/
│   │   │   │       └── page.tsx     # Pattern list  US-020–026
│   │   ├── practice/
│   │   │   ├── page.tsx             # Session log list  US-033
│   │   │   └── new/
│   │   │       └── page.tsx         # Log a session  US-030–032
│   │   ├── achievements/
│   │   │   └── page.tsx             # Achievement gallery  US-051
│   │   ├── goals/
│   │   │   └── page.tsx             # Goals list + create  US-070–073
│   │   ├── competitions/
│   │   │   ├── page.tsx             # Competition history  US-083
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Competition detail  US-081–082
│   │   ├── reports/
│   │   │   └── page.tsx             # Report generator UI  US-040–044
│   │   └── profile/
│   │       └── page.tsx             # Edit profile  US-004–006
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts         # Better Auth handler
│   │   ├── og/
│   │   │   └── achievement/
│   │   │       └── route.tsx        # OG card image generation  US-061
│   │   └── reports/
│   │       └── pdf/
│   │           └── route.ts         # PDF download endpoint  US-043
│   │
│   ├── _components/                 # Shared UI (non-routable)
│   │   ├── ui/                      # Primitives: Button, Card, Badge, Modal
│   │   ├── nav/
│   │   │   ├── BottomNav.tsx
│   │   │   └── TopBar.tsx
│   │   ├── dance/
│   │   │   ├── DanceCard.tsx
│   │   │   ├── LevelBadge.tsx
│   │   │   └── PatternRow.tsx
│   │   ├── achievements/
│   │   │   ├── AchievementCard.tsx
│   │   │   └── UnlockCelebration.tsx
│   │   └── gamification/
│   │       ├── XpBar.tsx
│   │       └── StreakBadge.tsx
│   │
│   ├── _lib/                        # Pure logic (non-routable)
│   │   ├── db/
│   │   │   ├── index.ts             # Drizzle client
│   │   │   └── schema.ts            # All table definitions
│   │   ├── dal/
│   │   │   ├── index.ts             # verifySession, getUser
│   │   │   ├── dances.ts
│   │   │   ├── patterns.ts
│   │   │   ├── practice.ts
│   │   │   ├── achievements.ts
│   │   │   └── competitions.ts
│   │   ├── actions/                 # Server Actions
│   │   │   ├── auth.ts
│   │   │   ├── dances.ts
│   │   │   ├── patterns.ts
│   │   │   ├── practice.ts
│   │   │   ├── achievements.ts
│   │   │   └── competitions.ts
│   │   ├── gamification.ts          # XP calculation, achievement unlock logic
│   │   └── definitions.ts           # Shared Zod schemas + TS types
│   │
│   ├── globals.css
│   ├── layout.tsx                   # Root layout
│   └── not-found.tsx
│
├── proxy.ts                         # Route protection (Next.js 16 uses proxy.ts)
├── public/
│   ├── manifest.json                # PWA manifest
│   └── icons/                       # PWA icons
├── docs/
│   ├── user-stories.md
│   └── development-plan.md
└── drizzle/
    └── migrations/
```

---

## Database Schema (Drizzle / PostgreSQL)

```
users              id, email, name, avatar_url, bio, studio, created_at
sessions           id, user_id, expires_at                          (Better Auth managed)

dance_styles       id, slug, name, category (standard|latin|smooth|rhythm), description
user_dances        id, user_id, style_id, current_level, added_at
dance_levels       id, style_id, name (bronze|silver|gold|open), order

patterns           id, style_id, level_id, name, description, order
user_patterns      id, user_id, pattern_id, status (learning|working|mastered),
                   confidence (1–5), notes, updated_at

practice_sessions  id, user_id, date, duration_minutes, type (solo|class|lesson), notes
session_patterns   id, session_id, pattern_id

competitions       id, user_id, name, date, location
competition_events id, competition_id, style_id, level_id, result_placement, result_notes

achievements       id, slug, name, description, icon, xp_reward, category
user_achievements  id, user_id, achievement_id, unlocked_at

goals              id, user_id, style_id, target_level, target_date, completed_at

xp_log             id, user_id, amount, reason, created_at
```

---

## Development Phases

---

### Phase 0 — Foundation
**User Stories:** US-113, US-114 (PWA / offline)
**Effort:** 3–4 days

#### Tasks
1. Install dependencies:
   ```
   better-auth drizzle-orm @supabase/supabase-js
   drizzle-kit zod framer-motion lucide-react
   @react-pdf/renderer @vercel/og next-pwa
   ```
2. Configure Supabase project; add `.env.local` with `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SESSION_SECRET`
3. Write Drizzle schema (`app/_lib/db/schema.ts`) covering all tables above
4. Run initial migration via `drizzle-kit push`
5. Configure Better Auth (`app/api/auth/[...all]/route.ts`), enable email/password + Google + Apple providers
6. Create `proxy.ts` to protect all `/(app)/` routes; redirect unauthenticated users to `/login`
7. Create `app/_lib/dal/index.ts` with `verifySession()` and `getUser()` using React `cache()`
8. Add `public/manifest.json` and PWA icons; configure `next-pwa` in `next.config.ts`
9. Set up Tailwind design tokens: brand colors, font scale, spacing

#### Key files
- `proxy.ts` — route protection (note: Next.js 16 uses `proxy.ts`, not `middleware.ts`)
- `app/_lib/db/schema.ts`
- `app/_lib/dal/index.ts`
- `next.config.ts` (pwa config)
- `public/manifest.json`

---

### Phase 1 — Account Management
**User Stories:** US-001–007
**Effort:** 2–3 days

#### Routes
| Route | Purpose |
|---|---|
| `/signup` | Registration form |
| `/login` | Login form (email + OAuth buttons) |
| `/(app)/profile` | Edit profile, change password, delete account |

#### Implementation notes
- Use `useActionState` (React 19) on signup/login forms for inline server validation errors
- `signup` Server Action in `app/_lib/actions/auth.ts`: validate with Zod → create user via Better Auth → `createSession()` → `redirect('/dashboard')`
- `logout` Server Action: `deleteSession()` → `redirect('/login')`
- Profile photo upload → Supabase Storage bucket `avatars/`; store public URL in `users.avatar_url`
- Account deletion Server Action: delete user row (cascade via FK) + Supabase Storage cleanup

#### Key components
- `app/(auth)/signup/page.tsx` — `SignupForm` (Client Component using `useActionState`)
- `app/(auth)/login/page.tsx` — `LoginForm` + OAuth buttons
- `app/(app)/profile/page.tsx` — Profile edit form, danger zone (delete account)

---

### Phase 2 — Dance Catalog & Levels
**User Stories:** US-010–016
**Effort:** 2 days

#### Routes
| Route | Purpose |
|---|---|
| `/(app)/dances` | My dances list + "Add dance" sheet |
| `/(app)/dances/[style]` | Dance detail; level selector |

#### Implementation notes
- Seed `dance_styles` and `dance_levels` tables with all standard and Latin syllabus dances (Waltz, Tango, Viennese Waltz, Foxtrot, Quickstep, Cha Cha, Samba, Rumba, Paso Doble, Jive) and levels (Bronze, Silver, Gold, Open)
- `addDance` Server Action: inserts into `user_dances`; triggers achievement check (first dance added)
- `updateLevel` Server Action: updates `user_dances.current_level`; on level advance, awards XP and checks for level-complete achievement
- Optimistic UI: use React `useOptimistic` for instant level badge update before server confirms

#### Key components
- `DanceCard.tsx` — thumbnail, current level badge, progress bar (patterns mastered / total)
- `LevelBadge.tsx` — color-coded pill (Bronze=amber, Silver=slate, Gold=yellow, Open=purple)
- `AddDanceSheet.tsx` — slide-up bottom sheet for mobile, lists all styles not yet added

---

### Phase 3 — Pattern Progress Tracking
**User Stories:** US-020–026
**Effort:** 3 days

#### Routes
| Route | Purpose |
|---|---|
| `/(app)/dances/[style]/patterns` | Pattern checklist for current level |

#### Implementation notes
- Seed `patterns` table with actual syllabus patterns per dance per level
- `PatternRow.tsx` shows: name, status toggle (learning → working → mastered), star confidence rating, notes expandable section
- Status changes via Server Action `updatePatternStatus`; each "mastered" triggers XP award (`xp_log` insert) and achievement check
- Pattern history shown as a small timeline in the notes expansion panel (reads `user_patterns.updated_at` changelog — store previous states in a JSONB column or separate `pattern_history` table)
- Progress bar per dance recalculated after every status change

#### Key components
- `PatternRow.tsx` — status button group, star rating, inline notes editor
- `PatternProgressBar.tsx` — animated progress bar (Framer Motion width transition)
- `FocusToggle.tsx` — pin/unpin pattern to top of list

---

### Phase 4 — Practice Logging
**User Stories:** US-030–034
**Effort:** 2 days

#### Routes
| Route | Purpose |
|---|---|
| `/(app)/practice` | Session history list + weekly summary |
| `/(app)/practice/new` | Log a new session |

#### Implementation notes
- New session form: date picker, duration (minutes), type selector (solo / group class / private lesson), multi-select of which patterns were worked, free-text notes
- `logSession` Server Action: insert `practice_sessions` + `session_patterns` rows; awards XP; checks streak achievement
- Weekly/monthly summary computed in a DAL query: `GROUP BY week`, `SUM(duration_minutes)`
- Streak calculation: query consecutive days with at least one session; store current streak in `users` table or compute on the fly

#### Key components
- `SessionCard.tsx` — date, duration, type badge, pattern tags
- `WeeklySummary.tsx` — bar chart (pure CSS or a minimal charting lib like Recharts)
- `SessionForm.tsx` — Client Component, pattern multi-select driven by user's current dances

---

### Phase 5 — Dashboard & Navigation
**User Stories:** US-110–114
**Effort:** 2 days

#### Implementation notes
- `BottomNav.tsx` — fixed bottom bar with five tabs: Dashboard, Dances, Practice, Achievements, Profile. 44px minimum tap targets. Active tab highlighted. Hides behind a keyboard when an input is focused (use `visualViewport` API).
- `TopBar.tsx` — page title + optional action button (e.g. "Add" on the dances page)
- Dashboard widgets: XP bar + dancer level, current streak badge, active dances with progress bars, recent achievements, upcoming competition countdown
- Offline: `next-pwa` service worker caches all pages; writes queue mutations to IndexedDB via a custom hook `useOfflineQueue` and replays on reconnect

#### Key components
- `BottomNav.tsx`
- `TopBar.tsx`
- `XpBar.tsx` — animated fill, shows current level label and XP to next level
- `StreakBadge.tsx` — fire icon + day count
- `DashboardWidget.tsx` — generic container card with title slot

---

### Phase 6 — Progress Reports
**User Stories:** US-040–044
**Effort:** 2–3 days

#### Routes
| Route | Purpose |
|---|---|
| `/(app)/reports` | Report builder UI |
| `/api/reports/pdf` | PDF download endpoint |

#### Implementation notes
- Report builder: choose dances to include, choose date range, preview on screen
- Screen preview uses the same React components as the app (Server Components, no extra library)
- PDF generation: Route Handler at `GET /api/reports/pdf` calls `verifySession()` then builds a `@react-pdf/renderer` `<Document>` server-side; streams the PDF as `application/pdf`
- Print CSS: add a `@media print` stylesheet via Tailwind plugin so the browser print dialog produces a clean output as a fallback
- Report sections per dance: level achieved, patterns mastered count, patterns list with status, practice hours logged in period

---

### Phase 7 — Gamification & Achievements
**User Stories:** US-050–057
**Effort:** 3–4 days

#### Achievement catalog (seed data)

| Slug | Trigger |
|---|---|
| `first-step` | First pattern marked learning |
| `pattern-master` | First pattern mastered |
| `bronze-complete` | All Bronze patterns mastered in any dance |
| `silver-complete` | All Silver patterns mastered in any dance |
| `gold-complete` | All Gold patterns mastered in any dance |
| `multi-dancer` | 3+ dance styles added |
| `streak-7` | 7-day practice streak |
| `streak-30` | 30-day practice streak |
| `century-club` | 100 total practice hours logged |
| `comp-debut` | First competition logged |
| `comp-podium` | First top-3 placement |
| `social-star` | First achievement shared to social media |

#### Implementation notes
- `checkAchievements(userId)` utility in `app/_lib/gamification.ts`: called by all Server Actions that could trigger an unlock; returns array of newly unlocked achievement slugs
- Caller passes returned slugs back to the client via `useActionState` return value; client reads them and triggers `UnlockCelebration` modal
- `UnlockCelebration.tsx`: full-screen Framer Motion overlay, confetti (CSS-only or `canvas-confetti`), achievement icon + name, dismiss after 3s or on tap
- XP awards: pattern mastered = 50 XP, level complete = 200 XP, practice session = 10 XP + 5/30min, achievement = varies per `achievements.xp_reward`
- Dancer level thresholds (example): Beginner 0–499, Developing 500–1499, Intermediate 1500–3499, Advanced 3500–7499, Champion 7500+

---

### Phase 8 — Goals & Milestones
**User Stories:** US-070–073
**Effort:** 1–2 days

#### Routes
| Route | Purpose |
|---|---|
| `/(app)/goals` | Goals list + create goal form |

#### Implementation notes
- Goal form: select dance, select target level, pick target date
- Progress toward goal = (patterns mastered at target level) / (total patterns at target level)
- "Behind pace" nudge: computed server-side; if today's date > (target_date × progress_percentage), flag as at-risk
- Notifications for at-risk goals handled in Phase 12
- Completing a goal: Server Action `completeGoal` sets `goals.completed_at`, awards XP, checks achievement

---

### Phase 9 — Social Sharing
**User Stories:** US-060–064
**Effort:** 2–3 days

#### Routes
| Route | Purpose |
|---|---|
| `/api/og/achievement` | Dynamic OG card image |
| `/p/[username]` | Public dancer profile |

#### Implementation notes
- OG card: `GET /api/og/achievement?achievementId=...&userId=...` — Route Handler using `@vercel/og`; renders a 1080×1080 card with achievement icon, name, dancer name, app branding; returns `image/png`
- Share flow: client calls Web Share API (`navigator.share`) if available (mobile); falls back to copy-link + direct links to Twitter/X, Instagram (Stories via image download), Facebook
- Public profile page at `/p/[username]`: Server Component, reads only public data (achievements with `is_public = true`); no auth required; shows dancer name, levels, achievement showcase
- `is_public` column on `user_achievements`; toggled via a privacy toggle on the achievement card

---

### Phase 10 — Competition Tracking
**User Stories:** US-080–084
**Effort:** 2 days

#### Routes
| Route | Purpose |
|---|---|
| `/(app)/competitions` | Competition list + add button |
| `/(app)/competitions/[id]` | Competition detail, events, results |

#### Implementation notes
- Add competition form: name, date, location
- Competition detail: add events (dance + level), log results after the fact (placement, notes)
- Result share card: same OG pipeline as achievements; card shows placement, dance, competition name
- Upcoming competition countdown shown on dashboard

---

### Phase 11 — Instructor & Notes
**User Stories:** US-090–093
**Effort:** 1–2 days

#### Implementation notes
- `instructor_name` and `instructor_notes` added to `user_patterns` (or a separate `pattern_notes` table for multiple instructors)
- Instructor name is a free-text field stored per user (not a separate entity); auto-suggest from previously used names
- Pin note: `is_pinned` boolean on the note row; pinned notes float to the top of the pattern detail
- Full-text search across notes: Postgres `to_tsvector` + `to_tsquery` via a Drizzle raw query; search UI in the notes section of the pattern list

---

### Phase 12 — Notifications & Reminders
**User Stories:** US-100–103
**Effort:** 2 days

#### Implementation notes
- Push notifications via Web Push API; store subscription objects in a `push_subscriptions` table
- Notification preferences stored in `users` table as JSONB: `{ practiceReminder: { enabled, dayOfWeek, time }, goalNudge: true, achievementAlerts: true, competitionReminder: true }`
- Server-side notification dispatch: Next.js Route Handler called by a cron job (Supabase scheduled function or Vercel Cron); sends push via `web-push` npm package
- Settings UI: single page `/profile#notifications` with toggles and a day/time picker for practice reminders

---

### Phase 13 — Polish & Launch Prep
**Effort:** 3–4 days

#### Tasks
- [ ] Accessibility audit: keyboard nav, ARIA labels, color contrast (WCAG 2.1 AA)
- [ ] Tap target audit: all interactive elements ≥ 44×44px
- [ ] Loading skeletons (`loading.tsx`) for every protected route
- [ ] Error boundaries (`error.tsx`) for every route segment
- [ ] `not-found.tsx` — branded 404 page
- [ ] SEO: `metadata` exports on all public pages; `sitemap.ts`; `robots.ts`
- [ ] OG images for marketing pages
- [ ] Performance: check bundle size, add `loading="lazy"` on below-fold images
- [ ] Security: verify all Server Actions call `verifySession()`; no sensitive data in client components
- [ ] E2E smoke test: signup → add dance → log practice → earn achievement → share

---

## Implementation Order

```
Phase 0  ──►  Phase 1  ──►  Phase 2  ──►  Phase 3
                                              │
                        ┌─────────────────────┤
                        ▼                     ▼
                     Phase 4              Phase 5
                        │                     │
                        └──────────┬──────────┘
                                   ▼
                                Phase 7  ──►  Phase 6
                                   │
                        ┌──────────┼──────────┐
                        ▼          ▼           ▼
                     Phase 8   Phase 9    Phase 10
                        │
                        ▼
                    Phase 11  ──►  Phase 12  ──►  Phase 13
```

Phases 4 and 5 can be developed in parallel. Phase 7 (gamification) should be wired in before Phase 9 (social sharing) since sharing depends on achievements existing.

---

## Package Installation Reference

```bash
# Core data + auth
npm install better-auth drizzle-orm @supabase/supabase-js
npm install -D drizzle-kit

# Validation
npm install zod

# UI + animation
npm install framer-motion lucide-react

# Reports
npm install @react-pdf/renderer
npm install @vercel/og

# PWA
npm install next-pwa

# Push notifications
npm install web-push
npm install -D @types/web-push
```
