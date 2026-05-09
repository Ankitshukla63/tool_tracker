# RFID Tool Tracking System

A full-stack RFID Tool Tracking system built with React + TypeScript (frontend) and Node.js + Express + TypeScript (backend), using PostgreSQL for data storage and JWT for authentication.

## Features

- **Tool Master**: Full CRUD for tool inventory (Tool ID, Name, Category, Status)
- **Issue / Return Flow**: Issue tools to users, return them, with full validation
- **RFID Inventory Scan**: Simulate RFID scanning — detects missing, extra, and correct tools
- **Dashboard**: Live stats — total, available, issued, and missing tools
- **JWT Authentication**: Secure API with Bearer token authentication

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express 5 + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **API Contracts**: OpenAPI 3.1 + Orval codegen (React Query hooks + Zod schemas)
- **Package Manager**: pnpm workspaces (monorepo)

## API Endpoints

All endpoints (except `/api/auth/*` and `/api/healthz`) require `Authorization: Bearer <token>` header.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/healthz` | Health check |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/tools` | List all tools (filter by status/category) |
| POST | `/api/tools` | Create a tool |
| GET | `/api/tools/:id` | Get tool by ID |
| PUT | `/api/tools/:id` | Update a tool |
| DELETE | `/api/tools/:id` | Delete a tool |
| POST | `/api/issue` | Issue a tool to a user |
| POST | `/api/return` | Return a tool |
| POST | `/api/scan` | RFID inventory scan |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/transactions` | Recent transaction log |

## Test Cases

- **Issue same tool twice** → Returns 400: "Tool is not available (current status: issued)"
- **Return non-issued tool** → Returns 400: "Tool is not currently issued (current status: available)"
- **Scan with missing tools** → `missing` array contains tools in DB but not scanned
- **Scan with extra tools** → `extra` array contains scanned IDs not in DB

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tools table
CREATE TABLE tools (
  id SERIAL PRIMARY KEY,
  tool_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status tool_status NOT NULL DEFAULT 'available', -- available | issued | missing
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  tool_id TEXT NOT NULL,
  user_id TEXT,
  action transaction_action NOT NULL, -- issue | return | scan
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Local Development

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Setup

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Push database schema
pnpm --filter @workspace/db run push

# Start the API server (development)
pnpm --filter @workspace/api-server run dev

# Start the frontend (development)
pnpm --filter @workspace/rfid-frontend run dev
```

### Codegen (after OpenAPI spec changes)

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Deploy to Railway

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: RFID Tool Tracking System"
git remote add origin https://github.com/your-username/rfid-tool-tracker.git
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app) and create a new project
2. Click **"Deploy from GitHub repo"** and select your repository
3. Railway will auto-detect the `railway.json` configuration
4. Add a **PostgreSQL** service to your project (click "+ New" → "Database" → "PostgreSQL")
5. Railway auto-sets `DATABASE_URL` — link it to your service
6. Add environment variables in Railway dashboard:
   - `JWT_SECRET` = (strong random string)
   - `NODE_ENV` = `production`
7. Railway handles `PORT` automatically
8. Click **Deploy** — Railway will build and start the app

### Step 3: First-time setup

After deployment, the database tables are created automatically via Drizzle schema push on first run.
Create your first admin user via:

```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "yourpassword"}'
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing (use a strong random string) |
| `PORT` | Auto | Port to listen on (Railway sets this) |
| `NODE_ENV` | Yes | Set to `production` for Railway |

## Assumptions & Limitations

- **User IDs in issue/return** are free-form strings (employee IDs like "EMP001") — not linked to registered users
- **RFID scan simulation**: The scan compares provided tool IDs against all tools in the database (not just available ones)
- **No role-based access control**: All authenticated users have full access
- **Password hashing**: bcryptjs with 10 salt rounds
- **JWT expiry**: 7 days
