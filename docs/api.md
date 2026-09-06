# Mail Sentinel API Reference

## Base URL
All API routes are prefixed with `/api`.
When running locally: `http://127.0.0.1:8000/api` (or proxied via Vite dev server at `http://127.0.0.1:5173/api`).

---

## Error Handling Format
Mail Sentinel returns standardized JSON error responses for all HTTP 4xx/5xx conditions:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "The provided email could not be parsed."
  }
}
```

Common error codes:
- `EMPTY_PAYLOAD`: Email body or content is empty.
- `INVALID_EMAIL`: RFC 5322 parsing error or corrupt structure.
- `FILE_TOO_LARGE`: Uploaded file exceeds the 10 MB threshold.
- `INVALID_FILE_TYPE`: Uploaded file extension is not `.eml`.
- `SCAN_NOT_FOUND`: Specified scan UUID does not exist.

---

## Endpoints

### 1. System Health Check
Check operational status of the API, database connectivity, and ML classifier readiness.

- **Method**: `GET /api/health`
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "service": "Mail Sentinel",
  "tagline": "Detect the Threat. Protect the Inbox.",
  "version": "1.0.0",
  "detection_engine": "online",
  "ml_model_loaded": true
}
```

---

### 2. Analyze Pasted Email
Submit raw email fields for real-time threat analysis.

- **Method**: `POST /api/scans`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "from_address": "security-alert@bank-update.xyz",
  "to_address": "analyst@enterprise.com",
  "reply_to": "attacker@freemail.ru",
  "subject": "URGENT: Verify your account immediately",
  "body": "Your bank account has been flagged. Click http://192.168.1.1/login to restore access.",
  "raw_headers": "Optional raw RFC headers..."
}
```
- **Response**: `201 Created`
```json
{
  "id": "49feccae-c5a9-4544-838e-eac3fb3221c7",
  "created_at": "2026-09-06T23:55:58.123456",
  "score": 85,
  "severity": "CRITICAL",
  "confidence": 0.98,
  "sender": "security-alert@bank-update.xyz",
  "recipient": "analyst@enterprise.com",
  "subject": "URGENT: Verify your account immediately",
  "ml_prediction": {
    "is_phishing": true,
    "confidence": 0.98,
    "top_features": ["urgent", "account", "verify", "login"]
  },
  "findings": [
    {
      "id": "...",
      "category": "URL",
      "severity": "CRITICAL",
      "title": "Raw IP Address Hostname Detected",
      "description": "The URL uses a raw IP address instead of a registered domain.",
      "evidence": "http://192.168.1.1/login"
    }
  ],
  "urls": [
    {
      "id": "...",
      "url": "http://192.168.1.1/login",
      "domain": "192.168.1.1",
      "risk_score": 90,
      "status": "CRITICAL",
      "reasons": ["Raw IP address", "Path contains 'login'"]
    }
  ],
  "attachments": [],
  "authentication": {
    "spf": "NOT_AVAILABLE",
    "dkim": "NOT_AVAILABLE",
    "dmarc": "NOT_AVAILABLE",
    "status": "UNKNOWN",
    "source_note": "No authentication headers detected in pasted email."
  },
  "recommendations": [
    "Do not click any embedded links or credentials verification forms.",
    "Block incoming communications from domain bank-update.xyz at the email gateway."
  ]
}
```

---

### 3. Upload & Analyze `.eml` File
Safely parse an RFC 5322 `.eml` file, extracting MIME headers, body, links, and attachment telemetry.

- **Method**: `POST /api/scans/upload`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: Binary content of the `.eml` file (Max 10 MB).
- **Response**: `201 Created` (Returns full `ScanDetail` schema as above).

---

### 4. Retrieve Scan Result
Retrieve forensic scan details by UUID.

- **Method**: `GET /api/scans/{scan_id}`
- **Response**: `200 OK` (Returns `ScanDetail`)
- **Error**: `404 Not Found` if scan does not exist.

---

### 5. List Scans / Incident History
List previous scans with pagination and optional severity filtering.

- **Method**: `GET /api/scans`
- **Query Parameters**:
  - `limit` (int, default: 20, max: 100)
  - `offset` (int, default: 0)
  - `severity` (string, optional: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- **Response**: `200 OK`
```json
{
  "total": 42,
  "limit": 20,
  "offset": 0,
  "scans": [
    {
      "id": "49feccae-c5a9-4544-838e-eac3fb3221c7",
      "created_at": "2026-09-06T23:55:58",
      "score": 85,
      "severity": "CRITICAL",
      "confidence": 0.98,
      "sender": "security-alert@bank-update.xyz",
      "subject": "URGENT: Verify your account immediately",
      "urls_count": 1,
      "attachments_count": 0
    }
  ]
}
```

---

### 6. Delete Scan
Remove a scan and its associated findings and telemetry records.

- **Method**: `DELETE /api/scans/{scan_id}`
- **Response**: `200 OK`
```json
{
  "success": true,
  "deleted_id": "49feccae-c5a9-4544-838e-eac3fb3221c7"
}
```

---

### 7. Security Dashboard Statistics
Aggregated threat metrics for the SOC dashboard. If no scans have been performed yet, returns clearly flagged sample data (`is_sample_data: true`).

- **Method**: `GET /api/statistics`
- **Response**: `200 OK`
```json
{
  "total_scans": 2,
  "phishing_detected": 1,
  "safe_emails": 1,
  "average_risk": 67.0,
  "is_sample_data": false,
  "severity_breakdown": {
    "LOW": 0,
    "MEDIUM": 1,
    "HIGH": 0,
    "CRITICAL": 1
  },
  "timeline": [
    {
      "time": "Recent",
      "low": 0,
      "medium": 1,
      "high": 0,
      "critical": 1
    }
  ]
}
```

---

### 8. Threat Intelligence Status
Check active threat intelligence adapter states (VirusTotal, URLhaus, PhishTank, AbuseIPDB).

- **Method**: `GET /api/threat-intel/status`
- **Response**: `200 OK`
```json
{
  "providers": [
    {
      "id": "virustotal",
      "name": "VirusTotal",
      "status": "NOT_CONFIGURED",
      "description": "Multi-engine malware and malicious URL scanning."
    },
    {
      "id": "urlhaus",
      "name": "URLhaus (abuse.ch)",
      "status": "NOT_CONFIGURED",
      "description": "Malicious URL feed sharing malware distribution sites."
    }
  ]
}
```

---

### 9. Threat Intelligence IOC Lookup
Perform passive reputational lookup for an indicator of compromise (URL, domain, or IP).

- **Method**: `POST /api/threat-intel/lookup`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "type": "url",
  "value": "http://suspicious-domain.com/login"
}
```
- **Response**: `200 OK`
```json
{
  "ioc": "http://suspicious-domain.com/login",
  "type": "url",
  "results": [
    {
      "provider": "VirusTotal",
      "status": "NOT_CONFIGURED",
      "message": "Threat Intelligence: Not Configured. Provide VIRUSTOTAL_API_KEY to enable."
    }
  ]
}
```
