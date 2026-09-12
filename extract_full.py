"""FULL extraction: connect read-only, find ALL emails matching the subject filter,
and extract every one that hasn't already been processed in a previous run.

Idempotent: a Message-ID already present in state/processed_emails.json is skipped
entirely (not re-fetched, not re-parsed), so running this again after new nominations
arrive only processes the new ones and never duplicates existing records.

Supporting documents are NOT downloaded — only their url/filename/type metadata is
captured; the files stay hosted on the awards site for the React/Vercel dossier to
link to directly.

Read-only against the mailbox throughout: BODY.PEEK[...] fetches only, no flags/moves/
deletes, no writes back to the server.
"""
import sys
from pathlib import Path

from src.config import load_config
from src.documents import build_supporting_documents
from src.exporters import write_csv, write_json
from src.extraction_log import LogEntry, RunLog
from src.imap_client import ReadOnlyMailbox
from src.models import NominationRecord, make_record_id
from src.parser import extract_message_id_from_header, parse_raw_email
from src.state import ProcessedState

PROJECT_ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = PROJECT_ROOT / "output"
STATE_DIR = PROJECT_ROOT / "state"

JSON_OUTPUT_PATH = OUTPUT_DIR / "nominations.json"
CSV_OUTPUT_PATH = OUTPUT_DIR / "nominations.csv"
LOG_OUTPUT_PATH = OUTPUT_DIR / "extraction_log.json"
STATE_PATH = STATE_DIR / "processed_emails.json"


def main() -> int:
    config = load_config()
    print(f"Connecting to {config.imap_host}:{config.imap_port} as {config.email_user} "
          f"(folder={config.imap_folder!r}, read-only)...")

    state = ProcessedState(STATE_PATH)
    existing_records: dict[str, dict] = _load_existing_records(JSON_OUTPUT_PATH)
    run_log = RunLog()

    new_records: list[dict] = []

    with ReadOnlyMailbox(config) as mailbox:
        ids = mailbox.search_by_subject(config.subject_filter)
        print(f"Found {len(ids)} email(s) matching subject filter {config.subject_filter!r}.")

        for i, imap_id in enumerate(ids, start=1):
            try:
                header_bytes = mailbox.fetch_header(imap_id)
                message_id = extract_message_id_from_header(header_bytes)
            except Exception as exc:  # header fetch/parsing itself failed
                run_log.add(LogEntry(
                    message_id="(unknown)", subject="(unknown)",
                    status="failed", reason=f"Could not read header: {exc}",
                ))
                print(f"  [{i}/{len(ids)}] FAILED reading header: {exc}")
                continue

            if state.is_processed(message_id):
                run_log.add(LogEntry(
                    message_id=message_id, subject="(skipped, not re-fetched)",
                    status="skipped_already_processed",
                    record_id=state.record_id_for(message_id),
                ))
                print(f"  [{i}/{len(ids)}] skip (already processed): {message_id}")
                continue

            try:
                raw_bytes = mailbox.fetch_raw(imap_id)
                parsed = parse_raw_email(raw_bytes)

                supporting_documents = build_supporting_documents(parsed.supporting_document_urls)
                record = NominationRecord(
                    id=make_record_id(parsed.meta.message_id),
                    source_message_id=parsed.meta.message_id,
                    source_subject=parsed.meta.subject,
                    source_date=parsed.meta.date,
                    source_from=parsed.meta.from_,
                    submitter_name=parsed.submitter_name,
                    contact_number=parsed.contact_number,
                    nominee_name=parsed.nominee_name,
                    award_category=parsed.award_category,
                    justification_summary=parsed.justification_summary,
                    nominee_email=parsed.nominee_email,
                    nominee_phone=parsed.nominee_phone,
                    supporting_documents=supporting_documents,
                )

                new_records.append(record.to_dict())
                state.mark_processed(parsed.meta.message_id, record.id)
                run_log.add(LogEntry(
                    message_id=parsed.meta.message_id, subject=parsed.meta.subject,
                    status="success", record_id=record.id,
                ))
                print(f"  [{i}/{len(ids)}] OK: {parsed.meta.subject}")

            except Exception as exc:
                # A parsing failure for one email must never abort the whole run.
                run_log.add(LogEntry(
                    message_id=message_id, subject="(parse failed)",
                    status="failed", reason=str(exc),
                ))
                print(f"  [{i}/{len(ids)}] FAILED: {exc}")

    all_records = list(existing_records.values()) + new_records
    write_json(all_records, JSON_OUTPUT_PATH)
    write_csv(all_records, CSV_OUTPUT_PATH)
    run_log.write(LOG_OUTPUT_PATH)
    state.save()

    summary = run_log.summary()
    print("\nRun summary:")
    print(f"  New records extracted:  {summary['success']}")
    print(f"  Skipped (already done): {summary['skipped_already_processed']}")
    print(f"  Failed:                 {summary['failed']}")
    print(f"  Total records in output: {len(all_records)}")
    print(f"\nWrote: {JSON_OUTPUT_PATH}")
    print(f"Wrote: {CSV_OUTPUT_PATH}")
    print(f"Wrote: {LOG_OUTPUT_PATH}")
    print(f"Updated: {STATE_PATH}")
    return 0


def _load_existing_records(path: Path) -> dict[str, dict]:
    if not path.exists():
        return {}
    import json
    records = json.loads(path.read_text(encoding="utf-8"))
    return {record["id"]: record for record in records}


if __name__ == "__main__":
    sys.exit(main())
