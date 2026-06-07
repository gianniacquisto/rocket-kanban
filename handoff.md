# Handoff: Rocket Kanban App

## Current Status
**Build in progress** — most components are written but the Vite build is hanging/very slow. The app is ~85% complete.

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
│   ├── login/+page.svelte          - Login page
│   ├── signup/+page.svelte         - Signup page
│   └── board/[id]/+page.svelte     - Main board view
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
- [ ] Supabase schema applied to actual project
- [ ] Environment variables configured
- [ ] End-to-end testing

## Current Build Status

### What's Working
- All Svelte components are written and compile (svelte-check passes)
- Type system is mostly clean
- Database schema SQL is ready

### Known Issues to Fix
1. **Vite build hanging** — the `vite build` command times out. This is the blocker.
2. **Supabase TypeScript types** — `insert()` returns `never[]` in the type inference. Workaround is using `as any` casts in some places. The `database.types.ts` file has the full schema but Supabase client isn't using it correctly.
3. **Tailwind v4** — installed but the `@tailwindcss/vite` plugin needs the correct import path (`import tailwindcss from '@tailwindcss/vite'`).
4. **Some accessibility warnings** (non-critical): missing ARIA roles on interactive divs, missing label associations, etc.

### Critical Next Steps
1. **Fix the build** — run `npx vite build` and resolve whatever is causing it to hang. Check if it's:
   - Tailwind v4 configuration issue
   - Large bundle from animations
   - Some dependency conflict
2. **Configure Supabase** — user needs to:
   - Create a Supabase project
   - Run `supabase-schema.sql` in the SQL editor
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`
3. **Test the full flow** — signup → create board → add cards → drag and drop
4. **Polish** — fix remaining accessibility warnings, add keyboard shortcuts, improve mobile responsiveness

## Files to Review/Modify

### Priority (Build Blocking)
- `/home/gianni/projects/kanban-app/vite.config.ts` — Tailwind plugin config
- `/home/gianni/projects/kanban-app/src/lib/supabase/client.ts` — Supabase client type inference
- `/home/gianni/projects/kanban-app/src/lib/supabase/database.types.ts` — Type definitions

### Nice to Fix
- `/home/gianni/projects/kanban-app/src/lib/components/CardSlideOver.svelte` — Uses `get()` from stores but could be simplified with Svelte 5 stores syntax
- `/home/gianni/projects/kanban-app/src/routes/board/[id]/+page.svelte` — Heavy page, could use lazy loading for lists
- `/home/gianni/projects/kanban-app/src/app.css` — Could add more arcade styling (scanlines, CRT effect, etc.)

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
**SvelteKit Kanban app with Supabase auth, animated pixel-rocket background, and arcade aesthetic — components are written but Vite build is hanging and needs troubleshooting.**
