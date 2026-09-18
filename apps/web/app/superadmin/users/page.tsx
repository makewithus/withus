'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  CheckCircle,
  XCircle,
  Shield,
  Loader2,
  User,
  Calendar,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { superAdminApi } from '../../../lib/api/superadmin';
import { formatDate } from '../../../lib/formatters';

export default function SuperAdminUsersPage() {
  const searchParams = useSearchParams();
  const isActivityTab = searchParams?.get('tab') === 'activity';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const [activityData, setActivityData] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityPage, setActivityPage] = useState(1);

  useEffect(() => {
    if (isActivityTab) {
      setActivityLoading(true);
      superAdminApi
        .getGlobalAudit({ page: 1, limit: 100 })
        .then((res) => setActivityData(res.data?.data || []))
        .finally(() => setActivityLoading(false));
      return;
    }

    setLoading(true);
    superAdminApi
      .getUsers({
        page: 1,
        limit: 100,
        search: search || undefined,
      })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [search, isActivityTab]);

  const filteredUsers = useMemo(() => {
    if (!data?.data) return [];

    return data.data.filter((u: any) => {
      if (statusFilter === 'ACTIVE' && !u.isActive) return false;
      if (statusFilter === 'INACTIVE' && u.isActive) return false;

      const primaryRole = u.organizationMemberships?.[0]?.role || 'NONE';
      if (roleFilter !== 'ALL' && primaryRole !== roleFilter) return false;

      if (fromDate) {
        const uDate = new Date(u.createdAt).getTime();
        const fDate = new Date(fromDate).getTime();
        if (uDate < fDate) return false;
      }

      if (toDate) {
        const uDate = new Date(u.createdAt).getTime();
        const tDate = new Date(toDate).getTime() + 86400000;
        if (uDate > tDate) return false;
      }

      return true;
    });
  }, [data, statusFilter, roleFilter, fromDate, toDate]);

  const LIMIT = 10;
  const totalFilteredPages = Math.max(1, Math.ceil(filteredUsers.length / LIMIT));
  const paginatedUsers = filteredUsers.slice((page - 1) * LIMIT, page * LIMIT);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setRoleFilter('ALL');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const isFiltered =
    Boolean(search) ||
    statusFilter !== 'ALL' ||
    roleFilter !== 'ALL' ||
    Boolean(fromDate) ||
    Boolean(toDate);

  if (isActivityTab) {
    const ACTIVITY_LIMIT = 10;
    const totalActivityPages = Math.max(
      1,
      Math.ceil(activityData.length / ACTIVITY_LIMIT)
    );
    const paginatedActivity = activityData.slice(
      (activityPage - 1) * ACTIVITY_LIMIT,
      activityPage * ACTIVITY_LIMIT
    );

    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            User Activity
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Recent actions performed across the platform.
          </p>
        </div>

        <section className="overflow-hidden bg-[#181818]">
          {activityLoading ? (
            <div className="px-5 py-14 text-center">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-zinc-400" />
              <p className="text-sm text-zinc-500">Loading activity...</p>
            </div>
          ) : activityData.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <Clock className="mx-auto mb-2 h-6 w-6 text-zinc-500" />
              <p className="text-sm text-zinc-500">
                No recent user activity found.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#202020]">
                    <tr>
                      {['Action', 'Actor Email', 'Organisation', 'Resource', 'Timestamp'].map(
                        (heading, index) => (
                          <th
                            key={heading}
                            className={`px-5 py-3 text-left text-xs font-medium text-zinc-400 ${
                              index === 4 ? 'text-right' : ''
                            }`}
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedActivity.map((e: any) => (
                      <tr
                        key={e.id}
                        className="transition-colors hover:bg-[#202020]"
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-zinc-200">
                          {e.action}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-zinc-300">
                          {e.actor?.email ?? (
                            <span className="text-zinc-600">System</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-zinc-400">
                          {e.organization?.name ?? (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-zinc-400">
                          {e.resourceType ?? (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs text-zinc-400">
                          {formatDate(e.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between bg-[#141414] px-5 py-3">
                <p className="text-xs text-zinc-500">
                  Page{' '}
                  <span className="font-medium text-zinc-300">
                    {activityPage}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-zinc-300">
                    {totalActivityPages}
                  </span>
                </p>

                <div className="flex gap-2">
                  <button
                    disabled={activityPage <= 1}
                    onClick={() =>
                      setActivityPage((p) => Math.max(1, p - 1))
                    }
                    className="px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <button
                    disabled={activityPage >= totalActivityPages}
                    onClick={() =>
                      setActivityPage((p) =>
                        Math.min(totalActivityPages, p + 1)
                      )
                    }
                    className="px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Platform Users
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          All registered user accounts across the platform.
        </p>
      </div>

      <section className="space-y-3 bg-[#181818] p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full bg-[#202020] pl-9 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:bg-[#242424]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 bg-[#202020] px-3 text-sm text-zinc-300 outline-none focus:bg-[#242424] md:col-span-3"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active Accounts Only</option>
            <option value="INACTIVE">Inactive Accounts Only</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 bg-[#202020] px-3 text-sm text-zinc-300 outline-none focus:bg-[#242424] md:col-span-3"
          >
            <option value="ALL">All Org Roles</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
            <option value="NONE">Unassigned / Personal</option>
          </select>

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex h-9 items-center justify-center gap-1.5 bg-[#202020] px-3 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#242424] md:col-span-1"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Joined date</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-zinc-500">
              From
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="h-8 bg-[#202020] px-2 text-xs text-zinc-300 outline-none focus:bg-[#242424]"
              />
            </label>

            <label className="flex items-center gap-1.5 text-xs text-zinc-500">
              To
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="h-8 bg-[#202020] px-2 text-xs text-zinc-300 outline-none focus:bg-[#242424]"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#181818]">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full">
            <thead className="bg-[#202020]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                  Email
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                  Organization
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                  Last Login
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400">
                  Joined
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-zinc-400">
                  Access
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-14 text-center text-sm text-zinc-500"
                  >
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-zinc-400" />
                    Loading platform users...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-14 text-center text-sm text-zinc-500"
                  >
                    No matching users found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user: any) => {
                  const role = user.organizationMemberships?.[0]?.role;
                  const orgName =
                    user.organizationMemberships?.[0]?.organization?.name;
                  const displayName =
                    user.fullName || user.email.split('@')[0];

                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-[#202020]"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#242424] text-xs font-semibold text-zinc-200">
                            {displayName[0]?.toUpperCase() || (
                              <User className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-zinc-200">
                            {displayName}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-zinc-400">
                        {user.email}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-zinc-300">
                        {orgName || (
                          <span className="text-zinc-600">Personal</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-zinc-400">
                        {role || <span className="text-zinc-600">—</span>}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                            <CheckCircle className="h-3.5 w-3.5 text-zinc-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                            <XCircle className="h-3.5 w-3.5 text-zinc-600" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-zinc-400">
                        {user.lastLoginAt ? (
                          formatDate(user.lastLoginAt)
                        ) : (
                          <span className="text-zinc-600">Never</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-zinc-400">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        {user.isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-200">
                            <Shield className="h-3.5 w-3.5 text-zinc-400" />
                            Super Admin
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">
                            Standard User
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between bg-[#141414] px-5 py-3">
          <p className="text-xs text-zinc-500">
            Page{' '}
            <span className="font-medium text-zinc-300">{page}</span> of{' '}
            <span className="font-medium text-zinc-300">
              {totalFilteredPages}
            </span>
            <span className="mx-1.5 text-zinc-700">·</span>
            <span className="font-medium text-zinc-300">
              {filteredUsers.length}
            </span>{' '}
            matching users
          </p>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Previous
            </button>
            <button
              disabled={page >= totalFilteredPages}
              onClick={() =>
                setPage((p) => Math.min(totalFilteredPages, p + 1))
              }
              className="px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
