import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { HowToUseModal } from './components/HowToUseModal';
import { Dashboard } from './pages/Dashboard';
import { Scanner } from './pages/Scanner';
import { Results } from './pages/Results';
import { History } from './pages/History';
import { ThreatIntelligence } from './pages/ThreatIntelligence';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { About } from './pages/About';
import { ScanService } from './services/api';

const MainLayout: React.FC = () => {
  const [engineOnline, setEngineOnline] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show 'How to Use' guide automatically on first platform visit
    const hasSeenGuide = localStorage.getItem('mail_sentinel_guide_seen');
    if (!hasSeenGuide) {
      setIsGuideOpen(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const health = await ScanService.getHealth();
        if (isMounted) {
          setEngineOnline(health.status === 'healthy' || health.status === 'ok');
        }
      } catch {
        if (isMounted) {
          setEngineOnline(false);
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
    if (pathname === '/') {
      return {
        title: 'Security Operations Dashboard',
        subtitle: 'Monitor and analyze suspicious email activity, detection metrics, and threat telemetry.',
      };
    }
    if (pathname === '/scan') {
      return {
        title: 'Email Security Scanner',
        subtitle: 'Analyze an email for phishing indicators, suspicious URLs, authentication anomalies, and social engineering.',
      };
    }
    if (pathname.startsWith('/results')) {
      return {
        title: 'Threat Assessment Dossier',
        subtitle: 'Granular explainability, multi-pillar telemetry findings, and SOC remediation actions.',
      };
    }
    if (pathname === '/history') {
      return {
        title: 'Scan History & Incident Log',
        subtitle: 'Historical email telemetry and audit records stored securely in local persistence.',
      };
    }
    if (pathname === '/threat-intelligence') {
      return {
        title: 'Threat Intelligence Feeds',
        subtitle: 'External OSINT feed integrations and multi-engine reputational lookups.',
      };
    }
    if (pathname === '/reports') {
      return {
        title: 'Security Reports & Analytics',
        subtitle: 'Executive threat landscape summaries, exportable telemetry dossiers, and compliance metrics.',
      };
    }
    if (pathname === '/settings') {
      return {
        title: 'Platform Configuration',
        subtitle: 'Deterministic risk thresholds, local ML specifications, and operational parameters.',
      };
    }
    if (pathname === '/about') {
      return {
        title: 'About Mail Sentinel',
        subtitle: 'Detect the Threat. Protect the Inbox. Architecture, mission, and detection pillars.',
      };
    }
    return {
      title: 'Mail Sentinel',
      subtitle: 'Intelligent Email Phishing Detection & Threat Analysis Platform',
    };
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen w-screen bg-black text-white antialiased font-sans selection:bg-[#0071e3] selection:text-white relative overflow-hidden">
      {/* Apple Ambient Dynamic Glow Backing */}
      <div className="apple-ambient-bg" aria-hidden="true">
        <div className="apple-ambient-orb-1" />
        <div className="apple-ambient-orb-2" />
      </div>

      {/* Persistent SOC Left Sidebar (macOS style frosted panel, strictly locked) */}
      <Sidebar
        engineOnline={engineOnline}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area (locked height, only <main> scrolls) */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative z-10">
        {/* Top Navbar */}
        <Navbar
          title={title}
          subtitle={subtitle}
          onOpenGuide={() => setIsGuideOpen(true)}
        />

        {/* Scrollable Page Body (clean, no duplicate padding, only this element scrolls) */}
        <main className="flex-1 min-w-0 w-full overflow-y-auto overscroll-contain">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scan" element={<Scanner />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/threat-intelligence" element={<ThreatIntelligence />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>

      {/* Interactive Platform Guide & Onboarding Tour Modal */}
      <HowToUseModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
};

export default App;
