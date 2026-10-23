"""Same-origin Vercel API; validates Supabase sessions before database/model access."""
import os
import httpx
import psycopg2
from fastapi import Depends, FastAPI, Header, HTTPException
from backend.main import repository, openai_client
from backend.models import Chat, Lookup
from backend.agent import answer

app = FastAPI(title="PreClear Homeowner Permit Compliance Checker", docs_url=None, redoc_url=None)


def authorize(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer ") or len(authorization) > 8192:
        raise HTTPException(401, "Please sign in to use permit lookup.")
    url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")
    if not url or not key:
        raise HTTPException(503, "Sign-in verification is not configured.")
    try:
        response = httpx.get(url.rstrip('/') + '/auth/v1/user', headers={
            'apikey': key, 'Authorization': authorization}, timeout=10)
        if response.status_code in (401, 403):
            raise HTTPException(401, "Please sign in again.")
        response.raise_for_status()
        user = response.json()
        if not user.get('id'):
            raise HTTPException(401, "Please sign in again.")
        return user['id']
    except (httpx.HTTPError, ValueError):
        raise HTTPException(503, "Sign-in service is temporarily unavailable.") from None


def ready_repository():
    if not os.environ.get('PERMIT_DATABASE_URL'):
        raise HTTPException(503, "Reviewed permit data is not connected yet. Please check with your jurisdiction.")
    return repository()


@app.get('/api/health')
def health():
    return {'status': 'ok', 'service': 'preclear-permit-api',
            'auth_configured': bool((os.environ.get('SUPABASE_URL') or os.environ.get('VITE_SUPABASE_URL'))
                                    and (os.environ.get('SUPABASE_ANON_KEY') or os.environ.get('VITE_SUPABASE_ANON_KEY'))),
            'lookup_configured': bool(os.environ.get('PERMIT_DATABASE_URL')),
            'chat_configured': bool(os.environ.get('PERMIT_DATABASE_URL') and os.environ.get('OPENAI_API_KEY') and os.environ.get('OPENAI_MODEL'))}


@app.get('/api/jurisdictions', dependencies=[Depends(authorize)])
def jurisdictions(repo=Depends(ready_repository)):
    try:
        return repo.jurisdictions()
    except psycopg2.Error:
        raise HTTPException(503, "Reviewed permit data is temporarily unavailable.") from None


@app.post('/api/permit-check', dependencies=[Depends(authorize)])
def lookup(request: Lookup, repo=Depends(ready_repository)):
    try:
        return repo.lookup(request)
    except psycopg2.Error:
        raise HTTPException(503, "Reviewed permit data is temporarily unavailable.") from None


@app.post('/api/chat', dependencies=[Depends(authorize)])
def chat(request: Chat, repo=Depends(ready_repository), client=Depends(openai_client)):
    from openai import OpenAIError
    try:
        return answer(client, os.environ['OPENAI_MODEL'], repo, request)
    except psycopg2.Error:
        raise HTTPException(503, "Reviewed permit data is temporarily unavailable.") from None
    except (OpenAIError, ValueError, TypeError, KeyError):
        raise HTTPException(502, "The lookup could not be completed. Please try again.") from None
