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
    superAdminApi.getSessions({ page: 1, limit: 100, status: statusFilter !== 'ALL' ? statusFilter : undefined })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  // Instant client-side filtering for search & date range
  const filteredSessions = useMemo(() => {
    if (!data?.data) return [];
    const query = search.toLowerCase().trim();
    return data.data.filter((s: any) => {
      // Search filter across multiple fields
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

      // Date range filter
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Delegated Sessions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">All delegated access sessions created across the platform.</p>
        </div>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-number bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded border border-slate-200 dark:border-zinc-700">
          Showing <span className="font-bold text-slate-900 dark:text-slate-100">{filteredSessions.length}</span> of <span className="font-bold text-slate-900 dark:text-slate-100">{data?.total ?? 0}</span> sessions
        </span>
      </div>

      {/* Structured & Consistent Multi-Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm space-y-4">
        {/* Row 1: Search & Status Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Direct Search on Type */}
          <div className="relative md:col-span-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by grantor, grantee, organization, or platform..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pl-9 pr-3 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 placeholder:text-slate-400"
            />
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full h-9 px-3 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          <div className="md:col-span-1 flex items-center justify-end">
            {isFiltered ? (
              <button
                onClick={clearFilters}
                className="h-9 px-3 w-full text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center justify-center gap-1.5"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            ) : (
              <div className="h-9 px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 justify-center">
                <Filter className="w-3 h-3" /> Filtered
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Clean Date Range Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-fit">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter by Created Date:</span>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="h-8 px-2 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="h-8 px-2 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Consistent Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-800">
            <thead className="bg-slate-50 dark:bg-zinc-800/50">
              <tr>
                <th scope="col" className="px-5 py-3 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Organization</th>
                <th scope="col" className="px-5 py-3 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Grantor Email</th>
                <th scope="col" className="px-5 py-3 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Grantee Email</th>
                <th scope="col" className="px-5 py-3 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Target Platform</th>
                <th scope="col" className="px-5 py-3 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Scope</th>
                <th scope="col" className="px-5 py-3 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-5 py-3 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Expires</th>
                <th scope="col" className="px-5 py-3 text-right text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin text-slate-700 dark:text-slate-300" />
                    Loading delegated sessions...
                  </td>
                </tr>
              ) : paginatedSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No matching delegated sessions found for the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedSessions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    {/* Organization */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                      {s.organization?.name ? (
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{s.organization.name}</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 rounded">
                          Global Platform
                        </span>
                      )}
                    </td>

                    {/* Grantor Email */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                      {s.grantor?.email ? (
                        <span>{s.grantor.email}</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 rounded">
                          System Automated
                        </span>
                      )}
                    </td>

                    {/* Grantee Email */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                      {s.grantee?.email ? (
                        <span>{s.grantee.email}</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 rounded">
                          External Recipient
                        </span>
                      )}
                    </td>

                    {/* Target Platform */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                      {s.integrationProvider ? (
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{s.integrationProvider}</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded">
                          WITHUS Internal
                        </span>
                      )}
                    </td>

                    {/* Scope */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {s.scope || 'Standard Access'}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                      {getStatusBadge(s.status)}
                    </td>

                    {/* Expires */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-800 dark:text-slate-200 font-number">
                      {formatDate(s.expiresAt)}
                    </td>

                    {/* Created */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-800 dark:text-slate-200 font-number text-right">
                      {formatDate(s.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/30">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Page <span className="font-bold text-slate-900 dark:text-slate-100 font-number">{page}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-slate-100 font-number">{totalFilteredPages}</span>
            {' '}· <span className="font-bold text-slate-900 dark:text-slate-100 font-number">{filteredSessions.length}</span> matching sessions
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalFilteredPages}
              onClick={() => setPage(p => Math.min(totalFilteredPages, p + 1))}
              className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




