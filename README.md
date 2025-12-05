# Employee Management Backend

Express + TypeScript backend with MongoDB, Redis, BullMQ, and JWT auth.

## Prerequisites
- Node.js 18+
- Yarn v1
- MongoDB running locally (default `mongodb://localhost:27017/employee-management`)
- Redis running locally (default `localhost:6379`)

### Start local MongoDB
```bash
# Example with Docker
docker run --name mongo -p 27017:27017 -d mongo:7
```

### Start local Redis
```bash
# Example with Docker
docker run --name redis -p 6379:6379 -d redis:7
```

## Environment
Copy `.env.example` (if present) or set these vars:

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `3000` |
| `CORS_ORIGIN` | Allowed origins | `*` |
| `JWT_SECRET` | Secret for JWT | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiry | `1d` |
| `MONGO_URI` | Mongo connection string | `mongodb://localhost:27017` |
| `MONGO_DB_NAME` | Database name | `employee-management` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password (optional) | — |

## Setup
```bash
yarn install
cp .env.example .env.local  # if available; otherwise define env vars above
```

## Scripts
- `yarn dev` — start dev server with nodemon.
- `yarn build` — compile TypeScript.
- `yarn start` — run compiled output.
- `yarn lint` — Biome lint.
- `yarn format` — Biome format.
- `yarn check` — Biome check.
- `yarn test` — Jest unit tests (with coverage).

## Running locally
1) Ensure MongoDB and Redis are running (see Docker examples above).
2) Set env vars (`PORT`, `MONGO_URI`, `MONGO_DB_NAME`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, etc).
3) Start dev server: `yarn dev` (listens on `http://localhost:3000` by default).
4) Seed admin (optional, if needed by auth flow): `yarn seed:admin`.

## API overview
- Auth: `POST /auth/login`, `GET /auth/me` (Bearer token).
- Employees: `GET /employee/data`, `POST /employee/add`, `PATCH /employee/update`, `DELETE /employee/remove`, `POST /employee/add/csv`.
- Notifications: `GET /notifications`, `PATCH /notifications/read`, WebSocket at `/ws/notifications?token=<jwt>`.

## Notes
- Queue operations use Redis + BullMQ; ensure Redis is available.
- Mongo models live in `src/database/schemas`.
- Tests mock external services (Mongo/Redis/WS) — see `test/` for examples.
