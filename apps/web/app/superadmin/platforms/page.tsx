'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  GitBranch,
  Globe,
  Layers,
  Mail,
  Puzzle,
  Search,
  Server,
  Shield,
  Share2,
  Triangle,
  Wallet,
  XCircle,
  Zap,
  ShoppingBag,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { superAdminApi } from '../../../lib/api/superadmin';
import { formatDate } from '../../../lib/formatters';

type AutofillSupport = 'full' | 'partial' | 'manual_step';

type VaultPlatform = {
  id: string;
  name: string;
  category: string;
  autofillSupport: AutofillSupport;
  nativeApiIntegration: boolean;
  otpSupport: boolean;
  otpType?: string;
  limitations: string | null;
  integrationConnections: {
    total: number;
    active: number;
    failed: number;
    disconnected: number;
  } | null;
  nativeSessionCount: number | null;
  activePresenceCount: number | null;
  analyticsNote: string | null;
};

type IntegrationStat = {
  provider: string;
  total: number;
  active: number;
  failed: number;
  disconnected: number;
  orgs: number;
  sessions: number;
};

function PlatformIcon({ platformId }: { platformId: string }) {
  const icons: Record<string, React.ReactNode> = {
    GITHUB: <GitBranch className="h-4 w-4" />,
    VERCEL: <Triangle className="h-4 w-4 fill-current" />,
    GODADDY: <Globe className="h-4 w-4" />,
    GMAIL: <Mail className="h-4 w-4" />,
    SHOPIFY: <ShoppingBag className="h-4 w-4" />,
    STRIPE: <CreditCard className="h-4 w-4" />,
    RAZORPAY: <Wallet className="h-4 w-4" />,
    LINKEDIN: <Share2 className="h-4 w-4" />,
    MCA: <Landmark className="h-4 w-4" />,
    GST: <ShieldCheck className="h-4 w-4" />,
    UDYAM: <FileText className="h-4 w-4" />,
  };

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#242424] text-zinc-300">
      {icons[platformId] ?? <Server className="h-4 w-4" />}
    </div>
  );
}

function ProviderIcon({ provider }: { provider: string }) {
  return <PlatformIcon platformId={provider} />;
}

