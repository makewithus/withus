'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { superAdminApi } from '../../lib/api/superadmin';
import {
  Users, Building2, Database, Activity, ShieldAlert, Loader2,
  KeyRound, Server, Wifi, WifiOff, RefreshCw, CreditCard,
  TrendingDown, AlertCircle, Calendar,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface Overview {
  users: { total: number; active: number; newInPeriod: number; inactive: number };
  organizations: { total: number; active: number; newInPeriod: number; inactive: number };
  vaults: { total: number };
  secrets: { total: number };
  sessions: { active: number; pending: number; revoked: number; expired: number; total: number };
  connections: { total: number; failed: number; healthy: number };
  audit: { eventsLast7Days: number };
  topPlatforms: { provider: string; activeSessions: number }[];
  billing: null;
}

type TimeRange = 'today' | '7d' | '30d' | '3m' | '6m' | '1y' | 'custom';

const TIME_RANGES: { label: string; value: TimeRange; days: number | null }[] = [
  { label: 'Today', value: 'today', days: 1 },
  { label: '7 Days', value: '7d', days: 7 },
  { label: '30 Days', value: '30d', days: 30 },
  { label: '3 Months', value: '3m', days: 90 },
  { label: '6 Months', value: '6m', days: 180 },
  { label: '1 Year', value: '1y', days: 365 },
  { label: 'Custom', value: 'custom', days: null },
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="bg-[#181818] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        <div className="w-8 h-8 flex items-center justify-center bg-[#242424]">
          <Icon className="w-4 h-4 text-zinc-300" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-semibold text-white tracking-tight tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function ComingSoonStatCard({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="bg-[#181818] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        <div className="w-8 h-8 flex items-center justify-center bg-[#242424]">
          <Icon className="w-4 h-4 text-zinc-500" />
        </div>
      </div>
      <div className="text-2xl font-semibold text-zinc-500">—</div>
      <span className="inline-flex w-fit px-2 py-1 text-[10px] font-semibold bg-[#3a2f18] text-[#d5a83d]">
        Coming Soon
      </span>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#181818] p-5 space-y-4">
      <h2 className="text-sm font-medium text-zinc-200">{title}</h2>
      {children}
    </div>
  );
}

function ChartLoading() {
  return <div className="h-44 animate-pulse bg-[#202020]" />;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#242424] px-3 py-2 text-xs space-y-1">
      <p className="text-zinc-400">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-medium text-white">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function ComingSoonChart({ title }: { title: string }) {
  return (
    <div className="bg-[#181818] min-h-[180px] p-5 flex flex-col justify-center gap-2">
      <h2 className="text-sm font-medium text-zinc-200">{title}</h2>
      <span className="inline-flex w-fit px-2 py-1 text-[10px] font-semibold bg-[#3a2f18] text-[#d5a83d]">
        Coming Soon · Billing Integration Required
      </span>
    </div>
  );
}

export default function SuperAdminOverview() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [growthData, setGrowthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const getDateRange = useCallback((range: TimeRange) => {
    if (range === 'custom') {
      const from = customFrom
        ? new Date(customFrom)
        : new Date(Date.now() - 30 * 86400000);
      const to = customTo ? new Date(`${customTo}T23:59:59`) : new Date();
      const days = Math.max(
        1,
        Math.ceil((to.getTime() - from.getTime()) / 86400000)
      );
      return { from: from.toISOString(), to: to.toISOString(), days };
    }

    const now = new Date();
    const days = TIME_RANGES.find((r) => r.value === range)?.days || 30;
    const from = new Date(now.getTime() - days * 86400000);

    return {
      from: from.toISOString(),
      to: now.toISOString(),
      days,
    };
  }, [customFrom, customTo]);

  const fetchData = useCallback(async (range: TimeRange) => {
    if (range === 'custom' && (!customFrom || !customTo)) return;

    try {
      setLoading(true);
      setError(null);

      const { from, to, days } = getDateRange(range);

      const [overviewRes, growthRes] = await Promise.all([
        superAdminApi.getOverview({ from, to }),
        superAdminApi.getGrowthData(days),
      ]);

      setOverview(overviewRes.data);
      setGrowthData(growthRes.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load platform overview.');
    } finally {
      setLoading(false);
    }
  }, [getDateRange, customFrom, customTo]);

  useEffect(() => {
    if (timeRange !== 'custom') fetchData(timeRange);
  }, [fetchData, timeRange]);

  useEffect(() => {
    if (timeRange === 'custom' && customFrom && customTo) {
      fetchData('custom');
    }
  }, [customFrom, customTo, timeRange, fetchData]);

  const chartData = growthData
    ? growthData.labels.map((date: string, i: number) => ({
        date: date.slice(5),
        Orgs: growthData.orgs[i],
        Users: growthData.users[i],
        Events: growthData.auditEvents[i],
      }))
    : [];

  const platformChartData =
    overview?.topPlatforms?.map((p) => ({
      name: p.provider,
      Sessions: p.activeSessions,
    })) ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Platform Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5 bg-[#181818] p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-2.5 py-1.5 text-xs transition-colors ${
                  timeRange === range.value
                    ? 'bg-[#2a2a2a] text-white'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchData(timeRange)}
            disabled={loading || (timeRange === 'custom' && (!customFrom || !customTo))}
            className="flex items-center gap-2 bg-[#242424] hover:bg-[#2a2a2a] disabled:opacity-40 px-3 py-2 text-xs font-medium text-zinc-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {timeRange === 'custom' && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#181818] p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Date range</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-zinc-500">
              From
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-8 px-2 text-xs text-zinc-200 bg-[#242424] focus:outline-none"
              />
            </label>

            <label className="flex items-center gap-2 text-xs text-zinc-500">
              To
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="h-8 px-2 text-xs text-zinc-200 bg-[#242424] focus:outline-none"
              />
            </label>
          </div>

          {(!customFrom || !customTo) && (
            <p className="text-xs text-zinc-500">Select both dates.</p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-[#241919] px-4 py-3 text-xs text-zinc-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-zinc-400" />
          {error}
        </div>
      )}

      {loading && !overview ? (
        <div className="flex items-center justify-center h-64 text-zinc-500 text-sm gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading platform analytics...
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-xs font-medium text-zinc-500">Overview</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <StatCard
                icon={Building2}
                label="Organisations"
                value={overview?.organizations.total ?? 0}
                sub={`${overview?.organizations.active ?? 0} active · ${overview?.organizations.inactive ?? 0} inactive`}
              />
              <StatCard
                icon={Users}
                label="Users"
                value={overview?.users.total ?? 0}
                sub={`${overview?.users.active ?? 0} active · ${overview?.users.inactive ?? 0} inactive`}
              />
              <StatCard
                icon={Wifi}
                label="Platform Connections"
                value={overview?.connections.total ?? 0}
                sub={`${overview?.connections.healthy ?? 0} healthy · ${overview?.connections.failed ?? 0} failed`}
              />
              <StatCard
                icon={WifiOff}
                label="Failed Connections"
                value={overview?.connections.failed ?? 0}
                sub="Currently in error state"
              />
              <StatCard
                icon={Database}
                label="Vaults"
                value={overview?.vaults.total ?? 0}
              />
              <StatCard
                icon={KeyRound}
                label="Secrets"
                value={overview?.secrets.total ?? 0}
              />
              <StatCard
                icon={Activity}
                label="Audit Events"
                value={overview?.audit.eventsLast7Days ?? 0}
                sub="Last 7 days"
              />
              <StatCard
                icon={Activity}
                label="Active Sessions"
                value={overview?.sessions.active ?? 0}
                sub={`${overview?.sessions.pending ?? 0} pending`}
              />

              <ComingSoonStatCard icon={CreditCard} label="Free Organisations" />
              <ComingSoonStatCard icon={CreditCard} label="Pro Organisations" />
              <ComingSoonStatCard icon={TrendingDown} label="MRR" />
              <ComingSoonStatCard icon={AlertCircle} label="Churned Organisations" />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="text-xs font-medium text-zinc-500">
                Session Lifecycle
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Active', value: overview?.sessions.active ?? 0 },
                  { label: 'Pending', value: overview?.sessions.pending ?? 0 },
                  { label: 'Revoked', value: overview?.sessions.revoked ?? 0 },
                  { label: 'Expired', value: overview?.sessions.expired ?? 0 },
                ].map((session) => (
                  <div key={session.label} className="bg-[#181818] p-4">
                    <p className="text-xs text-zinc-500">{session.label}</p>
                    <p className="text-xl font-semibold text-white mt-2 tabular-nums">
                      {session.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-medium text-zinc-500">
                Active Integration Sessions
              </h2>

              <div className="bg-[#181818] p-4">
                {!overview?.topPlatforms?.length ? (
                  <p className="text-xs text-zinc-500 py-3">
                    No active integration sessions.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {overview.topPlatforms.map((platform) => (
                      <div
                        key={platform.provider}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-zinc-200">
                          {platform.provider}
                        </span>
                        <span className="text-xs text-zinc-500 tabular-nums">
                          {platform.activeSessions}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-medium text-zinc-500">Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Organisation Growth">
                {loading || !chartData.length ? (
                  <ChartLoading />
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} width={28} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="Orgs"
                        stroke="#a1a1aa"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="User Growth">
                {loading || !chartData.length ? (
                  <ChartLoading />
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} width={28} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="Users"
                        stroke="#d4d4d8"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Platform Usage">
                {loading || !overview ? (
                  <ChartLoading />
                ) : platformChartData.length === 0 ? (
                  <div className="h-44 flex items-center justify-center text-xs text-zinc-500">
                    No active sessions on any platform.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={platformChartData} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(128,128,128,0.12)"
                        horizontal={false}
                      />
                      <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        width={70}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Sessions" fill="#a1a1aa" radius={0} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Security & Audit Activity">
                {loading || !chartData.length ? (
                  <ChartLoading />
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} width={28} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Events" fill="#a1a1aa" radius={0} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ComingSoonChart title="Free → Pro Conversion" />
              <ComingSoonChart title="MRR Growth" />
              <ComingSoonChart title="Organisation Churn" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
