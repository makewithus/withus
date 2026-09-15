'use client';

import React, { useState } from 'react';
import { DashboardShell } from '../../../components/layout/DashboardShell';
import { useAuth } from '../../../lib/auth/AuthContext';
import {
  useIntegrations,
  useConnectIntegration,
  useDisconnectIntegration,
  useHealthCheck,
  useOAuthUrl,
  useAnalyzePortal,
} from '../../../hooks/useIntegrations';
import { useToast } from '../../../components/common/Toast';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { formatDateTime } from '../../../lib/formatters';
import { PromptModal } from '../../../components/common/PromptModal';
import { hasPermission } from '../../../lib/auth/permissions';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Link2,
  Link2Off,
  ExternalLink,
  Loader2,
  Globe,
  Code2,
  Zap,
  Mail,
} from 'lucide-react';
import type { IntegrationProvider, IntegrationConnection } from '../../../lib/api/integrations';

// ─── Provider Metadata ────────────────────────────────────────────────────────

const PROVIDERS: {
  id: IntegrationProvider;
  name: string;
  description: string;
  docsUrl: string;
  authenticationType: 'PAT' | 'OAUTH';
  // Required only if authenticationType === 'PAT'
  patUrl?: string;
  patHint?: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'GMAIL',
    name: 'Gmail',
    description: 'Connect your Gmail account to allow WITHUS to extract OTPs sent to your organization inbox automatically.',
    docsUrl: 'https://developers.google.com/gmail/api',
    authenticationType: 'OAUTH',
    icon: <Mail className="w-5 h-5" />,
  },
  {
    id: 'VERCEL',
    name: 'Vercel',
    description: 'Native Vercel Integration. Requires Vercel Pro Team. Hobby plans do not support team invitations.',
    docsUrl: 'https://vercel.com/docs/rest-api',
    patUrl: 'https://vercel.com/account/tokens',
    patHint: 'Create a token at vercel.com/account/tokens. Requires "Full Account" scope.',
    authenticationType: 'PAT',
    icon: <span className="text-lg font-bold">▲</span>,
  },
  {
    id: 'GITHUB',
    name: 'GitHub',
    description: 'Native GitHub Integration. Manage repository access automatically.',
    docsUrl: 'https://docs.github.com/en/rest',
    patUrl: 'https://github.com/settings/tokens',
    patHint: 'Create a PAT (classic) with: read:org, admin:org, repo. Or a Fine-grained token with org access.',
    authenticationType: 'PAT',
    icon: <Code2 className="w-5 h-5" />,
  },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE')
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#eeeeee]">
        <CheckCircle className="h-3.5 w-3.5" /> Connected
      </span>
    );

  if (status === 'ERROR')
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#b0b0b0]">
        <AlertCircle className="h-3.5 w-3.5" /> Error
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#666666]">
      <XCircle className="h-3.5 w-3.5" /> Not connected
    </span>
  );
}

// ─── Integration Card ─────────────────────────────────────────────────────────

