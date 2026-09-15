'use client';

import React, { useState } from 'react';
import { useVaults } from '../../hooks/useVaults';
import { VaultList } from './VaultList';
import { Loading } from '../common/Loading';
import { ErrorState } from '../common/ErrorState';
import { EmptyState } from '../common/EmptyState';
import { CreateVaultModal } from './CreateVaultModal';
import { Shield, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission } from '../../lib/auth/permissions';

const PAGE_SIZE = 20;

export function VaultListPage() {
  const { organization } = useAuth();
  const orgId = organization?.id || '';
  const role = (organization as any)?.role as string | undefined;

  const canCreateVault = hasPermission(role, 'VAULT_CREATE');

  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useVaults(
    orgId,
    page,
    PAGE_SIZE
  );

  const vaults = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!organization) {
    return <Loading message="Loading your workspace..." />;
  }

  if (isLoading) {
    return <Loading message="Loading your vaults..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load vaults"
        message="We encountered an error while communicating with the Vault service."
        onRetry={() => refetch()}
      />
    );
  }

  if (vaults.length === 0 && page === 1) {
    return (
      <>
        <div className="mx-auto max-w-6xl space-y-6">
          <EmptyState
            title="No Vaults Found"
            description="Create your first secure vault to start storing encrypted secrets."
            icon={<Shield className="h-5 w-5 text-[#888888]" />}
            actionLabel={canCreateVault ? 'Create Vault' : undefined}
            onAction={
              canCreateVault ? () => setIsCreateOpen(true) : undefined
            }
          />
        </div>

        {canCreateVault && (
          <CreateVaultModal
            orgId={orgId}
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
              Secure Vaults
            </h1>

            <p className="mt-1 text-sm text-[#777777]">
              {total} vault{total !== 1 ? 's' : ''} · Page {page} of {totalPages}
            </p>
          </div>

          {canCreateVault && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#e8e8e8] px-4 text-sm font-medium text-[#111111] transition-colors hover:bg-white"
            >
              <Plus className="h-4 w-4" />
              Create Vault
            </button>
          )}
        </div>

        {/* Vaults */}
        <VaultList vaults={vaults} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex h-8 items-center gap-1 rounded-md bg-[#1b1b1b] px-3 text-xs text-[#999999] transition-colors hover:bg-[#222222] hover:text-[#eeeeee] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            <span className="px-2 text-xs text-[#666666]">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-md bg-[#1b1b1b] px-3 text-xs text-[#999999] transition-colors hover:bg-[#222222] hover:text-[#eeeeee] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {canCreateVault && (
        <CreateVaultModal
          orgId={orgId}
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </>
  );
}