"""Prepares output/awards.json — the public website dataset — from the raw
output/nominations.json source-of-truth.

Read-only against nominations.json (it is never modified). This step:
  - drops known test/trial submissions (exact nominee name + justification match)
  - reshapes each supporting document url into an evidence kind the site can
    render directly (document / image / video / external_link), based only on
    file extension — no other correction or inference
  - strips email/phone/IMAP/extraction metadata that the public site doesn't need

Does not deduplicate: the same nominee can legitimately appear more than once
(different categories, or multiple independent nominations).
"""
import json
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
RAW_PATH = PROJECT_ROOT / "output" / "nominations.json"
AWARDS_PATH = PROJECT_ROOT / "output" / "awards.json"

# Exact (nominee_name, justification_summary) pairs confirmed as test/trial
# submissions, not genuine nominations.
TEST_RECORDS = {
    ("David Indome", "This is a test"),
    ("Test nominee", "This is a test"),
    ("David Coleman", "Trial"),
    ("David Coleman", "Trial 2"),
    ("Test - Nominee contact info optional",
     "This is a test to validate nominee contact info is no longer mandatory"),
}

DOCUMENT_EXTS = {"pdf", "doc", "docx"}
IMAGE_EXTS = {"jpg", "jpeg", "png"}
VIDEO_EXTS = {"mp4", "mov", "webm"}

MIN_JUSTIFICATION_LEN = 15

MARKDOWN_LINK_RE = re.compile(r"^\[(https?://\S+)\]\((https?://\S+)\)$")


def is_test_record(record: dict) -> bool:
    name = (record.get("nominee_name") or "").strip()
    justification = (record.get("justification_summary") or "").strip()
    if name == "James Bond":
        return True
    return (name, justification) in TEST_RECORDS


def clean_url(url: str | None) -> str | None:
    """Strips Markdown link wrapping ([url](url)) if present; the underlying
    URL is preserved exactly, nothing else about it is changed."""
    if not url:
        return url
    match = MARKDOWN_LINK_RE.match(url.strip())
    if match:
        return match.group(2)
    return url


def classify_evidence(doc: dict) -> str:
    ext = (doc.get("type") or "").lower()
    if ext in DOCUMENT_EXTS:
        return "document"
    if ext in IMAGE_EXTS:
        return "image"
    if ext in VIDEO_EXTS:
        return "video"
    return "external_link"


def to_website_record(record: dict) -> dict:
    evidence = [
        {
            "kind": classify_evidence(doc),
            "url": clean_url(doc.get("url")),
            "filename": doc.get("filename"),
        }
        for doc in (record.get("supporting_documents") or [])
    ]
    return {
        "id": record["id"],
        "nominee_name": record.get("nominee_name"),
        "award_category": record.get("award_category"),
        "justification": record.get("justification_summary"),
        "nominator_name": record.get("submitter_name"),
        "supporting_evidence": evidence,
    }


def needs_manual_review(record: dict) -> list[str]:
    issues = []
    if not record.get("nominee_name"):
        issues.append("missing nominee_name")
    if not record.get("award_category"):
        issues.append("missing award_category")
    justification = (record.get("justification_summary") or "").strip()
    if len(justification) < MIN_JUSTIFICATION_LEN:
        issues.append("justification is missing or unusually short")
    return issues


def main() -> int:
    raw_records = json.loads(RAW_PATH.read_text(encoding="utf-8"))

    test_records = [r for r in raw_records if is_test_record(r)]
    kept_records = [r for r in raw_records if not is_test_record(r)]

    review_flags = [
        (r["id"], r.get("nominee_name"), r.get("award_category"), needs_manual_review(r))
        for r in kept_records
        if needs_manual_review(r)
    ]

    category_counts: dict[str, int] = {}
    evidence_counts: dict[str, int] = {}
    website_records = []
    for r in kept_records:
        category_counts[r.get("award_category")] = category_counts.get(r.get("award_category"), 0) + 1
        website_record = to_website_record(r)
        for ev in website_record["supporting_evidence"]:
            evidence_counts[ev["kind"]] = evidence_counts.get(ev["kind"], 0) + 1
        website_records.append(website_record)

    print("=== Preparation summary ===")
    print(f"Raw record count: {len(raw_records)}")
    print(f"Test records removed: {len(test_records)}")
    for r in test_records:
        print(f"  - {r.get('nominee_name')!r} / {r.get('justification_summary')!r} ({r.get('award_category')})")
    print(f"Final website record count: {len(website_records)}")
    print("Award category counts:")
    for cat, n in sorted(category_counts.items(), key=lambda kv: -kv[1]):
        print(f"  {n:4d}  {cat}")
    print("Supporting evidence breakdown by type:")
    for kind, n in sorted(evidence_counts.items(), key=lambda kv: -kv[1]):
        print(f"  {n:4d}  {kind}")
    print(f"Records with no supporting evidence: {sum(1 for r in website_records if not r['supporting_evidence'])}")
    print(f"Records flagged for manual review: {len(review_flags)}")
    for record_id, name, category, issues in review_flags:
        print(f"  - {record_id} {name!r} ({category}): {', '.join(issues)}")

    AWARDS_PATH.write_text(json.dumps(website_records, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nWrote {len(website_records)} records to {AWARDS_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
