"""
Generate realistic synthetic training datasets for Mail Sentinel.
Ensures zero real PII or proprietary secrets while covering diverse phishing tactics
and legitimate enterprise/personal communications.
"""
import csv
import os

phishing_templates = [
    # Credential Harvesting & Account Suspension
    ("Urgent: Your PayPal account has been restricted", 
     "Dear Customer, We detected unauthorized sign-in attempts on your PayPal account from an unrecognized IP address. To protect your funds, access has been restricted. You must verify your credentials immediately at http://paypal-security-verification.xyz/login or your account will be permanently suspended within 24 hours. Failure to act will result in asset liquidation. Enter your full login credentials, PIN, and debit card number.", 1),
    ("Security Alert: Unauthorized login attempt detected",
     "A sign-in attempt from Russia was detected on your Microsoft Office 365 account. If this was not you, please verify your identity immediately by visiting our secure portal: http://192.168.1.105/owa/auth/logon.aspx?replace=true. Do not delay, your corporate mailbox will be blocked within 2 hours. Regards, IT Security Team.", 1),
    ("Action Required: Your Netflix membership is on hold",
     "We were unable to validate your billing details for the next subscription period. Update your credit card and billing address immediately to avoid account cancellation. Click here to confirm payment details: http://netflix-billing-update.top/account/verify. Enter card CVV and expiration date.", 1),
    ("Apple ID Notice: Your account was accessed from a new device",
     "Your Apple ID was recently used to sign in to iCloud on an unrecognized Windows device. Your account has been temporarily locked to safeguard personal information. Verify your account at http://appleid-apple-support.icu/recovery to restore full access. Failure to verify will result in iCloud data purge.", 1),
    ("Google Workspace: Storage quota exceeded - incoming emails blocked",
     "Your Google Workspace mailbox has exceeded 99.8% capacity. You have 14 incoming emails pending delivery. Click here immediately to add 25GB free storage: http://google-drive-quota-upgrade.club/auth/upgrade. You will need to log in with your admin password to authorize the quota extension.", 1),
    ("Bank of America: Immediate verification required for card ending 4019",
     "Due to suspicious debit card transactions in foreign currency, your card has been frozen. You must unlock your card by confirming your SSN, card PIN, and online banking passcode at http://bankofamerica-online-secure-auth.buzz/card/unlock. Failure to do so within 12 hours will result in permanent card cancellation.", 1),
    ("Wells Fargo: Fraud alert - Suspicious wire transfer flagged",
     "A wire transfer of $4,850.00 to an offshore account is currently pending. If you did not authorize this, cancel the transfer immediately at http://wellsfargo-fraudprevention-alert.work/cancel?id=83910. Enter your username, security answers, and OTP token.", 1),
    ("Chase Online: Your online access has been temporarily suspended",
     "Our anti-fraud engine detected irregularities in your Chase checking account. To restore normal transactions, complete identity verification at http://chase-security-check.cf/login.jsp. Failure to respond within 6 hours will freeze all connected accounts.", 1),
    ("Amazon.com: Your order #402-9812491-192 has been placed",
     "Thank you for purchasing 1x Apple MacBook Pro M3 Max ($3,499.00). If you did not make this purchase, call our fraud desk or cancel the order immediately at http://amazon-order-cancellation-center.online/orders/cancel?order=402-9812491. Do not let the order ship!", 1),
    ("DocuSign: Please review and electronically sign: Termination Agreement",
     "Human Resources has sent you a confidential legal document via DocuSign. View and sign your document immediately: http://docusign-secure-document-sign.info/docusign/envelope/auth?ref=9201. Please sign within 4 hours to avoid HR escalation.", 1),
    
    # Financial / Invoice / Payroll Scams
    ("OVERDUE INVOICE #INV-2024-91823 - Final Notice",
     "Please find attached overdue invoice #INV-2024-91823. Payment of $12,450.00 is past due by 45 days. Legal proceedings will commence if remittance is not confirmed by close of business today. Download the remittance document invoice_remittance.pdf.exe immediately and wire funds.", 1),
    ("Updated Direct Deposit Information Required - HR Payroll",
     "All staff are required to verify their direct deposit bank routing information before Friday's payroll cycle. Please log in to the employee portal at http://workday-payroll-portal.top/login to re-enter your banking details. Unverified employees will have paychecks withheld.", 1),
    ("IRS Tax Refund Notice: You have an unclaimed tax rebate of $1,420.50",
     "Internal Revenue Service Notification: You are eligible for an economic tax refund of $1,420.50. To claim your payment directly into your bank account, submit your direct deposit details and Social Security Number at http://irs-tax-refund-portal.biz/claim.", 1),
    ("Crypto Wallet Security: Unauthorized ETH withdrawal initiated",
     "Metamask Security: A withdrawal of 3.25 ETH was initiated from your wallet. If this was not authorized by you, reject the transaction immediately by connecting your wallet at http://metamask-security-resolver.xyz/protect. Enter your 12-word seed phrase to cancel the transaction.", 1),
    ("DHL Express: Package delivery failed - Address verification needed",
     "Your shipment #DHL-9810234 is held at the sorting hub due to incorrect delivery address. A handling fee of $2.50 is required to re-route your delivery. Update address and pay online at http://dhl-delivery-tracking-service.net/tracking/update. Package will be destroyed in 48 hours.", 1),
    ("FedEx: Delivery notification exception #FDX-29104",
     "We were unable to deliver your package today because no recipient was available to sign. Download and print the delivery receipt from http://fedex-express-shipping-labels.link/receipt.exe to present at your local pickup station.", 1),
    
    # IT Helpdesk & CEO Fraud
    ("IT HelpDesk: Mandatory multi-factor authentication (MFA) upgrade",
     "All company employees must migrate to the new Duo/Okta MFA system by 5:00 PM today. Failure to update will result in complete account lockout. Enroll your mobile number and credentials at http://okta-sso-corporate-auth.xyz/enroll?user=corp. Enter existing Windows password.", 1),
    ("URGENT: Task from CEO - Wire Transfer",
     "Are you at your desk right now? I am currently in an all-day executive board meeting and need an urgent wire transfer sent to an acquisition vendor before 3 PM. Keep this confidential until announced. Send me the routing confirmation right away.", 1),
    ("HR Policy Update: Employee bonuses and compensation review 2024",
     "Management has finalized the 2024 performance bonus structure. Review your individualized bonus allocation in the attached encrypted document: bonus_review_2024.docm. Enable macros when prompted to decrypt your compensation statement.", 1),
    ("Zoom: Meeting invitation pending - Missed webinar with Legal",
     "You missed an urgent video conference meeting with Legal Counsel regarding an internal compliance investigation. Review the audio transcript and recording at http://zoom-cloud-meetings-recording.click/watch?id=981273. Login required.", 1),
    ("Voicemail Notification: You have 1 new pending audio message (42s)",
     "PBX Telephone System: You received a confidential voicemail from +1 (800) 555-0199. Listen to the recording online: http://cisco-voicemail-audio-player.top/listen?msg=8271. Authentication required with your work email credentials.", 1),
    ("Dropbox: 3 files were shared with you - Financial Audit Q3",
     "Deloitte Auditor shared 'Q3_Financial_Audit_Exceptions.zip' with you on Dropbox. Access and review the files at http://dropbox-secure-cloud-sharing.buzz/share/q3audit before the board meeting tomorrow morning.", 1),
    ("SharePoint: Document shared with you requires signature",
     "A confidential document 'Vendor_Agreement_Final.pdf' was shared with you. View and download at http://sharepoint-microsoft-onedrive.club/doc?id=28491. Please sign and return immediately.", 1),
    ("Geek Squad: Invoice confirmation for automatic renewal ($499.99)",
     "Thank you for renewing your Geek Squad Best Buy Total Tech Protection Plan for $499.99. The amount has been charged to your linked account. If you did not authorize this charge, call our cancellation support line or click http://geeksquad-billing-dispute.online to request an immediate refund.", 1),
    ("Norton LifeLock: Order receipt #NL-948123 ($389.00 debited)",
     "Your annual Norton 360 subscription has automatically renewed for $389.00. If you wish to dispute this transaction or cancel your subscription, download your cancellation form: http://norton-cancellation-portal.site/dispute.exe.", 1),
    ("USPS: Package waiting for redelivery fee",
     "Your package cannot be delivered due to an incomplete address. Please pay $1.99 redelivery fee at http://usps-redelivery-postal.xyz/pay to schedule a new delivery date.", 1),
    ("Coinbase: Security Warning - Device unauthorized",
     "A new device logged into your Coinbase account from Berlin, Germany. If this was not you, disable your account immediately at http://coinbase-account-lockout.icu/disable. Do not share your 2FA code.", 1),
    ("Steam Community: Trade offer pending from Valve Admin",
     "A Valve representative has requested an item inventory check. Confirm the trade at http://steamcommunlty-trade.buzz/trade/98124 to avoid trade ban.", 1),
    ("Internal IT: VPN certificate expiration alert",
     "Your corporate Cisco AnyConnect VPN certificate expires tonight at 11:59 PM. Renew your security credentials at http://corporate-vpn-renew.top/cert?user=corp before connection drops.", 1)
]

