'use client';

import React, { useEffect, useState } from 'react';
import { superAdminApi } from '../../lib/api/superadmin';
import { Users, Building2, Zap, Database, Activity, ShieldAlert, Loader2, KeyRound, Server } from 'lucide-react';

interface Overview {
  users: { total: number; active: number; newLast30Days: number; inactive: number };
  organizations: { total: number; active: number; newLast30Days: number };
  vaults: { total: number };
  secrets: { total: number };
  sessions: { active: number; pending: number; revoked: number; expired: number; total: number };
  audit: { eventsLast7Days: number };
  topPlatforms: { provider: string; activeSessions: number }[];
}

function StatCard({ icon: Icon, label, value, sub, accentBorder }: {
  icon: React.ElementType; label: string; value: React.ReactNode; sub?: string; accentBorder?: string;
}) {
  return (
    <div className="premium-card p-5 space-y-3 shadow-none relative overflow-hidden">
      {accentBorder && <div className={`absolute top-0 left-0 right-0 h-[2px] ${accentBorder}`} />}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 border border-premium">
          <Icon className="w-4 h-4 text-premium-main" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-premium-main tracking-tight font-number">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {sub && <div className="text-xs text-premium-muted font-medium mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export default function SuperAdminOverview() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    superAdminApi.getOverview()
      .then((res) => setOverview(res.data))
      .catch(() => setError('Failed to load platform overview.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-premium-muted text-xs font-semibold gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-premium-main" />
        Loading platform analytics...
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="premium-card p-6 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 font-semibold">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        {error || 'Failed to load overview.'}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="pb-3 border-b border-premium flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-premium-main">Platform Analytics</h1>
          <p className="text-xs text-premium-muted mt-0.5">
            Real-time security, usage, and system health metrics across WITHUS.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Registered Users"
          value={overview.users.total}
          sub={`${overview.users.active} active · ${overview.users.newLast30Days} joined this month`}
          accentBorder="bg-emerald-500"
        />
        <StatCard
          icon={Building2}
          label="Active Organizations"
          value={overview.organizations.total}
          sub={`${overview.organizations.active} operational · ${overview.organizations.newLast30Days} new this month`}
          accentBorder="bg-blue-500"
        />
        <StatCard
          icon={Zap}
          label="Live Delegated Sessions"
          value={overview.sessions.active}
          sub={`${overview.sessions.pending} pending approval · ${overview.sessions.total} lifetime`}
          accentBorder="bg-amber-500"
        />
        <StatCard
          icon={Database}
          label="Vaults & Secrets"
          value={
            <div className="flex items-center gap-4 pt-0.5">
              <div>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-number">{overview.vaults.total}</span>
                <span className="ml-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vaults</span>
              </div>
              <div className="h-5 w-[1px] bg-slate-200 dark:bg-zinc-800" />
              <div>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-number">{overview.secrets.total}</span>
                <span className="ml-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Secrets</span>
              </div>
            </div>
          }
          sub="Stored securely across all orgs"
          accentBorder="bg-zinc-700 dark:bg-zinc-300"
        />
      </div>

      {/* Session Health & Status Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">
            Delegated Session Lifecycle Status
          </h2>
          <span className="text-[10px] text-premium-muted font-bold font-number">
            Total Sessions: {overview.sessions.total}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="premium-card p-4 shadow-none space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-premium-main font-number">{overview.sessions.active}</div>
            <p className="text-[10px] text-premium-muted">Currently delegated</p>
          </div>

          <div className="premium-card p-4 shadow-none space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl font-bold text-premium-main font-number">{overview.sessions.pending}</div>
            <p className="text-[10px] text-premium-muted">Awaiting approval</p>
          </div>

          <div className="premium-card p-4 shadow-none space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Revoked</span>
              <span className="w-2 h-2 rounded-full bg-red-500" />
            </div>
            <div className="text-2xl font-bold text-premium-main font-number">{overview.sessions.revoked}</div>
            <p className="text-[10px] text-premium-muted">Manual revocation</p>
          </div>

          <div className="premium-card p-4 shadow-none space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expired</span>
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
            <div className="text-2xl font-bold text-premium-main font-number">{overview.sessions.expired}</div>
            <p className="text-[10px] text-premium-muted">TTL lapsed</p>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Connected Platforms */}
        <div className="premium-card p-6 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-premium pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-premium-main" />
              <h2 className="text-[11px] font-bold text-premium-main uppercase tracking-wider">
                Top Platforms by Active Sessions
              </h2>
            </div>
            <span className="text-[10px] text-premium-muted font-bold uppercase tracking-wider">Integrations</span>
          </div>

          {overview.topPlatforms.length === 0 ? (
            <div className="text-xs text-premium-muted py-6 text-center font-medium">No active integration sessions currently live.</div>
          ) : (
            <div className="space-y-3">
              {overview.topPlatforms.map((p) => (
                <div key={p.provider} className="flex items-center justify-between py-2 border-b border-premium/40 last:border-b-0">
                  <span className="text-xs font-bold text-premium-main">{p.provider}</span>
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-premium-main border border-premium/50 font-number">
                    {p.activeSessions} active session{p.activeSessions !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Activity Summary */}
        <div className="premium-card p-6 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-premium pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-premium-main" />
              <h2 className="text-[11px] font-bold text-premium-main uppercase tracking-wider">
                Platform Activity & Health
              </h2>
            </div>
            <span className="text-[10px] text-premium-muted font-bold uppercase tracking-wider">7-Day Window</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-premium/40">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-premium-muted" />
                <span className="text-xs font-semibold text-premium-main">Audit Log Events (Last 7 Days)</span>
              </div>
              <span className="text-xs font-bold text-premium-main font-number">{overview.audit.eventsLast7Days}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-premium/40">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-premium-muted" />
                <span className="text-xs font-semibold text-premium-main">Inactive / Suspended Accounts</span>
              </div>
              <span className="text-xs font-bold text-premium-main font-number">{overview.users.inactive}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-premium-muted" />
                <span className="text-xs font-semibold text-premium-main">New Organizations (Last 30 Days)</span>
              </div>
              <span className="text-xs font-bold text-premium-main font-number">{overview.organizations.newLast30Days}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


