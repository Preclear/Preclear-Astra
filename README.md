# PreClear — Homeowner Permit Compliance Checker

This is the canonical application repository for https://www.preclearai.net.
`Daniel21b/permitsaas` is a legacy repository and is not the live deployment source.

React/TypeScript (JavaScript) and Vite serve the existing interface. The Aura
conversation and `/permit-agent` call same-origin FastAPI endpoints hosted as a
Python Vercel Function. Supabase validates user sessions; PostgreSQL stores
reviewed municipal compliance rules. OpenAI interprets questions and calls a
bounded, read-only rule lookup tool. Python/Apify ingestion is in `municipal/`.

- `GET /api/health`: process health and configuration flags, not data readiness.
- `GET /api/jurisdictions`: jurisdictions with current reviewed rules.
- `POST /api/permit-check`: deterministic project-attribute rule lookup.
- `POST /api/chat`: sourced conversation using OpenAI database lookup tools.

All data/model endpoints verify a Supabase bearer session server-side. No OpenAI
or database secrets belong in `VITE_` environment variables. Missing service
configuration returns a clear unavailable response; no scripted permit advice
is substituted. Existing dashboard/report illustrations are not API results.

See [architecture and deployment](docs/ARCHITECTURE.md).

## Development

```sh
npm ci
npm run dev
python -m pip install -r requirements.txt
python -m uvicorn backend.web:app --port 8000
```

Use the Vite `/api` development proxy to port 8000. Copy `.env.example` for
frontend settings; export server settings into the Python process environment.
Validate with `npm run build` and `python -m pytest backend/tests -q`.

## Data ingestion

Install `requirements-municipal.txt`, then run `python -m municipal --help`.
The workflow supports Apify collection and `export-supabase` / `extract-export`
for existing raw documents and chunks. Candidate rules require source evidence,
manual review and an expiry before `import-reviewed` writes normalized rules.
The coverage command reports source pages, hosts and jurisdictions separately.

The owner has municipal documents in Supabase. A previous read returned HTTP 402
`exceed_db_size_quota`; this is unavailable coverage, not zero sources. The résumé
figure of 50+ sites remains unverified until the data is accessible and counted.
The résumé period Jan–Mar 2026 is user-supplied; this integration was added in
October 2026 and does not establish that all features existed earlier.
