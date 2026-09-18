'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { superAdminApi } from '../../../lib/api/superadmin';
import { Crown, RefreshCw, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

export default function AdminManagementPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await superAdminApi.getSuperAdmins();
      setData(res.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const admins: any[] = data?.admins || [];
  const recentActivity: any[] = data?.recentActivity || [];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
            Admin Management
          </h2>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#242424] px-3.5 py-2.5 text-sm font-medium text-[#cccccc] transition-colors hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:text-[#555555]"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-[#181818] px-5 py-4 text-sm text-[#cccccc]">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#888888]" />
          <span>{error}</span>
        </div>
      )}

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-medium text-[#cccccc]">
            Platform Super Admins
            <span className="ml-2 text-[#666666]">
              {loading ? '—' : admins.length}
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="h-32 animate-pulse bg-[#181818]" />
        ) : admins.length === 0 ? (
          <div className="bg-[#181818] px-5 py-10 text-center">
            <Crown className="mx-auto mb-3 h-5 w-5 text-[#555555]" />
            <p className="text-sm text-[#777777]">No Super Admins found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#181818]">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#1f1f1f]">
                <tr>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Name</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Email</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Status</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Last Login</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Created</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin: any) => (
                  <tr
                    key={admin.id}
                    className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-[#eeeeee]">
                      {admin.fullName || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#999999]">{admin.email}</td>
                    <td className="px-5 py-4">
                      {admin.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#eeeeee]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-[#666666]">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#888888]">
                      {admin.lastLoginAt
                        ? new Date(admin.lastLoginAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#888888]">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#666666]">
                      Coming Soon
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-medium text-[#cccccc]">Admin Management Actions</h3>
        </div>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
          <div className="bg-[#181818] px-5 py-5 transition-colors hover:bg-[#1d1d1d]">
            <div className="flex items-start gap-3">
              <Crown className="mt-0.5 h-4 w-4 shrink-0 text-[#777777]" />
              <div>
                <p className="text-sm font-medium text-[#eeeeee]">
                  Promote User to Super Admin
                </p>
                <p className="mt-1 text-xs leading-5 text-[#777777]">
                  Requires a secure confirmation and audited approval workflow
                </p>
                <p className="mt-3 text-xs font-medium text-[#666666]">
                  Secured Workflow — Coming Soon
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#181818] px-5 py-5 transition-colors hover:bg-[#1d1d1d]">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#777777]" />
              <div>
                <p className="text-sm font-medium text-[#eeeeee]">
                  Revoke Super Admin Access
                </p>
                <p className="mt-1 text-xs leading-5 text-[#777777]">
                  Requires secure confirmation, full audit trail, and session invalidation
                </p>
                <p className="mt-3 text-xs font-medium text-[#666666]">
                  Secured Workflow — Coming Soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {recentActivity.length > 0 && (
        <section>
          <div className="mb-3">
            <h3 className="text-sm font-medium text-[#cccccc]">
              Recent Platform Admin Activity
            </h3>
          </div>

          <div className="overflow-x-auto bg-[#181818]">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-[#1f1f1f]">
                <tr>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Action</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Admin</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Target</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((evt: any) => (
                  <tr
                    key={evt.id}
                    className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-[#999999]">
                      {evt.action}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#eeeeee]">
                      {evt.actor?.email || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#888888]">
                      {evt.targetId || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#888888]">
                      {new Date(evt.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}