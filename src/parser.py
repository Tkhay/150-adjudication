"""Parses the fixed nomination-form HTML structure into the source fields.

Field labels are matched flexibly (case-insensitive, tolerant of "(optional)"/"(s)"
suffixes) because the real form renders labels like "Nominee Email (optional)" and
"Submitter Contact Number" rather than the shorthand names used to describe the form.
"""
import email
import re
from dataclasses import dataclass
from email.message import Message
from urllib.parse import urlparse

from bs4 import BeautifulSoup

# (field_key, regex matching the label text on its own line). Order doesn't matter for
# matching since each pattern is distinct, but keep it in the form's field order for clarity.
FIELD_PATTERNS: list[tuple[str, str]] = [
    ("submitter_name", r"Submitter\s+Name"),
    # Two form templates are in use: the older Mailchimp-style layout labels this
    # "Contact Number", the newer one "Submitter Contact Number". Match both.
    ("contact_number", r"Submitter\s+Contact\s+Number"),
    ("contact_number", r"Contact\s+Number"),
    ("nominee_name", r"Nominee\s+Name"),
    ("award_category", r"Award\s+Category"),
    ("justification_summary", r"Nomination\s+Justification\s+Summary"),
    (None, r"Supporting\s+Document(?:\(s\)|s)?\s*(?:\(Optional\)|\(upload\))?"),  # boundary only, no text value
    ("nominee_email", r"Nominee\s+Email\s*(?:\(optional\))?"),
    ("nominee_phone", r"Nominee\s+Phone\s*(?:\(optional\))?"),
    # Older Mailchimp-style template labels the nominee's phone field "Nominee Contact
    # Number" instead of "Nominee Phone (optional)". Same data, different label.
    ("nominee_phone", r"Nominee\s+Contact\s+Number"),
]

# Section headers that appear on their own line but are not fields; strip them out
# before splitting so they don't get swallowed into the preceding field's value.
SECTION_HEADER_PATTERN = re.compile(r"(?im)^(Submitter Information|Nominee Information)\s*$")

# Two known footer signatures across the two templates in use, each on its own line:
# "This message was sent from <link>." and "Sent from <link>". Matched as a whole line
# (not a substring) so a justification that happens to contain the words "sent from"
# is never mistaken for the footer and truncated.
FOOTER_LINE_PATTERN = re.compile(r"(?im)^(?:this message was sent from|sent from)\s*$")


@dataclass
class ParsedEmailMeta:
    subject: str
    date: str
    from_: str
    message_id: str


@dataclass
class ParsedNomination:
    meta: ParsedEmailMeta
    submitter_name: str | None
    contact_number: str | None
    nominee_name: str | None
    award_category: str | None
    justification_summary: str | None
    nominee_email: str | None
    nominee_phone: str | None
    supporting_document_urls: list[str]


def parse_raw_email(raw_bytes: bytes) -> ParsedNomination:
    msg = email.message_from_bytes(raw_bytes)
    meta = _extract_meta(msg)
    html = _extract_html_part(msg)
    if html is None:
        raise ValueError("No text/html part found in email; cannot parse nomination fields.")

    soup = BeautifulSoup(html, "html.parser")
    text = _html_to_paragraph_text(soup)
    text = _strip_section_headers(text)
    text = _strip_footer(text)
    fields = _split_fields(text)
    urls = _extract_supporting_document_urls(soup)

    return ParsedNomination(
        meta=meta,
        submitter_name=fields.get("submitter_name"),
        contact_number=fields.get("contact_number"),
        nominee_name=fields.get("nominee_name"),
        award_category=fields.get("award_category"),
        justification_summary=fields.get("justification_summary"),
        nominee_email=fields.get("nominee_email") or None,
        nominee_phone=fields.get("nominee_phone") or None,
        supporting_document_urls=urls,
    )


def extract_message_id_from_header(header_bytes: bytes) -> str:
    """Cheap peek at just the Message-ID from a header-only IMAP fetch, so the full
    body doesn't need to be fetched/parsed for emails already processed."""
    msg = email.message_from_bytes(header_bytes)
    return msg.get("Message-ID", msg.get("Message-Id", ""))


def _extract_meta(msg: Message) -> ParsedEmailMeta:
    return ParsedEmailMeta(
        subject=msg.get("Subject", ""),
        date=msg.get("Date", ""),
        from_=msg.get("From", ""),
        message_id=msg.get("Message-ID", msg.get("Message-Id", "")),
    )


def _extract_html_part(msg: Message) -> str | None:
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                charset = part.get_content_charset() or "utf-8"
                return part.get_payload(decode=True).decode(charset, errors="replace")
        return None
    if msg.get_content_type() == "text/html":
        charset = msg.get_content_charset() or "utf-8"
        return msg.get_payload(decode=True).decode(charset, errors="replace")
    return None


def _html_to_paragraph_text(soup: BeautifulSoup) -> str:
    # Normalize <br> to newlines so paragraph structure survives get_text().
    for br in soup.find_all("br"):
        br.replace_with("\n")
    text = soup.get_text(separator="\n")
    # Collapse runs of blank lines but keep paragraph breaks.
    lines = [line.strip() for line in text.splitlines()]
    cleaned: list[str] = []
    for line in lines:
        if line or (cleaned and cleaned[-1] != ""):
            cleaned.append(line)
    return "\n".join(cleaned).strip()


def _strip_section_headers(text: str) -> str:
    lines = [line for line in text.splitlines() if not SECTION_HEADER_PATTERN.match(line)]
    return "\n".join(lines)


def _strip_footer(text: str) -> str:
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if FOOTER_LINE_PATTERN.match(line):
            return "\n".join(lines[:i]).rstrip("-\n ").strip()
    return text


def _split_fields(text: str) -> dict[str, str]:
    label_alternation = "|".join(f"(?:{pattern})" for _, pattern in FIELD_PATTERNS)
    line_pattern = re.compile(rf"(?im)^({label_alternation})\s*:?\s*$")

    matches = list(line_pattern.finditer(text))
    results: dict[str, str] = {}

    for i, match in enumerate(matches):
        label_text = match.group(1)
        key = _key_for_label(label_text)
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        value = text[start:end].strip()
        if key is not None:
            results[key] = value

    return results


def _key_for_label(label_text: str) -> str | None:
    for key, pattern in FIELD_PATTERNS:
        if re.fullmatch(pattern, label_text, flags=re.IGNORECASE):
            return key
    return None


def _extract_supporting_document_urls(soup: BeautifulSoup) -> list[str]:
    urls: list[str] = []
    seen = set()
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        scheme = urlparse(href).scheme.lower()
        if scheme not in ("http", "https"):
            continue

        context = a.find_parent(["p", "li", "td"])
        context_text = context.get_text(" ", strip=True).lower() if context else ""
        if "this message was sent from" in context_text or "sent from" in context_text:
            continue  # the mailer's own footer link back to the form site, not an attachment

        if href not in seen:
            seen.add(href)
            urls.append(href)
    return urls
