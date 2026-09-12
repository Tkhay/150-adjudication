"""Writes the extracted nomination records to JSON (for the React/Vercel dossier) and
CSV (for review in Excel)."""
import csv
import json
from pathlib import Path

CSV_FIELDS = [
    "id",
    "source_message_id",
    "source_subject",
    "source_date",
    "source_from",
    "submitter_name",
    "contact_number",
    "nominee_name",
    "award_category",
    "justification_summary",
    "nominee_email",
    "nominee_phone",
    "supporting_documents_count",
    "supporting_documents",
    "extracted_at",
]


def write_json(records: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")


def write_csv(records: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        for record in records:
            writer.writerow(_flatten_for_csv(record))


def _flatten_for_csv(record: dict) -> dict:
    docs = record.get("supporting_documents") or []
    docs_str = "; ".join(
        f"{doc.get('filename') or '(unknown filename)'} [{doc.get('type') or 'unknown'}] {doc.get('url')}"
        for doc in docs
    )
    row = {key: record.get(key) for key in CSV_FIELDS if key not in ("supporting_documents", "supporting_documents_count")}
    row["supporting_documents_count"] = len(docs)
    row["supporting_documents"] = docs_str
    return row
