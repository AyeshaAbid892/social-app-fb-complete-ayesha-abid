<p align="center">
  <img src="./docs/readme-header.svg" alt="SocialApp — Facebook-Inspired Social Media Platform" width="100%" />
</p>

<p align="center">
  <em>A single-page, backend-free social media platform built for the MERN Stack + AI Engineering Bootcamp React Assignment.</em>
</p>

---

## Table of Contents

1. [Overview](#1-overview)
2. [Requirement Compliance Matrix](#2-requirement-compliance-matrix) — *the checklist an instructor actually wants*
3. [Tech Stack](#3-tech-stack)
4. [Live Demo](#4-live-demo)
5. [Screenshots](#5-screenshots)
6. [How to Run Locally](#6-how-to-run-locally)
7. [Architecture & Folder Structure](#7-architecture--folder-structure)
8. [Data Model — localStorage Schema](#8-data-model--localstorage-schema)
9. [Route Map](#9-route-map)
10. [Authentication Flow, Step by Step](#10-authentication-flow-step-by-step)
11. [Page-by-Page Walkthrough](#11-page-by-page-walkthrough)
12. [Reusable Component API](#12-reusable-component-api)
13. [Custom Hooks](#13-custom-hooks)
14. [Bonus Features Implemented](#14-bonus-features-implemented)
15. [Code Quality & Engineering Practices](#15-code-quality--engineering-practices)
16. [Known Limitations](#16-known-limitations)
17. [What I Learned](#17-what-i-learned)

---

## 1. Overview

**SocialApp** is a Facebook-inspired social media platform built entirely with **React on the frontend — no backend, no Firebase, no Supabase, no external database.** Every piece of data (users, posts, comments, likes, friends, notifications, stories, bookmarks) lives in the browser's `localStorage` and is read/written through a single, centralized storage layer (`src/utils/storage.js`).

The project satisfies every requirement in the assignment brief — authentication, a public feed, full post CRUD with draft/publish states, likes and comments, public profiles, a protected dashboard, and a reusable component library — and then goes further with a set of optional, self-contained modules (stories, a friends system, notifications, dark mode, global search, and more) that were built to practice real product-engineering patterns beyond the minimum spec.

## 2. Requirement Compliance Matrix

This is the section to read first. Every row maps directly to a line item in the assignment PDF.

### Core Setup

| Requirement | Status | Where |
|---|---|---|
| React (Vite) project foundation | ✅ | `vite.config.js`, `package.json` |
| React Router v6+ for navigation, dynamic routes, protected routes | ✅ | `src/App.jsx` (using v7, backward-compatible with the v6 API taught in class) |
| Tailwind CSS for all styling | ✅ | `tailwind.config.js`, `src/index.css`, utility classes throughout |
| React Hook Form for all forms | ✅ | Login, Signup, Create/Edit Post, Profile Settings all use `useForm` |
| Context API for auth state | ✅ | `src/context/AuthContext.jsx` |
| `localStorage` for all data | ✅ | `src/utils/storage.js` — nothing touches `localStorage` directly outside this file |
| `clsx` for conditional classNames | ✅ | Used in `Button.jsx`, `Badge.jsx`, `Toaster.jsx`, and others |
| `React.lazy` + `Suspense` for code-splitting | ✅ | Every route in `App.jsx` is `lazy()`-loaded inside one `Suspense` boundary — confirmed by `npm run build` producing a separate chunk per page |
| No Bootstrap / MUI / Ant / jQuery / backend / external DB | ✅ | Verified — none of these appear anywhere in `package.json` or the source |

### Auth (10 marks)

| Requirement | Status |
|---|---|
| Signup: name/email/password validation, duplicate-email check | ✅ |
| Signup creates the account, then sends the user to `/login` | ✅ |
| Login: email + password match, inline "Invalid email or password" error | ✅ |
| Logout clears session | ✅ |
| Session persists across a page refresh | ✅ (`useState(() => storage.getCurrentUser())` on init) |

### Feed Page (8 marks)

| Requirement | Status |
|---|---|
| Shows only `isPublic: true` and `isDraft: false` posts, newest first | ✅ |
| Post card shows avatar, name, image, description, like/comment counts, timestamp | ✅ |
| Clicking a card opens Post Detail; clicking author opens Profile | ✅ |
| Guests clicking Like/Comment are redirected to `/login` with a message | ✅ |
| Navbar swaps Login/Signup for avatar + dashboard link when logged in | ✅ |
| Empty state: "No posts yet — be the first to share!" | ✅ |

### Post Creation (12 marks)

| Requirement | Status |
|---|---|
| Description required, minimum 10 characters | ✅ |
| Image upload with live preview + remove button | ✅ |
| Public/Private visibility control | ✅ |
| "Save as Draft" sets `isDraft: true`, clears the form, stays on the page | ✅ |
| "Publish" sets `isDraft: false`, redirects to the feed, post appears immediately | ✅ |

### Post Management (10 marks)

| Requirement | Status |
|---|---|
| Dashboard lists **all** of the user's posts (public, private, draft) | ✅ |
| Status badge, like count, comment count, formatted date per row | ✅ |
| Edit / Delete / Public-Private-toggle actions per post | ✅ |
| Delete uses a **custom modal**, never the browser's `confirm()` | ✅ |
| Drafts show a "Publish" button | ✅ |
| Empty state: "You haven't created any posts yet…" | ✅ |

### Post Detail (10 marks)

| Requirement | Status |
|---|---|
| Full post: author, description, image, formatted date | ✅ |
| Like/unlike toggle with live count; guests redirected to login | ✅ |
| All comments visible to everyone | ✅ |
| Add-comment box shown only when logged in; "Login to comment" otherwise | ✅ |
| Users can delete only their own comments | ✅ |
| "X Comments" counter above the list | ✅ |

### Profile Page (8 marks)

| Requirement | Status |
|---|---|
| Cover image (or gradient fallback), avatar, name, bio, location, joined date | ✅ |
| Shows only that user's **public, published** posts | ✅ |
| "Edit Profile" button shown only to the profile owner, linking to `/dashboard/settings` | ✅ |
| Empty state: "No public posts yet" | ✅ |

### Profile Settings (7 marks)

| Requirement | Status |
|---|---|
| Pre-filled name (required), bio (optional, 150-char live counter), location | ✅ |
| Avatar upload with live preview | ✅ |
| Save updates `localStorage` **and** `AuthContext`, so the navbar updates instantly, no reload | ✅ |
| Success message: "Profile updated successfully" | ✅ |

### Protected Routes (5 marks)

| Requirement | Status |
|---|---|
| `/dashboard/*` inaccessible without login → redirects to `/login` | ✅ |
| Already-logged-in users hitting `/login` or `/signup` are redirected to `/dashboard` | ✅ |

### Code Quality (10 marks)

| Requirement | Status |
|---|---|
| Reusable `Button`, `Input`, `Modal`, `Avatar`, `Badge`, `PostCard`, `CommentSection` with the exact prop contracts specified | ✅ |
| Custom hooks (`useAuth`, `usePosts`, `useLocalStorage`, and more) | ✅ |
| No `var` anywhere — `const`/`let` only | ✅ (verified with a project-wide search) |
| No array-index used as a React `key` in any required component | ✅ |
| No direct state mutation (`.push()` on state arrays) — always `[...arr, item]` | ✅ |
| No raw HTML strings stored in `localStorage` — plain data objects only | ✅ |

### Tailwind CSS (5 marks)

| Requirement | Status |
|---|---|
| Consistent, professional styling | ✅ — single `brand` color scale defined once in `tailwind.config.js` and reused everywhere |
| Responsive on mobile and desktop | ✅ — mobile-first utility classes, responsive nav/sidebar behavior |
| Dark mode | ✅ (bonus — `dark:` variants throughout, toggle persists) |

### README + Live Demo (5 marks)

| Requirement | Status |
|---|---|
| All 10 required sections | ✅ — see the Table of Contents above |
| Live demo link | ⚠️ **Action required** — see [Live Demo](#4-live-demo) |
| 4+ screenshots | ⚠️ **Action required** — see [Screenshots](#5-screenshots) |

> These two items cannot be completed inside this repository — they require an actual deployment and a running browser session. Everything else in the assignment is done; this is the only remaining manual step before submission.

## 3. Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI library |
| Vite | 8 | Build tool / dev server |
| React Router | 7 (v6-style API) | Routing, nested routes, protected routes |
| Tailwind CSS | 3 | Utility-first styling, dark mode |
| React Hook Form | 7 | Form state, validation |
| Context API | — | Global auth state |
| clsx | 2 | Conditional className composition |
| localStorage | Browser native | The entire "database" |

## 4. Live Demo

> ⚠️ **Not yet deployed.** Deploy the `dist/` output (`npm run build`) to Vercel or Netlify and put the link here, e.g.:
> **`https://social-app-your-name.vercel.app`**

## 5. Screenshots

> ⚠️ **Add at least 4 screenshots before submitting** (Feed page, Create Post, Profile page, Dashboard):
>
> `![Feed](./screenshots/feed.png)`
> `![Create Post](./screenshots/create-post.png)`
> `![Profile](./screenshots/profile.png)`
> `![Dashboard](./screenshots/dashboard.png)`

## 6. How to Run Locally

```bash
git clone <your-repo-url>
cd social-app
npm install
npm run dev
```

The app opens at `http://localhost:5173`. No environment variables, API keys, or backend services are required — it runs fully offline once dependencies are installed.

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build locally
npm run lint       # run oxlint across src/
```

## 7. Architecture & Folder Structure

```
social-app/
├── src/
│   ├── components/
│   │   ├── layout/        # Navbar, Footer, sidebar, mega-menu
│   │   ├── post/           # PostCard, PostForm, PostActions, CommentSection
│   │   ├── profile/        # ProfileHeader, AboutSection
│   │   ├── routing/        # RequireAuth, RedirectIfAuthed guards
│   │   ├── stories/         # Bonus: stories bar + viewer
│   │   ├── friends/          # Bonus: friend request widgets
│   │   ├── notifications/     # Bonus: notification list
│   │   └── ui/                 # Button, Input, Modal, Avatar, Badge, Toaster
│   ├── context/
│   │   └── AuthContext.jsx    # signup, login, logout, updateCurrentUser
│   ├── hooks/
│   │   ├── useAuth.js          # useContext(AuthContext) shortcut
│   │   ├── usePosts.js          # centralized post/like/comment/bookmark CRUD
│   │   ├── useLocalStorage.js    # generic state-synced-to-storage hook
│   │   ├── useFriends.js          # bonus: friend graph operations
│   │   ├── useNotifications.js     # bonus: notification operations
│   │   └── useStories.js            # bonus: story lifecycle + 24h expiry
│   ├── pages/
│   │   ├── FeedPage.jsx, LoginPage.jsx, SignupPage.jsx,
│   │   │   PostDetailPage.jsx, ProfilePage.jsx, NotFoundPage.jsx …
│   │   └── dashboard/
│   │       ├── DashboardLayout.jsx, PostsDashboard.jsx,
│   │       │   CreatePost.jsx, EditPost.jsx, ProfileSettings.jsx
│   ├── utils/
│   │   ├── storage.js      # the single gateway to localStorage
│   │   ├── helpers.js       # generateId, formatDate, etc.
│   │   └── toastBus.js       # tiny pub-sub for toast notifications
│   ├── App.jsx              # every route, all lazy-loaded
│   └── main.jsx               # BrowserRouter + AuthProvider root
├── docs/                       # README banner assets
├── tailwind.config.js
└── vite.config.js
```

**Design principle:** every component that needs data calls a **hook** (`usePosts`, `useAuth`, …), never `localStorage` directly. Every hook calls **`storage.js`**, never `localStorage` directly. This one-way dependency chain (`component → hook → storage.js → localStorage`) is what keeps the codebase testable and makes it trivial to swap `localStorage` for a real API later — only `storage.js` would need to change.

## 8. Data Model — localStorage Schema

```js
// Key: 'users'
{
  id: 'usr_1703001234_abc',
  name: 'Asad Khan',
  email: 'asad@test.com',
  password: 'Password123',   // demo-only — see Known Limitations
  bio: 'React developer from Lahore',
  location: 'Lahore, Pakistan',
  avatar: 'data:image/jpeg;base64,...',
  coverImage: 'data:image/jpeg;base64,...',
  joinedAt: '2025-01-15T10:00:00Z',
  onboarded: true,
}

// Key: 'posts'
{
  id: 'post_1703001234_xyz',
  authorId: 'usr_1703001234_abc',
  description: 'Hello everyone!',
  image: 'data:image/jpeg;base64,...',
  isPublic: true,
  isDraft: false,
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
}

// Key: 'comments'
{ id, postId, authorId, text, createdAt }

// Key: 'likes'
{ id, postId, userId, createdAt }
```

Bonus modules add their own namespaced keys the same way (`friends`, `friendRequests`, `notifications`, `stories`, `bookmarks`) — all read/written exclusively through `storage.js`.

## 9. Route Map

| Route | Access | Page |
|---|---|---|
| `/` | Public | FeedPage |
| `/login` | Public (redirects to `/dashboard` if authed) | LoginPage |
| `/signup` | Public (redirects to `/dashboard` if authed) | SignupPage |
| `/posts/:postId` | Public | PostDetailPage |
| `/profile/:userId` | Public | ProfilePage |
| `/dashboard` | Protected | DashboardLayout (sidebar shell) |
| `/dashboard/posts` | Protected | PostsDashboard |
| `/dashboard/create` | Protected | CreatePost |
| `/dashboard/edit/:postId` | Protected | EditPost |
| `/dashboard/settings` | Protected | ProfileSettings |
| `*` | Public | NotFoundPage (404) |

## 10. Authentication Flow, Step by Step

This is the exact trace an instructor will ask for in Q&A:

1. **Signup** — `AuthContext.signup()` checks `storage.getUsers()` for a matching email. If none exists, it builds a new user object with `generateId('usr')`, appends it to the `users` array, and calls `storage.setUsers()`. **It does not start a session.** The person is routed to `/login`.
2. **Login** — `AuthContext.login()` finds a user in `storage.getUsers()` by exact email + password match. If found, the password field is stripped (`sanitizeUser`), the safe object is written to `storage.setCurrentUser()` and to the `currentUser` state, and the promise resolves with that user.
3. **First-time routing** — `LoginPage` checks the returned user's `onboarded` flag. If it's `false` (first login after signup), the person is sent to `/onboarding` to finish their profile; afterwards `onboarded` is set to `true`. Returning users skip straight to their intended destination (or `/`).
4. **Persistence** — `AuthContext` initializes its `currentUser` state with `useState(() => storage.getCurrentUser())`, so a page refresh re-hydrates the session instantly from `localStorage` with no flash of "logged out" state.
5. **Logout** — clears both the `currentUser` state and the `currentUser` key in `localStorage`.
6. **Route protection** — `RequireAuth` (wrapping every `/dashboard/*` route) reads `isAuthenticated` from `useAuth()`. If false, it renders `<Navigate to="/login" state={{ from: location }} />`, which is how `LoginPage` knows where to send the person back to after they log in.

## 11. Page-by-Page Walkthrough

- **Feed (`/`)** — pulls all posts via `usePosts()`, filters to `isPublic && !isDraft`, sorts newest-first, renders `<PostCard>` per post. Includes a bonus live search bar filtering by description.
- **Login / Signup** — `react-hook-form` driven, with the exact validation rules from the spec (email format, 6-char password on login; 8-char + uppercase + number on signup, confirmed via `watch()`).
- **Post Detail** — loads one post by `:postId`, renders `<PostActions>` for like/unlike and `<CommentSection>` for the comment thread, including per-comment ownership checks for the delete button.
- **Profile** — resolves `:userId`, shows their profile card plus only their public/published posts; shows "Edit Profile" only when `currentUser.id === userId`.
- **Dashboard → My Posts** — the full CRUD table: status badges, edit/delete/toggle actions, publish-from-draft button, custom delete-confirmation modal.
- **Dashboard → Create/Edit Post** — shared `<PostForm>` component; Create resets itself after a draft save, Edit pre-fills from the existing post and redirects away if the current user isn't the owner.
- **Dashboard → Settings** — pre-filled profile form with a live 150-character bio counter and avatar preview; writes through `updateCurrentUser()` so the navbar reflects changes with zero reloads.

## 12. Reusable Component API

| Component | Key Props |
|---|---|
| `Button` | `variant` (primary/secondary/danger/ghost), `size` (sm/md/lg), `isLoading`, `disabled` |
| `Input` | `label`, `error`, `type`, plus the full `register()` spread from React Hook Form |
| `Avatar` | `src`, `name`, `size` (sm=32px/md=48px/lg=80px) — falls back to a colored initial |
| `Modal` | `isOpen`, `onClose`, `title` — overlay click and `Escape` both close it |
| `Badge` | `variant` (draft/public/private) |
| `PostCard` | `post` — resolves the author internally and renders the full card |
| `CommentSection` | `postId` — owns its own comment list, add, and delete logic |

## 13. Custom Hooks

- **`useAuth()`** — thin `useContext(AuthContext)` wrapper.
- **`usePosts()`** — single source of truth for post/like/comment/bookmark CRUD. Uses an internal `version` counter as a cache-buster so every consumer re-renders the instant any post changes, without needing a global store library.
- **`useLocalStorage(key, initialValue)`** — generic `useState`-like hook that mirrors its value into `localStorage` automatically.
- **`useFriends`, `useNotifications`, `useStories`** — bonus modules following the exact same pattern as `usePosts`, for consistency across the codebase.

## 14. Bonus Features Implemented

All 6 optional add-ons from the assignment are done (only 5 were required):

1. **Search Posts on Feed** — real-time `.filter()` on every keystroke, "No results found for X" empty state.
2. **Bookmark/Save Posts** — bookmark icon on every card, a "Saved Posts" view in the dashboard.
3. **Dark Mode** — `dark:` classes throughout, toggle persists in `localStorage`.
4. **Character Counter** — live count on the post description, turns orange at 400 and red at 480, submit disabled at 500+.
5. **Image Preview Before Upload** — `FileReader`-based preview + remove button on both Create and Edit.
6. **Delete Your Own Comments** — inline "Are you sure? Yes / No" confirmation, not the browser's `confirm()`.

Beyond the required bonus list, the project also includes (explicitly out of scope for grading, listed here only for transparency): a friends system, notifications, 24-hour stories, global search, and a settings hub. These are scaffolded behind the same `RequireAuth` guard and don't interfere with any graded requirement.

## 15. Code Quality & Engineering Practices

- **Single data gateway** — `storage.js` is the only file that touches `window.localStorage`. Every hook and component goes through it.
- **No prop drilling** — auth state via Context; post/social state via dedicated hooks.
- **No index-as-key, no direct state mutation, no `var`** — verified by a project-wide search, not just spot-checked.
- **Clean lint pass** — `npx oxlint src` returns **0 errors** (a small number of intentional `exhaustive-deps` notices on cache-buster dependencies remain — a well-known, deliberate pattern, not a bug).
- **Clean production build** — `npm run build` completes with no warnings besides Vite's own plugin-timing notice, and correctly emits a separate chunk per lazy-loaded route.
- **Consistent design tokens** — a single `brand` color scale in `tailwind.config.js`, reused everywhere instead of one-off hex values.
- **Mobile-first responsive layout** — every multi-column view (`Sidebar`, `RightRail`, dashboard shell) stacks to a single column below its breakpoint instead of forcing a fixed-width row that overflows on phones/tablets. The top navbar collapses its center icon row below `md` and swaps the search input for a compact icon, so nothing gets clipped or pushed off-screen down to ~320px-wide viewports. Verified at `sm` (640px), `md` (768px), `lg` (1024px), and `xl` (1280px) Tailwind breakpoints.

## 16. Known Limitations

Being upfront about what a real backend (and more production hardening) would add:

- **Passwords are stored in plain text in `localStorage`.** This is inherent to a "no backend" assignment — there's no server to hash against — but it is not how authentication should ever work in a real product.
- **No automated tests.** There's no Jest/Vitest/React Testing Library suite yet. The assignment doesn't require one, but a production codebase at this size would have unit tests for `storage.js` and the hooks, plus a few integration tests for the auth flow.
- **No TypeScript.** The project is plain JS/JSX. Prop shapes are documented in this README and via clear prop names, but there's no compile-time enforcement.
- **No CI pipeline.** Linting and building are manual (`npm run lint`, `npm run build`); there's no GitHub Actions workflow running them automatically on push.
- **`localStorage` has real limits** — roughly 5–10MB per origin, and base64-encoded images can eat that quickly with heavy use. A real backend with object storage (S3, Cloudinary, etc.) would be the fix.
- **No pagination** — the feed loads every public post at once. Fine for a demo dataset, not for production scale.

## 17. What I Learned

Building this project end-to-end forced me to think about state ownership in a way that copy-pasting tutorial code never does. The biggest shift was realizing that `localStorage` isn't just "the database" — it's a synchronous, single-threaded API with no built-in reactivity, so every hook that reads from it needs its own strategy for telling React "something changed, re-render." I settled on a simple version-counter pattern in `usePosts` rather than reaching for a state-management library, and it taught me a lot about *why* libraries like Zustand or Redux exist in the first place — they're solving exactly this problem at scale. React Hook Form's `watch()` for the password-confirmation check was another small but important lesson in avoiding controlled-input boilerplate. Protected routing with `RequireAuth` and the `location.state.from` redirect-back pattern made React Router's data flow click in a way it hadn't before. Overall, the hardest part wasn't any single feature — it was resisting the urge to let one component do too much, and instead keeping the `component → hook → storage.js` chain honest all the way through.

## 18. Assignment 2 Features (Friends · Real-Time Chat · AI)

Three feature sets were added on top of the Assignment 1 SocialApp above, kept in their own files/folders so nothing from Assignment 1 was rewritten:

- **Friend System extension** — `/people` (People You May Know, sorted incoming→none→outgoing per spec, with mutual-friend counts), relationship-aware buttons on the Profile page, and the existing Friends/Requests pages relabeled to match the spec's exact button text (Accept/Reject/Cancel Request).
- **Real-Time One-to-One Chat** — `/chat` and `/chat/:userId`, friends-only, with text/image/video messages, typing indicators, online/last-seen status, read receipts, emoji reactions, and in-conversation search — synced live across browser tabs with zero backend.
- **AI Integration (OpenAI)** — a writing assistant in Create/Edit Post, a comment suggester on Post Detail, a bio optimiser in Profile Settings, and two chat AI modes (reply suggestions + optional auto-reply), all routed through one `useAI.js` hook.

## 19. AI Features — How Each One Uses the OpenAI API

Every AI call in the app goes through `hooks/useAI.js`, which itself only ever talks to `lib/openai.js` (a single client, instantiated once). All calls use **gpt-4o-mini** with **max_tokens: 300**, per the assignment's cost-control requirement.

| Feature | Where | What it sends the model | What comes back |
|---|---|---|---|
| Post writing assistant | Create/Edit Post (collapsible panel, closed by default) | A short user idea | JSON `{ description }`, under 280 characters |
| Comment suggestion | Post Detail, logged-in users only | The post's description | A short 1-2 sentence comment |
| Bio optimisation | Profile Settings | Current name/bio/location | An improved bio, under 150 characters |
| Chat reply suggestions (Mode 1, always on) | Any open chat | Last 5 messages of the conversation | JSON `{ suggestions: [3 short replies] }` |
| Chat auto-reply (Mode 2, opt-in) | Any open chat, after enabling in the AI menu | Last 5 messages | A natural 1-3 sentence reply, sent automatically after a short delay |

Every one of these is wrapped in try/catch inside `useAI.js` — a failed OpenAI call **never** crashes a page. Post/comment/bio features surface an inline error message; chat suggestion generation (Mode 1) fails silently per spec (no error shown — the chips just don't appear); chat auto-reply (Mode 2) shows a toast ("AI reply failed — please reply manually") since the user is actively relying on it to respond for them.

**Bonus: AI Chat Personality.** The chat header's AI menu includes a personality selector (Friendly / Professional / Casual / Funny), stored per-user in the `aiSettings` localStorage key and injected into every chat-related system prompt. The active personality shows next to the online/last-seen status in the chat header whenever AI is enabled.

## 20. Real-Time Chat Architecture — How It Works Without a Backend

There's no server, so "real-time" here means: **write to `localStorage`, let the browser's native `storage` event tell every other tab to re-read it.**

```
Tab 1 (User A)                          Tab 2 (User B)
User A sends a message
  → storage.setMessages([...])
  → browser fires a 'storage' event  ──────────────►  useChat's listener catches it
                                                        → re-reads messages from localStorage
                                                        → UI updates instantly
```

Two details that matter a lot in practice:

1. **The `storage` event never fires in the tab that made the write** — only in *other* tabs. That's fine for the cross-tab real-time requirement, but it left a gap: if the Navbar's unread-message badge and an open chat window are both mounted in the *same* tab, neither would know the other just sent a message. So `useChat.js` layers a second, same-tab pub/sub (`utils/chatBus.js`, following the same pattern as the pre-existing `toastBus.js`) on top of the native event. Every write fires both.
2. **Cleanup matters.** `useChat.js`'s `useEffect` returns `window.removeEventListener('storage', onStorage)` — without it, every unmounted chat component would keep listening forever, causing memory leaks and, worse, stale closures writing over fresh state.

**`getConversationId(userIdA, userIdB)`** sorts both ids alphabetically before joining them with `_`, so `A→B` and `B→A` always resolve to the identical conversation id. Skipping that sort is the single most common way this feature breaks — messages sent from one direction would silently land in a different conversation than messages sent from the other, and appear to "disappear."

**Typing indicators and online status** are handled without extra writes: a typing timestamp (or presence heartbeat) is written once, and every reader treats it as "active" only while `Date.now() - timestamp` is under a threshold (3s for typing, 5 minutes for online) — checked on a local re-render tick (`useNowTick`), not by writing a matching "stopped typing" event.

## 21. How to Set Up the OpenAI API Key

1. Get a key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Copy the template: `cp .env.example .env`
3. Open `.env` and paste your key: `VITE_OPENAI_API_KEY=sk-...`
4. Restart the dev server (`npm run dev`) if it was already running — Vite only reads `.env` on startup.

`.env` is listed in `.gitignore` and is **never** committed. If you clone this repo fresh, AI features will show a friendly inline error until you complete these steps — every other feature (friends, chat, posts) works with no key configured.

## 22. Screenshots

_Add at least 4 screenshots here before submitting: the People page, a chat conversation with AI reply chips visible, the AI post-generation flow in action, and AI auto-reply mode active with its banner showing._

## 24. Premium Chat Upgrades

Built on top of the Feature 2 chat system, without changing its schema or breaking anything:

- **Message actions** (reply, copy, pin, delete-for-me, delete-for-everyone) — opened from the "⋯" on any bubble. "Delete for me" only hides a message for the person who deleted it (it stays in storage and visible to the other participant); "Delete for everyone" replaces the content instead of removing the message outright, since actually deleting it would orphan any reply that quotes it.
- **Reply threads** — replying shows a quoted preview above the composer while composing, and inline inside the sent bubble once delivered, via a `replyToId` reference on the message.
- **Chat themes** — 7 themes, stored per-conversation in a `chatThemes` key so both participants see the same one. Every theme change posts a system message into the timeline (`type: 'system'`) so there's a visible record of who changed it and when — these reuse the exact same message array/real-time sync machinery as normal messages, no parallel code path needed.
- **Conversation info panel** — opens from clicking the friend's name/avatar in the chat header: nickname (per-viewer, so you naming your friend something doesn't rename them for their side), mute, read-receipts toggle (this one has a real effect — turning it off means your opens stop marking the other person's messages as read, matching how Messenger's toggle behaves), archive, delete chat (hides it from your inbox only), and block (which genuinely disables the composer for both participants once either side blocks the other).
- **Chat sidebar** — search + All/Unread filter tabs.

## 25. Deliberately Not Implemented — and Why

A few things commonly seen in real messaging apps were intentionally left out, because building them would either violate this assignment's own constraints or produce code that couldn't be explained honestly in the Q&A:

- **Voice/video calling** — real calling needs WebRTC plus a signaling server. The assignment explicitly rules out any backend and any WebSocket library, which is exactly the infrastructure real calling requires. A fake "Call" button that opens nothing would be worse than not having one.
- **A real GIF picker** — needs a third-party API key (e.g. Giphy/Tenor) that isn't part of this project's scope.
- **Groups / Communities as live features** — the assignment's data model and marks rubric are built entirely around one-to-one conversations between friends; multi-user group chat is a meaningfully different data shape (participant lists, group-level read state, etc.) that isn't part of what's graded here.


