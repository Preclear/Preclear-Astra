-- Separate additive schema: legacy permit_rules and retrieval remain intact.
CREATE TABLE IF NOT EXISTS compliance_rules (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id),
 project_type TEXT NOT NULL,
 conditions JSONB NOT NULL CHECK (jsonb_typeof(conditions)='array'),
 permit_required BOOLEAN NOT NULL,
 requirement TEXT NOT NULL,
 code_citation TEXT NOT NULL,
 source_url TEXT NOT NULL,
 source_hash TEXT NOT NULL,
 rule_hash TEXT NOT NULL,
 retrieved_at TIMESTAMPTZ NOT NULL,
 verified_at TIMESTAMPTZ,
 verified_by TEXT,
 valid_until TIMESTAMPTZ,
 is_active BOOLEAN NOT NULL DEFAULT TRUE,
 UNIQUE(jurisdiction_id,source_url,source_hash,rule_hash),
 CHECK (verified_at IS NULL OR (verified_by IS NOT NULL AND valid_until>verified_at))
);
CREATE INDEX IF NOT EXISTS compliance_lookup_idx ON compliance_rules(jurisdiction_id,project_type) WHERE is_active;
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
-- No browser/anon policy. Ingestion and API use dedicated server-side credentials.

-- Grant these NOLOGIN roles to dedicated runtime login roles during deployment.
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='permit_api') THEN CREATE ROLE permit_api NOLOGIN; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='permit_ingest') THEN CREATE ROLE permit_ingest NOLOGIN; END IF;
END $$;
GRANT USAGE ON SCHEMA public TO permit_api, permit_ingest;
GRANT SELECT ON compliance_rules TO permit_api;
GRANT SELECT, INSERT, UPDATE ON compliance_rules TO permit_ingest;
DROP POLICY IF EXISTS permit_api_read ON compliance_rules;
CREATE POLICY permit_api_read ON compliance_rules FOR SELECT TO permit_api
 USING (is_active AND verified_at IS NOT NULL AND valid_until > NOW());
DROP POLICY IF EXISTS permit_ingest_write ON compliance_rules;
CREATE POLICY permit_ingest_write ON compliance_rules FOR ALL TO permit_ingest
 USING (TRUE) WITH CHECK (TRUE);

GRANT SELECT ON jurisdictions TO permit_api;
