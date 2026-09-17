'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { superAdminApi } from '../../../lib/api/superadmin';
import { formatDate } from '../../../lib/formatters';
import { CheckCircle, XCircle, Clock, Loader2, AlertTriangle, Search, Calendar, Filter, RotateCcw } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active Sessions Only' },
  { value: 'PENDING_GRANT', label: 'Pending Grant Only' },
  { value: 'REVOKED', label: 'Revoked Sessions Only' },
  { value: 'EXPIRED', label: 'Expired Sessions Only' },
  { value: 'REVOKE_FAILED', label: 'Revoke Failed Only' },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" /> Active
        </span>
      );
    case 'PENDING_GRANT':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" /> Pending
        </span>
      );
    case 'REVOKED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <XCircle className="w-3 h-3 mr-1 text-rose-600 dark:text-rose-400" /> Revoked
        </span>
      );
    case 'REVOKE_FAILED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
          <AlertTriangle className="w-3 h-3 mr-1 text-orange-600 dark:text-orange-400" /> Failed
        </span>
      );
    case 'EXPIRED':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-zinc-700">
          <Clock className="w-3 h-3 mr-1 text-slate-500" /> Expired
        </span>
      );
  }
}

export default function SuperAdminSessionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    superAdminApi.getSessions({
      page: 1,
      limit: 100,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
    })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filteredSessions = useMemo(() => {
    if (!data?.data) return [];

    const query = search.toLowerCase().trim();

    return data.data.filter((s: any) => {
      if (query) {
        const matchesOrg = s.organization?.name?.toLowerCase().includes(query);
        const matchesGrantor = s.grantor?.email?.toLowerCase().includes(query);
        const matchesGrantee = s.grantee?.email?.toLowerCase().includes(query);
        const matchesPlatform = s.integrationProvider?.toLowerCase().includes(query);
        const matchesScope = s.scope?.toLowerCase().includes(query);

        if (!matchesOrg && !matchesGrantor && !matchesGrantee && !matchesPlatform && !matchesScope) {
          return false;
        }
      }

      if (fromDate) {
        const sDate = new Date(s.createdAt).getTime();
        const fDate = new Date(fromDate).getTime();
        if (sDate < fDate) return false;
      }

      if (toDate) {
        const sDate = new Date(s.createdAt).getTime();
        const tDate = new Date(toDate).getTime() + 86400000;
        if (sDate > tDate) return false;
      }

      return true;
    });
  }, [data, search, fromDate, toDate]);

  const LIMIT = 10;
  const totalFilteredPages = Math.max(1, Math.ceil(filteredSessions.length / LIMIT));
  const paginatedSessions = filteredSessions.slice((page - 1) * LIMIT, page * LIMIT);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const isFiltered = search || statusFilter !== 'ALL' || fromDate || toDate;

  const statusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'PENDING_GRANT':
        return 'Pending';
      case 'REVOKED':
        return 'Revoked';
      case 'REVOKE_FAILED':
        return 'Failed';
      case 'EXPIRED':
      default:
        return 'Expired';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
            Delegated Sessions
          </h1>
          <p className="mt-1 text-sm text-[#777777]">
            All delegated access sessions created across the platform.
          </p>
        </div>

        <p className="shrink-0 text-sm text-[#666666]">
          <span className="font-medium text-[#dddddd]">{filteredSessions.length}</span>
          {' '}of{' '}
          <span className="font-medium text-[#dddddd]">{data?.total ?? 0}</span>
          {' '}sessions
        </p>
      </div>

      <div className="bg-[#181818] p-4">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              placeholder="Search organization, grantor, grantee, platform, or scope"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full bg-[#111111] pl-9 pr-3 text-sm text-[#eeeeee] outline-none placeholder:text-[#555555] focus:bg-[#151515]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 bg-[#111111] px-3 text-sm text-[#cccccc] outline-none focus:bg-[#151515]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {isFiltered ? (
            <button
              onClick={clearFilters}
              className="inline-flex h-10 items-center justify-center gap-2 bg-[#242424] px-3.5 text-sm font-medium text-[#cccccc] transition-colors hover:bg-[#2b2b2b] hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs font-medium text-[#777777]">
            <Calendar className="h-3.5 w-3.5" />
            <span>Created</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="h-9 bg-[#111111] px-2.5 text-xs text-[#cccccc] outline-none focus:bg-[#151515]"
            />
            <span className="text-xs text-[#555555]">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="h-9 bg-[#111111] px-2.5 text-xs text-[#cccccc] outline-none focus:bg-[#151515]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-[#181818]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#202020]">
              <tr>
                {[
                  'Organization',
                  'Grantor',
                  'Grantee',
                  'Platform',
                  'Scope',
                  'Status',
                  'Expires',
                  'Created',
                ].map((heading, index) => (
                  <th
                    key={heading}
                    scope="col"
                    className={`whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-[#999999] ${
                      index === 7 ? 'text-right' : ''
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#888888]" />
                    <p className="mt-3 text-sm text-[#666666]">
                      Loading delegated sessions...
                    </p>
                  </td>
                </tr>
              ) : paginatedSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <p className="text-sm font-medium text-[#aaaaaa]">
                      No matching delegated sessions
                    </p>
                    <p className="mt-1 text-xs text-[#5f5f5f]">
                      Try changing or clearing the filters.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedSessions.map((s: any) => (
                  <tr
                    key={s.id}
                    className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {s.organization?.name ? (
                        <span className="font-medium text-[#eeeeee]">
                          {s.organization.name}
                        </span>
                      ) : (
                        <span className="text-[#777777]">Global Platform</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[#b5b5b5]">
                      {s.grantor?.email || (
                        <span className="text-[#666666]">System Automated</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[#b5b5b5]">
                      {s.grantee?.email || (
                        <span className="text-[#666666]">External Recipient</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[#cccccc]">
                      {s.integrationProvider || (
                        <span className="text-[#666666]">WithUs Internal</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[#999999]">
                      {s.scope || 'Standard Access'}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-[#bdbdbd]">
                        {s.status === 'ACTIVE' && (
                          <CheckCircle className="h-3.5 w-3.5 text-[#dddddd]" />
                        )}
                        {s.status === 'PENDING_GRANT' && (
                          <Clock className="h-3.5 w-3.5 text-[#999999]" />
                        )}
                        {s.status === 'REVOKED' && (
                          <XCircle className="h-3.5 w-3.5 text-[#777777]" />
                        )}
                        {s.status === 'REVOKE_FAILED' && (
                          <AlertTriangle className="h-3.5 w-3.5 text-[#aaaaaa]" />
                        )}
                        {s.status === 'EXPIRED' && (
                          <Clock className="h-3.5 w-3.5 text-[#666666]" />
                        )}
                        <span>{statusLabel(s.status)}</span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[#999999]">
                      {formatDate(s.expiresAt)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-[#999999]">
                      {formatDate(s.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredSessions.length > 0 && (
          <div className="flex items-center justify-between bg-[#141414] px-4 py-3">
            <p className="text-xs text-[#666666]">
              Page <span className="text-[#aaaaaa]">{page}</span> of{' '}
              <span className="text-[#aaaaaa]">{totalFilteredPages}</span>
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="bg-[#202020] px-3 py-2 text-xs font-medium text-[#aaaaaa] transition-colors hover:bg-[#292929] hover:text-white disabled:cursor-not-allowed disabled:text-[#444444]"
              >
                Previous
              </button>
              <button
                disabled={page >= totalFilteredPages}
                onClick={() =>
                  setPage((p) => Math.min(totalFilteredPages, p + 1))
                }
                className="bg-[#202020] px-3 py-2 text-xs font-medium text-[#aaaaaa] transition-colors hover:bg-[#292929] hover:text-white disabled:cursor-not-allowed disabled:text-[#444444]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
