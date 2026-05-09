# RFID Tool Tracking System

A full-stack RFID Tool Tracking system for managing industrial tool inventory with JWT authentication.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/rfid-frontend run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `JWT_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS + shadcn/ui + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (jsonwebtoken) + bcryptjs
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle for API), Vite (static for frontend)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/tools.ts` — DB schema (tools, users, transactions tables)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/auth.ts` — JWT + bcrypt helpers
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware
- `artifacts/rfid-frontend/src/` — React frontend

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks + Zod schemas
- JWT stored in localStorage on frontend; injected as Bearer token in customFetch
- Express serves static frontend files in production (NODE_ENV=production)
- Free-form user IDs for tool issue/return (e.g. "EMP001") — not linked to registered users
- All DB schema changes go through Drizzle push (dev) or Railway publish flow (prod)

## Product

RFID Tool Tracking System with: Tool Master CRUD, Issue/Return flow with validation, RFID Scan simulation, Dashboard statistics, and JWT-authenticated API.

## User preferences

- Railway + GitHub deployment target
- Code must be 100% correct and deployable without changes
- Tech: React + TypeScript (UI), Node.js + Express + TypeScript (Backend), PostgreSQL

## Gotchas

- Always run codegen after changing openapi.yaml: `pnpm --filter @workspace/api-spec run codegen`
- Always run DB push after schema changes: `pnpm --filter @workspace/db run push`
- JWT_SECRET env var required in production — defaults to a hardcoded key in dev only
- Frontend uses BASE_PATH from Vite env — handled automatically by the artifact workflow

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `README.md` for Railway deployment instructions and API documentation
