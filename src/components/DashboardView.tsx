import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShieldCheck,
  Cpu,
  KeyRound,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Server,
  Layers,
  FileCode2,
  Terminal,
} from 'lucide-react';

interface DashboardViewProps {
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onOpenAuth,
}) => {
  const { user, isAuthenticated } = useAuth();

  const securityPillars = [
    {
      title: 'Scrypt-64 Password Hashing',
      desc: '32-byte CSPRNG salt with N=16384 memory cost and timing-safe equality comparison.',
      status: 'Active',
    },
    {
      title: 'TON Test-Only Flag (0x80)',
      desc: 'Enforces bit 7 check and CRC16-XMODEM. Strictly rejects mainnet addresses (EQ.../UQ...).',
      status: 'Enforced',
    },
    {
      title: 'TonAPI Credential Isolation',
      desc: 'Client never sees Toncenter or TonAPI keys. Balance proxied via /api/ton/account/<addr>.',
      status: 'Protected',
    },
    {
      title: 'Brute-Force Account Lockout',
      desc: 'Locks account for 15 minutes after 5 consecutive failed attempts with anti-timing defense.',
      status: 'Active',
    },
    {
      title: 'Intentionally Disabled Jettons',
      desc: 'Jetton transfer endpoints respond 403 Forbidden until FunC bytecode audit is finalized.',
      status: 'Locked',
    },
    {
      title: 'Webhook Replay Prevention',
      desc: 'Nonce cache, 5-minute timestamp expiration window, and cryptographic HMAC protection.',
      status: 'Shielded',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>PR #191 Consolidation & Security Baseline</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            borderP45 Security & Authentication Engine
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            A production-grade architecture uniting salted scrypt user authentication, Android APK build automation, and hardened TON Testnet wallet validation with zero client-side credential exposure.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => onSelectTab('apkbuilder')}
                  className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
                >
                  <Cpu className="h-4 w-4" />
                  <span>Open ApkBuilder Console</span>
                </button>
                <button
                  onClick={() => onSelectTab('security')}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span>Run 8-Point Security Audit</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
                >
                  <Lock className="h-4 w-4" />
                  <span>Sign In or Register</span>
                </button>
                <button
                  onClick={() => onSelectTab('tontestnet')}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <span>Explore TON Testnet Tooling</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Auth Status & User Card */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Authentication State
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isAuthenticated ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-xs font-medium text-slate-300">
                {isAuthenticated ? 'Authenticated' : 'Guest Mode'}
              </span>
            </div>
          </div>
          {isAuthenticated && user ? (
            <div className="space-y-2">
              <p className="text-sm font-bold text-white truncate">{user.name || user.email}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-cyan-300">
                  {user.role.toUpperCase()}
                </span>
                <span>·</span>
                <span className="truncate">{user.email}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Last authenticated: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleTimeString() : 'Current session'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-400 mb-3">
                Sign in with an email & password to trigger Android APK builds, configure keystores, and save linked testnet wallets.
              </p>
              <button
                onClick={onOpenAuth}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1"
              >
                Sign in to your account →
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              PR #191 Architecture
            </span>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
              Consolidated
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Layout</span>
              <span className="font-mono text-cyan-300">BorderP45/app.py</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Chain ID</span>
              <span className="font-mono text-cyan-300">-3 (TON Testnet)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Procfile Target</span>
              <span className="font-mono text-cyan-300">--chdir BorderP45</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Routes Aligned</span>
              <span className="font-mono text-emerald-400">/terms, /privacy</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              TonConnect Protocol
            </span>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] font-medium text-cyan-400 border border-cyan-500/20">
              v2.0 Testnet
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Manifest URL</span>
              <a
                href="/tonconnect-manifest.json"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-cyan-400 hover:underline"
              >
                /tonconnect-manifest.json
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Address Filter</span>
              <span className="font-mono text-cyan-300">0x80 test-only</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Jetton Transfers</span>
              <span className="text-amber-400 font-medium">Locked (Audit Pending)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Native Finality</span>
              <span className="text-slate-400">Requires on-chain proof</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Consolidated Security Controls</h2>
            <p className="text-xs text-slate-400">
              Core defenses implemented across authentication, blockchain protocol, and API routing.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('security')}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            Run full audit suite →
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {securityPillars.map((p, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">{p.title}</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-400">
                  {p.status}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Quick Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          onClick={() => onSelectTab('apkbuilder')}
          className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-left transition-all hover:border-cyan-500/50 hover:bg-slate-900"
        >
          <div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
              ApkBuilder Console
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Compile, package, and sign Android APK / AAB bundles with BorderP45 TonConnect v2 testnet integration.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <span>Manage Builds</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onSelectTab('tontestnet')}
          className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-left transition-all hover:border-cyan-500/50 hover:bg-slate-900"
        >
          <div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
              TON Testnet Validator
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Verify testnet friendly addresses, inspect 0x80 bitmask & CRC16 checksums, and test mainnet rejection.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <span>Inspect Addresses</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onSelectTab('security')}
          className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-5 text-left transition-all hover:border-cyan-500/50 hover:bg-slate-900"
        >
          <div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
              Security Regression Suite
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Execute live regression tests verifying authentication, webhook deduplication, and asset alignments.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <span>Run Test Suite</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};
