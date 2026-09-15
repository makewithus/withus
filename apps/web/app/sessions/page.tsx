'use client';

import React, { useState } from 'react';
import { useIncomingSessions, useOutgoingSessions, useRevokeSession } from '../../hooks/useSessions';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { CreateSessionModal } from '../../components/sessions/CreateSessionModal';
import { RequestAccessModal } from '../../components/sessions/RequestAccessModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { PromptModal } from '../../components/common/PromptModal';
import { Plus, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { SessionStatus } from '@repo/types';
import { useAuth } from '../../lib/auth/AuthContext';
import { useToast } from '../../components/common/Toast';
import { hasPermission } from '../../lib/auth/permissions';

export default function SessionsPage() {
  const { organization } = useAuth();
  const orgId = organization?.id || '';
  const { toast } = useToast();

  const { data: incomingSessions, isLoading: isLoadingIncoming, refetch: refetchIncoming } = useIncomingSessions(orgId);
  const { data: outgoingSessions, isLoading: isLoadingOutgoing } = useOutgoingSessions(orgId);
  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession(orgId);

  const canGrantAccess = hasPermission(organization?.role, 'SESSION_REVOKE');


  const [isModalOpen, setIsModalOpen] = useState(false);
  // Pagination states
  const [incPage, setIncPage] = useState(1);
  const [outPage, setOutPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const paginatedIncoming = incomingSessions?.slice((incPage - 1) * ITEMS_PER_PAGE, incPage * ITEMS_PER_PAGE);
  const totalIncPages = incomingSessions ? Math.ceil(incomingSessions.length / ITEMS_PER_PAGE) : 0;

  const paginatedOutgoing = outgoingSessions?.slice((outPage - 1) * ITEMS_PER_PAGE, outPage * ITEMS_PER_PAGE);
  const totalOutPages = outgoingSessions ? Math.ceil(outgoingSessions.length / ITEMS_PER_PAGE) : 0;

  // Confirm modal state (replaces window.confirm for revoke)
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  const canCreateSession = !!orgId;

  const formatExpiry = (expiresAt: string | Date) => {
    const d = new Date(expiresAt);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins <= 0) return `Expired`;
    if (diffMins < 60) return `Expires in ${diffMins}m`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `Expires in ${diffHours}h`;
    const diffDays = Math.round(diffHours / 24);
    return `Expires in ${diffDays}d`;
  };

  const getStatusBadge = (status: SessionStatus, expiresAt: string | Date) => {
    if (status === SessionStatus.REVOKED) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777777]">
          <XCircle className="h-3.5 w-3.5 text-[#555555]" />
          Revoked
        </span>
      );
    }

    if (status === SessionStatus.EXPIRED || new Date(expiresAt) <= new Date()) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777777]">
          <Clock className="h-3.5 w-3.5 text-[#555555]" />
          Expired
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#eeeeee]">
        <CheckCircle className="h-3.5 w-3.5" />
        Active
      </span>
    );
  };

  const handleRevokeConfirmed = () => {
    if (!confirmRevokeId) return;
    const id = confirmRevokeId;
    setConfirmRevokeId(null);
    revokeSession(id, {
      onSuccess: () => toast('success', 'Session revoked.'),
      onError: () => toast('error', 'Failed to revoke session.'),
    });
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
              Delegated Sessions
            </h1>
            <p className="mt-1 text-sm text-[#777777]">
              Manage time-bound access delegations.
            </p>
          </div>

          {canCreateSession && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#eeeeee] px-4 py-2.5 text-sm font-medium text-[#111111] transition-colors hover:bg-white"
            >
              <Plus className="h-4 w-4" />
              {canGrantAccess ? 'Create Delegated Session' : 'Request Temporary Access'}
            </button>
          )}
        </div>

        <div className="space-y-8">
          {/* Incoming Sessions */}
          <section>
            <div className="mb-3">
              <h2 className="text-sm font-medium text-[#cccccc]">My Access</h2>
            </div>

            <div className="overflow-hidden bg-[#181818]">
              {isLoadingIncoming ? (
                <div className="px-5 py-8 text-center text-sm text-[#666666]">
                  Loading...
                </div>
              ) : !incomingSessions?.length ? (
                <div className="px-5 py-8 text-center text-sm text-[#777777]">
                  No active sessions. Request temporary access from this page, or approve pending requests to create delegated sessions.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-[#1f1f1f]">
                      <tr>
                        <th className="px-5 py-3 text-xs font-medium text-[#777777]">Resource</th>
                        <th className="px-5 py-3 text-xs font-medium text-[#777777]">Granted By</th>
                        <th className="px-5 py-3 text-xs font-medium text-[#777777]">Status / Uses</th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-[#777777]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedIncoming?.map((session) => {
                        const isActive =
                          session.status === SessionStatus.ACTIVE &&
                          new Date(session.expiresAt) > new Date();

                        return (
                          <tr
                            key={session.id}
                            className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                          >
                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-[#eeeeee]">
                                {(session.scope as string) === 'INTEGRATION'
                                  ? `${(session as any).integrationProvider} Access`
                                  : `${session.scope} Access`}
                              </p>
                              <p className="mt-1 max-w-xs truncate text-xs text-[#777777]">
                                {(session.scope as string) === 'INTEGRATION'
                                  ? (session as any).integrationProvider === 'GODADDY'
                                    ? `Domain: ${(session as any).integrationResourceExternalId}`
                                    : (session as any).integrationProvider === 'VERCEL'
                                      ? `Project: ${(session as any).integrationResourceExternalId}`
                                      : `Repository: ${(session as any).integrationResourceExternalId}`
                                  : (session.resourceName || session.resourceId).split('_deleted_')[0]}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-[#999999]">
                              {session.grantor?.fullName ||
                                session.grantor?.email ||
                                session.grantorId}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-4">
                                {getStatusBadge(session.status, session.expiresAt)}
                                <div className="flex flex-col gap-0.5 text-xs text-[#777777]">
                                  <span>{formatExpiry(session.expiresAt)}</span>
                                  {(session.scope as string) !== 'INTEGRATION' && (
                                    <span>
                                      Uses: {session.revealCount} / {session.maxReveals ?? '∞'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right">
                              {isActive &&
                                (session.scope as string) === 'INTEGRATION' &&
                                ((session as any).integrationProvider === 'GODADDY' ||
                                  (session as any).integrationProvider === 'HOSTINGER' ||
                                  (session as any).integrationProvider === 'CPANEL') ? (
                                <a
                                  href={
                                    (session as any).integrationProvider === 'GODADDY'
                                      ? 'https://sso.godaddy.com/'
                                      : (session as any).integrationProvider === 'HOSTINGER'
                                        ? 'https://hpanel.hostinger.com/'
                                        : 'https://cpanel.net/'
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center bg-[#eeeeee] px-3 py-2 text-xs font-medium text-[#111111] transition-colors hover:bg-white"
                                >
                                  Launch Session
                                </a>
                              ) : isActive && (session.scope as string) === 'INTEGRATION' ? (
                                <span className="text-xs font-medium text-[#888888]">
                                  Managed by WithUs
                                </span>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {totalIncPages > 1 && (
                    <div className="flex items-center justify-between bg-[#151515] px-5 py-3">
                      <p className="text-xs text-[#777777]">
                        Page <span className="text-[#eeeeee]">{incPage}</span> of{' '}
                        <span className="text-[#eeeeee]">{totalIncPages}</span>
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setIncPage((p) => Math.max(1, p - 1))}
                          disabled={incPage === 1}
                          className="bg-[#242424] px-3 py-2 text-xs font-medium text-[#bbbbbb] transition-colors hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:text-[#555555]"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => setIncPage((p) => Math.min(totalIncPages, p + 1))}
                          disabled={incPage === totalIncPages}
                          className="bg-[#242424] px-3 py-2 text-xs font-medium text-[#bbbbbb] transition-colors hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:text-[#555555]"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {canGrantAccess && (
            <section>
              <div className="mb-3">
                <h2 className="text-sm font-medium text-[#cccccc]">Access I've Granted</h2>
              </div>

              <div className="overflow-hidden bg-[#181818]">
                {isLoadingOutgoing ? (
                  <div className="px-5 py-8 text-center text-sm text-[#666666]">
                    Loading...
                  </div>
                ) : !outgoingSessions?.length ? (
                  <div className="px-5 py-8 text-center text-sm text-[#777777]">
                    No active sessions. Request temporary access from this page, or approve pending requests to create delegated sessions.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="bg-[#1f1f1f]">
                        <tr>
                          <th className="px-5 py-3 text-xs font-medium text-[#777777]">Grantee</th>
                          <th className="px-5 py-3 text-xs font-medium text-[#777777]">Scope / Resource</th>
                          <th className="px-5 py-3 text-xs font-medium text-[#777777]">Status / Uses</th>
                          <th className="px-5 py-3 text-right text-xs font-medium text-[#777777]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOutgoing?.map((session) => {
                          const isActive =
                            session.status === SessionStatus.ACTIVE &&
                            new Date(session.expiresAt) > new Date();

                          return (
                            <tr
                              key={session.id}
                              className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                            >
                              <td className="px-5 py-4 text-sm text-[#eeeeee]">
                                {session.grantee?.fullName ||
                                  session.grantee?.email ||
                                  session.granteeId}
                              </td>

                              <td className="px-5 py-4 text-sm text-[#999999]">
                                {(session.scope as string) === 'INTEGRATION'
                                  ? (session as any).integrationProvider === 'GODADDY'
                                    ? 'Browser Extension'
                                    : (session as any).integrationProvider === 'VERCEL'
                                      ? `Vercel · ${(session as any).integrationResourceExternalId}`
                                      : `GitHub · ${(session as any).integrationResourceExternalId}`
                                  : `${session.scope} · ${(session.resourceName || session.resourceId).split('_deleted_')[0]}`}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-4">
                                  {getStatusBadge(session.status, session.expiresAt)}
                                  <div className="flex flex-col gap-0.5 text-xs text-[#777777]">
                                    <span>{formatExpiry(session.expiresAt)}</span>
                                    {(session.scope as string) !== 'INTEGRATION' && (
                                      <span>
                                        Uses: {session.revealCount} / {session.maxReveals ?? '∞'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4 text-right">
                                {isActive && (
                                  <button
                                    onClick={() => setConfirmRevokeId(session.id)}
                                    disabled={isRevoking}
                                    aria-label="Revoke session"
                                    title="Revoke Session"
                                    className="inline-flex bg-[#242424] p-2 text-[#aaaaaa] transition-colors hover:bg-[#2b2b2b] hover:text-[#eeeeee] disabled:cursor-not-allowed disabled:text-[#555555]"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {totalOutPages > 1 && (
                      <div className="flex items-center justify-between bg-[#151515] px-5 py-3">
                        <p className="text-xs text-[#777777]">
                          Page <span className="text-[#eeeeee]">{outPage}</span> of{' '}
                          <span className="text-[#eeeeee]">{totalOutPages}</span>
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setOutPage((p) => Math.max(1, p - 1))}
                            disabled={outPage === 1}
                            className="bg-[#242424] px-3 py-2 text-xs font-medium text-[#bbbbbb] transition-colors hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:text-[#555555]"
                          >
                            Prev
                          </button>
                          <button
                            onClick={() => setOutPage((p) => Math.min(totalOutPages, p + 1))}
                            disabled={outPage === totalOutPages}
                            className="bg-[#242424] px-3 py-2 text-xs font-medium text-[#bbbbbb] transition-colors hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:text-[#555555]"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {canGrantAccess ? (
          <CreateSessionModal
            orgId={orgId}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        ) : (
          <RequestAccessModal
            orgId={orgId}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}

        {/* Revoke Confirm Modal */}
        <ConfirmModal
          isOpen={!!confirmRevokeId}
          title="Revoke Session"
          message="Are you sure you want to revoke this session? The user will immediately lose access."
          confirmLabel="Revoke"
          danger
          isPending={isRevoking}
          onConfirm={handleRevokeConfirmed}
          onCancel={() => setConfirmRevokeId(null)}
        />
      </div>
    </DashboardShell>
  );
}