# Expand templates with variations
phishing_data = []
for subj, body, label in phishing_templates:
    phishing_data.append((subj, body, label))
    phishing_data.append((f"[URGENT] {subj}", f"High Priority Alert:\n\n{body}\n\nImmediate compliance is required by security policy.", label))
    phishing_data.append((f"ATTENTION: {subj}", f"Notice ID: #SEC-{abs(hash(subj)) % 100000}\n{body}\n\nPlease do not reply directly to this automated security dispatch.", label))
    phishing_data.append((f"Final Reminder: {subj}", f"Final notice before administrative suspension.\n{body}", label))
    phishing_data.append((f"Action Required: {subj}", f"Dear User,\n\nPlease review the following notice immediately:\n\n{body}\n\nThank you,\nAccount Services", label))

legitimate_templates = [
    # Corporate communications & Project Updates
    ("Weekly Engineering Standup Notes - Sprint 42",
     "Hi Team,\n\nHere is a recap of today's sprint standup. Front-end team completed the user profile redesign. Backend team finalized the database migration scripts and resolved issue #302. Next code freeze is scheduled for Thursday at 4:00 PM. Please make sure all pull requests are reviewed by tomorrow afternoon.\n\nBest,\nAlex Turner\nEngineering Lead", 0),
    ("GitHub: Pull request #142 approved and merged into main",
     "Hi Rohan,\n\nYour pull request #142 ('Optimize database queries for scan results') has been reviewed and approved by Sarah Chen. All 48 CI unit tests passed successfully. The changes have been merged into the main branch and will be deployed in the next scheduled release window.\n\nView pull request on GitHub: https://github.com/company/mail-sentinel/pull/142", 0),
    ("Quarterly Team All-Hands Meeting Agenda - Thursday 2 PM",
     "Hello Everyone,\n\nPlease find the agenda for our upcoming Q3 All-Hands meeting this Thursday at 2:00 PM in Conference Room B and on Google Meet.\n\nAgenda:\n1. Executive Summary & Company Milestones\n2. Product Roadmap Update\n3. Customer Success Highlights\n4. Open Q&A\n\nLooking forward to seeing everyone there.\n\nRegards,\nPeople Operations", 0),
    ("AWS Monthly Billing Invoice - Account #849201923",
     "Dear AWS Customer,\n\nYour Amazon Web Services billing statement for the period October 1 - October 31 is now available. Total amount charged: $148.32 to card ending in 8192. You can view your itemized billing statement and cost breakdown in the AWS Management Console at https://console.aws.amazon.com/billing/home. Thank you for choosing AWS.", 0),
    ("Your order has shipped: O'Reilly 'Designing Data-Intensive Applications'",
     "Hello,\n\nGreat news! Your recent book order has shipped via USPS Priority Mail. Tracking Number: 9400111899223192839102. Estimated delivery date is Tuesday, November 12th. You can track your package progress directly at https://www.usps.com.\n\nThank you for shopping with us.", 0),
    ("Lunch & Learn: Introduction to Rust for Python Developers",
     "Hey folks,\n\nJoin us this Friday at 12:30 PM in the 4th floor lounge for our monthly engineering Lunch & Learn session. David will give a practical walkthrough of writing high-performance Rust extensions for Python web services. Pizza and refreshments will be provided. RSVP on the calendar invite so we have an accurate headcount.", 0),
    ("Customer Support Ticket #8912 resolved: API Rate Limit Increase",
     "Hi Michael,\n\nWe have reviewed your request and successfully upgraded your production API quota to 10,000 requests per minute. You should see the updated threshold reflected in your developer portal dashboard immediately. Let us know if you need any further assistance.\n\nBest regards,\nStripe Developer Support Team", 0),
    ("Release Notes: Mail Sentinel v1.2.0 is now available",
     "We are excited to announce the release of Mail Sentinel v1.2.0!\n\nKey Highlights:\n- Enhanced passive URL domain analysis\n- Improved accuracy on display name typosquatting\n- Added export reports in JSON/CSV\n- Bug fixes in attachment MIME detection\n\nCheck out the full changelog in our documentation repository.", 0),
    ("Office Maintenance: Scheduled Elevator Servicing this Saturday",
     "Please be advised that scheduled maintenance will take place on the building passenger elevators this Saturday between 8:00 AM and 2:00 PM. Freight elevators will remain operational during this period. We apologize for any inconvenience.\n\nFacilities Management", 0),
    ("HR Notice: Open Enrollment for Health Benefits starts next week",
     "Dear Team Members,\n\nAnnual open enrollment for medical, dental, and vision insurance begins on Monday and runs through November 20th. Informational webinars will be held on Tuesday and Thursday. Please review the updated benefits guide attached on the internal BambooHR portal.\n\nHuman Resources Department", 0),
    ("Security Advisory: Scheduled Patching of Staging Kubernetes Clusters",
     "DevOps Notice:\n\nWe will be performing routine kernel upgrades and security patches on the staging Kubernetes cluster tonight between 11:00 PM and 1:00 AM UTC. No downtime is expected for production traffic. Staging API endpoints may experience intermittent restarts for up to 5 minutes.", 0),
    ("Your receipt from The Coffee Bean & Tea Leaf",
     "Thank you for your visit! Total: $6.75 paid with Apple Pay on 10/24 at 08:42 AM. Item: 1x Large Iced Vanilla Latte. We appreciate your business and hope to see you again soon!", 0),
    ("Flight Confirmation: SFO to JFK - Delta Air Lines #DL482",
     "Confirmation Code: H7X9K2. Passenger: Rohan JM. Flight: DL482 departing San Francisco (SFO) at 8:15 AM on Nov 18, arriving New York (JFK) at 4:45 PM. Seat 14A (Main Cabin). Add your boarding pass to Apple Wallet via the official Delta app.", 0),
    ("Gym Membership: Monthly check-in summary and class schedule",
     "Way to go! You completed 12 workouts at Equinox this month. Check out next week's updated HIIT, yoga, and spin class schedules on our member portal or mobile app. Remember to stay hydrated!", 0),
    ("Google Calendar: Invitation - Sprint Planning @ Mon Nov 4, 10am - 11am",
     "You have been invited to Sprint Planning by Priya Patel.\nWhen: Monday Nov 4, 2024 10:00 AM - 11:00 AM Eastern Time.\nWhere: Google Meet (meet.google.com/abc-defg-hij).\nGuests: Engineering Team, Product Manager.\nAccept / Tentative / Decline options available in your calendar.", 0),
    ("Conference Registration Confirmed: PyCon US 2025 in Pittsburgh",
     "Dear Attendee, Your registration for PyCon US 2025 has been confirmed. Confirmation number: PYCON-89214. The conference schedule and tutorial registration links will be sent out in January. We look forward to seeing you there!", 0),
    ("Code Review Requested: [Frontend] Accessible modal dialog component",
     "Hi team, I have created a pull request to implement an accessible keyboard-navigable modal dialog adhering to WAI-ARIA standards. Please review when you have time: https://github.com/company/mail-sentinel/pull/156. Tests are passing.", 0),
    ("Substack: Weekly Cybersecurity Architecture Digest #89",
     "In this week's issue: zero-trust network architectures, memory-safe languages in operating systems, and supply chain security in modern package registries. Read the full post on Substack: https://cyberarchitecture.substack.com/p/issue-89.", 0),
    ("Datadog Alert: Database connection pool utilization normalized",
     "Resolved: Database connection pool utilization on replica-02 has returned below 65% threshold (currently 42%). Event duration: 4 minutes. No query latency spikes detected on primary cluster.", 0),
    ("Zoom Meeting Summary with AI Notes: Product Strategy Review",
     "Hi Team, Here is the automated transcript and key action items from today's product strategy review. Key takeaways: 1. Launch beta by end of Q4. 2. Finalize SOC 2 audit checklist. Next meeting set for next Tuesday.", 0)
]

