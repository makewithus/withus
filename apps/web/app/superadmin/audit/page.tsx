'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { superAdminApi } from '../../../lib/api/superadmin';
import { formatDate } from '../../../lib/formatters';
import { Shield, Loader2, Search, Calendar, Filter, RotateCcw, LogIn, AlertTriangle } from 'lucide-react';

// ─── Action filters for each view ────────────────────────────────────────────

// Login Activity: auth-related actions from AuditEvent
const LOGIN_ACTIONS = ['auth.login', 'auth.logout', 'auth.token_refresh', 'auth.login_failed',
  'auth.password_reset', 'auth.email_verified', 'auth.register'];

// Security Events: error / suspicious / access-control actions
const SECURITY_ACTIONS = ['auth.login_failed', 'session.revoke_failed', 'secret.reveal_denied',
  'approval.rejected', 'integration.error', 'auth.unauthorized', 'auth.forbidden',
  'vault.access_denied', 'session.expired', 'session.revoked'];

type AuditView = 'org' | 'platform' | 'login' | 'security';

export default function SuperAdminAuditPage() {
  const searchParams = useSearchParams();
  // Derive active view from URL ?tab= param; default to 'org'
  const tabParam = searchParams?.get('tab');
  const activeView: AuditView =
    tabParam === 'login' ? 'login' :
    tabParam === 'security' ? 'security' :
    tabParam === 'platform' ? 'platform' :
    'org';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadOrgAudit = (actionFilter?: string) => {
    setLoading(true);
    superAdminApi.getGlobalAudit({ page: 1, limit: 200, action: actionFilter || undefined })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  const loadPlatformAudit = () => {
    setLoading(true);
    superAdminApi.getPlatformAudit({ page: 1, limit: 200 })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  // Reload data when view changes
  useEffect(() => {
    setPage(1);
    setSearch('');
    if (activeView === 'platform') {
      loadPlatformAudit();
    } else {
      // For login/security tabs, we still call getGlobalAudit with a broad fetch
      // then filter client-side — this avoids multiple round trips and keeps
      // the existing API contract unchanged
      loadOrgAudit();
    }
  }, [activeView]);

  // Client-side multi-filter + tab-specific action filter
  const filteredEvents = useMemo(() => {
    if (!data?.data) return [];
    const query = search.toLowerCase().trim();

    return data.data.filter((e: any) => {
      // ── Tab-specific action filter ──────────────────────────────────────
      if (activeView === 'login') {
        // Show only auth-related actions (exact prefix match for robustness)
        const isLoginEvent = LOGIN_ACTIONS.some(a => e.action?.startsWith(a)) ||
          e.action?.startsWith('auth.');
        if (!isLoginEvent) return false;
      }
      if (activeView === 'security') {
        // Show error/access-denied/security events
        const isSecurityEvent = SECURITY_ACTIONS.some(a => e.action?.startsWith(a)) ||
          e.action?.includes('fail') ||
          e.action?.includes('error') ||
          e.action?.includes('denied') ||
          e.action?.includes('revoked') ||
          e.action?.includes('unauthorized');
        if (!isSecurityEvent) return false;
      }

      // ── Text search ─────────────────────────────────────────────────────
      if (query) {
        const matchesAction = e.action?.toLowerCase().includes(query);
        const matchesActor = e.actor?.email?.toLowerCase().includes(query);
        const matchesOrg = e.organization?.name?.toLowerCase().includes(query);
        const matchesResource = (e.resourceType || e.targetType)?.toLowerCase().includes(query);
        if (!matchesAction && !matchesActor && !matchesOrg && !matchesResource) return false;
      }

      // ── Date range ──────────────────────────────────────────────────────
      if (fromDate) {
        const eDate = new Date(e.createdAt).getTime();
        const fDate = new Date(fromDate).getTime();
        if (eDate < fDate) return false;
      }
      if (toDate) {
        const eDate = new Date(e.createdAt).getTime();
        const tDate = new Date(toDate).getTime() + 86400000;
        if (eDate > tDate) return false;
      }

      return true;
    });
  }, [data, search, fromDate, toDate, activeView]);

  const LIMIT = 10;
  const totalFilteredPages = Math.max(1, Math.ceil(filteredEvents.length / LIMIT));
  const paginatedEvents = filteredEvents.slice((page - 1) * LIMIT, page * LIMIT);

  const clearFilters = () => {
    setSearch('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const isFiltered = search || fromDate || toDate;

  // ── View metadata ──────────────────────────────────────────────────────────
  const viewMeta: Record<AuditView, { title: string; icon: React.ElementType; emptyMsg: string }> = {
    org: {
      title: 'Audit Logs',
      icon: Shield,
      emptyMsg: 'No matching audit events found for the selected filters.',
    },
    platform: {
      title: 'Super Admin Log',
      icon: Shield,
      emptyMsg: 'No Super Admin actions recorded.',
    },
    login: {
      title: 'Login Activity',
      icon: LogIn,
      emptyMsg: 'No login activity found for the selected filters.',
    },
    security: {
      title: 'Security Events',
      icon: AlertTriangle,
      emptyMsg: 'No security events found for the selected filters.',
    },
  };

  const meta = viewMeta[activeView];
  const MetaIcon = meta.icon;
  const isPlatformTab = activeView === 'platform';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-[#242424] text-[#999999]">
              <MetaIcon className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
                {meta.title}
              </h1>
            </div>
          </div>
        </div>

        <p className="shrink-0 text-sm text-[#666666]">
          {filteredEvents.length} events
        </p>
      </div>

      <section className="bg-[#181818] p-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              placeholder="Search action, actor, organisation, or resource..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full bg-[#111111] pl-10 pr-3 text-sm text-[#eeeeee] outline-none transition-colors placeholder:text-[#555555] focus:bg-[#161616]"
            />
          </div>

          {isFiltered ? (
            <button
              onClick={clearFilters}
              className="inline-flex h-10 items-center justify-center gap-2 bg-[#242424] px-4 text-sm font-medium text-[#cccccc] transition-colors hover:bg-[#2b2b2b]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          ) : (
            <div className="flex h-10 items-center gap-2 px-2 text-xs text-[#666666]">
              <Filter className="h-3.5 w-3.5" />
              Filters
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-col gap-3 bg-[#141414] p-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-[#bbbbbb]">
            <Calendar className="h-4 w-4 text-[#666666]" />
            Timestamp
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-[#666666]">
              From
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 bg-[#111111] px-2.5 text-sm text-[#cccccc] outline-none focus:bg-[#161616]"
              />
            </label>

            <label className="flex items-center gap-2 text-xs text-[#666666]">
              To
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 bg-[#111111] px-2.5 text-sm text-[#cccccc] outline-none focus:bg-[#161616]"
              />
            </label>
          </div>
        </div>

        {(activeView === 'login' || activeView === 'security') && (
          <div className="mt-2 flex items-start gap-2 bg-[#141414] p-3">
            <MetaIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#777777]" />
            <p className="text-xs leading-5 text-[#777777]">
              {activeView === 'login'
                ? 'Showing authentication-related events filtered from the full audit log.'
                : 'Showing access failures, revocations, and integration errors filtered from the full audit log.'}
            </p>
          </div>
        )}
      </section>

      <section className="overflow-hidden bg-[#181818]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="bg-[#1f1f1f]">
                {(isPlatformTab
                  ? ['Action', 'Admin Actor', 'Target Type', 'Target ID', 'Timestamp']
                  : ['Action', 'Actor Email', 'Organisation', 'Resource Type', 'Timestamp']
                ).map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-medium text-[#777777] ${
                      i === 4 ? 'text-right' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-[#777777]" />
                    <p className="text-sm text-[#777777]">Loading events...</p>
                  </td>
                </tr>
              ) : paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <MetaIcon className="mx-auto mb-3 h-6 w-6 text-[#666666]" />
                    <p className="text-sm text-[#777777]">{meta.emptyMsg}</p>
                  </td>
                </tr>
              ) : isPlatformTab ? (
                paginatedEvents.map((e: any) => (
                  <tr
                    key={e.id}
                    className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-[#eeeeee]">
                      {e.action}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-[#b0b0b0]">
                      {e.actor?.email ?? (
                        <span className="text-[#555555]">Super Admin</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-[#b0b0b0]">
                      {e.targetType ?? <span className="text-[#555555]">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-[#888888]">
                      {e.targetId ? e.targetId.slice(0, 16) + '...' : <span className="text-[#555555]">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-[#b0b0b0]">
                      {formatDate(e.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                paginatedEvents.map((e: any) => (
                  <tr
                    key={e.id}
                    className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-[#eeeeee]">
                      {e.action}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-[#b0b0b0]">
                      {e.actor?.email ?? <span className="text-[#555555]">System</span>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-[#b0b0b0]">
                      {e.organization?.name ?? <span className="text-[#555555]">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-[#999999]">
                      {e.resourceType ?? <span className="text-[#555555]">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-[#b0b0b0]">
                      {formatDate(e.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between bg-[#141414] px-5 py-3">
          <p className="text-sm text-[#666666]">
            Page <span className="text-[#eeeeee]">{page}</span> of{' '}
            <span className="text-[#eeeeee]">{totalFilteredPages}</span>
            <span className="mx-2 text-[#444444]">·</span>
            {filteredEvents.length} matching events
          </p>

          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="bg-[#242424] px-3 py-2 text-xs font-medium text-[#cccccc] transition-colors hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Previous
            </button>
            <button
              disabled={page >= totalFilteredPages}
              onClick={() => setPage((p) => Math.min(totalFilteredPages, p + 1))}
              className="bg-[#242424] px-3 py-2 text-xs font-medium text-[#cccccc] transition-colors hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
