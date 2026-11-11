import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { AuditLog } from '../types/index.ts';
import {
  Shield,
  RefreshCw,
  Clock,
  KeyRound,
  UserCheck,
  AlertTriangle,
  Lock,
  FileText,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/audit-logs', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'LOGIN_SUCCESS':
        return (
          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
            LOGIN_SUCCESS
          </span>
        );
      case 'LOGIN_FAILED':
        return (
          <span className="rounded bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-400">
            LOGIN_FAILED
          </span>
        );
      case 'ACCOUNT_LOCKED':
        return (
          <span className="rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[11px] font-bold text-rose-300">
            ACCOUNT_LOCKED (15m)
          </span>
        );
      case 'SIGNUP':
        return (
          <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
            SIGNUP
          </span>
        );
      case 'PASSWORD_CHANGE':
        return (
          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
            PASSWORD_CHANGE
          </span>
        );
      case 'LOGOUT':
        return (
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
            LOGOUT
          </span>
        );
      default:
        return (
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Security Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tamper-evident chronological record of authentication events, password updates, and privilege actions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-850 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Event Journal</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {logs.length} Logged Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Event Action</th>
                <th className="px-6 py-3">Target Email / User</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">IP Address</th>
                <th className="px-6 py-3">Client Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-sans">
                    No security audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-6 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap font-sans">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-3 text-white whitespace-nowrap">
                      {log.email}
                    </td>
                    <td className="px-6 py-3 text-slate-300 font-sans text-xs max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                    <td className="px-6 py-3 text-cyan-300 text-[11px] whitespace-nowrap">
                      {log.ip}
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-[10px] max-w-xs truncate">
                      {log.userAgent}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
