# SmartOrder AI

> Turn paper order sheets into structured, approved orders in under 2 minutes — using AI vision, smart defaults, and manager approval workflows.

SmartOrder AI is a multi-tenant order automation platform that connects supermarkets to their distributors. Supermarket staff photograph paper order sheets; an AI vision model extracts line items into a structured draft; managers review and approve; approved orders are emailed to distributors and surface in their dashboard. No more manual re-typing of paper forms.

---

## How It Works

```
Photo of paper order sheet
        │
        ▼
  ┌──────────────┐
  │  AI Vision   │   OpenAI GPT-4o extracts product name, quantity,
  │  Extraction  │   unit, and confidence from the image/PDF
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  Smart       │   Matches extracted products against the
  │  Suggestions │   supermarket's last approved order and
  └──────┬───────┘   pre-fills quantities as time-saving defaults
         │
         ▼
  ┌──────────────┐
  │  Staff       │   Staff reviews, edits, adds or removes items,
  │  Review      │   then submits for manager approval
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  Manager     │   Manager reviews the draft, approves or
  │  Approval    │   rejects with optional comment
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  Distributor │   Distributor receives email notification and
  │  Fulfillment │   sees the order in their dashboard → marks fulfilled
  └──────────────┘
```

### Key safety rule

No order ever reaches a distributor without explicit human approval. The AI assists — it never decides.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Vite |
| **Routing** | React Router v7 |
| **Backend / DB** | Supabase (Postgres, Auth, Storage, Edge Functions) |
| **AI Vision** | OpenAI GPT-4o (Vision) — structured JSON extraction |
| **Email** | Resend — distributor notification on order approval |
| **Auth** | Supabase Auth (email + password), JWT, role-based access |
| **Icons** | Lucide React (UI icons) |
| **Design System** | Custom Tailwind v4 theme — Plus Jakarta Sans, enterprise blue + amber palette |

---

## User Roles

| Role | Permissions |
|------|------------|
| **Staff** | Create orders (upload + AI extraction), edit drafts, submit for approval, view own organization's orders |
| **Manager** | Everything staff can do, plus: review and approve/reject pending orders, see approval queue and manager dashboard |
| **Distributor** | View incoming approved orders from assigned supermarkets, mark orders as fulfilled |
| **Admin** | Manage organizations, distributors, and user assignments |

Each role lands on a different home screen after login. Navigation items are role-aware — staff see "New Order" and "Dashboard," managers additionally see "Approvals," distributors see their incoming orders dashboard.

---

## Project Structure

```
src/
├── components/
│   └── layout/           # AppShell (sidebar + nav), AuthLayout
│   ├── AnimatedBackground.tsx  # Subtle animated bg for auth/marketing pages
│   ├── EmptyState.tsx     # Consistent empty states for tables and lists
│   ├── LoadingScreen.tsx  # Full-page loading spinner with message
│   ├── ProtectedRoute.tsx # Redirects unauthenticated users to /login
│   └── RoleRoute.tsx      # Redirects users whose role doesn't match
├── lib/
│   ├── auth-context.tsx   # React context wrapping Supabase Auth (session, profile, role)
│   ├── roles.ts           # Role-to-nav mapping and home-path resolution
│   └── supabase.ts        # Supabase client singleton
├── pages/
│   ├── Landing.tsx        # Public marketing homepage
│   ├── Login.tsx          # Email + password sign-in
│   ├── Signup.tsx         # Email + password registration
│   ├── Approvals.tsx      # Manager: pending approval queue
│   ├── ManagerDashboard.tsx   # Manager: overview stats and quick actions
│   ├── DistributorDashboard.tsx # Distributor: incoming orders from assigned supermarkets
│   ├── AdminPanel.tsx     # Admin: user and organization management
│   └── orders/
│       ├── OrdersList.tsx # Staff/manager: all orders for their organization
│       └── NewOrder.tsx   # File upload → AI extraction → editable draft → submit
├── types/
│   └── index.ts           # UserRole, Profile, and shared TypeScript types
├── App.tsx                # Root component with all route definitions
├── main.tsx               # React entry point
└── index.css              # Tailwind v4 directives, @theme tokens, Google Fonts
```

---

## Data Model (High Level)

| Table | Purpose |
|-------|---------|
| `organizations` | Supermarkets — id, name, assigned distributor |
| `distributors` | Distributors — id, name, contact email |
| `profiles` | User profiles (1:1 with auth.users) — role, organization_id, distributor_id |
| `products` | Products created ad-hoc from OCR results — name, unit, organization |
| `orders` | Orders — status (`draft` → `pending_approval` → `approved` / `rejected` → `fulfilled`), source file URL, timestamps |
| `order_items` | Line items — product name, quantity, unit, source (`ocr` / `suggested` / `manual`) |

