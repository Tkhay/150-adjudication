"""Per-run log of which emails were processed, skipped (already done), or failed."""
import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path


@dataclass
class LogEntry:
    message_id: str
    subject: str
    status: str  # "success" | "skipped_already_processed" | "failed"
    record_id: str | None = None
    reason: str | None = None


@dataclass
class RunLog:
    run_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    entries: list[LogEntry] = field(default_factory=list)

    def add(self, entry: LogEntry) -> None:
        self.entries.append(entry)

    def summary(self) -> dict[str, int]:
        counts = {"success": 0, "skipped_already_processed": 0, "failed": 0}
        for entry in self.entries:
            counts[entry.status] = counts.get(entry.status, 0) + 1
        return counts

    def write(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "run_at": self.run_at,
            "summary": self.summary(),
            "entries": [asdict(e) for e in self.entries],
        }
        path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
