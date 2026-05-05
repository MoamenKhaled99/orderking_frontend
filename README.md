# OrderKing — Food Delivery Frontend

A full-featured food delivery web app built with Vue 3, Vite, TypeScript, Pinia, and Tailwind CSS. Connects to a NestJS backend with Supabase PostgreSQL.

---

## Table of Contents

- [Live Demo Setup](#live-demo-setup)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Architecture](#architecture)
- [User Roles](#user-roles)

---

## Live Demo Setup

The app connects to a shared Supabase instance. To run it locally with real data, you only need the environment variables — no database setup required.

---

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- The backend running locally (see [orderking-backend](../orderking-backend)) **or** a deployed backend URL

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/orderking-frontend.git
cd orderking-frontend

# 2. Install dependencies
npm install
```

---

## Environment Variables

Create a `.env` file in the project root with the following values (pre-filled for the demo project):

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://irtbzketnspwesanqenb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydGJ6a2V0bnNwd2VzYW5xZW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5ODA4MzMsImV4cCI6MjA5MzU1NjgzM30.Kb-6NMAWlNqHm2HRORwgFWbiqobPM5vdAKz4ctHWAlY
```

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the NestJS backend API |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key — safe to share, enforces RLS |

> The anon key is the **public** key — it is intentionally safe to expose in frontend code. It gives read access to the shared demo database so interviewers see real data without any setup.

---

## Running the App

```bash
# Development server (hot reload)
npm run dev

# Type check + production build
npm run build

# Preview production build locally
npm run preview
```

The dev server starts at `http://localhost:5173`.

---

## Architecture

```
src/
├── api/                  # Axios API layer — one file per domain
│   ├── client.ts         # Axios instance with auth interceptor
│   ├── restaurants.ts    # GET /restaurants, GET /restaurants/:id
│   ├── orders.ts         # POST /orders, GET /orders/:id
│   ├── menu.ts           # GET /menu/:restaurantId
│   ├── me.ts             # GET /me (role detection)
│   └── restaurant-dashboard.ts  # All /restaurant-dashboard/* endpoints
│
├── stores/               # Pinia state management
│   ├── auth.store.ts     # Supabase session, role, fetchRole()
│   ├── cart.store.ts     # Cart items, totals, add-to-cart animation trigger
│   └── order.store.ts    # Active order state
│
├── layouts/              # Route-level shell components
│   ├── PublicLayout.vue  # /login, /restaurant/login, /restaurant/register
│   ├── CustomerLayout.vue   # / and all customer routes
│   ├── RestaurantLayout.vue # /restaurant/* routes
│   └── AdminLayout.vue   # /admin/* routes
│
├── components/
│   ├── shared/
│   │   └── SidebarLayout.vue  # Reusable sidebar shell with mobile hamburger drawer
│   └── customer/
│       ├── MenuItemCard.vue   # Item card with add-to-cart + fly animation
│       ├── CartDrawer.vue     # Slide-in cart
│       └── ...
│
├── views/
│   ├── auth/             # LoginView, RestaurantLoginView, RestaurantRegisterView
│   ├── customer/         # HomeView, RestaurantView, CheckoutView, OrderDetailView, MyOrdersView
│   ├── restaurant/       # Dashboard, Orders, Menu, Settings
│   └── admin/            # AdminOrderSearchView, AdminOrderDetailView
│
├── router/
│   └── index.ts          # Vue Router with role-aware navigation guards
│
├── lib/
│   └── supabase.ts       # Shared Supabase client (auth + realtime + storage)
│
└── types/
    └── index.ts          # Shared TypeScript interfaces
```

### Key Design Decisions

**Role detection without a roles table**
After login, the app calls `GET /api/me` which checks if a `Restaurant` row exists with `ownerId === userId`. Returns `{ role: 'RESTAURANT_OWNER' | 'CUSTOMER' }`. No extra DB tables needed.

**Navigation guard**
`router/index.ts` runs `auth.init()` on every protected route. Restaurant owners are automatically redirected to `/restaurant/dashboard` if they try to access customer routes.

**API layer**
`api/client.ts` is an Axios instance that automatically injects the Supabase JWT as `Authorization: Bearer` on every request. All API functions return unwrapped `response.data.data`.

**Realtime**
`OrderDetailView` and `RestaurantOrdersView` subscribe to Supabase Realtime `postgres_changes` events so order status updates appear instantly without polling.

**Cart animation**
`cart.store.ts` holds an `animationTrigger` ref. `MenuItemCard` writes to it with the button's coordinates + item image. `CustomerLayout` watches the trigger and spawns a flying card element using the Web Animations API.

**Idempotency**
Each checkout session generates a UUID on mount. If the user taps "Place Order" twice, the backend ignores the duplicate (unique `idempotencyKey` constraint).

---

## User Roles

| Role | Login URL | Entry point |
|---|---|---|
| Customer | `/login` | `/` — browse restaurants |
| Restaurant owner | `/restaurant/login` | `/restaurant/dashboard` |
| Admin | `/login` | `/admin` |

New restaurant owners register at `/restaurant/register` (3-step form: account → restaurant info → success).