**Row-Level Security:** Staff and managers only access rows scoped to their `organization_id`. Distributors only access orders scoped to their `distributor_id`. Managers additionally hold approve/reject permissions that staff don't.

---

## AI Architecture

### OCR Extraction (`ocr-extract` Edge Function)

1. Client uploads order sheet image/PDF to Supabase Storage
2. Client calls `supabase.functions.invoke("ocr-extract", { body: { filePath } })`
3. Edge Function verifies JWT, fetches signed URL from Storage
4. Calls OpenAI GPT-4o Vision API with a strict JSON schema (Structured Outputs)
5. Returns structured items: `{ items: [{ raw_name, quantity, unit, confidence }] }`

**Secret:** `OPENAI_API_KEY` lives only in Supabase Edge Function secrets. The browser never touches it.

### Smart Suggestions (Client-side)

After extraction, the app queries the organization's last approved order. If a product name matches, the quantity is pre-filled from that history. This is a simple SQL heuristic, not ML — "predictive ordering" in MVP means smart defaults, not demand forecasting.

### Notifications (`notify-distributor` Edge Function)

When a manager approves an order, the client calls this function. It verifies the caller is a manager, fetches the distributor's contact email, and sends an HTML email via Resend with order details and an in-app link.

**Secret:** `RESEND_API_KEY` lives only in Supabase Edge Function secrets.

### Failure Modes

| Scenario | Behaviour |
|----------|-----------|
| OCR returns empty | Staff sees an empty, editable draft with instructions to add items manually |
| OCR returns low confidence | Items are visually flagged (amber warning) but still editable |
| OpenAI API down | Error message shown; staff can build the order manually |
| Resend email fails | Order still transitions to `approved`; failure is logged; manual resend possible |

---

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Landing / marketing page |
| `/login` | Public | Sign in |
| `/signup` | Public | Create account |
| `/orders` | Staff, Manager | Order list for the user's organization |
| `/orders/new` | Staff, Manager | Create new order (upload + AI extraction) |
| `/manager` | Manager | Manager dashboard with stats and quick actions |
| `/approvals` | Manager | Pending approval queue |
| `/distributor` | Distributor | Incoming orders dashboard |
| `/admin` | Admin | Admin panel (users, organizations, distributors) |
| `*` | Public | Redirects to `/` |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project with Auth, Storage, and Edge Functions configured
- API keys for OpenAI and Resend (stored as Supabase Edge Function secrets)

### Environment & Secrets

All secrets are stored in Supabase Edge Function secrets, not `.env` files:

| Secret Name | Used By | Purpose |
|------------|---------|---------|
| `OPENAI_API_KEY` | `ocr-extract` Edge Function | GPT-4o Vision API calls |
| `RESEND_API_KEY` | `notify-distributor` Edge Function | Distributor email notifications |

The Supabase publishable (anon) key is safe in client source — it's configured in `src/lib/supabase.ts`.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### Production Build

```bash
npm run build    # Outputs to dist/
npm run preview  # Serves the production build locally
```

---

## Design System

The project uses a custom Tailwind v4 theme defined in `src/index.css`:

- **Colours:** Deep indigo primary (`#1E40AF`), sky blue secondary, amber accent
- **Typography:** Plus Jakarta Sans (400/600/700/800)
- **Aesthetic:** Clean, professional, enterprise — data-dense screens are minimal and readable; auth/marketing screens include a subtle animated background
- **Icons:** Lucide React for UI icons

The full design system specification lives at `docs/design-system/MASTER.md`.

---

## Documentation

| Document | Location | Contents |
|----------|----------|----------|
| PRD | `docs/prd/overview.md` | Full product requirements, user stories, acceptance criteria, scope |
| AI Architecture | `docs/AI_ARCHITECTURE.md` | Detailed AI pipeline, orchestration diagrams, failure modes, key decisions |
| Design System | `docs/design-system/MASTER.md` | Palette, typography, component specs, anti-patterns, pre-delivery checklist |

---

## Out of Scope (MVP)

- Real ML-based demand forecasting (current suggestions use last-order heuristics)
- Product catalog / inventory management UI
- Two-way inventory sync with distributor systems
- SMS notifications
- Multi-level approval chains
- Native mobile app (responsive web covers mobile use cases)
