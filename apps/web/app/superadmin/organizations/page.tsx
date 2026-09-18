'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { superAdminApi } from '../../../lib/api/superadmin';
import { Search, ExternalLink, CheckCircle, XCircle, Loader2, Building2, Calendar, RotateCcw } from 'lucide-react';
import { formatDate } from '../../../lib/formatters';

export default function SuperAdminOrgsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [page, setPage] = useState(1);

  const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    setLoading(true);
    superAdminApi.getOrganizations({ page: 1, limit: 100, search: search || undefined })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [search]);

  const filteredOrgs = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((org: any) => {
      if (statusFilter === 'ACTIVE' && !org.isActive) return false;
      if (statusFilter === 'INACTIVE' && org.isActive) return false;
      if (statusFilter === 'NEW' && new Date(org.createdAt) < THIRTY_DAYS_AGO) return false;
      if (statusFilter === 'HIGH_USAGE' && (org._count?.delegatedSessions ?? 0) < 5) return false;
      if (statusFilter === 'LOW_USAGE' && (org._count?.delegatedSessions ?? 0) > 0) return false;
      if (fromDate && new Date(org.createdAt).getTime() < new Date(fromDate).getTime()) return false;
      if (toDate && new Date(org.createdAt).getTime() > new Date(toDate).getTime() + 86400000) return false;
      return true;
    });
  }, [data, statusFilter, fromDate, toDate]);

  const LIMIT = 10;
  const totalFilteredPages = Math.max(1, Math.ceil(filteredOrgs.length / LIMIT));
  const paginatedOrgs = filteredOrgs.slice((page - 1) * LIMIT, page * LIMIT);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const isFiltered = search || statusFilter !== 'ALL' || fromDate || toDate;

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
            Organizations
          </h1>
        </div>
        <p className="shrink-0 text-sm text-[#666666]">
          <span className="font-medium text-[#dddddd]">{filteredOrgs.length}</span> of{' '}
          <span className="font-medium text-[#dddddd]">{data?.total ?? 0}</span> organizations
        </p>
      </div>

      <div className="bg-[#181818] p-4">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_240px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              placeholder="Search organization or owner email"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-10 w-full bg-[#111111] pl-9 pr-3 text-sm text-[#eeeeee] outline-none placeholder:text-[#555555] focus:bg-[#151515]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 bg-[#111111] px-3 text-sm text-[#cccccc] outline-none focus:bg-[#151515]"
          >
            <option value="ALL">All Organizations</option>
            <option value="ACTIVE">Active Organizations</option>
            <option value="INACTIVE">Inactive Organizations</option>
            <option value="NEW">New (Last 30 Days)</option>
            <option value="HIGH_USAGE">High Usage (5+ Sessions)</option>
            <option value="LOW_USAGE">Low Usage (0 Sessions)</option>
          </select>

          {isFiltered ? (
            <button onClick={clearFilters} className="inline-flex h-10 items-center justify-center gap-2 bg-[#242424] px-3.5 text-sm font-medium text-[#cccccc] hover:bg-[#2b2b2b] hover:text-white">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          ) : <div className="hidden lg:block" />}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs font-medium text-[#777777]">
            <Calendar className="h-3.5 w-3.5" />
            <span>Registration date</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="h-9 bg-[#111111] px-2.5 text-xs text-[#cccccc] outline-none focus:bg-[#151515]" />
            <span className="text-xs text-[#555555]">to</span>
            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="h-9 bg-[#111111] px-2.5 text-xs text-[#cccccc] outline-none focus:bg-[#151515]" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-[#666666]">
          <span className="bg-[#3a2f18] px-2 py-1 text-[#d5a83d]">Coming Soon</span>
          <span>Free, Pro, Trial, and subscription status filters require billing integration.</span>
        </div>
      </div>

      <div className="overflow-hidden bg-[#181818]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#202020]">
              <tr>
                {['Organization','Primary Owner','Members','Vaults','Sessions','Status','Created','Action'].map((h, i) => (
                  <th key={h} className={`whitespace-nowrap px-4 py-3 text-xs font-medium text-[#999999] ${[2,3,4].includes(i) ? 'text-center' : i === 7 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-14 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#777777]" />
                  <p className="mt-3 text-sm text-[#666666]">Loading organizations...</p>
                </td></tr>
              ) : paginatedOrgs.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-14 text-center">
                  <p className="text-sm font-medium text-[#aaaaaa]">No matching organizations</p>
                  <p className="mt-1 text-xs text-[#5f5f5f]">Try changing or clearing the filters.</p>
                </td></tr>
              ) : paginatedOrgs.map((org: any) => (
                <tr key={org.id} className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]">
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#242424] text-[#999999]"><Building2 className="h-3.5 w-3.5" /></div>
                      <span className="text-sm font-medium text-[#eeeeee]">{org.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#b5b5b5]">{org.owner?.email || <span className="text-[#666666]">No Primary Owner</span>}</td>
                  <td className="px-4 py-4 text-center text-sm text-[#dddddd]">{org._count?.members ?? 0}</td>
                  <td className="px-4 py-4 text-center text-sm text-[#dddddd]">{org._count?.vaults ?? 0}</td>
                  <td className="px-4 py-4 text-center text-sm text-[#dddddd]">{org._count?.delegatedSessions ?? 0}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#bdbdbd]">
                      {org.isActive ? <CheckCircle className="h-3.5 w-3.5 text-[#dddddd]" /> : <XCircle className="h-3.5 w-3.5 text-[#777777]" />}
                      <span>{org.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#999999]">{formatDate(org.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <Link href={`/superadmin/organizations/${org.id}`} className="inline-flex items-center gap-1.5 bg-[#242424] px-3 py-2 text-xs font-medium text-[#cccccc] hover:bg-[#2b2b2b] hover:text-white">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrgs.length > 0 && (
          <div className="flex items-center justify-between bg-[#141414] px-4 py-3">
            <p className="text-xs text-[#666666]">Page <span className="text-[#aaaaaa]">{page}</span> of <span className="text-[#aaaaaa]">{totalFilteredPages}</span></p>
            <div className="flex items-center gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="bg-[#202020] px-3 py-2 text-xs font-medium text-[#aaaaaa] hover:bg-[#292929] hover:text-white disabled:cursor-not-allowed disabled:text-[#444444]">Previous</button>
              <button disabled={page >= totalFilteredPages} onClick={() => setPage(p => Math.min(totalFilteredPages, p + 1))} className="bg-[#202020] px-3 py-2 text-xs font-medium text-[#aaaaaa] hover:bg-[#292929] hover:text-white disabled:cursor-not-allowed disabled:text-[#444444]">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
