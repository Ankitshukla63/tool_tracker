# RFID Tool Tracking System

A full-stack RFID Tool Tracking System built using React + TypeScript for the frontend and Node.js + Express + TypeScript for the backend, with PostgreSQL as the database and JWT-based authentication.

---

# Live Demo

https://tool-tracker-1-lee1.onrender.com

# GitHub Repository

https://github.com/Ankitshukla63/tool_tracker

---

# Project Overview

The RFID Tool Tracking System is designed to manage industrial tools using RFID-based inventory tracking concepts. The system allows organizations to maintain tool inventory, issue and return tools, track transactions, and simulate RFID inventory scans to detect missing or extra tools.

The project includes:

* Full authentication system
* Tool inventory management
* RFID scan simulation
* Dashboard analytics
* Transaction history
* PostgreSQL database integration
* RESTful APIs

---

# Features

## Authentication

* User Registration
* User Login
* JWT Token Authentication
* Protected APIs

## Tool Management

* Add Tools
* Update Tools
* Delete Tools
* View Tool Inventory
* Tool Status Tracking

## Tool Issue / Return

* Issue tools to users/employees
* Return issued tools
* Validation for invalid operations

## RFID Scan Simulation

* Detect Missing Tools
* Detect Extra Tools
* Match scanned tools with database inventory

## Dashboard

* Total Tools
* Available Tools
* Issued Tools
* Missing Tools
* Recent Transactions

---

# Tech Stack

## Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui

## Backend

* Node.js
* Express.js 5
* TypeScript

## Database

* PostgreSQL
* Drizzle ORM

## Authentication & Security

* JWT (jsonwebtoken)
* bcryptjs

## API & Tooling

* OpenAPI 3.1
* Orval Codegen
* React Query
* pnpm Workspaces

---

# Architecture

```text
Frontend (React + Vite)
        ↓
REST API (Express.js)
        ↓
PostgreSQL Database
```

---

# API Endpoints

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | `/api/healthz`       | Health Check         |
| POST   | `/api/auth/register` | Register User        |
| POST   | `/api/auth/login`    | Login User           |
| GET    | `/api/tools`         | Get All Tools        |
| POST   | `/api/tools`         | Create Tool          |
| GET    | `/api/tools/:id`     | Get Tool By ID       |
| PUT    | `/api/tools/:id`     | Update Tool          |
| DELETE | `/api/tools/:id`     | Delete Tool          |
| POST   | `/api/issue`         | Issue Tool           |
| POST   | `/api/return`        | Return Tool          |
| POST   | `/api/scan`          | RFID Inventory Scan  |
| GET    | `/api/stats`         | Dashboard Statistics |
| GET    | `/api/transactions`  | Transaction Logs     |

---

# Database Schema

## Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Tools Table

```sql
CREATE TABLE tools (
  id SERIAL PRIMARY KEY,
  tool_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status tool_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Transactions Table

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  tool_id TEXT NOT NULL,
  user_id TEXT,
  action transaction_action NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# Project Structure

```bash
tool_tracker/
│
├── artifacts/
├── attached_assets/
├── lib/
├── scripts/
│
├── .env.example
├── .gitignore
├── .npmrc
├── .replit
├── .replitignore
│
├── build.sh
├── nixpacks.toml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
│
├── push_to_github.sh
├── railway.json
├── render.yaml
├── replit.md
│
├── tsconfig.base.json
├── tsconfig.json
│
└── README.md
```


# Local Development Setup

## Prerequisites

* Node.js 20+
* pnpm 9+
* PostgreSQL

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Ankitshukla63/tool_tracker.git
cd tool_tracker
```

## Install Dependencies

```bash
pnpm install
```

---

# Environment Variables

Create a `.env` file:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

# Database Setup

```bash
pnpm --filter @workspace/db run push
```

---

# Start Backend Server

```bash
pnpm --filter @workspace/api-server run dev
```

---

# Start Frontend

```bash
pnpm --filter @workspace/rfid-frontend run dev
```

---

# Deployment (Render)

## Steps

1. Push project to GitHub
2. Create a new Web Service on Render
3. Connect GitHub Repository
4. Add PostgreSQL Database
5. Configure Environment Variables:

   * DATABASE_URL
   * JWT_SECRET
   * NODE_ENV=production
6. Deploy Application

---

# Environment Variables

| Variable     | Required | Description             |
| ------------ | -------- | ----------------------- |
| DATABASE_URL | Yes      | PostgreSQL Database URL |
| JWT_SECRET   | Yes      | Secret key for JWT      |
| NODE_ENV     | Yes      | Environment Mode        |
| PORT         | Auto     | Provided by Render      |

---

# RFID Scan Logic

The RFID scan endpoint compares scanned tool IDs with database inventory and categorizes tools into:

* Correct Tools
* Missing Tools
* Extra Tools

---

# Validation Rules

## Issue Tool Validation

* Prevents issuing already issued tools

## Return Tool Validation

* Prevents returning non-issued tools

## Authentication Validation

* Protected routes require JWT token

---

# Test Cases

## Issue Same Tool Twice

Response:

```json
{
  "message": "Tool is not available"
}
```

## Return Non-Issued Tool

Response:

```json
{
  "message": "Tool is not currently issued"
}
```

## RFID Scan Missing Tools

Returns missing tools inside:

```json
missing[]
```

---

# Security Features

* JWT Authentication
* Password Hashing using bcryptjs
* Protected API Routes
* Input Validation
* Secure Password Storage

---

# Assumptions & Limitations

* RFID scanning is simulated
* No role-based access control
* Employee IDs are free-form strings
* JWT expires in 7 days

---

# Future Improvements

* Real RFID Hardware Integration
* Role-Based Access Control
* Email Notifications
* Advanced Reporting
* Export Reports (PDF/Excel)
* Multi-user Access Levels

---

# Author

Ankit Shukla

---
