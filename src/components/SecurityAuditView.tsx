import React, { useState, useEffect } from 'react';
import { TestSuiteResponse } from '../types/index.ts';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  Repeat,
  AlertTriangle,
  FileCode2,
  Terminal,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const SecurityAuditView: React.FC = () => {
  const [testReport, setTestReport] = useState<TestSuiteResponse | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Webhook Replay Simulator state
  const [testNonce, setTestNonce] = useState(() => `nonce-${Date.now().toString(36)}`);
  const [webhookResult, setWebhookResult] = useState<any | null>(null);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  const runRegressionSuite = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/tests/run');
      if (res.ok) {
        const data = await res.json();
        setTestReport(data);
      }
    } catch (err) {
      console.error('Test run error:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  useEffect(() => {
    runRegressionSuite();
  }, []);

  const handleSendWebhook = async (useExistingNonce: boolean) => {
    setIsSendingWebhook(true);
    const nonceToSend = useExistingNonce ? testNonce : `nonce-${Date.now().toString(36)}`;
    if (!useExistingNonce) {
      setTestNonce(nonceToSend);
    }

    try {
      const res = await fetch('/api/webhook/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Nonce': nonceToSend,
          'X-Webhook-Timestamp': Date.now().toString(),
          'X-Webhook-Signature': 'sha256=9f82c40183e9b72a8d1038e92a8b',
        },
        body: JSON.stringify({
          event: 'wallet.transaction.broadcast',
          sender: 'kQCOfXzJb2h9l9Q3E0mD9wKqFj3y3U8fE0cBaZ8gT1bZ2rTest',
          amount: '1.0',
        }),
      });

      const data = await res.json();
      setWebhookResult({
        status: res.status,
        nonce: nonceToSend,
        ...data,
      });
    } catch (err: any) {
      setWebhookResult({ error: err.message });
    } finally {
      setIsSendingWebhook(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            BorderP45 PR #191 Security Regression Suite
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated verification of the 8 consolidation pillars, testnet invariants, and replay defenses.
          </p>
        </div>

        <button
          onClick={runRegressionSuite}
          disabled={isRunningTests}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shrink-0 disabled:opacity-50"
        >
          <Play className={`h-3.5 w-3.5 fill-current ${isRunningTests ? 'animate-spin' : ''}`} />
          <span>{isRunningTests ? 'Executing Tests...' : 'Run Regression Suite'}</span>
        </button>
      </div>

      {/* Test Suite Summary Banner */}
      {testReport && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              {testReport.allPassed ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <XCircle className="h-5 w-5" />
                </div>
              )}
              <div>
                <h2 className="text-base font-bold text-white">
                  {testReport.allPassed
                    ? 'All 8 Security Regression Suites Passed'
                    : 'Regression Suites Detected Failures'}
                </h2>
                <p className="text-xs text-slate-400">
                  Evaluated at {new Date(testReport.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-extrabold font-mono text-emerald-400">
                {testReport.passedCount} / {testReport.totalCount}
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Passed Invariants
              </p>
            </div>
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testReport.results.map((test) => (
              <div
                key={test.id}
                className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {test.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-white">{test.name}</span>
                  </div>
                  <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                    {test.category}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {test.description}
                </p>

                <div className="pt-2 border-t border-slate-850 space-y-1">
                  {test.assertions.map((a, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                      <span className="text-emerald-400">✓</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Webhook Replay Attack Simulator */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              Webhook Idempotency & Replay Attack Defense Simulator
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Active Nonce Cache: 15m Eviction
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Test duplicate webhook handling. Send a fresh webhook to process it idempotently, then trigger a simulated replay attack with the exact same nonce to verify that the server returns <code className="text-rose-400">409 Conflict</code>.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleSendWebhook(false)}
            disabled={isSendingWebhook}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            1. Send Fresh Webhook (New Nonce)
          </button>
          <button
            onClick={() => handleSendWebhook(true)}
            disabled={isSendingWebhook}
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
          >
            2. Replay Duplicate Webhook (Same Nonce)
          </button>
        </div>

        {webhookResult && (
          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <span
                className={`font-bold ${
                  webhookResult.status === 200
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                HTTP {webhookResult.status}: {webhookResult.status === 200 ? 'SUCCESS' : 'REPLAY BLOCKED'}
              </span>
              <span className="text-[11px] text-slate-500">
                Nonce: {webhookResult.nonce}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {webhookResult.message || webhookResult.error}
            </p>
          </div>
        )}
      </div>

      {/* PR #191 Architecture Notes & Consolidation Status */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-cyan-400" />
          <span>Consolidated Repository Checklist (PR #191)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
            <div className="text-white font-semibold">1. Server-Side Balance Proxy</div>
            <p className="text-slate-400 text-[11px]">
              Direct client Toncenter calls eliminated. Frontend exclusively consumes <code className="text-cyan-300">/api/ton/account/&lt;address&gt;</code> with zero API key leaks.
            </p>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
            <div className="text-white font-semibold">2. Bitmask 0x80 & CRC16 Enforcement</div>
            <p className="text-slate-400 text-[11px]">
              Friendly addresses strictly mandate bit 7 (0x80) test-only flag. Mainnet EQ.../UQ... rejected with 400.
            </p>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
            <div className="text-white font-semibold">3. Route Alignment</div>
            <p className="text-slate-400 text-[11px]">
              Mapped consistent <code className="text-cyan-300">/terms</code> and <code className="text-cyan-300">/privacy</code> assets and updated Procfile (<code className="text-cyan-300">--chdir BorderP45</code>).
            </p>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
            <div className="text-white font-semibold">4. Jetton Transfer Safety Lock</div>
            <p className="text-slate-400 text-[11px]">
              Jetton transfers intentionally disabled with 403 Forbidden until FunC bytecode audit is finalized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
