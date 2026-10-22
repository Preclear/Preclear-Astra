import os

import psycopg2
from psycopg2.extras import RealDictCursor

from backend.rules import evaluate


class Repository:
    def jurisdictions(self):
        conn = psycopg2.connect(os.environ["PERMIT_DATABASE_URL"], connect_timeout=10)
        try:
            with conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""SELECT DISTINCT j.id,j.name FROM jurisdictions j
                    JOIN compliance_rules r ON r.jurisdiction_id=j.id
                    WHERE r.is_active AND r.verified_at IS NOT NULL
                    AND r.valid_until > NOW() ORDER BY j.name""")
                return [{"id": str(r["id"]), "name": r["name"]} for r in cur.fetchall()]
        finally:
            conn.close()

    def lookup(self, request):
        conn = psycopg2.connect(os.environ["PERMIT_DATABASE_URL"], connect_timeout=10)
        try:
            with conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """SELECT id,conditions,permit_required,requirement,code_citation,
                    source_url,verified_at,valid_until FROM compliance_rules
                    WHERE jurisdiction_id=%s AND project_type=%s AND is_active=TRUE
                    AND verified_at IS NOT NULL AND valid_until > NOW()""",
                    (str(request.jurisdiction_id), request.project_type),
                )
                rows = cur.fetchall()
        finally:
            conn.close()
        return evaluate(rows, request.attributes)
