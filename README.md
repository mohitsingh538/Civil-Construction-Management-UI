
# Civil Construction Management Platform

A monorepo for the Civil Construction Management application.

See [docs/repository-structure.md](docs/repository-structure.md) for the current source-of-truth layout and ownership boundaries.

## Structure

| Folder | Purpose |
|--------|---------|
| `web/` | React + Vite + TypeScript web app |
| `core/` | Shared types, services, models, utils |
| `mobile-app/` | React Native mobile app (future) |
| `backend/` | FastAPI Python backend (future) |

## Running the web app

```bash
cd web
npm install
npm run dev
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for a full explanation of the monorepo design and the `@core/*` shared logic layer.
