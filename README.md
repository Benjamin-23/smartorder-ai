# SmartOrder AI

Turn paper order sheets into structured orders in seconds. SmartOrder AI uses AI-powered image recognition to extract order details from photos of paper forms, route them through manager approvals, and deliver clean structured orders to distributors.

## Features

- **Snap a Photo** — Photograph any paper order sheet and let AI extract the details
- **AI Extraction** — Automatic recognition of products, quantities, and pricing
- **Manager Approval** — Built-in approval workflows before orders reach distributors
- **Smart Suggestions** — AI-powered recommendations based on order history
- **Instant Notifications** — Real-time updates for order status changes
- **Full Audit Trail** — Complete history of every order and approval

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **AI:** OpenAI API (via Supabase Edge Functions)

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/       # Shared UI components
│   └── layout/       # AppShell, AuthLayout, etc.
├── lib/              # Utilities (auth, roles, Supabase client)
├── pages/            # Route pages
│   └── orders/       # Order-related pages
├── types/            # TypeScript type definitions
├── App.tsx           # Root component with routing
├── main.tsx          # Entry point
└── index.css         # Global styles and Tailwind theme
```

## User Roles

- **Sales Rep** — Create orders by snapping photos of paper forms
- **Manager** — Review and approve/reject orders
- **Distributor** — View and fulfill approved orders
- **Admin** — Manage users, roles, and system settings
