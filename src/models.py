"""Flat nomination record shaped for a React/Vercel dossier + JSON export."""
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone

NOMINATION_NAMESPACE = uuid.UUID("6f6e6f6d-6961-6e6e-6f6d-696e6174696f")  # fixed, arbitrary


@dataclass
class SupportingDocument:
    """Metadata only — the file stays hosted on the awards site; nothing is downloaded."""
    url: str
    filename: str | None = None
    type: str | None = None


@dataclass
class NominationRecord:
    id: str
    source_message_id: str
    source_subject: str
    source_date: str
    source_from: str
    submitter_name: str | None
    contact_number: str | None
    nominee_name: str | None
    award_category: str | None
    justification_summary: str | None
    nominee_email: str | None
    nominee_phone: str | None
    supporting_documents: list[SupportingDocument] = field(default_factory=list)
    extracted_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict:
        return asdict(self)


def make_record_id(message_id: str) -> str:
    """Deterministic UUID from the email's Message-ID, so re-processing the same
    email later (full run) yields the same record id instead of a fresh random one."""
    key = message_id.strip() or str(uuid.uuid4())
    return str(uuid.uuid5(NOMINATION_NAMESPACE, key))
