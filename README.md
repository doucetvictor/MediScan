# MediScan

MediScan is a small prototype web application consisting of a React + Vite frontend and a set of serverless function utilities (Python) located in `serverless-functions/`.

## Disclamer
This is for EDUCATIONAL Purpose.

Be careful - do not upload or commit sensitive information (personal data, patient health information, credentials, API keys, or other secrets) to this repository or in the application. Treat any real user or patient data with appropriate protections and follow applicable laws and institutional policies when testing with real data.
**We very strongly recommand to use fake, anonymised and/or non-real data for testing/using the solution.**

## Repository layout

- `frontend/` - React + TypeScript app (Vite). UI components live in `frontend/src/components`.
- `serverless-functions/` - Python serverless utilities, SQL schema, and helper scripts.
- `docker-compose.yml` - Docker Compose configuration used to run containerized services.
- `start_server.sh`, `clean_server.sh` - convenience scripts at the repo root.

## Services

Current Compose services (see `docker-compose.yml` for canonical source):

- `frontend` - built from `frontend/` and exposing port 80 (host:container `80:80`).

## Prerequisites

- Git (to clone repo)
- Docker & Docker Compose (for containerized quick start)
- Node.js (v18+ recommended) and npm or yarn (to run the frontend locally)
- Python 3.8+ (if you plan to run or modify the serverless functions locally)

## Quick start (Docker Compose)

This is the fastest way to run the application locally using the repository-provided compose file.

1. From repository root, build and start containers:

```bash
docker-compose up --build
```

2. Open the frontend in your browser:

http://localhost/

3. To stop and remove containers:

```bash
docker-compose down
```

If you use the provided helper scripts, `start_server.sh` and `clean_server.sh` are convenience wrappers located at repo root - inspect them to see the exact commands they're running.

## Local frontend development

1. Change to the frontend directory:

```bash
cd frontend
```

2. Install dependencies (npm example):

```bash
npm install
```

3. Start the Vite dev server:

```bash
npm run dev
```

The `frontend/package.json` provides these scripts:

- `dev` - runs Vite in development mode
- `build` - builds production assets (runs `tsc -b` then `vite build`)
- `preview` - previews the production build via `vite preview`

Open the URL printed by Vite, usually http://localhost:5173 by default. 

## Serverless functions / backend

For this project purpose, all services have been exposed to internet, for running the project, you just have to run the website part and it'll connect with our backend services.

The `serverless-functions/` folder contains Python scripts, a `requirements.txt`, and a SQL schema (`cloud-sql-postgres-config-schema.sql`). How to run these depends on your target platform (Cloud Functions, Cloud Run, local testing). Common local steps:

Documentation for Serverless functions / backend services have been provided in  the `serverless-functions` folder.

## Database

The Postgres schema is provided as `serverless-functions/cloud-sql-postgres-config-schema.sql`.

## Disclamer
This is for EDUCATIONAL Purpose.

Be careful - do not upload or commit sensitive information (personal data, patient health information, credentials, API keys, or other secrets) to this repository or through the application. Treat any real user or patient data with appropriate protections and follow applicable laws and institutional policies when testing with real data.
**We very strongly recommand to use fake, anonymised or non-real data for testing/using the solution.**