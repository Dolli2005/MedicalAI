# Mediverse Backend

Simple Node/Express backend to support the Mediverse frontend included in the repository.

Quick start (PowerShell):

```powershell
cd c:\Users\Devanshu\Downloads\mediverse-ai-main\mediverse-ai-main\backend
npm install
node server.js
```

Server will listen on port 3000 by default. Frontend static files are served from the sibling `frontend/` folder.

Available API endpoints (basic CRUD):

- GET /api/health — health check
- GET /api/prescriptions — list
- POST /api/prescriptions — create
- GET /api/prescriptions/:id — get
- PUT /api/prescriptions/:id — update
- DELETE /api/prescriptions/:id — delete

Same pattern for `/api/appointments` and `/api/diagnostics`.

Notes:
- Data is persisted as JSON files under `backend/data/` for simplicity. Not intended for production.
- If you want a DB, replace the read/write helpers in `routes/*.js`.
