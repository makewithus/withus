'use client';

import React, { useEffect, useState } from 'react';
import { superAdminApi } from '../../../lib/api/superadmin';
import {
  Activity,
  AlertTriangle,
  Check,
  Clock,
  Eye,
  Loader2,
  Shield,
  Vault,
} from 'lucide-react';
import { formatDate } from '../../../lib/formatters';

type VaultAnalytics = {
  summary: {
    totalVaults: number;
    totalSecrets: number;
    activeSessions: number;
    totalReveals: number;
  };
  secretsByType: { type: string; count: number }[];
  secretsByStatus: { status: string; count: number }[];
  topVaults: {
    id: string;
    name: string;
    orgName: string;
    orgId: string;
    secretCount: number;
  }[];
  topRevealedSecrets: {
    id: string;
    name: string;
    type: string;
    revealCount: number;
    lastRevealedAt: string | null;
    vaultName: string;
    orgName: string;
  }[];
  sessionsByScope: { scope: string; count: number }[];
  recentActivity: {
    id: string;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    createdAt: string;
    actor: { email: string; fullName: string } | null;
    organization: { name: string } | null;
  }[];
};

const SECRET_TYPE_LABELS: Record<string, string> = {
  PASSWORD: 'Password',
  API_KEY: 'API Key',
  TOKEN: 'Token',
  SSH_KEY: 'SSH Key',
  CERTIFICATE: 'Certificate',
  OAUTH: 'OAuth Token',
  COOKIE: 'Cookie',
  TEXT: 'Text',
  JSON: 'JSON',
  OTHER: 'Other',
};

const SECRET_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  DISABLED: 'Disabled',
  PENDING_ROTATION: 'Pending Rotation',
  DELETED: 'Deleted',
};

