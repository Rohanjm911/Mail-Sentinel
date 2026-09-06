"""
Text preprocessing and normalization pipeline for Mail Sentinel.
Provides reproducible cleaning for email subjects and bodies.
"""
import re
from typing import Optional

# Regular expressions for URL, IP, email, currency detection
URL_REGEX = re.compile(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[^\s]*', re.IGNORECASE)
IP_REGEX = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
CURRENCY_REGEX = re.compile(r'[\$€£¥]\s*\d+(?:,\d{3})*(?:\.\d{1,2})?|\b\d+(?:,\d{3})*(?:\.\d{1,2})?\s*(?:usd|eur|gbp|btc|eth)\b', re.IGNORECASE)
HTML_TAG_REGEX = re.compile(r'<[^>]+>')
SPECIAL_CHAR_REGEX = re.compile(r'[^\w\s\.\,\!\?\-]')

def clean_text(text: Optional[str]) -> str:
    """
    Cleans raw email text:
    - Strips HTML tags
    - Replaces URLs with URL_TOKEN
    - Replaces IP addresses with IP_TOKEN
    - Replaces email addresses with EMAIL_TOKEN
    - Replaces currency amounts with MONEY_TOKEN
    - Removes non-alphanumeric noise while preserving key punctuation
    - Normalizes multiple spaces and lowercases
    """
    if not text:
        return ""
    
    # Remove HTML tags if present
    cleaned = HTML_TAG_REGEX.sub(" ", text)
    
    # Tokenize high-signal entities
    cleaned = URL_REGEX.sub(" urltoken ", cleaned)
    cleaned = IP_REGEX.sub(" iptoken ", cleaned)
    cleaned = EMAIL_REGEX.sub(" emailtoken ", cleaned)
    cleaned = CURRENCY_REGEX.sub(" moneytoken ", cleaned)
    
    # Strip odd characters
    cleaned = SPECIAL_CHAR_REGEX.sub(" ", cleaned)
    
    # Normalize whitespace & lowercase
    cleaned = " ".join(cleaned.lower().split())
    return cleaned

def combine_subject_body(subject: Optional[str], body: Optional[str]) -> str:
    """
    Combines subject with body text giving weighted emphasis to subject lines.
    """
    s = clean_text(subject)
    b = clean_text(body)
    if s and b:
        # Subject repeated twice to give it proportional semantic weight in TF-IDF
        return f"{s} {s} {b}"
    elif s:
        return s
    return b