# Expand legitimate templates
legitimate_data = []
for subj, body, label in legitimate_templates:
    legitimate_data.append((subj, body, label))
    legitimate_data.append((f"Re: {subj}", f"Thanks for the update.\n\nOn Mon, wrote:\n{body}", label))
    legitimate_data.append((f"Fwd: {subj}", f"Sharing this with the wider group for visibility.\n\n---------- Forwarded message ---------\n{body}", label))
    legitimate_data.append((f"[Update] {subj}", f"Team,\n\n{body}\n\nHave a great remainder of the week.", label))
    legitimate_data.append((f"FYI: {subj}", f"Please see below for your information:\n\n{body}\n\nLet me know if any questions.", label))
    legitimate_data.append((f"[Internal] {subj}", f"All,\n\n{body}\n\nBest regards,\nInternal Operations Team", label))
    legitimate_data.append((f"Follow-up: {subj}", f"Following up on our discussion yesterday regarding this matter:\n\n{body}\n\nCheers,\nAlex", label))
    legitimate_data.append((f"Weekly Digest: {subj}", f"Here is your weekly summary:\n\n{body}", label))

# Trim to equal balanced counts
min_count = min(len(phishing_data), len(legitimate_data))
phishing_data = phishing_data[:min_count]
legitimate_data = legitimate_data[:min_count]