const SCOPE_LABELS: Record<string, string> = {
  VAULT: 'Vault',
  SECRET: 'Secret',
  INTEGRATION: 'Integration',
};

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-[#181818] px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Icon className="h-3.5 w-3.5 text-zinc-600" />
        {label}
      </div>
      <p className="mt-1.5 text-xl font-medium text-zinc-100">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-1 bg-[#141414] px-4 py-2.5">
      <button
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        className="px-3 py-1.5 text-xs text-zinc-500 hover:bg-[#242424] hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Previous
      </button>
      <span className="px-2 text-xs text-zinc-600">
        {page} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        className="px-3 py-1.5 text-xs text-zinc-500 hover:bg-[#242424] hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}

export default function VaultAnalyticsPage() {
  const [data, setData] = useState<VaultAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [topVaultsPage, setTopVaultsPage] = useState(1);
  const [topSecretsPage, setTopSecretsPage] = useState(1);
  const [recentActivityPage, setRecentActivityPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);

    superAdminApi
      .getVaultAnalytics()
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load vault analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading vault analytics...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl bg-[#181818] px-5 py-12 text-center text-sm text-zinc-500">
        <p>{error || 'No data available.'}</p>
      </div>
    );
  }

  const {
    summary,
    secretsByType,
    secretsByStatus,
    topVaults,
    topRevealedSecrets,
    sessionsByScope,
    recentActivity,
  } = data;

  const VAULTS_LIMIT = 5;
  const totalVaultPages = Math.max(
    1,
    Math.ceil(topVaults.length / VAULTS_LIMIT)
  );
  const paginatedTopVaults = topVaults.slice(
    (topVaultsPage - 1) * VAULTS_LIMIT,
    topVaultsPage * VAULTS_LIMIT
  );

  const SECRETS_LIMIT = 5;
  const totalSecretsPages = Math.max(
    1,
    Math.ceil(topRevealedSecrets.length / SECRETS_LIMIT)
  );
  const paginatedTopSecrets = topRevealedSecrets.slice(
    (topSecretsPage - 1) * SECRETS_LIMIT,
    topSecretsPage * SECRETS_LIMIT
  );

  const ACTIVITY_LIMIT = 10;
  const totalActivityPages = Math.max(
    1,
    Math.ceil(recentActivity.length / ACTIVITY_LIMIT)
  );
  const paginatedActivity = recentActivity.slice(
    (recentActivityPage - 1) * ACTIVITY_LIMIT,
    recentActivityPage * ACTIVITY_LIMIT
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Vault Analytics
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Vault, secret, session, and access activity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Vaults" value={summary.totalVaults} icon={Vault} />
        <Stat label="Secrets" value={summary.totalSecrets} icon={Shield} />
        <Stat
          label="Active Sessions"
          value={summary.activeSessions}
          icon={Activity}
        />
        <Stat label="Reveals" value={summary.totalReveals} icon={Eye} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="bg-[#181818]">
          <div className="bg-[#202020] px-4 py-3">
            <h2 className="text-sm font-medium text-zinc-200">
              Secrets by Type
            </h2>
          </div>

          {secretsByType.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-zinc-600">
              No secrets found.
            </div>
          ) : (
            <div>
              {secretsByType.map(({ type, count }) => {
                const total = secretsByType.reduce((sum, item) => sum + item.count, 0);
                const pct = total ? Math.round((count / total) * 100) : 0;

                return (
                  <div
                    key={type}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-[#202020]"
                  >
                    <span className="w-28 shrink-0 text-sm text-zinc-400">
                      {SECRET_TYPE_LABELS[type] || type}
                    </span>

                    <div className="h-1.5 flex-1 bg-[#242424]">
                      <div
                        className="h-full bg-zinc-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="w-12 text-right text-sm text-zinc-300">
                      {count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="space-y-3">
          <section className="bg-[#181818]">
            <div className="bg-[#202020] px-4 py-3">
              <h2 className="text-sm font-medium text-zinc-200">
                Secrets by Status
              </h2>
            </div>

            <div>
              {secretsByStatus.map(({ status, count }) => (
                <div
                  key={status}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#202020]"
                >
                  <span className="text-sm text-zinc-400">
                    {SECRET_STATUS_LABELS[status] || status}
                  </span>
                  <span className="text-sm font-medium text-zinc-200">
                    {count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#181818]">
            <div className="bg-[#202020] px-4 py-3">
              <h2 className="text-sm font-medium text-zinc-200">
                Sessions by Scope
              </h2>
            </div>

            {sessionsByScope.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-zinc-600">
                No sessions found.
              </div>
            ) : (
              <div>
                {sessionsByScope.map(({ scope, count }) => (
                  <div
                    key={scope}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#202020]"
                  >
                    <span className="text-sm text-zinc-400">
                      {SCOPE_LABELS[scope] || scope}
                    </span>
                    <span className="text-sm font-medium text-zinc-200">
                      {count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <section className="overflow-hidden bg-[#181818]">
        <div className="bg-[#202020] px-4 py-3">
          <h2 className="text-sm font-medium text-zinc-200">
            Top Vaults by Secret Count
          </h2>
        </div>

        {topVaults.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-zinc-600">
            No vaults found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#1d1d1d]">
                  <tr>
                    {['Vault', 'Organisation', 'Secrets'].map((heading, index) => (
                      <th
                        key={heading}
                        className={`px-4 py-3 text-left text-xs font-medium text-zinc-500 ${
                          index === 2 ? 'text-right' : ''
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedTopVaults.map((vault) => (
                    <tr
                      key={vault.id}
                      className="hover:bg-[#202020]"
                    >
                      <td className="px-4 py-3.5 text-sm text-zinc-300">
                        {vault.name}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-zinc-500">
                        {vault.orgName}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm text-zinc-300">
                        {vault.secretCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={topVaultsPage}
              totalPages={totalVaultPages}
              setPage={setTopVaultsPage}
            />
          </>
        )}
      </section>

      <section className="overflow-hidden bg-[#181818]">
        <div className="bg-[#202020] px-4 py-3">
          <h2 className="text-sm font-medium text-zinc-200">
            Most Revealed Secrets
          </h2>
        </div>

        {topRevealedSecrets.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-zinc-600">
            No secrets have been revealed yet.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#1d1d1d]">
                  <tr>
                    {['Secret', 'Type', 'Vault', 'Organisation', 'Reveals', 'Last Revealed'].map(
                      (heading, index) => (
                        <th
                          key={heading}
                          className={`px-4 py-3 text-left text-xs font-medium text-zinc-500 ${
                            index >= 4 ? 'text-right' : ''
                          }`}
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedTopSecrets.map((secret) => (
                    <tr
                      key={secret.id}
                      className="hover:bg-[#202020]"
                    >
                      <td className="px-4 py-3.5 text-sm text-zinc-300">
                        {secret.name}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-zinc-500">
                        {SECRET_TYPE_LABELS[secret.type] || secret.type}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-zinc-500">
                        {secret.vaultName}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-zinc-500">
                        {secret.orgName}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm text-zinc-300">
                        {secret.revealCount}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm text-zinc-500">
                        {secret.lastRevealedAt
                          ? formatDate(secret.lastRevealedAt)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={topSecretsPage}
              totalPages={totalSecretsPages}
              setPage={setTopSecretsPage}
            />
          </>
        )}
      </section>

      <section className="overflow-hidden bg-[#181818]">
        <div className="bg-[#202020] px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Activity className="h-4 w-4 text-zinc-500" />
            Recent Vault Activity
          </h2>
        </div>

        {recentActivity.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Clock className="mx-auto mb-2 h-5 w-5 text-zinc-600" />
            <p className="text-sm text-zinc-600">
              No vault activity recorded yet.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#1d1d1d]">
                  <tr>
                    {['Action', 'Actor', 'Organisation', 'Resource', 'Timestamp'].map(
                      (heading, index) => (
                        <th
                          key={heading}
                          className={`px-4 py-3 text-left text-xs font-medium text-zinc-500 ${
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
                  {paginatedActivity.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-[#202020]"
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap text-sm text-zinc-300">
                        {event.action}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-sm text-zinc-500">
                        {event.actor?.email ?? 'System'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-sm text-zinc-500">
                        {event.organization?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-sm text-zinc-500">
                        {event.resourceType ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right text-sm text-zinc-500">
                        {formatDate(event.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={recentActivityPage}
              totalPages={totalActivityPages}
              setPage={setRecentActivityPage}
            />
          </>
        )}
      </section>
    </div>
  );
}
