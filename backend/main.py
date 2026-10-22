import os
import secrets
from fastapi import Depends, FastAPI, Header, HTTPException
from backend.models import Lookup, Chat
from backend.repository import Repository
from backend.agent import answer

app = FastAPI(title="Homeowner Permit Compliance Checker")


def authorize(x_permit_service_key: str = Header(default="")):
    expected = os.environ.get("PERMIT_SERVICE_KEY", "")
    if not expected:
        raise HTTPException(503, "Service authentication is not configured")
    if not secrets.compare_digest(expected, x_permit_service_key):
        raise HTTPException(401, "Unauthorized")


def repository():
    return Repository()


def openai_client():
    from openai import OpenAI

    if not os.environ.get("OPENAI_API_KEY") or not os.environ.get("OPENAI_MODEL"):
        raise HTTPException(503, "Conversational lookup is not configured")
    return OpenAI(timeout=25, max_retries=0)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/v1/permit-check", dependencies=[Depends(authorize)])
def permit_check(request: Lookup, repo=Depends(repository)):
    return repo.lookup(request)


@app.post("/v1/chat", dependencies=[Depends(authorize)])
def chat(request: Chat, repo=Depends(repository), client=Depends(openai_client)):
    try:
        return answer(client, os.environ["OPENAI_MODEL"], repo, request)
    except (ValueError, TypeError, KeyError):
        raise HTTPException(
            502, "The model returned invalid lookup arguments; please try again"
        ) from None
