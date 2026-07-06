# FinTrack Pro

Enterprise Finance — Real-time personal finance tracking application.

Built with an **Express + Prisma** backend, a **Next.js 16** frontend, and a **React Native** mobile app, communicating through a BFF (Backend For Frontend) proxy layer (web) or direct API calls (mobile).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Database** | MySQL 8+ via Prisma 7 ORM (MariaDB adapter) |
| **Backend** | Node.js (ESM), Express 5, JWT auth (httpOnly cookies), bcrypt |
| **Frontend** | Next.js 16.2.10 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4 (dark mode via `next-themes`) |
| **State** | Redux Toolkit (single user slice) |
| **Charts** | Recharts |
| **Animation** | Framer Motion, View Transitions API |
| **Icons** | lucide-react (web), react-native-vector-icons (mobile) |
| **API Docs** | Swagger Autogen + swagger-ui-express |
| **Mobile** | React Native 0.86, React Navigation 7, AsyncStorage |

---

## Features

- **Authentication** — Sign up, log in, session persistence via httpOnly JWT cookie, logout
- **Dashboard** — Summary stat cards (balance, income, expense, count), monthly bar chart (Income vs Expense), searchable/filterable transactions table
- **Transaction CRUD** — Add transactions via modal, view in table with search & type filter, delete with confirmation dialog
- **Settings** — Update profile name and currency (INR / USD / EUR / GBP), persists to database
- **Dark Mode** — Toggle switch with animated View Transitions API (circle, rectangle, polygon, gif, circle-blur variants), click sound effect, persisted preference
- **Mobile App** — Native Android/iOS client with bottom tab navigation, FAB button for adding transactions, profile settings, and direct API calls to the backend
- **BFF Proxy** — All web frontend requests go through Next.js Route Handlers (`/api/*`) so the backend URL is never exposed to the browser. Mobile app calls the backend directly.

---

## Getting Started

### Prerequisites

- Node.js 20+
- MySQL running on `localhost:3306`
- A database named `fintrakerpro` (or update `DATABASE_URL` in `backend/.env`)

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Server starts at `http://localhost:3000`

Swagger docs at `http://localhost:3000/api-docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Server starts at `http://localhost:4000`

### 3. Mobile App Setup

```bash
cd Application
npm install

# Android
npm run dev

# iOS
cd ios && pod install && cd ..
npm run ios
```

The mobile app connects directly to the backend at `https://api.fintrackpro.goosecodes.com`. To change this, edit `src/config/baseurl.ts`.

---

## Architecture

### Data Flow

**Web (BFF Proxy):**
```
Browser ──fetch()──> Next.js Route Handler (/api/*)
                          │
                          ▼
                    Express API (localhost:3000)
                          │
                          ▼
                    Prisma ORM ──> MySQL
```

**Mobile (Direct):**
```
React Native App ──fetch()──> Express API (api.fintrackpro.goosecodes.com)
                                    │
                                    ▼
                              Prisma ORM ──> MySQL
```

The web frontend never directly calls the Express backend. All requests go through Next.js Route Handlers (`src/app/api/`), which forward cookies and proxy to `http://localhost:3000`. The mobile app calls the backend directly and stores the JWT token in AsyncStorage.

### API Proxy Routes

| Frontend Route | Method | Backend Target |
|---|---|---|
| `/api/auth/signup` | POST | `/userRoutes/signup` |
| `/api/auth/login` | POST | `/userRoutes/login` |
| `/api/auth/logout` | POST | Clears cookie directly |
| `/api/auth/check` | GET | `/userRoutes/check` |
| `/api/auth/update` | PATCH | `/userRoutes/update` |
| `/api/transactions` | GET | `/moneyRoutes/getTransactions` |
| `/api/transactions` | POST | `/moneyRoutes/addTransaction` |
| `/api/transactions/summary` | GET | `/moneyRoutes/getTransactionSummary` |
| `/api/transactions/[id]` | DELETE | `/moneyRoutes/deleteTransaction/:id` |

### Backend API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/userRoutes/signup` | Create account |
| POST | `/userRoutes/login` | Authenticate, set JWT cookie |
| GET | `/userRoutes/check` | Validate session, return user |
| PATCH | `/userRoutes/update` | Update name / currency |
| POST | `/moneyRoutes/addTransaction` | Add a transaction |
| GET | `/moneyRoutes/getTransactions` | List transactions (supports `?type=&search=`) |
| GET | `/moneyRoutes/getTransactionSummary` | Aggregated totals |
| DELETE | `/moneyRoutes/deleteTransaction/:id` | Delete a transaction |

---

## Project Structure

### Backend (`backend/`)

```
backend/
├── .env                          # DB URL, JWT secret, port
├── package.json
├── prisma.config.ts              # Prisma config (schema path, datasource)
├── prisma/
│   └── schema/
│       ├── base.prisma           # Generator & datasource config
│       ├── user.prisma           # User model
│       └── money.prisma          # Transaction model
├── generated/prisma/             # Auto-generated Prisma client
└── src/
    ├── server.js                 # Entry point (dotenv, listen)
    ├── app.js                    # Express app (CORS, routes, Swagger UI)
    ├── swagger.js                # Swagger spec generation
    ├── swaggerjsonformater.js    # Post-processes swagger output
    ├── config/
    │   └── dbconfig.js           # Prisma client singleton
    ├── controller/
    │   ├── user.controller.js    # signup, login, check, update
    │   └── money.controller.js   # add, list, delete, summary
    └── routes/
        ├── user.routes.js        # /userRoutes/*
        └── money.routes.js       # /moneyRoutes/*
```

