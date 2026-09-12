"""Read-only IMAP-over-SSL access. Never modifies mailbox state (no flags, moves, deletes)."""
import imaplib
from dataclasses import dataclass

from .config import Config


@dataclass
class FoundEmail:
    imap_id: bytes
    raw_bytes: bytes


class ReadOnlyMailbox:
    """Thin wrapper around imaplib that only ever peeks at messages."""

    def __init__(self, config: Config):
        self._config = config
        self._conn: imaplib.IMAP4_SSL | None = None

    def __enter__(self) -> "ReadOnlyMailbox":
        self._conn = imaplib.IMAP4_SSL(self._config.imap_host, self._config.imap_port)
        self._conn.login(self._config.email_user, self._config.email_password)
        # readonly=True: server-side guarantee that SELECT will not permit flag changes.
        status, _ = self._conn.select(self._config.imap_folder, readonly=True)
        if status != "OK":
            raise RuntimeError(f"Could not select folder {self._config.imap_folder!r}")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if self._conn is not None:
            try:
                self._conn.close()
            except imaplib.IMAP4.error:
                pass  # close() can fail on a readonly-selected mailbox; logout still runs.
            self._conn.logout()

    def search_by_subject(self, subject_filter: str) -> list[bytes]:
        assert self._conn is not None
        criteria = f'(SUBJECT "{subject_filter}")'
        status, data = self._conn.search(None, criteria)
        if status != "OK":
            raise RuntimeError(f"IMAP SEARCH failed: {status}")
        ids = data[0].split()
        return ids

    def fetch_raw(self, imap_id: bytes) -> bytes:
        """Fetch the full raw message via BODY.PEEK[], which never sets \\Seen."""
        assert self._conn is not None
        status, data = self._conn.fetch(imap_id, "(BODY.PEEK[])")
        if status != "OK" or not data or data[0] is None:
            raise RuntimeError(f"IMAP FETCH failed for id {imap_id!r}: {status}")
        # data[0] is typically (b'<id> (BODY[] {n}', b'<raw message bytes>')
        raw = data[0][1]
        return raw

    def fetch_header(self, imap_id: bytes) -> bytes:
        """Fetch only the header via BODY.PEEK[HEADER] — cheap way to read Message-ID
        before deciding whether the full body needs fetching/parsing at all."""
        assert self._conn is not None
        status, data = self._conn.fetch(imap_id, "(BODY.PEEK[HEADER])")
        if status != "OK" or not data or data[0] is None:
            raise RuntimeError(f"IMAP HEADER FETCH failed for id {imap_id!r}: {status}")
        return data[0][1]