def write_csv(filename, data):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["subject", "body", "label"])
        for row in data:
            writer.writerow(row)
    print(f"Wrote {len(data)} rows to {filename}")

def generate_test_eml_files(base_dir):
    test_eml_dir = os.path.join(base_dir, "test_emails")
    os.makedirs(test_eml_dir, exist_ok=True)

    # 1. phishing_01.eml: PayPal credential harvesting with spoofed sender and suspicious link
    eml_phishing_01 = """From: "PayPal Support Services" <support@security-paypal-auth.xyz>
To: target.user@enterprise.com
Subject: URGENT: Your PayPal account has been temporarily restricted
Date: Sun, 06 Sep 2026 14:22:10 +0000
Message-ID: <9284102.20260906@security-paypal-auth.xyz>
Return-Path: <bounce@security-paypal-auth.xyz>
Received-SPF: fail (google.com: domain of security-paypal-auth.xyz does not designate permitted sender IP)
Authentication-Results: mx.google.com;
       spf=fail (google.com: domain of security-paypal-auth.xyz does not designate permitted sender IP) smtp.mailfrom=bounce@security-paypal-auth.xyz;
       dkim=fail header.i=@security-paypal-auth.xyz;
       dmarc=fail (p=REJECT sp=REJECT dis=NONE) header.from=paypal.com
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"

<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
  <h2>Account Security Alert</h2>
  <p>Dear Customer,</p>
  <p>We detected unauthorized sign-in attempts on your PayPal account from an unrecognized IP address (185.220.101.4). To prevent unauthorized withdrawals, access has been restricted.</p>
  <p>You must verify your credentials within 24 hours to restore full access. Failure to comply will result in permanent account suspension and asset freeze.</p>
  <p><a href="http://paypal-security-verification.xyz/login?session=894102">Click here to verify your PayPal Account immediately</a></p>
  <p>Thank you,<br>PayPal Security Department</p>
</body>
</html>
"""

    # 2. phishing_02.eml: Fake payroll invoice with double-extension executable attachment
    eml_phishing_02 = """From: "HR Payroll Department" <payroll@global-hr-portal.top>
Reply-To: bad-actor-collector@protonmail.com
To: accounting@enterprise.com
Subject: OVERDUE INVOICE #INV-2026-9182 - Final Legal Notice
Date: Sun, 06 Sep 2026 15:10:00 +0000
Message-ID: <payroll.91823@global-hr-portal.top>
Authentication-Results: mx.google.com;
       spf=softfail smtp.mailfrom=payroll@global-hr-portal.top;
       dkim=none;
       dmarc=none
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="====BOUNDARY_PHISH_02===="

--====BOUNDARY_PHISH_02====
Content-Type: text/plain; charset="UTF-8"

Please find attached overdue invoice #INV-2026-9182.
Total amount past due: $14,850.00.
Remittance must be wired by close of business today to halt impending legal arbitration.
Review the attached remittance authorization form immediately.

Corporate Accounts Payable
--====BOUNDARY_PHISH_02====
Content-Type: application/x-msdownload; name="invoice_remittance_sep2026.pdf.exe"
Content-Disposition: attachment; filename="invoice_remittance_sep2026.pdf.exe"
Content-Transfer-Encoding: base64

TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAyAAAAA4fug4AtAnNIbgBTM0hVGhpcyBwcm9ncmFtIGNhbm5vdCBiZSBydW4gaW4gRE9TIG1v
ZGUuDQ0KJAAAAAAAAAA=
--====BOUNDARY_PHISH_02====--
"""

    # 3. legitimate_01.eml: Genuine sprint status email
    eml_legit_01 = """From: "Alex Turner" <alex.turner@company.com>
To: dev-team@company.com
Subject: Weekly Engineering Standup Notes - Sprint 42
Date: Sun, 06 Sep 2026 10:00:00 +0000
Message-ID: <standup.42.20260906@company.com>
Return-Path: <alex.turner@company.com>
Received-SPF: pass (google.com: domain of alex.turner@company.com designates 198.51.100.12 as permitted sender)
Authentication-Results: mx.google.com;
       spf=pass smtp.mailfrom=alex.turner@company.com;
       dkim=pass header.i=@company.com header.s=202601;
       dmarc=pass (p=REJECT) header.from=company.com
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

Hi Team,

Here is a recap of today's sprint standup:
1. Front-end team completed the user profile redesign and responsive tables.
2. Backend team finalized the database migration scripts and resolved issue #302.
3. Next code freeze is scheduled for Thursday at 4:00 PM.

Please review pull request #142 by tomorrow afternoon:
https://github.com/company/mail-sentinel/pull/142

Best regards,
Alex Turner
Engineering Lead
"""

    # 4. legitimate_02.eml: Real GitHub PR notification
    eml_legit_02 = """From: "GitHub Notifications" <notifications@github.com>
To: rohan.jm@enterprise.com
Subject: [GitHub] Pull Request #142 approved and merged (company/mail-sentinel)
Date: Sun, 06 Sep 2026 11:30:15 +0000
Message-ID: <company/mail-sentinel/pull/142/merged@github.com>
Return-Path: <noreply@github.com>
Received-SPF: pass (google.com: domain of noreply@github.com designates 192.30.252.200 as permitted sender)
Authentication-Results: mx.google.com;
       spf=pass smtp.mailfrom=noreply@github.com;
       dkim=pass header.i=@github.com header.s=pf2014;
       dmarc=pass (p=REJECT) header.from=github.com
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"

<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #24292f;">
  <p>Hi Rohan,</p>
  <p>Your pull request <strong>#142</strong> (<a href="https://github.com/company/mail-sentinel/pull/142">Optimize database queries for scan results</a>) was reviewed, approved, and merged into <code>main</code> by Sarah Chen.</p>
  <p>All automated checks passed.</p>
  <p style="font-size: 12px; color: #57604a;">GitHub, Inc. &bull; 88 Colin P Kelly Jr St, San Francisco, CA 94107</p>
</body>
</html>
"""

    with open(os.path.join(test_eml_dir, "phishing_01.eml"), "w", encoding="utf-8") as f:
        f.write(eml_phishing_01.strip())
    with open(os.path.join(test_eml_dir, "phishing_02.eml"), "w", encoding="utf-8") as f:
        f.write(eml_phishing_02.strip())
    with open(os.path.join(test_eml_dir, "legitimate_01.eml"), "w", encoding="utf-8") as f:
        f.write(eml_legit_01.strip())
    with open(os.path.join(test_eml_dir, "legitimate_02.eml"), "w", encoding="utf-8") as f:
        f.write(eml_legit_02.strip())
    print("Generated 4 test .eml files in", test_eml_dir)

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    write_csv(os.path.join(base_dir, "phishing_samples.csv"), phishing_data)
    write_csv(os.path.join(base_dir, "legitimate_samples.csv"), legitimate_data)
    generate_test_eml_files(base_dir)

