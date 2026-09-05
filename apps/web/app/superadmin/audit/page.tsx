'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { superAdminApi } from '../../../lib/api/superadmin';
import { formatDate } from '../../../lib/formatters';
import { Shield, Loader2, Search, Calendar, Filter, RotateCcw } from 'lucide-react';

export default function SuperAdminAuditPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [tab, setTab] = useState<'org' | 'platform'>('org');

  const loadOrgAudit = () => {
    setLoading(true);
    superAdminApi.getGlobalAudit({ page: 1, limit: 100, action: search || undefined })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  const loadPlatformAudit = () => {
    setLoading(true);
    superAdminApi.getPlatformAudit({ page: 1, limit: 100 })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'org') loadOrgAudit();
    else loadPlatformAudit();
  }, [tab, search]);

  // Client-side instant multi-filter for search & date range
  const filteredEvents = useMemo(() => {
    if (!data?.data) return [];
    const query = search.toLowerCase().trim();
    return data.data.filter((e: any) => {
      if (query) {
        const matchesAction = e.action?.toLowerCase().includes(query);
        const matchesActor = e.actor?.email?.toLowerCase().includes(query);
        const matchesOrg = e.organization?.name?.toLowerCase().includes(query);
        const matchesResource = (e.resourceType || e.targetType)?.toLowerCase().includes(query);

        if (!matchesAction && !matchesActor && !matchesOrg && !matchesResource) {
          return false;
        }
      }

      // Date range filter
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
  }, [data, search, fromDate, toDate]);

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Security & Audit Log</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Platform-wide security audit trail and administrative action log.</p>
        </div>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-number bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded border border-slate-200 dark:border-zinc-700">
          Showing <span className="font-bold text-slate-900 dark:text-slate-100">{filteredEvents.length}</span> of <span className="font-bold text-slate-900 dark:text-slate-100">{data?.total ?? 0}</span> security events
        </span>
      </div>

      {/* Structured & Consistent Multi-Filter Bar & Tab Selection */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm space-y-4">
        {/* Row 1: Tab Controls & Direct Search Input */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Tabs */}
          <div className="md:col-span-4 flex gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-700">
            {[
              { key: 'org', label: 'Organization Events' },
              { key: 'platform', label: 'Super Admin Log' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key as any); setPage(1); }}
                className={`flex-1 py-1 px-2.5 text-xs font-bold rounded transition-all ${
                  tab === t.key
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/80 dark:border-zinc-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Direct Search input */}
          <div className="relative md:col-span-7">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search action, actor email, organization, or resource type..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pl-9 pr-3 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 placeholder:text-slate-400"
            />
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
            <span>Filter Event Timestamp:</span>
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
                {tab === 'org'
                  ? ['Action', 'Actor Email', 'Organization', 'Resource Type', 'Timestamp'].map((h, i) => (
                      <th key={h} scope="col" className={`px-5 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))
                  : ['Action', 'Admin Actor', 'Target Type', 'Target ID', 'Timestamp'].map((h, i) => (
                      <th key={h} scope="col" className={`px-5 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))
                }
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin text-slate-700 dark:text-slate-300" />
                    Loading audit events...
                  </td>
                </tr>
              ) : paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No matching audit events found for the selected filters.</p>
                  </td>
                </tr>
              ) : tab === 'org' ? (
                paginatedEvents.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    {/* Action */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                      {e.action}
                    </td>

                    {/* Actor Email */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                      {e.actor?.email ? (
                        <span>{e.actor.email}</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 rounded">
                          System Automated
                        </span>
                      )}
                    </td>

                    {/* Organization */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                      {e.organization?.name ? (
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{e.organization.name}</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 rounded">
                          Platform Scope
                        </span>
                      )}
                    </td>

                    {/* Resource Type */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                      {e.resourceType ? (
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{e.resourceType}</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 rounded">
                          Global System Event
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-800 dark:text-slate-200 font-number text-right">
                      {formatDate(e.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                paginatedEvents.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    {/* Action */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                      {e.action}
                    </td>

                    {/* Admin Actor */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                      {e.actor?.email ? (
                        <span>{e.actor.email}</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 rounded">
                          Super Admin
                        </span>
                      )}
                    </td>

                    {/* Target Type */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {e.targetType ? (
                        <span>{e.targetType}</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 rounded">
                          Global Configuration
                        </span>
                      )}
                    </td>

                    {/* Target ID */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono text-slate-700 dark:text-slate-300">
                      {e.targetId ? (
                        <span>{e.targetId.slice(0, 16)}...</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 rounded">
                          Administrative
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-800 dark:text-slate-200 font-number text-right">
                      {formatDate(e.createdAt)}
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
            {' '}· <span className="font-bold text-slate-900 dark:text-slate-100 font-number">{filteredEvents.length}</span> matching events
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




