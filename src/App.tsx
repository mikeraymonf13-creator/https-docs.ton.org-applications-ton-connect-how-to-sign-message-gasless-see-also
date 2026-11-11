import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ApkBuilderView } from './components/ApkBuilderView.tsx';
import { VulnerabilityScannerView } from './components/VulnerabilityScannerView.tsx';
import { TonTestnetView } from './components/TonTestnetView.tsx';
import { SecurityAuditView } from './components/SecurityAuditView.tsx';
import { AuditLogsView } from './components/AuditLogsView.tsx';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            onSelectTab={setCurrentTab}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
        {currentTab === 'apkbuilder' && (
          <ApkBuilderView onOpenAuth={() => setIsAuthModalOpen(true)} />
        )}
        {currentTab === 'scanner' && (
          <VulnerabilityScannerView />
        )}
        {currentTab === 'tontestnet' && (
          <TonTestnetView />
        )}
        {currentTab === 'security' && (
          <SecurityAuditView />
        )}
        {currentTab === 'logs' && (
          <AuditLogsView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">borderP45</span>
            <span>·</span>
            <span>ApkBuilder & TON Testnet Consolidation (PR #191)</span>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="/tonconnect-manifest.json"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              TonConnect Manifest
            </a>
            <a
              href="/terms"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/api/security/sbom"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>SBOM Export</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
