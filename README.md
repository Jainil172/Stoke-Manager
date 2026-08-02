# StockFlow — Inventory Management System

A full-stack inventory management system built with **React (Vite)** on the frontend and **Node.js (Express) + MySQL** on the backend.

![Screenshots placeholder — add captures of Dashboard, Products, Reports and Profile pages]

## Features

- **Authentication** — register, login (JWT), forgot-password, account deletion
- **Dashboard** — totals, inventory value, low/out-of-stock counts, recent stock activity, revenue/cost and stock movement charts
- **Products** — full CRUD with search, filters (category, supplier, status), sorting, pagination and product-image upload (JPG/PNG/WEBP/GIF, max 2MB)
- **Categories & Suppliers** — full CRUD with validation
- **Stock control** — stock-in and stock-out movements with party/reference tracking and stock-level validation
- **Analytics** — monthly stock movement, revenue vs cost, category and supplier distribution, inventory value trend
- **Reports** — one-click **PDF** (pdfkit) and **CSV** (json2csv) exports of the full catalog
- **Profile & Settings** — editable profile (name, email, phone, location, bio), change password, notification preferences, delete account
- **Notifications** — live low-stock / out-of-stock alerts derived from real inventory data
- **Theming** — dark/light mode persisted in local storage
- **Security** — JWT-protected routes, helmet, CORS allow-list, rate limiting, express-validator on every body, strict upload validation
- **Optimization** — indexed queries, pagination, gzip-friendly bundle, immutable static uploads
- **Responsive** — mobile-first layout across all pages

## Tech Stack

| Layer     | Technology                                    |
| --------- | --------------------------------------------- |
| Frontend  | React 18, Vite, React Router, Recharts, Tailwind (via CSS vars), Framer Motion, Axios |
| Backend   | Node.js, Express, MySQL (mysql2), JWT, bcryptjs |
| Reports   | pdfkit, json2csv                              |
| Uploads   | multer (disk storage, 2MB limit)              |

## Project Structure

```
second project/
├── backend/
│   ├── sql/schema.sql          # Idempotent schema + seeds + migrations (runs on startup)
│   ├── uploads/                # Uploaded product images (served at /uploads)
│   └── src/
│       ├── config/db.js        # MySQL pool + ensureDatabase
│       ├── middleware/         # auth, error, upload, rate limits
│       ├── models/             # user, product, category, supplier, inventory, dashboard, report
│       ├── services/           # business logic
│       ├── controllers/        # request handlers
│       ├── routes/             # auth, products, categories, suppliers, inventory, dashboard, reports
│       ├── utils/              # ApiError, asyncHandler, generateToken, validate
│       ├── app.js              # Express app (CORS, helmet, static uploads, routers)
│       └── server.js           # Entry point
└── frontend/
    └── src/
        ├── components/         # charts, tables, modals, cards, ui primitives, navigation
        ├── context/            # AuthContext, DataContext (API-backed), ThemeContext
        ├── pages/              # Landing, Login/Register, Dashboard pages
        ├── services/           # axios client + snake→camel mappers
        └── utils/              # formatters, validators, hooks
```

## Prerequisites

- Node.js 18+ (tested on 22)
- MySQL 8+ running locally

## Installation

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env   # then edit .env with your MySQL credentials
npm run dev              # or: npm start
```

Required `.env` values:

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173   # comma-separated origins; localhost:5173 is always allowed
JWT_SECRET=<long random string>    # e.g. openssl rand -hex 32
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=stockflow
```

The database, tables and seed data are created automatically on first startup — no manual SQL step needed.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Optionally create `frontend/.env` with `VITE_API_URL` to point at a deployed API (unset = auto-detect `http://<frontend-host>:5000/api`).

### 3. Demo login

| Email                | Password    |
| -------------------- | ----------- |
| `demo@stockflow.app` | `demopass123` |

## API Overview

All routes except `register`, `login`, `forgot-password` and `health` require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST   | `/api/auth/register` | Create an account |
| POST   | `/api/auth/login` | Login, returns JWT |
| GET    | `/api/auth/profile` | Current user profile |
| PUT    | `/api/auth/profile` | Update profile (name, email, phone, location, bio) |
| PUT    | `/api/auth/change-password` | Change password (current + new) |
| DELETE | `/api/auth/account` | Delete account |
| GET/PUT| `/api/auth/settings` | Notification/language/currency preferences |
| GET/POST| `/api/products` | List (search, filter, sort, paginate) / create |
| GET/PUT/DELETE | `/api/products/:id` | Read / update / delete |
| POST   | `/api/products/:id/image` | Upload product image (multipart field `image`, max 2MB) |
| GET/POST| `/api/categories` | List / create |
| GET/PUT/DELETE | `/api/categories/:id` | Read / update / delete |
| GET/POST| `/api/suppliers` | List / create |
| GET/PUT/DELETE | `/api/suppliers/:id` | Read / update / delete |
| POST   | `/api/inventory/stock-in` | Record stock received |
| POST   | `/api/inventory/stock-out` | Record stock dispatched (validates availability) |
| GET    | `/api/inventory/history` | Movement history (filters + pagination) |
| GET    | `/api/dashboard` | Totals, inventory value, low/out counts, recent activities |
| GET    | `/api/dashboard/analytics` | Monthly movement, revenue/cost, category & supplier distribution, value trend |
| GET    | `/api/reports/pdf` | Full catalog as PDF (attachment) |
| GET    | `/api/reports/csv` | Full catalog as CSV (attachment) |
| GET    | `/uploads/*` | Served product images |

Responses follow `{ success, message, data }`.

## Database Setup (manual alternative)

`schema.sql` is idempotent and runs automatically on every server start via `ensureDatabase()`. To create everything manually:

```bash
mysql -u root -p < sql/schema.sql
```

## Deployment

**Backend** — set `NODE_ENV=production`, a strong `JWT_SECRET`, and `CLIENT_URL` to your frontend origin(s). Serve with `npm start` behind a reverse proxy (Caddy/Nginx) for TLS.

**Frontend** — `npm run build`, then serve the `dist/` folder (or deploy to Vercel/Netlify). Set `VITE_API_URL` at build time to the deployed API.

Notes:

- CORS allows any `localhost`/`127.0.0.1` port in development plus anything listed in `CLIENT_URL`.
- Product images are stored under `backend/uploads/` and served with a 7-day immutable cache.
- Rate limits: 100 req/15min for auth routes, 500 req/15min for API routes.
