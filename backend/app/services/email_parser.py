"""
Safe email parser service for Mail Sentinel.
Handles RFC 5322 / MIME .eml files and pasted email content.
Strictly treats all inputs as untrusted:
- Never executes attachments or scripts.
- Sanitizes HTML and isolates URLs.
- Normalizes into a uniform schema.
"""
import re
import email
from email import policy
from email.message import EmailMessage
from typing import Dict, Any, List, Optional, Tuple
from html.parser import HTMLParser

# Regex for extracting URLs from plain text
URL_REGEX = re.compile(
    r'(https?://[^\s<>"\')]+|www\.[^\s<>"\')]+)',
    re.IGNORECASE
)

class SafeHTMLExtractor(HTMLParser):
    """
    Safely extracts text and hyperlinks from HTML email content.
    Prevents script execution and extracts link display text.
    """
    def __init__(self):
        super().__init__()
        self.text_parts: List[str] = []
        self.links: List[Dict[str, str]] = []
        self.current_tag: Optional[str] = None
        self.current_href: Optional[str] = None
        self.current_anchor_text: List[str] = []
        self.in_blacklisted_tag = False

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]):
        self.current_tag = tag.lower()
        if self.current_tag in ("script", "style", "iframe", "object", "embed", "applet"):
            self.in_blacklisted_tag = True
            return

        if self.current_tag == "a":
            href_dict = dict(attrs)
            href = href_dict.get("href", "")
            if href:
                self.current_href = href
                self.current_anchor_text = []

    def handle_endtag(self, tag: str):
        tag_lower = tag.lower()
        if tag_lower in ("script", "style", "iframe", "object", "embed", "applet"):
            self.in_blacklisted_tag = False
            return

        if tag_lower == "a" and self.current_href:
            anchor_text = "".join(self.current_anchor_text).strip()
            self.links.append({
                "url": self.current_href,
                "anchor_text": anchor_text
            })
            self.current_href = None
            self.current_anchor_text = []
        elif tag_lower in ("p", "br", "div", "h1", "h2", "h3", "h4", "tr", "li"):
            self.text_parts.append("\n")

    def handle_data(self, data: str):
        if not self.in_blacklisted_tag:
            self.text_parts.append(data)
            if self.current_href:
                self.current_anchor_text.append(data)

    def get_text(self) -> str:
        return "".join(self.text_parts).strip()

    def get_links(self) -> List[Dict[str, str]]:
        return self.links

