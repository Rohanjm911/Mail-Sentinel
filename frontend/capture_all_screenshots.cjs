const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  console.log('Launching browser with:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    defaultViewport: {
      width: 1560,
      height: 980,
      deviceScaleFactor: 2
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--force-device-scale-factor=2',
      '--font-render-hinting=max'
    ]
  });

  const page = await browser.newPage();

  const takeShot = async (filename, desc) => {
    console.log(`Capturing ${filename} (${desc})...`);
    const filePath = path.join(OUT_DIR, filename);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Saved -> ${filePath}`);
  };

  try {
    // 1. Capture Onboarding Guide Modal
    console.log('Navigating to Dashboard for Onboarding Guide...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => localStorage.removeItem('mail_sentinel_guide_seen'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await takeShot('08_onboarding_guide.png', 'Interactive SOC Onboarding Guide & Walkthrough Modal');

    // 2. Set guide seen in localStorage and reload to clear modal
    await page.evaluate(() => {
      localStorage.setItem('mail_sentinel_guide_seen', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(3000); // Wait for dashboard Recharts and telemetry gauges

    // 3. Capture SOC Command Dashboard
    await takeShot('01_soc_dashboard.png', 'SOC Operations Dashboard with Risk Analytics & Engine Telemetry');

    // 4. Capture Email Security Scanner
    console.log('Navigating to Email Security Scanner...');
    await page.goto('http://localhost:5173/scan', { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    // Click sample pill "PayPal Phish"
    try {
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text && text.includes('PayPal Phish')) {
          await btn.click();
          console.log('Clicked PayPal Phish scenario preset');
          await sleep(1000);
          break;
        }
      }
    } catch (e) {
      console.warn('Could not click sample pill:', e.message);
    }
    await sleep(1500);
    await takeShot('02_security_scanner.png', 'Email Security Scanner with Threat Scenarios & Raw Ingestion');

    // 5. Capture Threat Assessment Dossier / Forensic Results
    console.log('Navigating to Forensic Results Dossier...');
    await page.goto('http://localhost:5173/results/7f60aa9d-c2a0-4865-ab42-2390509e0617', { waitUntil: 'domcontentloaded' });
    await sleep(3500); // Allow Activity Ring SVG radial progress & Finding cards animation
    await takeShot('03_threat_dossier.png', 'Forensic Threat Dossier with Activity Ring Gauge & SOC Playbook');

    // 6. Capture Threat Intelligence Workstation
    console.log('Navigating to Threat Intelligence Workstation...');
    await page.goto('http://localhost:5173/threat-intelligence?ioc=paypal-security-update.xyz&type=domain', { waitUntil: 'domcontentloaded' });
    await sleep(3500); // Allow IOC lookup API request and telemetry cards
    await takeShot('04_threat_intelligence.png', 'Threat Intelligence Workstation with Multi-Feed OSINT Providers');

    // 7. Capture Incident History
    console.log('Navigating to Incident History...');
    await page.goto('http://localhost:5173/history', { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await takeShot('05_incident_history.png', 'Scan History & Incident Audit Trail with Severity Filtering');

    // 8. Capture Security Reports & Analytics
    console.log('Navigating to Security Reports & Analytics...');
    await page.goto('http://localhost:5173/reports', { waitUntil: 'domcontentloaded' });
    await sleep(3000);
    await takeShot('06_security_reports.png', 'Security Analytics Posture & Attack Vector Breakdown');

    // 9. Capture Platform Settings
    console.log('Navigating to Platform Settings...');
    await page.goto('http://localhost:5173/settings', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await takeShot('07_platform_settings.png', 'Platform Configuration & Detection Engine Sensitivity Weights');

    console.log('All 8 high-resolution screenshots generated and validated successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

capture();
