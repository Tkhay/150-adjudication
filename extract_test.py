"""TEST-mode extraction: connect read-only, find nomination emails, process exactly ONE
(the most recent match), and write test-output.json.

Supporting documents are NOT downloaded — they stay hosted on the awards site; only
their URL/filename/type metadata is captured for the React/Vercel dossier to link to.

Does not modify the mailbox in any way and does not process any other email.
"""
import json
import sys
from pathlib import Path

from src.config import load_config
from src.documents import build_supporting_documents
from src.imap_client import ReadOnlyMailbox
from src.models import NominationRecord, make_record_id
from src.parser import parse_raw_email

PROJECT_ROOT = Path(__file__).resolve().parent
TEST_OUTPUT_PATH = PROJECT_ROOT / "test-output.json"


def main() -> int:
    config = load_config()
    print(f"Connecting to {config.imap_host}:{config.imap_port} as {config.email_user} "
          f"(folder={config.imap_folder!r}, read-only)...")

    with ReadOnlyMailbox(config) as mailbox:
        ids = mailbox.search_by_subject(config.subject_filter)
        print(f"Found {len(ids)} email(s) matching subject filter {config.subject_filter!r}.")

        if not ids:
            print("No matching nomination emails found. Nothing to do.")
            return 0

        selected_id = ids[-1]  # most recent (highest sequence/UID from SEARCH)
        raw_bytes = mailbox.fetch_raw(selected_id)

    parsed = parse_raw_email(raw_bytes)

    print("\nSelected email for TEST extraction:")
    print(f"  Subject:    {parsed.meta.subject}")
    print(f"  Date:       {parsed.meta.date}")
    print(f"  From:       {parsed.meta.from_}")
    print(f"  Message-ID: {parsed.meta.message_id}")
    print()

    supporting_documents = build_supporting_documents(parsed.supporting_document_urls)
    if supporting_documents:
        print(f"Found {len(supporting_documents)} supporting document URL(s) (metadata only, no download):")
        for doc in supporting_documents:
            print(f"  {doc.filename or '(unknown filename)'} [{doc.type or 'unknown'}] -> {doc.url}")
    else:
        print("No supporting document URLs found in this email.")

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

    TEST_OUTPUT_PATH.write_text(
        json.dumps([record.to_dict()], indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    print(f"\nWrote extracted record to {TEST_OUTPUT_PATH}")
    print(json.dumps(record.to_dict(), indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
