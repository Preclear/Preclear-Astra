"""Read existing public-source documents and chunks without changing Supabase."""

from datetime import datetime, timezone
from urllib.parse import urlparse


def rows(client, table, params):
    offset = 0
    while True:
        response = client.get(table, params={**params, "limit": 500, "offset": offset})
        if response.status_code != 200:
            # Do not turn quota/auth failures into an apparent empty database.
            raise RuntimeError(
                f"Supabase {table} read failed (HTTP {response.status_code}); coverage is unavailable"
            )
        page = response.json()
        yield from page
        if not page:
            break
        offset += len(page)
        if offset >= 100000:
            raise RuntimeError("Export limit reached; narrow the source inventory")


def export_sources(client):
    documents = list(
        rows(
            client,
            "raw_documents",
            {
                "select": "id,jurisdiction_id,source_url,retrieved_at",
                "is_active": "eq.true",
                "order": "id",
            },
        )
    )
    sources = []
    missing = []
    for document in documents:
        chunks = list(
            rows(
                client,
                "ordinance_chunks",
                {
                    "select": "id,chunk_text,chunk_index",
                    "raw_document_id": "eq." + document["id"],
                    "order": "chunk_index,id",
                },
            )
        )
        text = "\n\n".join(
            chunk["chunk_text"] for chunk in chunks if chunk.get("chunk_text")
        )
        if not text:
            missing.append(document["id"])
            continue
        sources.append(
            {
                "url": document["source_url"],
                "jurisdiction_id": document["jurisdiction_id"],
                "retrieved_at": document["retrieved_at"],
                "text": text,
            }
        )
    urls = {doc["source_url"] for doc in documents if doc.get("source_url")}
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "raw_document_count": len(documents),
        "source_pages": len(urls),
        "source_sites": len(
            {urlparse(url).hostname for url in urls if urlparse(url).hostname}
        ),
        "jurisdictions": len({doc["jurisdiction_id"] for doc in documents}),
        "documents_without_linked_chunks": missing,
        "sources": sources,
        "note": "Stored source inventory, not proof of reviewed normalized rule coverage.",
    }
