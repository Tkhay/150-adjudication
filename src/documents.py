"""Builds supporting-document metadata from URLs found in the email — no network
requests, no downloading. The files stay hosted on the awards site; the React/Vercel
dossier will link to these URLs directly."""
from pathlib import Path
from urllib.parse import unquote, urlparse

from .models import SupportingDocument


def build_supporting_documents(urls: list[str]) -> list[SupportingDocument]:
    return [_build_one(url) for url in urls]


def _build_one(url: str) -> SupportingDocument:
    path = urlparse(url).path
    filename = Path(unquote(path)).name or None
    return SupportingDocument(url=url, filename=filename, type=_guess_type(filename))


def _guess_type(filename: str | None) -> str | None:
    if not filename:
        return None
    ext = Path(filename).suffix.lstrip(".").lower()
    return ext or None
