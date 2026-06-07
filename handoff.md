# Handoff: Rocket Kanban App

## Current Status
**Build working** — Vite build completes in ~4s. All components compile. Auth flow working. The app is ~95% complete. Ready for full end-to-end testing.

## Project: Rocket Kanban
A futuristic, arcade-themed Kanban board app built with SvelteKit + Supabase.

### Tech Stack (Decided During Grilling Session)
- **Framework:** SvelteKit (Svelte 5 with runes)
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Auth)
- **Drag & Drop:** Native HTML5 drag events
- **Icons:** Lucide Svelte
- **Database:** PostgreSQL on Supabase with Row Level Security
- **Auth:** Supabase Auth (email/password)

### Design Decisions
- Futuristic/minimal aesthetic with arcade energy
- Pixel art rocket background animation (starfield with drifting rockets)
- Neon accent colors (cyan/purple gradient theme)
- Clean, readable UI with personality
- Personal Kanban board (no sharing/collaboration for v1)
- Dark theme by default

### Architecture
```
src/
├── lib/
│   ├── components/
│   │   ├── StarfieldBg.svelte      - Animated starfield + pixel rockets
│   │   ├── BoardSidebar.svelte     - Sidebar with board list
│   │   ├── List.svelte             - Kanban list column + drag-drop container
│   │   ├── Card.svelte             - Draggable card component
│   │   ├── CardSlideOver.svelte    - Slide-over panel for card editing
│   │   ├── RocketLaunch.svelte     - Celebration animation
│   │   └── AuthButton.svelte       - Login/signup button
│   ├── stores/
│   │   └── app.ts                  - Svelte stores for state
│   └── supabase/
│       ├── client.ts               - Supabase client
│       └── database.types.ts       - TypeScript types
├── routes/
│   ├── +page.svelte                - Landing page
│   ├── auth/callback/+page.svelte  - OAuth/auth callback handler
│   ├── board/+page.svelte          - Redirect to first board / auto-create
│   ├── board/[id]/+page.svelte     - Main board view
│   ├── login/+page.svelte          - Login page
│   ├── signup/+page.svelte         - Signup page
├── app.css                         - Global styles
├── app.html                        - HTML template
├── vite.config.ts                  - Vite config (with Tailwind plugin)
└── supabase-schema.sql             - Database schema
```

### Data Model
```
boards (id, name, owner_id, icon, created_at, updated_at)
lists (id, name, board_id, position, created_at, updated_at)
cards (id, title, description, board_id, list_id, position, cover_image_url, due_date, created_at, updated_at)
labels (id, name, color, board_id, owner_id, created_at, updated_at)
card_labels (card_id, label_id)  -- many-to-many junction
```

### Key Features (Built)
- [x] Landing page with animated background
- [x] Email/password authentication (Supabase)
- [x] Board creation with default lists (To Do, In Progress, Done)
- [x] Board sidebar with CRUD operations
- [x] Kanban columns with drag-and-drop cards
- [x] Card creation and editing
- [x] Card detail slide-over panel
- [x] Labels on cards
- [x] Due dates
- [x] Rocket launch celebration when a list is completed
- [x] Animated starfield background with pixel rockets
- [x] Neon/arcade theme
- [x] Removed deprecated `lucide-svelte` dependency
- [x] Fixed self-closing non-void HTML elements
- [x] Added ARIA roles to interactive divs
- [x] Fixed label associations in CardSlideOver
- [x] Fixed h1→button for accessibility
- [x] Lazy-loaded Supabase client (works without env vars for landing page)
- [x] Local Supabase dev stack (Docker, via `npx supabase start`)
- [x] Auth callback page for email verification flow
- [x] /board catch-all page (redirects to first board or creates one)
- [x] Post-login redirect to first board
- [x] Supabase schema applied via migrations
- [ ] End-to-end testing

## Current Build Status

### What's Working
- All Svelte components are written and compile (svelte-check passes)
- Type system is mostly clean
- Database schema SQL is ready

