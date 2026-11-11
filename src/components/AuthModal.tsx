import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Lock, Mail, User, ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, signup, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'developer' | 'engineer' | 'auditor'>('developer');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Password strength calculation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 8) {
        setLocalError('Password must be at least 8 characters long.');
        return;
      }
      if (!hasUppercase || !hasLowercase || !hasNumber) {
        setLocalError('Password must include uppercase, lowercase, and numeric characters.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setLocalError(res.error || 'Login failed.');
        }
      } else {
        const res = await signup(email, password, name || email.split('@')[0], role);
        if (res.success) {
          onClose();
        } else {
          setLocalError(res.error || 'Registration failed.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@apkbuilder.internal');
    setPassword('ApkBuilder2026!Secure');
    setMode('login');
    setLocalError(null);
    clearError();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-6 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {mode === 'login' ? 'Sign In to borderP45' : 'Create borderP45 Account'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'login'
                ? 'Authenticate to manage APK builds & TON testnet security.'
                : 'Register for cryptographic signing and build pipeline access.'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {(localError || error) && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">{localError || error}</div>
          </div>
        )}

        {/* Mode Switch Tabs */}
        <div className="flex rounded-lg bg-slate-950 p-1 mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLocalError(null);
              clearError();
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'login'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setLocalError(null);
              clearError();
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'signup'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name or Alias
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              {mode === 'signup' && (
                <span className="text-[11px] text-slate-400">
                  Scrypt-salted storage
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Enter your password'}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Password strength indicators for signup */}
            {mode === 'signup' && (
              <div className="mt-2.5 space-y-2 rounded-lg bg-slate-950/70 p-2.5 border border-slate-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Password Strength</span>
                  <span
                    className={
                      strengthScore >= 4
                        ? 'text-emerald-400 font-medium'
                        : strengthScore >= 3
                        ? 'text-amber-400 font-medium'
                        : 'text-rose-400 font-medium'
                    }
                  >
                    {strengthScore >= 4 ? 'Strong' : strengthScore >= 3 ? 'Medium' : 'Weak'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 h-1.5 w-full">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-full rounded-sm transition-colors ${
                        strengthScore >= lvl
                          ? strengthScore >= 4
                            ? 'bg-emerald-500'
                            : strengthScore >= 3
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-400 pt-1">
                  <span className={hasMinLength ? 'text-emerald-400' : 'text-slate-500'}>
                    ✓ 8+ Characters
                  </span>
                  <span className={hasUppercase ? 'text-emerald-400' : 'text-slate-500'}>
                    ✓ Uppercase letter
                  </span>
                  <span className={hasLowercase ? 'text-emerald-400' : 'text-slate-500'}>
                    ✓ Lowercase letter
                  </span>
                  <span className={hasNumber ? 'text-emerald-400' : 'text-slate-500'}>
                    ✓ Number (0-9)
                  </span>
                </div>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Role & Permission Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['developer', 'engineer', 'auditor'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 px-2 text-xs rounded-lg border capitalize transition-colors text-center ${
                      role === r
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 font-medium'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:opacity-50 mt-2"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>
              {isSubmitting
                ? 'Processing...'
                : mode === 'login'
                ? 'Authenticate'
                : 'Create Account & Sign In'}
            </span>
          </button>
        </form>

        {/* Demo Fast Login Banner */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Need a quick test?</span>
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
          >
            Fill Demo Admin Account
          </button>
        </div>
      </div>
    </div>
  );
};
