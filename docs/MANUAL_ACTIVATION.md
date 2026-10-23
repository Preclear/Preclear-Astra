# Manual activation and known limits

As of October 23, 2026, the owner confirms Supabase's database-size quota remains unresolved to avoid additional expense. No paid upgrade is requested. Stored municipal documents/chunks exist, but accessible coverage and the résumé's 50+ source-site count are unverified. The deployed interface is not proof of working database or model integration. Until the steps below succeed, Aura displays an unavailable state rather than fabricated answers.

## 1. Restore data access within your chosen budget

Inspect the Supabase project's database usage and quota status. You may leave the project limited. If you choose to reduce stored data, export and verify a backup first, then review retention and remove only data you deliberately choose to discard. No automatic deletion, plan change or billing change is part of this repair. Confirm the raw_documents and ordinance_chunks tables can be read before attempting ingestion. A quota error is not an empty dataset.

## 2. Prepare reviewed rules

Back up the database. The existing public.jurisdictions table must have id (UUID) and name columns. Review and apply supabase/migrations/025_compliance_rules.sql using your database migration workflow. It adds compliance_rules and the permit_api / permit_ingest NOLOGIN roles. Give a dedicated runtime login membership in permit_api; use a separate ingestion login with permit_ingest. Use TLS connection strings and keep passwords out of Git. Existing jurisdiction row-level security, if enabled, must allow the runtime login to read the intended jurisdiction rows.

Raw documents and chunks do not automatically become reviewed compliance_rules. With local server-side environment variables set, use:

```sh
python -m pip install -r requirements-municipal.txt
python -m municipal.pipeline export-supabase --output sources.json
python -m municipal.pipeline extract-export --input sources.json --output candidates.json
```

Export needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Extraction needs OPENAI_API_KEY and OPENAI_MODEL and may incur model usage. Inspect the exported schema and resolve any documents_without_linked_chunks first. Review candidates against original sources; use municipal/pipeline.py's import_reviewed schema, include human verification metadata and a future expiry, and save the reviewed import payload as reviewed.json. Do not import unverified model output. Using the ingestion database login:

```sh
python -m municipal.pipeline import-reviewed --input reviewed.json --output coverage.json
```

Only active, reviewed, unexpired rules appear in the app. Count source pages, unique source hosts and jurisdictions separately. Do not treat stored-document counts as reviewed-rule coverage.

## 3. Configure the correct Vercel project

Open Daniel's projects → preclear-astra → Environment Variables. Set these for Production (and separately for Preview if you want previews to use a test backend):

| Variable | Value / purpose |
| --- | --- |
| VITE_SUPABASE_URL | Your Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Your project's public anon key; never the service-role key |
| PERMIT_DATABASE_URL | TLS PostgreSQL connection string for the restricted runtime login |
| OPENAI_API_KEY | Server-side OpenAI API key |
| OPENAI_MODEL | Exact model identifier available to that API project and compatible with the Responses tool workflow |

The backend accepts the VITE_SUPABASE values for session verification; optional server aliases are SUPABASE_URL and SUPABASE_ANON_KEY. Never put database passwords, OpenAI keys or service-role keys in VITE_ variables: they are bundled into browser code. VITE_API_URL alone does not configure this same-origin API.

Configure Supabase authentication for the production site and allowed redirect paths. If using Google sign-in, configure that provider too. The sign-in return path can include /permit-agent and its question query. Save settings, then redeploy the latest main branch in Vercel so both browser build variables and server variables take effect.

## 4. Verify activation

1. Open https://www.preclearai.net/api/health. auth_configured, lookup_configured and chat_configured should be true. These flags only confirm settings exist, not that credentials or data work.
2. Sign in at https://www.preclearai.net/sign-in with a real account. Confirm successful return to the app.
3. Open https://www.preclearai.net/permit-agent. Confirm a jurisdiction with reviewed rules loads.
4. Ask a question covered by one reviewed rule. Verify the result, source links and conditions against the original document.
5. Ask a question missing required attributes. Confirm clarification or jurisdiction verification, not a guessed approval.
6. Verify /api/jurisdictions and /api/chat still reject unauthenticated requests. Record the date and result of a successful live lookup before claiming end-to-end readiness.

If quota remains unresolved, stop at the unavailable state and retain the storage/data limitation in the portfolio. Do not call configuration-only health checks a successful model/database test.
