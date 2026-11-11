import React, { useState } from 'react';
import { TonAccountData } from '../types/index.ts';
import {
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Send,
  Ban,
  ArrowRight,
  RefreshCw,
  Wallet,
  Copy,
  Check,
} from 'lucide-react';

export const TonTestnetView: React.FC = () => {
  // Address input
  const [addressInput, setAddressInput] = useState('kQCOfXzJb2h9l9Q3E0mD9wKqFj3y3U8fE0cBaZ8gT1bZ2rTest');
  const [accountData, setAccountData] = useState<TonAccountData | null>(null);
  const [errorDetails, setErrorDetails] = useState<any | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Transfer simulator states
  const [recipient, setRecipient] = useState('');
  const [amountTon, setAmountTon] = useState('0.5');
  const [transferEstimate, setTransferEstimate] = useState<any | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  // Jetton transfer attempt state
  const [jettonResult, setJettonResult] = useState<any | null>(null);
  const [isAttemptingJetton, setIsAttemptingJetton] = useState(false);

  const queryAccount = async (targetAddress?: string) => {
    const addr = targetAddress || addressInput;
    if (!addr.trim()) return;

    setIsQuerying(true);
    setAccountData(null);
    setErrorDetails(null);

    try {
      const res = await fetch(`/api/ton/account/${encodeURIComponent(addr.trim())}`);
      const data = await res.json();

      if (res.ok && data.success && data.network === 'testnet' && data.chain_id === -3) {
        setAccountData(data);
      } else {
        setErrorDetails(data);
      }
    } catch (err: any) {
      setErrorDetails({
        error: err.message || 'Network error querying account',
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleEstimateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setTransferEstimate(null);
    setIsEstimating(true);

    try {
      const res = await fetch('/api/ton/transfer/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toAddress: recipient, amountTon }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTransferEstimate(data);
      } else {
        setTransferError(data.error || 'Transfer estimation failed');
      }
    } catch (err: any) {
      setTransferError(err.message || 'Network error');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleAttemptJettonTransfer = async () => {
    setIsAttemptingJetton(true);
    setJettonResult(null);

    try {
      const res = await fetch('/api/ton/transfer/jetton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jettonMaster: 'kQB_jetton_master_test',
          toAddress: addressInput,
          amount: '100',
        }),
      });
      const data = await res.json();
      setJettonResult({ status: res.status, ...data });
    } catch (err: any) {
      setJettonResult({ error: err.message });
    } finally {
      setIsAttemptingJetton(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          BorderP45 TON Testnet & Security Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Server-side TonAPI isolation, CRC16 checksum verification, and strict test-only (0x80) address filtering.
        </p>
      </div>

      {/* Address Query & Validation Workbench */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              Server-Side Address & Balance Proxy
            </h2>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            Chain ID: -3 (Testnet)
          </span>
        </div>

        {/* Input & Search */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter TON Testnet Address (starts with kQ or 0Q)"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <button
            onClick={() => queryAccount()}
            disabled={isQuerying}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shrink-0 disabled:opacity-50"
          >
            <Search className={`h-3.5 w-3.5 ${isQuerying ? 'animate-spin' : ''}`} />
            <span>{isQuerying ? 'Validating...' : 'Inspect Address'}</span>
          </button>
        </div>

        {/* Presets & Samples */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Test Samples:</span>
          <button
            onClick={() => {
              const addr = 'kQCOfXzJb2h9l9Q3E0mD9wKqFj3y3U8fE0cBaZ8gT1bZ2rTest';
              setAddressInput(addr);
              queryAccount(addr);
            }}
            className="rounded bg-slate-800 px-2 py-1 text-[11px] text-cyan-300 hover:bg-slate-750 transition-colors"
          >
            Valid Testnet (kQ...)
          </button>
          <button
            onClick={() => {
              const addr = '0QCOfXzJb2h9l9Q3E0mD9wKqFj3y3U8fE0cBaZ8gT1bZ2rTest';
              setAddressInput(addr);
              queryAccount(addr);
            }}
            className="rounded bg-slate-800 px-2 py-1 text-[11px] text-cyan-300 hover:bg-slate-750 transition-colors"
          >
            Non-Bounceable Testnet (0Q...)
          </button>
          <button
            onClick={() => {
              const addr = 'EQCGScrZe1xwoWqZaJ6BjR84s4-n4k5_N822qK_s8z8nO345';
              setAddressInput(addr);
              queryAccount(addr);
            }}
            className="rounded bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-[11px] text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            Mainnet Trap (EQ...) - Rejection Test
          </button>
        </div>

        {/* Successful Validation & Account Details */}
        {accountData && (
          <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="font-semibold text-xs">
                  Valid TON Testnet Address (CRC16 + 0x80 Flag Verified)
                </span>
              </div>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                Network: {accountData.network} (ID: {accountData.chain_id})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400">Testnet Balance:</span>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {accountData.balance_ton} <span className="text-cyan-400 text-sm">TON</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    ({accountData.balance_nano.toLocaleString()} nanoTON)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Account Status:</span>
                  <div className="font-mono text-white capitalize mt-0.5">
                    {accountData.status} · {accountData.interfaces.join(', ')}
                  </div>
                </div>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between bg-slate-950/70 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Bounceable:</span>
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <span>{accountData.bounceable.slice(0, 16)}...</span>
                    <button
                      onClick={() => copyToClipboard(accountData.bounceable, 'b')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'b' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-slate-950/70 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Raw Format:</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span>{accountData.raw_address.slice(0, 18)}...</span>
                    <button
                      onClick={() => copyToClipboard(accountData.raw_address, 'raw')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'raw' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[11px] text-slate-300 flex items-center justify-between">
              <span>Security Validation: Tag Bit 0x80 Enforced</span>
              <span className="text-emerald-400 font-mono">TonAPI Credential Isolated</span>
            </div>
          </div>
        )}

        {/* Error / Rejection Details */}
        {errorDetails && (
          <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-5 animate-fade-in">
            <div className="flex items-center gap-2 text-rose-400 mb-2 font-semibold text-xs">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>Address Validation Rejected by BorderP45 Policy</span>
            </div>
            <p className="text-xs text-rose-200 leading-relaxed font-mono">
              {errorDetails.error || 'The supplied address does not satisfy TON Testnet invariants.'}
            </p>
            {errorDetails.validationDetails && (
              <div className="mt-3 rounded bg-slate-950 p-2.5 font-mono text-[11px] text-slate-400 border border-rose-500/20 space-y-1">
                <div>Detected Network: {errorDetails.validationDetails.network}</div>
                <div>Test-Only Flag (0x80): {errorDetails.validationDetails.testOnlyFlag ? 'PRESENT' : 'MISSING (MAINNET)'}</div>
                <div>CRC16 Check: {errorDetails.validationDetails.crcMatch ? 'VALID' : 'INVALID'}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Safety & Transfer Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Native Transfer Preparation */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Send className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Native TON Testnet Transfer</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Prepare and estimate testnet transfers. Finality is explicitly unconfirmed until verified on-chain.
          </p>

          <form onSubmit={handleEstimateTransfer} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Destination Address</label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="kQ... or 0Q... (Testnet only)"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Amount (TON)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amountTon}
                onChange={(e) => setAmountTon(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isEstimating}
              className="w-full rounded-lg bg-cyan-500 py-2 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {isEstimating ? 'Estimating...' : 'Estimate Transfer & Verify Invariants'}
            </button>
          </form>

          {transferEstimate && (
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 space-y-1.5 animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>UNCONFIRMED: PENDING ON-CHAIN VERIFICATION</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {transferEstimate.warning}
              </p>
              <div className="pt-1 text-[11px] font-mono text-slate-300 border-t border-amber-500/20 flex justify-between">
                <span>Estimated Fee: {transferEstimate.estimated_fee_ton} TON</span>
                <span>Chain: {transferEstimate.network}</span>
              </div>
            </div>
          )}

          {transferError && (
            <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {transferError}
            </div>
          )}
        </div>

        {/* Jetton Transfer Lock Panel */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Ban className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Jetton Transfers Lock Status</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Per BorderP45 PR #191 consolidation specifications, Jetton token transfers are intentionally locked with a <code className="text-rose-400">403 Forbidden</code> HTTP status code until smart-contract bytecode and contract tests are officially audited.
            </p>

            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-400 space-y-1">
              <div>Endpoint: POST /api/ton/transfer/jetton</div>
              <div>Status: 403 Forbidden</div>
              <div>Audit Requirement: FunC compiler & bytecode verification</div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleAttemptJettonTransfer}
              disabled={isAttemptingJetton}
              className="w-full rounded-lg border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              {isAttemptingJetton ? 'Testing Endpoint...' : 'Trigger Jetton Endpoint (Verify 403 Rejection)'}
            </button>

            {jettonResult && (
              <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-slate-300 animate-fade-in space-y-1">
                <div className="text-rose-400 font-bold">
                  HTTP {jettonResult.status || 403}: {jettonResult.error}
                </div>
                <div className="text-[11px] text-slate-400">{jettonResult.message}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
