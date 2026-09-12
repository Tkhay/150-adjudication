"""Idempotency store: remembers which Message-IDs have already been turned into a
nomination record, so re-running the full extraction never creates duplicates and
never re-fetches/re-parses emails it has already processed."""
import json
from pathlib import Path


class ProcessedState:
    def __init__(self, path: Path):
        self._path = path
        self._message_id_to_record_id: dict[str, str] = {}
        if path.exists():
            self._message_id_to_record_id = json.loads(path.read_text(encoding="utf-8"))

    def is_processed(self, message_id: str) -> bool:
        return message_id in self._message_id_to_record_id

    def record_id_for(self, message_id: str) -> str | None:
        return self._message_id_to_record_id.get(message_id)

    def mark_processed(self, message_id: str, record_id: str) -> None:
        self._message_id_to_record_id[message_id] = record_id

    def save(self) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._path.write_text(
            json.dumps(self._message_id_to_record_id, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