class EmailParserService:
    @staticmethod
    def parse_eml_bytes(data: bytes) -> Dict[str, Any]:
        """
        Parses raw RFC 5322 MIME bytes safely.
        """
        try:
            msg = email.message_from_bytes(data, policy=policy.default)
        except Exception as e:
            # Fallback with relaxed policy
            msg = email.message_from_bytes(data, policy=policy.compat32)

        return EmailParserService._extract_from_message(msg)

    @staticmethod
    def parse_pasted(
        sender: str,
        recipient: str,
        subject: str,
        body: str,
        reply_to: Optional[str] = None,
        raw_headers: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Parses manually pasted email fields and optional raw headers.
        """
        headers_dict: Dict[str, Any] = {}
        authentication_dict: Dict[str, Any] = {
            "spf": "UNKNOWN",
            "dkim": "UNKNOWN",
            "dmarc": "UNKNOWN",
            "details": "Parsed from manual input."
        }

        if raw_headers:
            try:
                # Wrap headers in a synthetic message
                header_msg = email.message_from_string(raw_headers + "\n\n", policy=policy.default)
                headers_dict = {k: str(v) for k, v in header_msg.items()}
                # Extract authentication results from headers if present
                authentication_dict = EmailParserService.extract_authentication_results(header_msg)
            except Exception:
                headers_dict = {"Raw-Headers": raw_headers}

        # Extract URLs from body
        urls = EmailParserService.extract_urls(body, "")

        return {
            "sender": sender.strip(),
            "recipient": recipient.strip(),
            "reply_to": (reply_to or "").strip(),
            "subject": subject.strip(),
            "body": body.strip(),
            "headers": headers_dict,
            "urls": urls,
            "attachments": [],
            "authentication": authentication_dict
        }

    @staticmethod
    def _extract_from_message(msg: Any) -> Dict[str, Any]:
        """
        Extracts normalized data from an email.message object.
        """
        headers_dict: Dict[str, Any] = {}
        for key, val in msg.items():
            # If multiple headers with same key exist (e.g. Received), group them
            if key in headers_dict:
                if isinstance(headers_dict[key], list):
                    headers_dict[key].append(str(val))
                else:
                    headers_dict[key] = [headers_dict[key], str(val)]
            else:
                headers_dict[key] = str(val)

        sender = str(msg.get("From", "")).strip()
        recipient = str(msg.get("To", "")).strip()
        reply_to = str(msg.get("Reply-To", "")).strip()
        subject = str(msg.get("Subject", "")).strip()

        plain_text_body, html_body = EmailParserService.extract_body(msg)
        body = plain_text_body if plain_text_body else html_body
        
        # Extract URLs from body
        urls = EmailParserService.extract_urls(body, html_body)

        # Extract attachment telemetry (safe; does not execute or save malicious files)
        attachments = EmailParserService.extract_attachments(msg)

        # Extract Authentication Headers
        authentication = EmailParserService.extract_authentication_results(msg)

        return {
            "sender": sender,
            "recipient": recipient,
            "reply_to": reply_to if reply_to else None,
            "subject": subject,
            "body": body,
            "headers": headers_dict,
            "urls": urls,
            "attachments": attachments,
            "authentication": authentication
        }

    @staticmethod
    def extract_body(msg: Any) -> Tuple[str, str]:
        """
        Safely extracts plain-text and HTML body contents from an email message.
        """
        plain_text_parts: List[str] = []
        html_parts: List[str] = []

        if msg.is_multipart():
            for part in msg.walk():
                content_disposition = str(part.get("Content-Disposition", "")).lower()
                if "attachment" in content_disposition:
                    continue
                content_type = part.get_content_type()
                try:
                    payload = part.get_payload(decode=True)
                    if not payload:
                        continue
                    charset = part.get_content_charset() or "utf-8"
                    decoded_text = payload.decode(charset, errors="replace") if isinstance(payload, bytes) else str(payload)

                    if content_type == "text/plain":
                        plain_text_parts.append(decoded_text)
                    elif content_type == "text/html":
                        html_parts.append(decoded_text)
                except Exception:
                    continue
        else:
            try:
                payload = msg.get_payload(decode=True)
                if payload:
                    charset = msg.get_content_charset() or "utf-8"
                    decoded_text = payload.decode(charset, errors="replace") if isinstance(payload, bytes) else str(payload)
                    if msg.get_content_type() == "text/html":
                        html_parts.append(decoded_text)
                    else:
                        plain_text_parts.append(decoded_text)
            except Exception:
                pass

        plain_text = "\n".join(plain_text_parts).strip()
        raw_html = "\n".join(html_parts).strip()

        # If no plain text was provided but HTML was, extract text safely from HTML
        if not plain_text and raw_html:
            extractor = SafeHTMLExtractor()
            try:
                extractor.feed(raw_html)
                plain_text = extractor.get_text()
            except Exception:
                plain_text = re.sub(r'<[^>]+>', ' ', raw_html)

        return plain_text, raw_html

    @staticmethod
    def extract_urls(plain_text: str, raw_html: str) -> List[Dict[str, Any]]:
        """
        Extracts URLs from plain-text body and HTML body safely.
        """
        seen_urls = set()
        urls: List[Dict[str, Any]] = []

        # 1. From HTML anchors
        if raw_html:
            extractor = SafeHTMLExtractor()
            try:
                extractor.feed(raw_html)
                for item in extractor.get_links():
                    u = item["url"].strip()
                    if u and u not in seen_urls and not u.startswith(("mailto:", "tel:", "javascript:")):
                        seen_urls.add(u)
                        urls.append({
                            "url": u,
                            "anchor_text": item.get("anchor_text", ""),
                            "source": "html_link"
                        })
            except Exception:
                pass

        # 2. From plain text via Regex
        if plain_text:
            matches = URL_REGEX.findall(plain_text)
            for m in matches:
                u = m.strip(".,;:()[]{}<>\"'")
                if u and u not in seen_urls and not u.startswith(("mailto:", "tel:", "javascript:")):
                    seen_urls.add(u)
                    urls.append({
                        "url": u,
                        "anchor_text": "",
                        "source": "text_body"
                    })

        return urls

    @staticmethod
    def extract_attachments(msg: EmailMessage) -> List[Dict[str, Any]]:
        """
        Extracts attachment metadata WITHOUT executing files.
        """
        attachments: List[Dict[str, Any]] = []
        if not msg.is_multipart():
            return attachments

        for part in msg.walk():
            content_disposition = str(part.get("Content-Disposition", ""))
            filename = part.get_filename()

            if filename or "attachment" in content_disposition.lower():
                safe_name = filename or "unnamed_attachment"
                mime_type = part.get_content_type()
                payload = part.get_payload(decode=True)
                size = len(payload) if payload else 0

                # Extract extension safely
                ext = ""
                if "." in safe_name:
                    ext = "." + safe_name.rsplit(".", 1)[-1].lower()

                attachments.append({
                    "filename": safe_name,
                    "extension": ext,
                    "mime_type": mime_type,
                    "size": size
                })

        return attachments

    @staticmethod
    def extract_authentication_results(msg: EmailMessage) -> Dict[str, Any]:
        """
        Parses Authentication-Results and Received-SPF headers.
        Distinguishes between header-recorded results and missing checks.
        """
        auth_results_header = msg.get("Authentication-Results", "")
        spf_header = msg.get("Received-SPF", "")

        spf_status = "UNKNOWN"
        dkim_status = "UNKNOWN"
        dmarc_status = "UNKNOWN"
        source_note = "Extracted from message headers."

        full_auth_text = f"{auth_results_header} {spf_header}".lower()

        # SPF Extraction
        if "spf=pass" in full_auth_text or "received-spf: pass" in full_auth_text or full_auth_text.startswith("pass"):
            spf_status = "PASS"
        elif "spf=fail" in full_auth_text or "received-spf: fail" in full_auth_text or full_auth_text.startswith("fail"):
            spf_status = "FAIL"
        elif "spf=softfail" in full_auth_text or "received-spf: softfail" in full_auth_text:
            spf_status = "SOFTFAIL"
        elif "spf=neutral" in full_auth_text:
            spf_status = "NEUTRAL"
        elif "spf=none" in full_auth_text:
            spf_status = "NONE"

        # DKIM Extraction
        if "dkim=pass" in full_auth_text:
            dkim_status = "PASS"
        elif "dkim=fail" in full_auth_text:
            dkim_status = "FAIL"
        elif "dkim=neutral" in full_auth_text:
            dkim_status = "NEUTRAL"
        elif "dkim=none" in full_auth_text:
            dkim_status = "NONE"

        # DMARC Extraction
        if "dmarc=pass" in full_auth_text:
            dmarc_status = "PASS"
        elif "dmarc=fail" in full_auth_text:
            dmarc_status = "FAIL"
        elif "dmarc=none" in full_auth_text:
            dmarc_status = "NONE"

        if not auth_results_header and not spf_header:
            spf_status = "NONE"
            dkim_status = "NONE"
            dmarc_status = "NONE"
            source_note = "Authentication headers not available in email."

        return {
            "spf": spf_status,
            "dkim": dkim_status,
            "dmarc": dmarc_status,
            "raw_authentication_results": auth_results_header if auth_results_header else "Not Available",
            "raw_received_spf": spf_header if spf_header else "Not Available",
            "source_note": source_note
        }