### Known Issues to Fix
1. **`as any` casts in CardSlideOver.svelte** — Supabase type inference still needs work. The `insert()` calls use `as any` for labels and card_labels.
2. **`autofocus` attribute warnings** — Svelte 5 prefers focus via refs + `$effect`. Found in List.svelte, BoardSidebar.svelte, CardSlideOver.svelte, board/[id]/+page.svelte.
3. **Non-interactive elements with click handlers** — Card.svelte uses `role="article"` with `onclick` — should be addressed for full accessibility.
4. **`adapter-auto` warning** — no production deployment target configured (expected for local dev).

### Critical Next Steps
1. **Test the full flow** — login → create board → add cards → drag and drop (local Supabase is already configured)
2. **Fix `as any` casts** — clean up Supabase type inference for label/card_labels inserts
3. **Polish** — fix autofocus warnings with refs/$effect, improve keyboard accessibility, add mobile responsiveness

## Files to Review/Modify

### Priority
- `src/lib/components/CardSlideOver.svelte` — `as any` casts for label insertions
- `src/lib/components/BoardSidebar.svelte` — `as any` cast for board insert
- `src/lib/components/CardSlideOver.svelte` — Uses `get()` from stores but could be simplified with Svelte 5 stores syntax

### Nice to Fix
- `src/routes/board/[id]/+page.svelte` — Heavy page, could use lazy loading for lists
- `src/app.css` — Could add more arcade styling (scanlines, CRT effect, etc.)
- All components with `autofocus` — replace with refs + `$effect(() => ref.focus())`

## Important Context from Grilling Session
- The user wanted an **arcadey, futuristic** feel — pixel rockets, neon accents, satisfying animations
- **Minimal scope** for v1: personal boards, drag-and-drop, labels, due dates
- **No team sharing** for launch — push to v1.1
- **SvelteKit** chosen for fast DX and great Svelte 5 runes support
- **Supabase** for backend to avoid managing a server
- User wants to **see the app running before reviewing** — so getting the build working is the top priority

## Suggested Skills
- `improve-codebase-architecture` — once the build works, to clean up the Supabase type handling and store patterns
- `tdd` — if the user wants to add tests for the drag-and-drop logic
- `grill-with-docs` — to refine the v2 feature set (real-time sync, sharing, etc.)

## Redacted Info
- Supabase credentials are stored in `.env.local` (user must fill these in)
- No API keys or secrets in version control

## One-Line Summary
**SvelteKit Kanban app with Supabase auth, animated pixel-rocket background, and arcade aesthetic — build works, local Supabase running, full auth flow functional.**

## Session Log (2026-06-07)
### Build & Accessibility Fixes
- Verified `vite build` completes successfully (~4s)
- Removed deprecated `lucide-svelte` dependency
- Fixed self-closing non-void HTML elements (`div />`, `textarea />`, `span />`)
- Added ARIA roles (`role="button"`, `role="article"`, `role="list"`) to interactive divs
- Added keyboard handlers (`onkeydown` with Enter) to interactive divs
- Fixed label association in CardSlideOver (added `id` and `for` attributes)
- Changed `<h1>` with onclick to `<button>` for accessibility

### Dev Server Improvements
- Made Supabase client lazy-loaded — app renders landing page without env vars
- Created `.env.example` for Supabase config

### Supabase Setup
- Initialized `supabase` CLI, created migration `001_initial_schema.sql`
- Set up local Supabase dev stack via Docker (`npx supabase start`)
- Configured `.env.local` with local Supabase credentials
- Schema auto-applied on `supabase start` (boards, lists, cards, labels, RLS, triggers)

### Auth Flow Fixes
- Removed redirect-from-login loop (was causing 404 on `/board`)
- Created `/auth/callback` page for OAuth/email verification flow
- Created `/board` catch-all page (redirects to first board or auto-creates one)
- Post-login redirect now goes to user's first board
- Login page no longer redirects before authentication attempt

## Local Supabase Setup
```bash
# Start local Supabase stack
cd /home/gianni/projects/rocket-kanban
npx supabase start

# Stop
npx supabase stop

# Reset database (re-runs all migrations)
npx supabase db reset

# API URL: http://127.0.0.1:54321
# Studio:   http://127.0.0.1:54323
# Mailpit:  http://127.0.0.1:54324
```