function IntegrationCard({
  provider,
  connection,
  onConnect,
  onDisconnect,
  onHealthCheck,
  isCheckingHealth,
  canManage,
}: {
  provider: typeof PROVIDERS[0];
  connection?: IntegrationConnection;
  onConnect: (provider: IntegrationProvider) => void;
  onDisconnect: (provider: IntegrationProvider) => void;
  onHealthCheck: (provider: IntegrationProvider) => void;
  isCheckingHealth: boolean;
  canManage: boolean;
}) {
  const isConnected = connection?.status === 'ACTIVE' || connection?.status === 'ERROR';

  return (
    <div className="bg-[#181818] p-5 transition-colors duration-150 hover:bg-[#1d1d1d]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#242424] text-[#a0a0a0]">
            {provider.icon}
          </div>
          <p className="truncate text-[15px] font-semibold text-[#eeeeee]">{provider.name}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={connection?.status || 'DISCONNECTED'} />
          <a
            href={provider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-[#666666] transition-colors hover:text-[#dddddd]"
            title="Documentation"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm leading-5 text-[#777777]">
        {provider.description}
      </p>

      {/* Last checked */}
      {connection?.lastCheckedAt && (
        <p className="mb-3 text-xs text-[#666666]">
          Last checked: {formatDateTime(connection.lastCheckedAt)}
          {(connection.providerMeta as any)?.identity && ` · ${(connection.providerMeta as any).identity}`}
        </p>
      )}

      {/* Error */}
      {connection?.lastError && (
        <p className="mb-3 bg-[#111111] px-3 py-2 text-xs leading-5 text-[#999999]">
          {connection.lastError}
        </p>
      )}

      {/* Actions */}
      {canManage && (
        <div className="mt-5 flex items-center gap-2 pt-1">
          {isConnected ? (
            <>
              <button
                onClick={() => onDisconnect(provider.id)}
                className="inline-flex items-center justify-center bg-[#242424] px-3 py-2 text-xs font-medium text-[#dddddd] transition-colors hover:bg-[#2c2c2c]"
              >
                <Link2Off className="w-3 h-3 mr-1" />
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={() => onConnect(provider.id)}
              className="inline-flex items-center justify-center bg-[#eeeeee] px-3 py-2 text-xs font-medium text-[#111111] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-[#666666]"
            >
              <Link2 className="w-3.5 h-3.5 mr-1" />
              Connect
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Connect Modal ────────────────────────────────────────────────────────────

function ConnectModal({
  provider,
  onClose,
  onConfirm,
  isPending,
}: {
  provider: typeof PROVIDERS[0] | null;
  onClose: () => void;
  onConfirm: (token: string) => void;
  isPending: boolean;
}) {
  if (!provider) return null;
  return (
    <PromptModal
      isOpen={!!provider}
      title={`Connect ${provider.name}`}
      message={provider.patHint || ''}
      label="Personal Access Token"
      placeholder="Paste your PAT here…"
      confirmLabel="Connect"
      required
      isPending={isPending}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { organization, user } = useAuth();
  const orgId = organization?.id || '';
  const { data: connections = [], isLoading } = useIntegrations(orgId);
  const { mutate: connectIntegration, isPending: isConnecting } = useConnectIntegration(orgId);
  const { mutate: disconnectIntegration, isPending: isDisconnecting } = useDisconnectIntegration(orgId);
  const { mutate: runHealthCheck, isPending: isCheckingHealth } = useHealthCheck(orgId);
  const { mutate: getOAuthUrl } = useOAuthUrl(orgId);
  const { toast } = useToast();

  const canManage = hasPermission((organization as any)?.role, 'INTEGRATION_CONNECT');

  const [connectingProvider, setConnectingProvider] = useState<typeof PROVIDERS[0] | null>(null);
  const [disconnectingProvider, setDisconnectingProvider] = useState<IntegrationProvider | null>(null);

  // Custom Portal Analysis State
  const [portalUrl, setPortalUrl] = useState('');
  const [portalResult, setPortalResult] = useState<{ compatible: boolean; platform: string | null; reason?: string } | null>(null);
  const { mutate: analyzePortal, isPending: isAnalyzing } = useAnalyzePortal(orgId);

  const handleInitiateConnect = (provider: typeof PROVIDERS[0]) => {
    if (provider.authenticationType === 'PAT') {
      setConnectingProvider(provider);
    } else if (provider.authenticationType === 'OAUTH') {
      getOAuthUrl(provider.id, {
        onSuccess: (data) => {
          if (data.url) window.location.href = data.url;
        },
        onError: (err: any) => {
          toast('error', err?.response?.data?.message || `Failed to initiate OAuth for ${provider.name}`);
        }
      });
    }
  };

  const handleConnect = (token: string) => {
    if (!connectingProvider) return;
    connectIntegration(
      { provider: connectingProvider.id, token },
      {
        onSuccess: (data) => {
          toast('success', `${connectingProvider.name} connected as ${data.identity}`);
          setConnectingProvider(null);
        },
        onError: (err: any) => {
          toast('error', err?.response?.data?.message || `Failed to connect ${connectingProvider.name}`);
        },
      },
    );
  };

  const handleDisconnect = () => {
    if (!disconnectingProvider) return;
    const name = PROVIDERS.find((p) => p.id === disconnectingProvider)?.name || disconnectingProvider;
    disconnectIntegration(disconnectingProvider, {
      onSuccess: () => {
        toast('success', `${name} disconnected.`);
        setDisconnectingProvider(null);
      },
      onError: (err: any) => {
        toast('error', err?.response?.data?.message || `Failed to disconnect ${name}`);
      },
    });
  };

  const handleHealthCheck = (provider: IntegrationProvider) => {
    const name = PROVIDERS.find((p) => p.id === provider)?.name || provider;
    runHealthCheck(provider, {
      onSuccess: (result) => {
        if (result.healthy) {
          toast('success', `${name} connection is healthy. ${result.identity ? `(${result.identity})` : ''}`);
        } else {
          toast('error', `${name} connection failed: ${result.error}`);
        }
      },
      onError: () => toast('error', `Health check for ${name} failed.`),
    });
  };

  const handleAnalyzePortal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalUrl.trim()) return;
    analyzePortal(portalUrl, {
      onSuccess: (data: any) => {
        setPortalResult(data);
      },
      onError: () => {
        setPortalResult({ compatible: false, platform: null, reason: 'error' });
      },
    });
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
            Integrations
          </h1>
          <p className="mt-1 text-sm text-[#777777]">
            Connect external platforms to delegate access securely through WithUs.
          </p>
        </div>

        <section className="bg-[#181818] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#242424] text-[#999999]">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#eeeeee]">
                Add Custom Portal
              </h2>
              <p className="mt-0.5 text-xs text-[#666666]">
                Check whether a portal is supported by the verified integration registry.
              </p>
            </div>
          </div>

          <form onSubmit={handleAnalyzePortal} className="mt-5 flex max-w-2xl gap-2">
            <input
              type="url"
              className="min-w-0 flex-1 bg-[#111111] px-3.5 py-2.5 text-sm text-[#eeeeee] placeholder:text-[#555555] outline-none transition-colors focus:bg-[#151515]"
              placeholder="https://github.com/login"
              value={portalUrl}
              onChange={(e) => {
                setPortalUrl(e.target.value);
                setPortalResult(null);
              }}
              required
            />
            <button
              type="submit"
              disabled={isAnalyzing || !portalUrl}
              className="inline-flex min-w-[96px] items-center justify-center bg-[#eeeeee] px-4 py-2.5 text-sm font-medium text-[#111111] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-[#666666]"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Check URL'
              )}
            </button>
          </form>

          {portalResult && (
            <div className="mt-4 bg-[#111111] px-4 py-3">
              {portalResult.compatible ? (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 shrink-0 text-[#eeeeee]" />
                  <div>
                    <div className="text-sm font-medium text-[#eeeeee]">Compatible</div>
                    <div className="mt-0.5 text-xs text-[#777777]">
                      {portalResult.platform} detected. Known WITHUS platform.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 shrink-0 text-[#999999]" />
                  <div>
                    <div className="text-sm font-medium text-[#dddddd]">Unknown Portal</div>
                    <div className="mt-0.5 text-xs leading-5 text-[#777777]">
                      {portalResult.reason === 'not_https'
                        ? 'Custom portals must use HTTPS for secure connection.'
                        : portalResult.reason === 'invalid_url'
                        ? 'Invalid URL format.'
                        : 'Not currently supported. This portal is not in the WITHUS verified registry.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="bg-[#181818] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#242424] text-[#888888]">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#dddddd]">
                Platform-Agnostic Integrations
              </p>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-[#666666]">
                Connect developer platforms and delegate access securely. WithUs stores credentials
                encrypted and handles approval workflows so your team never shares passwords or tokens directly.
              </p>
            </div>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#eeeeee]">Connected Platforms</h2>
            <span className="text-xs text-[#555555]">{PROVIDERS.length} available</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
              {PROVIDERS.map((p) => (
                <div key={p.id} className="h-52 animate-pulse bg-[#181818]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
              {PROVIDERS.map((provider) => {
                const connection = connections.find((c) => c.provider === provider.id);
                return (
                  <IntegrationCard
                    key={provider.id}
                    provider={provider}
                    connection={connection}
                    onConnect={(id) => handleInitiateConnect(PROVIDERS.find((p) => p.id === id)!)}
                    onDisconnect={(id) => setDisconnectingProvider(id)}
                    onHealthCheck={(id) => runHealthCheck(id)}
                    isCheckingHealth={isCheckingHealth}
                    canManage={canManage}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      <ConnectModal
        provider={connectingProvider}
        onClose={() => setConnectingProvider(null)}
        onConfirm={handleConnect}
        isPending={isConnecting}
      />

      <ConfirmModal
        isOpen={!!disconnectingProvider}
        title="Disconnect Integration"
        message={`Disconnect ${
          PROVIDERS.find((p) => p.id === disconnectingProvider)?.name || disconnectingProvider
        }? The stored credentials will be deleted. Existing sessions are not affected.`}
        confirmLabel="Disconnect"
        danger
        isPending={isDisconnecting}
        onConfirm={handleDisconnect}
        onCancel={() => setDisconnectingProvider(null)}
      />
    </DashboardShell>
  );
}
