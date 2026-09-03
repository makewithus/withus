'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRevealSecret } from '../../hooks/useRevealSecret';
import { useRevealSessionSecret } from '../../hooks/useSessions';
import { Eye, EyeOff, AlertTriangle, Loader2, Copy, Check } from 'lucide-react';

interface RevealFlowProps {
  orgId: string;
  vaultId: string;
  secretId: string;
  sessionId?: string;
}

export function RevealFlow({ orgId, vaultId, secretId, sessionId }: RevealFlowProps) {
  const [reason, setReason] = useState('');
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showPassVal, setShowPassVal] = useState(true);

  // We can't conditionally call hooks, so we call both but only use one's mutate
  const nativeReveal = useRevealSecret();
  const sessionReveal = useRevealSessionSecret(orgId);
  const isPending = sessionId ? sessionReveal.isPending : nativeReveal.isPending;
  const error = sessionId ? sessionReveal.error : nativeReveal.error;
  const reset = sessionId ? sessionReveal.reset : nativeReveal.reset;

  const handleClear = useCallback(() => {
    setPlaintext(null);
    setReason('');
    setShowForm(false);
    setCopiedUser(false);
    setCopiedPass(false);
    setCopiedAll(false);
    setShowPassVal(true);
    reset();
  }, [reset]);

  // Clear plaintext on unmount or after 60 seconds
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (plaintext) {
      timeout = setTimeout(() => {
        handleClear();
      }, 60000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [plaintext, handleClear]);

  const handleReveal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    if (sessionId) {
      sessionReveal.mutate(
        { sessionId, reason },
        {
          onSuccess: (plaintextFromData) => {
            setPlaintext(plaintextFromData);
            setShowForm(false);
            setReason('');
          },
        }
      );
    } else {
      nativeReveal.mutate(
        { orgId, vaultId, secretId, reason },
        {
          onSuccess: (data) => {
            setPlaintext(data.plaintext);
            setShowForm(false);
            setReason('');
          },
        }
      );
    }
  };

  const handleCopyUser = async (val: string) => {
    if (val) {
      await navigator.clipboard.writeText(val);
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    }
  };

  const handleCopyPass = async (val: string) => {
    if (val) {
      await navigator.clipboard.writeText(val);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handleCopyAll = async (val: string) => {
    if (val) {
      await navigator.clipboard.writeText(val);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  if (plaintext) {
    const isCredential = plaintext.includes('\n');
    const parts = isCredential ? plaintext.split('\n') : [];
    const usernamePart = parts[0] || '';
    const passwordPart = parts.slice(1).join('\n');

    return (
      <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-250/20 dark:border-amber-900/20 rounded-xl p-5 relative transition-all">
        <div className="flex items-center text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-4">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Secret Revealed
        </div>
        
        {isCredential ? (
          <div className="space-y-3.5">
            {/* Username Row */}
            {usernamePart.trim() && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Username
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-900 dark:bg-slate-950 border border-slate-800 dark:border-slate-900 text-slate-100 rounded-lg px-3.5 py-2.5 font-mono text-xs overflow-x-auto selection:bg-slate-800">
                    {usernamePart}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyUser(usernamePart)}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-xs transition-colors shadow-sm flex-shrink-0"
                    title="Copy Username"
                  >
                    {copiedUser ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUser ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Password Row */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Password
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-900 dark:bg-slate-950 border border-slate-800 dark:border-slate-900 text-slate-100 rounded-lg px-3.5 py-2.5 font-mono text-xs overflow-x-auto selection:bg-slate-800 flex items-center justify-between">
                  <span>{showPassVal ? passwordPart : '••••••••••••'}</span>
                  <button
                    type="button"
                    onClick={() => setShowPassVal(!showPassVal)}
                    className="text-slate-400 hover:text-slate-200 ml-2 focus:outline-none"
                    title={showPassVal ? "Mask password" : "Show password"}
                  >
                    {showPassVal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPass(passwordPart)}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-xs transition-colors shadow-sm flex-shrink-0"
                  title="Copy Password"
                >
                  {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Non-credential / Single value */
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Secret Value
              </label>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 dark:bg-slate-950 border border-slate-800 dark:border-slate-900 text-slate-100 rounded-lg px-3.5 py-2.5 font-mono text-xs break-all selection:bg-slate-800">
                {plaintext}
              </div>
              <button
                type="button"
                onClick={() => handleCopyAll(plaintext)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-xs transition-colors shadow-sm flex-shrink-0"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions & Timer */}
        <div className="mt-4 pt-3.5 border-t border-amber-200/40 dark:border-amber-900/30 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="flex items-center px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg font-semibold text-xs transition-colors shadow-sm"
          >
            <EyeOff className="w-3.5 h-3.5 mr-1.5" />
            Hide Secret
          </button>

          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
            Auto-hides in 60 seconds
          </span>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <form onSubmit={handleReveal} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">Provide Audit Reason</h3>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 flex items-start gap-2.5">
            <span className="text-red-500 mt-0.5">⚠</span>
            <p className="text-xs font-medium text-red-700 dark:text-red-400">{error.message}</p>
          </div>
        )}

        <div className="mb-4 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400">
            Why do you need to view this secret?
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:ring-slate-100/10 dark:focus:border-slate-100 outline-none transition-all text-slate-950 dark:text-slate-50 text-xs"
            placeholder="e.g. Debugging production database issue ticket #1234"
          />
        </div>
        
        <div className="flex space-x-2.5">
          <button
            type="submit"
            disabled={isPending || !reason.trim()}
            className="flex items-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Eye className="w-3.5 h-3.5 mr-1.5" />
            )}
            Reveal
          </button>
          
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              reset();
            }}
            disabled={isPending}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-xs transition-colors shadow-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-755 dark:text-slate-300 rounded-lg font-semibold text-xs transition-all duration-150 shadow-sm"
    >
      <Eye className="w-3.5 h-3.5 mr-1.5" />
      Reveal Secret Value
    </button>
  );
}
