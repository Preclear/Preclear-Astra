from unittest.mock import patch, Mock
import pytest
from fastapi.testclient import TestClient
from backend.web import app, authorize, ready_repository

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean():
    yield
    app.dependency_overrides.clear()


def test_no_session_never_calls_model():
    with patch('backend.web.answer') as answer:
        assert client.post('/api/chat', json={}).status_code == 401
        answer.assert_not_called()


def test_auth_service_failure_is_unavailable(monkeypatch):
    import httpx
    monkeypatch.setenv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    monkeypatch.setenv('VITE_SUPABASE_ANON_KEY', 'public-key')
    with patch('backend.web.httpx.get', side_effect=httpx.ConnectError('offline')):
        assert client.get('/api/jurisdictions', headers={'Authorization': 'Bearer token'}).status_code == 503


def test_missing_database_is_explicit(monkeypatch):
    monkeypatch.delenv('PERMIT_DATABASE_URL', raising=False)
    app.dependency_overrides[authorize] = lambda: 'user'
    assert client.get('/api/jurisdictions').status_code == 503
    assert client.get('/api/health').json()['lookup_configured'] is False


def test_verified_session_and_jurisdictions(monkeypatch):
    monkeypatch.setenv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    monkeypatch.setenv('VITE_SUPABASE_ANON_KEY', 'public-key')
    repo = Mock(); repo.jurisdictions.return_value = [{'id': 'one', 'name': 'Example'}]
    app.dependency_overrides[ready_repository] = lambda: repo
    response = Mock(status_code=200); response.json.return_value = {'id': 'verified-user'}
    with patch('backend.web.httpx.get', return_value=response) as get:
        result = client.get('/api/jurisdictions', headers={'Authorization': 'Bearer token'})
        assert result.status_code == 200
        assert result.json()[0]['name'] == 'Example'
        assert get.call_args.kwargs['headers']['Authorization'] == 'Bearer token'


def test_db_failure_does_not_leak_credentials():
    import psycopg2
    app.dependency_overrides[authorize] = lambda: 'user'
    repo = Mock(); repo.jurisdictions.side_effect = psycopg2.OperationalError('sensitive connection details')
    app.dependency_overrides[ready_repository] = lambda: repo
    response = client.get('/api/jurisdictions')
    assert response.status_code == 503
    assert 'sensitive' not in response.text


def test_health_reports_configuration_without_values(monkeypatch):
    for name in ('SUPABASE_URL', 'SUPABASE_ANON_KEY', 'VITE_SUPABASE_URL',
                 'VITE_SUPABASE_ANON_KEY', 'PERMIT_DATABASE_URL', 'OPENAI_API_KEY', 'OPENAI_MODEL'):
        monkeypatch.delenv(name, raising=False)
    assert client.get('/api/health').json() == {
        'status': 'ok', 'service': 'preclear-permit-api', 'auth_configured': False,
        'lookup_configured': False, 'chat_configured': False}
    for name in ('VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY',
                 'PERMIT_DATABASE_URL', 'OPENAI_API_KEY', 'OPENAI_MODEL'):
        monkeypatch.setenv(name, 'secret-test-value')
    response = client.get('/api/health')
    assert response.json()['auth_configured'] is True
    assert response.json()['chat_configured'] is True
    assert 'secret-test-value' not in response.text
