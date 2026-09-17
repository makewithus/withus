'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { superAdminApi } from '../../../lib/api/superadmin';
import {
  BarChart3,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await superAdminApi.getProductAnalytics(days);
      setData(res.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
            Product Analytics
          </h2>
          <p className="mt-1 text-sm text-[#777777]">
            Acquisition, activation, engagement, and retention.
          </p>
        </div>

        <div className="flex items-center gap-1">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-10 bg-[#181818] px-3 text-sm text-[#cccccc] outline-none focus:bg-[#202020]"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 bg-[#eeeeee] px-3.5 text-sm font-medium text-[#111111] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-[#666666]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#181818] px-4 py-3 text-sm text-[#b0b0b0]">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#888888]" />
          {error}
        </div>
      )}

      <section>
        <h3 className="mb-3 text-sm font-medium text-[#eeeeee]">Acquisition</h3>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
          <div className="bg-[#181818] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-[#242424] text-[#888888]">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#eeeeee]">New organisations</p>
                <p className="mt-0.5 text-xs text-[#666666]">Last {days} days</p>
              </div>
            </div>
            <p className="mt-6 text-2xl font-semibold tracking-tight text-[#eeeeee]">
              {loading ? '—' : data?.acquisition?.newOrgs ?? '—'}
            </p>
          </div>

          <div className="bg-[#181818] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-[#242424] text-[#888888]">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#eeeeee]">New users</p>
                <p className="mt-0.5 text-xs text-[#666666]">Last {days} days</p>
              </div>
            </div>
            <p className="mt-6 text-2xl font-semibold tracking-tight text-[#eeeeee]">
              {loading ? '—' : data?.acquisition?.newUsers ?? '—'}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-[#eeeeee]">Activation</h3>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
          {[
            ['Organisations with first session', data?.activation?.orgsWithSession ?? '—'],
            ['Activation rate', `${data?.activation?.activationRate ?? '—'}%`],
            ['Organisations with vault', data?.activation?.orgsWithVault ?? '—'],
          ].map(([label, value]) => (
            <div key={label} className="bg-[#181818] p-5">
              <p className="text-sm font-medium text-[#cccccc]">{label}</p>
              <p className="mt-5 text-2xl font-semibold tracking-tight text-[#eeeeee]">
                {loading ? '—' : value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-[#eeeeee]">Engagement</h3>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['Active users (7d)', data?.engagement?.activeUsersLast7d ?? '—'],
            ['Active users (30d)', data?.engagement?.activeUsersLast30d ?? '—'],
            ['Audit events', data?.engagement?.auditEventsInPeriod ?? '—'],
            ['Credential events', data?.engagement?.credentialEvents ?? '—'],
          ].map(([label, value]) => (
            <div key={label} className="bg-[#181818] p-5">
              <p className="text-sm font-medium text-[#cccccc]">{label}</p>
              <p className="mt-5 text-2xl font-semibold tracking-tight text-[#eeeeee]">
                {loading ? '—' : value}
              </p>
            </div>
          ))}
        </div>

        {!loading && data?.engagement?.note && (
          <p className="mt-2 text-xs text-[#666666]">{data.engagement.note}</p>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-[#eeeeee]">Retention</h3>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
          {[
            ['7-day retention', 'Not available'],
            ['30-day retention', 'Not available'],
            ['90-day retention', 'Not available'],
          ].map(([label, value]) => (
            <div key={label} className="bg-[#181818] p-5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#666666]" />
                <p className="text-sm font-medium text-[#eeeeee]">{label}</p>
              </div>
              <p className="mt-5 text-xs text-[#666666]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-[#eeeeee]">Conversion & Churn</h3>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
          <div className="bg-[#181818] p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#666666]" />
              <p className="text-sm font-medium text-[#eeeeee]">Free → Pro conversion</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#666666]">
              Available after subscription and billing integration.
            </p>
          </div>

          <div className="bg-[#181818] p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#666666]" />
              <p className="text-sm font-medium text-[#eeeeee]">Churn analytics</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#666666]">
              Available after subscription tracking is implemented.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
