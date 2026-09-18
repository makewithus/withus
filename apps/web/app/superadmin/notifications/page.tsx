'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { superAdminApi } from '../../../lib/api/superadmin';
import {
  AlertCircle,
  Info,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

type AlertLevel = 'critical' | 'warning' | 'info';

function AlertCard({
  level,
  title,
  message,
  time,
}: {
  level: AlertLevel;
  title: string;
  message: string;
  time?: string | Date | null;
}) {
  const iconMap = {
    critical: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = iconMap[level];

  return (
    <div className="flex items-start gap-3 bg-[#181818] px-5 py-4 transition-colors hover:bg-[#1d1d1d]">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#777777]" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs font-medium text-[#bbbbbb]">
            {level === 'critical'
              ? 'Critical'
              : level === 'warning'
                ? 'Warning'
                : 'Information'}
          </span>

          {time && (
            <span className="text-xs text-[#666666]">
              {new Date(time).toLocaleString()}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm font-medium text-[#eeeeee]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#777777]">{message}</p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await superAdminApi.getNotifications();
      setData(res.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const alerts: any[] = data?.alerts || [];
  const recentAdminActions: any[] = data?.recentAdminActions || [];

  const criticals = alerts.filter((a) => a.level === 'critical');
  const warnings = alerts.filter((a) => a.level === 'warning');
  const infos = alerts.filter((a) => a.level === 'info');

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
            Notifications & Alerts
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
        <div className="flex items-center gap-3 bg-[#181818] px-5 py-4">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#777777]" />
          <span className="text-sm text-[#cccccc]">{error}</span>
        </div>
      )}

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-medium text-[#cccccc]">Active Alerts</h3>
        </div>

        {loading ? (
          <div className="space-y-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse bg-[#181818]"
              />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center gap-3 bg-[#181818] px-5 py-6">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#888888]" />
            <div>
              <p className="text-sm font-medium text-[#eeeeee]">
                All systems normal
              </p>
              <p className="mt-1 text-sm text-[#777777]">
                No active alerts at this time.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-px">
            {criticals.map((a, i) => (
              <AlertCard
                key={`c-${i}`}
                level="critical"
                title={a.title}
                message={a.message}
                time={a.time}
              />
            ))}
            {warnings.map((a, i) => (
              <AlertCard
                key={`w-${i}`}
                level="warning"
                title={a.title}
                message={a.message}
                time={a.time}
              />
            ))}
            {infos.map((a, i) => (
              <AlertCard
                key={`i-${i}`}
                level="info"
                title={a.title}
                message={a.message}
                time={a.time}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-medium text-[#cccccc]">Future Alert Types</h3>
        </div>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
          {[
            {
              title: 'High Error Rate',
              note: 'Requires error rate monitoring middleware',
            },
            {
              title: 'New Pro Customer',
              note: 'Requires billing & subscription integration',
            },
            {
              title: 'Plan Upgrade / Downgrade',
              note: 'Requires subscription lifecycle tracking',
            },
            {
              title: 'Security Anomaly Detection',
              note: 'Requires pattern analysis over audit events',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-[#181818] px-5 py-4 transition-colors hover:bg-[#1d1d1d]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#eeeeee]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#777777]">
                    {item.note}
                  </p>
                </div>

                <span className="shrink-0 text-xs font-medium text-[#666666]">
                  Coming Soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {recentAdminActions.length > 0 && (
        <section>
          <div className="mb-3">
            <h3 className="text-sm font-medium text-[#cccccc]">
              Recent Admin Actions
              <span className="ml-2 text-[#666666]">(7 days)</span>
            </h3>
          </div>

          <div className="overflow-x-auto bg-[#181818]">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-[#1f1f1f]">
                <tr>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">
                    Action
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">
                    Admin
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-[#777777]">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentAdminActions.map((evt: any) => (
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
