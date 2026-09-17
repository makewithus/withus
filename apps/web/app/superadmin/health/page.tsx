'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { superAdminApi } from '../../../lib/api/superadmin';
import { HeartPulse, Database, Cpu, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '../../../lib/formatters';

type HealthStatus = 'operational' | 'degraded' | 'down' | 'unknown';

export default function SystemHealthPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [errorEvents, setErrorEvents] = useState<any[]>([]);
  const [errorsLoading, setErrorsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await superAdminApi.getSystemHealth();
      setData(res.data);
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e?.message || 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const apiStatus: HealthStatus = data?.api?.status || 'unknown';
  const dbStatus: HealthStatus = data?.database?.status || 'unknown';
  const dbLatency: number = data?.database?.latencyMs || 0;
  const integrations: any[] = data?.integrations || [];
  const errorEventsLastHour: number = data?.errorEventsLastHour || 0;

  // Group integration statuses
  const integrationMap = new Map<string, Record<string, number>>();
  for (const row of integrations) {
    if (!integrationMap.has(row.provider)) integrationMap.set(row.provider, {});
    integrationMap.get(row.provider)![row.status] = row.count;
  }

  // Load error events when errors tab is active
  useEffect(() => {
    if (tabParam !== 'errors') return;
    setErrorsLoading(true);
    superAdminApi.getGlobalAudit({ page: 1, limit: 100 })
      .then((res) => {
        const all = res.data?.data || [];
        const errors = all.filter((e: any) =>
          e.action?.includes('fail') ||
          e.action?.includes('error') ||
          e.action?.includes('denied') ||
          e.action?.includes('revoked') ||
          e.action?.includes('unauthorized') ||
          e.action?.includes('revoke_failed') ||
          e.action === 'integration.error'
        );
        setErrorEvents(errors);
      })
      .finally(() => setErrorsLoading(false));
  }, [tabParam]);

  const [errorsPage, setErrorsPage] = useState(1);

  // ── Errors tab early return ───────────────────────────────────────────────
  if (tabParam === 'errors') {
    const LIMIT = 10;
    const totalErrorPages = Math.max(1, Math.ceil(errorEvents.length / LIMIT));
    const paginatedErrors = errorEvents.slice((errorsPage - 1) * LIMIT, errorsPage * LIMIT);

    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
              Error Events
            </h2>
            <p className="mt-1 text-sm text-[#777777]">
              Recent error and failure events from the platform audit log.
            </p>
          </div>
          <p className="shrink-0 text-sm text-[#777777]">
            {errorEvents.length} events
          </p>
        </div>

        <div className="overflow-hidden bg-[#181818]">
          {errorsLoading ? (
            <div className="px-5 py-14 text-center">
              <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-[#777777]" />
              <p className="text-sm text-[#777777]">Loading error events...</p>
            </div>
          ) : errorEvents.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-6 w-6 text-[#eeeeee]" />
              <p className="text-sm text-[#777777]">
                No error events found in the recent audit log.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="bg-[#1f1f1f]">
                      {['Action', 'Actor', 'Organisation', 'Resource', 'Timestamp'].map((h, i) => (
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
                    {paginatedErrors.map((e: any) => (
                      <tr key={e.id} className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]">
                        <td className="px-5 py-4 text-sm font-medium text-[#eeeeee]">{e.action}</td>
                        <td className="px-5 py-4 text-sm text-[#b0b0b0]">
                          {e.actor?.email ?? <span className="text-[#555555]">System</span>}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#b0b0b0]">
                          {e.organization?.name ?? <span className="text-[#555555]">—</span>}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#b0b0b0]">
                          {e.resourceType ?? <span className="text-[#555555]">—</span>}
                        </td>
                        <td className="px-5 py-4 text-right text-sm text-[#b0b0b0]">
                          {formatDate(e.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalErrorPages > 1 && (
                <div className="flex items-center justify-between bg-[#141414] px-5 py-3">
                  <p className="text-sm text-[#666666]">
                    Page <span className="text-[#eeeeee]">{errorsPage}</span> of{' '}
                    <span className="text-[#eeeeee]">{totalErrorPages}</span>
                  </p>
                  <div className="flex gap-1">
                    <button
                      disabled={errorsPage <= 1}
                      onClick={() => setErrorsPage((p) => Math.max(1, p - 1))}
                      className="bg-[#242424] px-3 py-2 text-xs font-medium text-[#cccccc] transition-colors hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Previous
                    </button>
                    <button
                      disabled={errorsPage >= totalErrorPages}
                      onClick={() => setErrorsPage((p) => Math.min(totalErrorPages, p + 1))}
                      className="bg-[#242424] px-3 py-2 text-xs font-medium text-[#cccccc] transition-colors hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
            System Health
          </h2>
          <p >
            {lastRefresh && (
              <span className="ml-2 text-[#555555]">
              Last updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#eeeeee] px-3.5 py-2.5 text-sm font-medium text-[#111111] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-[#666666]"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#181818] px-4 py-3 text-sm text-[#b0b0b0]">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#888888]" />
          {error}
        </div>
      )}

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-medium text-[#eeeeee]">Core Services</h3>
        </div>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
          {[
            {
              title: 'API Server',
              detail: 'Application service',
              icon: HeartPulse,
              status: apiStatus,
              latency: null,
            },
            {
              title: 'Database',
              detail: 'Primary data store',
              icon: Database,
              status: dbStatus,
              latency: dbLatency > 0 ? `${dbLatency}ms` : null,
            },
          ].map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="bg-[#181818] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center bg-[#242424] text-[#888888]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#eeeeee]">{service.title}</p>
                    <p className="mt-0.5 text-xs text-[#666666]">{service.detail}</p>
                  </div>
                </div>

                <div className="mt-6">
                  {loading ? (
                    <div className="h-6 w-24 animate-pulse bg-[#242424]" />
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {service.status === 'operational' ? (
                          <CheckCircle2 className="h-4 w-4 text-[#eeeeee]" />
                        ) : service.status === 'degraded' ? (
                          <AlertTriangle className="h-4 w-4 text-[#999999]" />
                        ) : (
                          <Clock className="h-4 w-4 text-[#555555]" />
                        )}
                        <span className="text-sm font-medium capitalize text-[#dddddd]">
                          {service.status}
                        </span>
                      </div>
                      {service.latency && (
                        <span className="text-xs text-[#666666]">{service.latency}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="bg-[#181818] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-[#242424] text-[#888888]">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#eeeeee]">Server</p>
                <p className="mt-0.5 text-xs text-[#666666]">Runtime monitoring</p>
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="h-6 w-28 animate-pulse bg-[#242424]" />
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#eeeeee]" />
                  <span className="text-sm font-medium text-[#dddddd]">
                    Heap threshold: 150 MB
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-medium text-[#eeeeee]">Integration Status</h3>
        </div>

        <div className="overflow-x-auto bg-[#181818]">
          {loading ? (
            <div className="h-40 animate-pulse bg-[#242424]" />
          ) : (
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="bg-[#1f1f1f]">
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Platform</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Active</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Failed</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Disconnected</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">Status</th>
                </tr>
              </thead>
              <tbody>
                {['VERCEL', 'GITHUB', 'GODADDY', 'GMAIL'].map((provider) => {
                  const stats = integrationMap.get(provider) || {};
                  const active = stats['ACTIVE'] || 0;
                  const failed = stats['ERROR'] || 0;
                  const disconnected = stats['DISCONNECTED'] || 0;
                  const overallStatus =
                    failed > 0 ? 'ERROR' : active > 0 ? 'ACTIVE' : 'DISCONNECTED';

                  return (
                    <tr
                      key={provider}
                      className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-[#eeeeee]">{provider}</td>
                      <td className="px-5 py-4 text-sm text-[#b0b0b0]">{active}</td>
                      <td className="px-5 py-4 text-sm text-[#b0b0b0]">{failed}</td>
                      <td className="px-5 py-4 text-sm text-[#777777]">{disconnected}</td>
                      <td className="px-5 py-4 text-xs font-medium text-[#999999]">
                        {overallStatus.replace('_', ' ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
