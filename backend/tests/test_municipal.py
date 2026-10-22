from unittest.mock import MagicMock
import pytest
from municipal.pipeline import normalize, import_reviewed, coverage

SOURCE = {
    "url": "https://town.example.gov/permits",
    "jurisdiction_id": "11111111-1111-4111-8111-111111111111",
    "text": "A deck larger than 200 square feet requires a permit.",
    "retrieved_at": "2026-10-21T00:00:00Z",
}
RULE = {
    "project_type": "deck",
    "conditions": [{"attribute": "area_sqft", "operator": "gt", "value": 200}],
    "permit_required": True,
    "requirement": SOURCE["text"],
    "code_citation": "Example §1",
    "quote": SOURCE["text"],
}


def test_source_hash_and_provenance():
    normalized = normalize(RULE, SOURCE)
    assert len(normalized["source_hash"]) == 64
    assert normalized["source_url"] == SOURCE["url"]


def test_fabricated_quote_rejected():
    with pytest.raises(ValueError):
        normalize({**RULE, "quote": "invented exemption"}, SOURCE)


def test_invalid_boolean_rejected():
    with pytest.raises(ValueError):
        normalize({**RULE, "permit_required": "false"}, SOURCE)


def test_unreviewed_rules_never_import():
    conn = MagicMock()
    with pytest.raises(ValueError):
        import_reviewed(conn, [{"source": SOURCE, "rules": [RULE]}])
    conn.cursor.return_value.__enter__.return_value.execute.assert_not_called()


def test_coverage_counts_sites_not_pages():
    conn = MagicMock()
    conn.cursor.return_value.__enter__.return_value.fetchall.return_value = [
        ("https://town.gov/a", "one"),
        ("https://town.gov/b", "one"),
    ]
    assert coverage(conn)["source_sites"] == 1


def test_apify_and_model_adapter_produces_unreviewed_candidates():
    import json
    from types import SimpleNamespace
    from municipal.pipeline import crawl

    apify = MagicMock()
    apify.actor.return_value.call.return_value = {
        "status": "SUCCEEDED",
        "defaultDatasetId": "dataset",
    }
    apify.dataset.return_value.iterate_items.return_value = [
        {"url": SOURCE["url"], "text": SOURCE["text"]}
    ]
    model = MagicMock()
    model.responses.create.return_value = SimpleNamespace(
        status="completed", output_text=json.dumps({"rules": [RULE]})
    )
    result = crawl([SOURCE], apify, model, "configured-model")
    assert result[0]["reviewed_by"] is None
    assert result[0]["rules"][0]["source_hash"]
    assert (
        apify.actor.return_value.call.call_args.kwargs["run_input"]["maxCrawlPages"]
        == 1
    )


def test_supabase_quota_error_is_not_zero_coverage():
    from municipal.supabase_export import export_sources

    client = MagicMock()
    client.get.return_value.status_code = 402
    with pytest.raises(RuntimeError, match="coverage is unavailable"):
        export_sources(client)


def test_existing_raw_document_chunks_are_reused():
    from municipal.supabase_export import export_sources
    from types import SimpleNamespace as NS

    responses = iter(
        [
            [
                {
                    "id": "doc1",
                    "jurisdiction_id": SOURCE["jurisdiction_id"],
                    "source_url": SOURCE["url"],
                    "retrieved_at": SOURCE["retrieved_at"],
                }
            ],
            [],
            [{"id": "chunk1", "chunk_text": SOURCE["text"], "chunk_index": 0}],
            [],
        ]
    )
    client = MagicMock()
    client.get.side_effect = lambda *args, **kwargs: NS(
        status_code=200, json=lambda: next(responses)
    )
    result = export_sources(client)
    assert result["source_sites"] == 1
    assert result["sources"][0]["text"] == SOURCE["text"]
    assert result["documents_without_linked_chunks"] == []