function Capability({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${muted ? 'text-zinc-600' : 'text-zinc-400'}`}>
      <Check className={`h-3.5 w-3.5 ${muted ? 'text-zinc-700' : 'text-zinc-500'}`} />
      {children}
    </span>
  );
}

function PlatformEcosystemTab() {
  const [platforms, setPlatforms] = useState<VaultPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setLoading(true);
    superAdminApi
      .getPlatformEcosystem()
      .then((res) => setPlatforms(res.data?.platforms || []))
      .catch(() => setError('Failed to load platform ecosystem data.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(platforms.map((p) => p.category)))],
    [platforms]
  );

  const filteredPlatforms = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return platforms.filter((platform) => {
      const matchesSearch =
        !query ||
        platform.name.toLowerCase().includes(query) ||
        platform.category.toLowerCase().includes(query) ||
        platform.id.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'all' || platform.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [platforms, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Zap className="h-4 w-4 animate-pulse" />
          Loading platforms...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 bg-[#181818] p-4 text-sm text-zinc-400">
        <XCircle className="h-4 w-4 text-zinc-500" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search platforms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full bg-[#181818] pl-9 pr-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:bg-[#202020]"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs transition-colors ${
                selectedCategory === category
                  ? 'bg-[#242424] text-zinc-100'
                  : 'text-zinc-500 hover:bg-[#181818] hover:text-zinc-300'
              }`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      {filteredPlatforms.length === 0 ? (
        <div className="bg-[#181818] py-14 text-center text-sm text-zinc-500">
          No platforms match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredPlatforms.map((platform) => (
            <div
              key={platform.id}
              className="bg-[#181818] p-4 transition-colors hover:bg-[#1d1d1d]"
            >
              <div className="flex items-start gap-3">
                <PlatformIcon platformId={platform.id} />

                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-zinc-100">
                    {platform.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    {platform.category}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                <Capability>
                  {platform.autofillSupport === 'full'
                    ? 'Full autofill'
                    : platform.autofillSupport === 'partial'
                      ? 'Partial autofill'
                      : 'Autofill + manual step'}
                </Capability>

                <Capability muted={!platform.nativeApiIntegration}>
                  {platform.nativeApiIntegration
                    ? 'Native API'
                    : 'Vault autofill'}
                </Capability>

                {platform.otpSupport && (
                  <Capability>{platform.otpType || 'OTP support'}</Capability>
                )}
              </div>

              {(platform.limitations || platform.analyticsNote) && (
                <div className="mt-4 flex gap-2 bg-[#202020] p-3 text-xs leading-relaxed text-zinc-500">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
                  <span>{platform.limitations || platform.analyticsNote}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IntegrationConnectionsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    superAdminApi
      .getPlatformStats()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const stats: IntegrationStat[] = data?.stats || [];
  const recentActivity: any[] = data?.recentActivity || [];

  const LIMIT = 10;
  const totalPages = Math.max(1, Math.ceil(recentActivity.length / LIMIT));
  const paginatedActivity = recentActivity.slice(
    (page - 1) * LIMIT,
    page * LIMIT
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Zap className="h-4 w-4 animate-pulse" />
          Loading integrations...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {stats.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.provider} className="bg-[#181818] p-4">
              <div className="flex items-center gap-3">
                <ProviderIcon provider={stat.provider} />
                <div>
                  <h3 className="text-sm font-medium text-zinc-100">
                    {stat.provider}
                  </h3>
                  <p className="text-xs text-zinc-600">
                    {stat.total} total connections
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#202020] py-2">
                  <p className="text-[10px] text-zinc-600">Active</p>
                  <p className="mt-0.5 text-sm font-medium text-zinc-300">
                    {stat.active}
                  </p>
                </div>
                <div className="bg-[#202020] py-2">
                  <p className="text-[10px] text-zinc-600">Failed</p>
                  <p className="mt-0.5 text-sm font-medium text-zinc-300">
                    {stat.failed}
                  </p>
                </div>
                <div className="bg-[#202020] py-2">
                  <p className="text-[10px] text-zinc-600">Sessions</p>
                  <p className="mt-0.5 text-sm font-medium text-zinc-300">
                    {stat.sessions}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recentActivity.length > 0 && (
        <section className="overflow-hidden bg-[#181818]">
          <div className="flex items-center gap-2 bg-[#202020] px-5 py-3">
            <Activity className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-medium text-zinc-200">
              Recent Integration Activity
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#1d1d1d]">
                <tr>
                  {['Action', 'Organisation', 'Actor', 'Timestamp'].map(
                    (heading, index) => (
                      <th
                        key={heading}
                        className={`px-5 py-3 text-left text-xs font-medium text-zinc-500 ${
                          index === 3 ? 'text-right' : ''
                        }`}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedActivity.map((event: any) => (
                  <tr
                    key={event.id}
                    className="transition-colors hover:bg-[#202020]"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-zinc-300">
                      {event.action}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-zinc-400">
                      {event.organization?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-zinc-400">
                      {event.actor?.email ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs text-zinc-500">
                      {formatDate(event.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-[#141414] px-5 py-3">
              <p className="text-xs text-zinc-600">
                Page <span className="text-zinc-400">{page}</span> of{' '}
                <span className="text-zinc-400">{totalPages}</span>
              </p>

              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:bg-[#242424] disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:bg-[#242424] disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {stats.length === 0 && recentActivity.length === 0 && (
        <div className="bg-[#181818] py-14 text-center text-sm text-zinc-500">
          No integration data available.
        </div>
      )}
    </div>
  );
}

export default function SuperAdminPlatformsPage() {
  const searchParams = useSearchParams();
  const isConnectionsTab = searchParams?.get('tab') === 'connections';

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-zinc-100">
            <Puzzle className="h-5 w-5 text-zinc-500" />
            WITHUS Platforms
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isConnectionsTab
              ? 'Native API integration connections.'
              : 'Supported Vault and browser-extension platforms.'}
          </p>
        </div>

        <nav className="flex gap-1">
          <a
            href="/superadmin/platforms"
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              !isConnectionsTab
                ? 'bg-[#242424] text-zinc-100'
                : 'text-zinc-500 hover:bg-[#181818] hover:text-zinc-300'
            }`}
          >
            Platform Ecosystem
          </a>
          <a
            href="/superadmin/platforms?tab=connections"
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              isConnectionsTab
                ? 'bg-[#242424] text-zinc-100'
                : 'text-zinc-500 hover:bg-[#181818] hover:text-zinc-300'
            }`}
          >
            Integration Connections
          </a>
        </nav>
      </div>

      {isConnectionsTab ? (
        <IntegrationConnectionsTab />
      ) : (
        <PlatformEcosystemTab />
      )}
    </div>
  );
}
