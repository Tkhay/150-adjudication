"""Loads mailbox connection settings from .env. Never logs the password."""
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv
import os

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


@dataclass(frozen=True)
class Config:
    imap_host: str
    imap_port: int
    email_user: str
    email_password: str
    imap_folder: str
    subject_filter: str

    def __repr__(self) -> str:
        # Deliberately omit email_password from any repr/debug output.
        return (
            f"Config(imap_host={self.imap_host!r}, imap_port={self.imap_port!r}, "
            f"email_user={self.email_user!r}, imap_folder={self.imap_folder!r}, "
            f"subject_filter={self.subject_filter!r})"
        )


def load_config() -> Config:
    load_dotenv(ENV_PATH)

    host = os.getenv("IMAP_HOST")
    port_raw = os.getenv("IMAP_PORT", "993")
    user = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASSWORD")
    folder = os.getenv("IMAP_FOLDER", "INBOX")
    subject_filter = os.getenv("SUBJECT_FILTER", "Awards Nomination Form")

    missing = [
        name
        for name, value in (
            ("IMAP_HOST", host),
            ("EMAIL_USER", user),
            ("EMAIL_PASSWORD", password),
        )
        if not value
    ]
    if missing:
        raise RuntimeError(
            f"Missing required .env value(s): {', '.join(missing)}. "
            f"Check {ENV_PATH}."
        )

    try:
        port = int(port_raw)
    except ValueError as exc:
        raise RuntimeError(f"IMAP_PORT must be an integer, got {port_raw!r}") from exc

    return Config(
        imap_host=host,
        imap_port=port,
        email_user=user,
        email_password=password,
        imap_folder=folder,
        subject_filter=subject_filter,
    )
