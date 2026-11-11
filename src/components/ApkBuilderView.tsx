import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ApkBuild } from '../types/index.ts';
import {
  Cpu,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Terminal,
  Shield,
  FileCheck,
  RefreshCw,
  Lock,
} from 'lucide-react';

interface ApkBuilderViewProps {
  onOpenAuth: () => void;
}

export const ApkBuilderView: React.FC<ApkBuilderViewProps> = ({ onOpenAuth }) => {
  const { user, token, isAuthenticated } = useAuth();

  const [builds, setBuilds] = useState<ApkBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);

  // Form fields for new build
  const [variant, setVariant] = useState('Release (Testnet)');
  const [versionName, setVersionName] = useState('1.2.4-testnet');
  const [versionCode, setVersionCode] = useState(191);
  const [packageName, setPackageName] = useState('org.borderp45.wallet');

  // Simulated build console
  const [buildProgressStep, setBuildProgressStep] = useState<number>(0);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [isBuildingActive, setIsBuildingActive] = useState(false);

  const fetchBuilds = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/builds');
      if (res.ok) {
        const data = await res.json();
        setBuilds(data.builds || []);
      }
    } catch (err) {
      console.error('Error fetching builds:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, []);

  const handleStartBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !token) {
      onOpenAuth();
      return;
    }

    setIsTriggering(true);
    setShowTriggerModal(false);
    setIsBuildingActive(true);
    setBuildProgressStep(1);
    setBuildLogs(['[INFO] Initializing Gradle build daemon...']);

    // Step-by-step build simulation
    const steps = [
      { step: 1, log: `[BUILD] Target package: ${packageName} (v${versionName}, code ${versionCode})` },
      { step: 2, log: '[CHECK] Verifying TonConnect manifest at /tonconnect-manifest.json... PASS' },
      { step: 3, log: '[SECURITY] Validating TON Testnet friendly address format (0x80 test-only bit & CRC16)... OK' },
      { step: 4, log: '[COMPILE] Compiling Kotlin Android wallet modules & Jetpack Compose UI...' },
      { step: 5, log: '[AUDIT] Checking disabled transfer APIs: Jetton transfers blocked with 403... ENFORCED' },
      { step: 6, log: '[SIGN] Signing APK via APK Signature Scheme v2/v3 with BorderP45-Testnet-Keystore-v2...' },
      { step: 7, log: '[SUCCESS] Artifact generated: app-release-testnet-signed.apk' },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setBuildProgressStep(steps[i].step);
      setBuildLogs((prev) => [...prev, steps[i].log]);
    }

    try {
      const res = await fetch('/api/builds/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ variant, versionName, versionCode, packageName }),
      });

      if (res.ok) {
        const data = await res.json();
        setBuilds((prev) => [data.build, ...prev]);
      }
    } catch (err) {
      console.error('Trigger build error:', err);
    } finally {
      setIsTriggering(false);
      setTimeout(() => {
        setIsBuildingActive(false);
      }, 2500);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            ApkBuilder & Keystore Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Package and sign Android applications configured with BorderP45 TON testnet security invariants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBuilds}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-850 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>
          {isAuthenticated ? (
            <button
              onClick={() => setShowTriggerModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Trigger Build</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-slate-750 transition-colors"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Sign In to Build</span>
            </button>
          )}
        </div>
      </div>

      {/* Active build progress banner if running */}
      {isBuildingActive && (
        <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold text-white">
                Compiling APK: {versionName} (Build #{versionCode})
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-400">Step {buildProgressStep}/7</span>
          </div>

          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-cyan-400 transition-all duration-300 ease-out"
              style={{ width: `${(buildProgressStep / 7) * 100}%` }}
            />
          </div>

          <div className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-300 border border-slate-800 max-h-36 overflow-y-auto space-y-1">
            {buildLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-500 select-none">&gt;</span>
                <span className={log.includes('SUCCESS') ? 'text-emerald-400 font-semibold' : ''}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Builds Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
        <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Compiled Build Artifacts</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total Builds: {builds.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-3">Version & Code</th>
                <th className="px-6 py-3">Variant</th>
                <th className="px-6 py-3">Package Identifier</th>
                <th className="px-6 py-3">SHA-256 Fingerprint</th>
                <th className="px-6 py-3">Signing Keystore</th>
                <th className="px-6 py-3">Size</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {builds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No builds found. Trigger a new build to start packaging.
                  </td>
                </tr>
              ) : (
                builds.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <div>
                          <span>{b.version}</span>
                          <span className="ml-1.5 rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-cyan-300 font-mono">
                            #{b.versionCode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-medium text-slate-300">
                        {b.variant}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-cyan-300 whitespace-nowrap">
                      {b.packageName}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {b.sha256.slice(0, 12)}...{b.sha256.slice(-8)}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-slate-300">
                      {b.signedWith}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                      {(b.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          alert(`Mock downloading ${b.packageName}-${b.version}.apk\nSHA-256: ${b.sha256}`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-cyan-400 hover:bg-slate-750 hover:text-cyan-300 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>APK</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trigger Modal */}
      {showTriggerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Trigger Android Build</h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure parameters for the BorderP45 ApkBuilder pipeline.
            </p>

            <form onSubmit={handleStartBuild} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Build Variant</label>
                <select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Release (Testnet)">Release (Testnet Signed)</option>
                  <option value="Debug">Debug (Unsigned Developer Build)</option>
                  <option value="Staging">Staging (Integration Test)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Version Name</label>
                <input
                  type="text"
                  required
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Version Code</label>
                  <input
                    type="number"
                    required
                    value={versionCode}
                    onChange={(e) => setVersionCode(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Keystore Profile</label>
                  <input
                    type="text"
                    disabled
                    value="BorderP45-Keystore-v2"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Android Package Name</label>
                <input
                  type="text"
                  required
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTriggerModal(false)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTriggering}
                  className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  {isTriggering ? 'Starting...' : 'Execute Build'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
