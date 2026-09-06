# Mail Sentinel Security & Threat Model

## 1. Security Philosophy
Mail Sentinel handles **untrusted, potentially hostile email data**.
The platform is designed under a **Zero-Trust Sandbox Model**: every pasted text block, header, URL, attachment, and `.eml` file is treated as actively malicious until analyzed.

---

## 2. Key Safeguards & Controls

### 1. Zero Attachment Execution
- **Policy**: Mail Sentinel will **never** execute, decompress, or trigger execution of attachments.
- **Implementation**: Files are parsed strictly at the binary header/metadata level to extract file name, size, MIME type, and dual-extension patterns (`.pdf.exe`).
- **Protection**: Eliminates risk of remote code execution (RCE) or payload detonating on the analysis host.

### 2. Passive URL Analysis Only
- **Policy**: Mail Sentinel will **never** automatically crawl, fetch, or trigger HTTP requests to extracted links by default.
- **Implementation**: URLs are inspected using lexical, syntactic, and structural heuristics (e.g., raw IP detection, suspicious TLDs, keyword matches, entropy, punycode/IDN homoglyphs).
- **Protection**: Prevents triggering one-time attacker tokens, tracking pixels, canary traps, or exploit kits.

### 3. HTML Sanitization & XSS Neutralization
- **Policy**: Prevent Cross-Site Scripting (XSS) in both the analysis engine and frontend UI.
- **Implementation**: The parser strips `<script>`, `<iframe>`, `<object>`, `<embed>`, and inline event handlers (`onload`, `onerror`, `onclick`). The React frontend renders plain text and structured tables with native JSX escaping without `dangerouslySetInnerHTML`.
- **Protection**: Prevents client-side session compromise and malicious script execution.

### 4. Input Validation & DoS Prevention
- **Payload Size Limit**: File uploads are capped at 10 MB in FastAPI (`MAX_UPLOAD_SIZE_BYTES`).
- **Stream Limit**: Multipart streams are validated before buffering to prevent memory exhaustion attacks.
- **Timeout Protection**: Internal parsing processes enforce explicit timeouts on complex multipart MIME trees.

### 5. SQL Injection Prevention
- **Implementation**: All database operations use **SQLAlchemy ORM** with parameterized queries.
- **Protection**: Raw SQL string concatenation is strictly prohibited throughout the codebase.

### 6. Secret Management & Threat Intelligence Safety
- **No Key Leaks**: Threat intelligence API keys (e.g., `VIRUSTOTAL_API_KEY`, `URLHAUS_API_KEY`) are read strictly from server-side environment variables and are **never** returned in API responses to the browser.
- **Graceful Degradation**: If external API keys are absent, the application reports `Threat Intelligence: Not Configured` without crashing or fabricating results.

### 7. Privacy & Data Minimization
- **No Raw Body Retention**: To comply with data privacy policies and prevent storing sensitive credentials or PII, the backend does **not** persist raw email bodies in the database.
- **Telemetry-Only Storage**: Only extracted analytical telemetry (sender, subject, risk score, findings, URL records, and attachment summaries) are stored.