### Frontend (`frontend/`)

```
frontend/
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── public/
│   └── clicksoundeffect.mp3     # Theme toggle sound
└── src/
    ├── config/
    │   └── baseurl.ts           # Backend URL constant
    ├── lib/
    │   └── utils.ts             # cn() helper (clsx + tailwind-merge)
    ├── store/
    │   ├── store.ts             # Redux store config
    │   ├── hooks.ts             # Typed useAppDispatch / useAppSelector
    │   ├── Provider.tsx         # Redux Provider wrapper
    │   └── slice/
    │       └── userslice.ts     # Auth state (login, logout, setCurrency)
    ├── components/
    │   ├── Sidebar.tsx          # Navigation sidebar
    │   ├── Navbar.tsx           # Top bar (user name + logout)
    │   ├── TransactionModal.tsx # Add transaction form modal
    │   ├── ThemeProvider.tsx    # next-themes provider wrapper
    │   └── skiper26.tsx         # Theme animation engine (View Transitions)
    ├── assets/
    │   └── clicksoundeffect.mp3
    └── app/
        ├── layout.tsx           # Root layout (Theme + Redux providers)
        ├── globals.css          # Tailwind v4 + dark mode variant
        ├── (pages)/
        │   ├── layout.tsx       # Auth guard + sidebar/navbar shell
        │   ├── page.tsx         # Dashboard (/)
        │   ├── login/page.tsx   # Login page
        │   ├── signup/page.tsx  # Signup page
        │   └── setting/page.tsx # Settings page
        └── api/
            ├── auth/
            │   ├── signup/route.js
            │   ├── login/route.js
            │   ├── check/route.js
            │   ├── logout/route.js
            │   └── update/route.js
            └── transactions/
                ├── route.js
                ├── summary/route.js
                └── [id]/route.js
```

### Mobile App (`Application/`)

```
Application/
├── package.json
├── App.tsx                         # Root: Redux Provider + NavigationContainer
├── src/
│   ├── config/
│   │   └── baseurl.ts             # Backend URL (production)
│   ├── services/
│   │   └── api.ts                 # API client (auth + transactions, token mgmt)
│   ├── store/
│   │   ├── store.ts               # Redux store config
│   │   ├── hooks.ts               # Typed useAppDispatch / useAppSelector
│   │   └── slice/
│   │       └── userslice.ts       # Auth state (login, logout, setCurrency)
│   ├── components/
│   │   ├── StackNav.tsx           # Stack navigator (auth check + routing)
│   │   ├── TabNav.tsx             # Bottom tab navigator + FAB button
│   │   └── TransactionModal.tsx   # Add transaction bottom sheet
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Loginpage.tsx      # Login screen
│   │   │   └── Signuppage.tsx     # Signup screen
│   │   ├── Homepage.tsx           # Dashboard (stats, chart, transactions)
│   │   └── Settingspage.tsx       # Profile settings + logout
│   └── assets/
│       └── applogoimage.png       # App logo
├── android/                        # Android native project
└── ios/                            # iOS native project
```

---

## Database Models

### User

| Field | Type | Notes |
|---|---|---|
| `uiid` | String (PK) | UUID generated via `crypto.randomUUID()` |
| `email` | String (unique) | |
| `password` | String | bcrypt hashed |
| `fullName` | String | |
| `currency` | String | Default `"INR"` |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

### Transaction

| Field | Type | Notes |
|---|---|---|
| `id` | String (PK) | `@default(cuid())` |
| `userId` | String (FK) | References `user.uiid` |
| `type` | String | `"Income"` / `"Expense"` |
| `paymentType` | String | `"credit"` / `"debit"` |
| `description` | String | |
| `amount` | Float | |
| `date` | DateTime | |
| `category` | String | Food, Transport, Shopping, Bills, Salary, Other |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

---

## Environment Variables

### Backend (`backend/.env`)

```
SERVERPORT=3000
DATABASE_URL="mysql://root:@localhost:3306/fintrakerpro"
JWT_SECRET="your-secret-key"
```

### Frontend

The backend URL is configured in `src/config/baseurl.ts`:

```ts
export const baseurl = "http://localhost:3000"
```

### Mobile App

The backend URL is configured in `src/config/baseurl.ts`:

```ts
export const BASE_URL = "https://api.fintrackpro.goosecodes.com";
```

The mobile app stores the JWT token in AsyncStorage and sends it as a `Cookie` header on subsequent requests.

---

## Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with nodemon (generates Swagger first) |
| `npm run pgen` | Regenerate Prisma client |
| `npm run mig` | Create a Prisma migration |
| `npm run dbpush` | Push schema to database |
| `npm run build` | Bundle with esbuild |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server on port 4000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Mobile App

| Command | Description |
|---|---|
| `npm run dev` / `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator |
| `npm start` | Start Metro bundler |
| `npm test` | Run Jest tests |
