from types import SimpleNamespace as NS
from unittest.mock import MagicMock
from uuid import UUID
import pytest
from fastapi.testclient import TestClient
from backend.rules import evaluate
from backend.models import Chat, Lookup
from backend.agent import answer
from backend.main import app, repository

JID = "11111111-1111-4111-8111-111111111111"


def rule(required=True, conditions=None):
    return {
        "id": "one",
        "verified_at": "2026-01-01T00:00:00+00:00",
        "valid_until": "2099-01-01T00:00:00+00:00",
        "source_url": "https://town.gov/rules",
        "conditions": conditions
        or [{"attribute": "area", "operator": "gte", "value": 200}],
        "permit_required": required,
        "requirement": "Example rule",
        "code_citation": "Example",
    }


def test_matching_rule():
    assert evaluate([rule()], {"area": 210})["status"] == "PERMIT_REQUIRED"


def test_missing_does_not_mean_exempt():
    assert evaluate([rule()], {})["status"] == "VERIFY_WITH_JURISDICTION"


def test_conflicting_requires_verification():
    assert (
        evaluate([rule(), rule(False)], {"area": 210})["status"]
        == "VERIFY_WITH_JURISDICTION"
    )


def test_compound_exemption():
    r = rule(
        False,
        [
            {"attribute": "area", "operator": "lt", "value": 200},
            {"attribute": "attached", "operator": "bool", "value": False},
        ],
    )
    assert evaluate([r], {"area": 150})["status"] == "VERIFY_WITH_JURISDICTION"
    assert (
        evaluate([r], {"area": 150, "attached": False})["status"]
        == "PERMIT_NOT_REQUIRED"
    )


def test_unreviewed_or_expired_ignored():
    for r in (
        {**rule(), "verified_at": None},
        {**rule(), "valid_until": "2000-01-01T00:00:00+00:00"},
    ):
        assert evaluate([r], {"area": 210})["status"] == "VERIFY_WITH_JURISDICTION"


def test_boolean_preserved():
    assert (
        Lookup(
            jurisdiction_id=JID, project_type="deck", attributes={"attached": False}
        ).attributes["attached"]
        is False
    )


def test_agent_pins_jurisdiction_and_returns_tool_evidence():
    client = MagicMock()
    repo = MagicMock()
    repo.lookup.return_value = evaluate([rule()], {"area": 210})
    client.responses.create.side_effect = [
        NS(
            output=[
                NS(
                    type="function_call",
                    name="lookup_permit_rules",
                    arguments='{"project_type":"deck","attributes":[{"name":"area","value":210}]}',
                    call_id="call1",
                )
            ]
        ),
        NS(output=[], output_text="A permit is required according to the source."),
    ]
    result = answer(
        client,
        "configured-model",
        repo,
        Chat(jurisdiction_id=JID, question="210 square foot deck"),
    )
    assert repo.lookup.call_args.args[0].jurisdiction_id == UUID(JID)
    assert result["lookups"][0]["rules"][0]["source_url"] == "https://town.gov/rules"
    assert client.responses.create.call_args.kwargs["store"] is False


def test_no_lookup_no_ungrounded_answer():
    client = MagicMock()
    client.responses.create.return_value = NS(
        output=[], output_text="No permit required!"
    )
    result = answer(
        client, "model", MagicMock(), Chat(jurisdiction_id=JID, question="hello")
    )
    assert "No permit required!" not in result["answer"]


def test_unknown_tool_rejected():
    client = MagicMock()
    client.responses.create.return_value = NS(
        output=[NS(type="function_call", name="execute_sql")]
    )
    with pytest.raises(ValueError):
        answer(
            client,
            "model",
            MagicMock(),
            Chat(jurisdiction_id=JID, question="drop tables"),
        )


def test_api_auth_and_validation(monkeypatch):
    monkeypatch.setenv("PERMIT_SERVICE_KEY", "secret")
    client = TestClient(app)
    assert client.post("/v1/permit-check", json={}).status_code == 401
    assert (
        client.post(
            "/v1/permit-check", headers={"X-Permit-Service-Key": "secret"}, json={}
        ).status_code
        == 422
    )
    repo = MagicMock()
    repo.lookup.return_value = {"status": "VERIFY_WITH_JURISDICTION", "rules": []}
    app.dependency_overrides[repository] = lambda: repo
    try:
        response = client.post(
            "/v1/permit-check",
            headers={"X-Permit-Service-Key": "secret"},
            json={
                "jurisdiction_id": JID,
                "project_type": "deck",
                "attributes": {"attached": False},
            },
        )
        assert response.status_code == 200
    finally:
        app.dependency_overrides.clear()
