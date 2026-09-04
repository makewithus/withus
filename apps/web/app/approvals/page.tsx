'use client';

import React, { useState } from 'react';
import { useMyRequests, usePendingApprovals, useResolveApproval } from '../../hooks/useApprovals';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { PromptModal } from '../../components/common/PromptModal';
import { Check, X, Clock, CheckCircle, XCircle, Shield } from 'lucide-react';
import { ApprovalRequestStatus } from '@repo/types';
import { useAuth } from '../../lib/auth/AuthContext';
import { useToast } from '../../components/common/Toast';
import { formatDate, formatDateTime } from '../../lib/formatters';

export default function ApprovalsPage() {
  const { organization, user } = useAuth();
  const orgId = organization?.id || '';
  const { toast } = useToast();
  const { data: myRequests, isLoading: isLoadingRequests } = useMyRequests(orgId);
  const { data: pendingApprovals, isLoading: isLoadingPending } = usePendingApprovals(orgId);
  const pendingApprovalsToReview = pendingApprovals?.filter((r: any) => r.requesterId !== user?.id);
  const { mutate: resolveApproval, isPending: isResolving } = useResolveApproval(orgId);

  // State for the rejection reason prompt modal
  const [rejectState, setRejectState] = useState<string | null>(null); // holds approvalId when open

  const handleApprove = (approvalId: string) => {
    resolveApproval(
      { approvalId, data: { status: 'APPROVED' } },
      {
        onSuccess: () => toast('success', 'Access Granted. A delegated session has been created automatically.'),
        onError: (err: any) => toast('error', err.message || 'Failed to approve request.'),
      }
    );
  };

  const handleRejectWithReason = (reason: string) => {
    if (!rejectState) return;
    const id = rejectState;
    setRejectState(null);
    resolveApproval({ approvalId: id, data: { status: 'REJECTED', reason: reason || undefined } });
  };

  const handleResolve = (approvalId: string, status: 'APPROVED' | 'REJECTED') => {
    if (status === 'APPROVED') {
      handleApprove(approvalId);
    } else {
      setRejectState(approvalId);
    }
  };

  const getStatusBadge = (status: ApprovalRequestStatus) => {
    switch (status) {
      case ApprovalRequestStatus.PENDING:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-250/20 dark:border-amber-900/30">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case ApprovalRequestStatus.APPROVED:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-250/20 dark:border-emerald-900/20">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </span>
        );
      case ApprovalRequestStatus.REJECTED:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-250/20 dark:border-red-900/30">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Pagination state
  const [reviewPage, setReviewPage] = useState(1);
  const [myReqPage, setMyReqPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const paginatedReview = pendingApprovalsToReview?.slice((reviewPage - 1) * ITEMS_PER_PAGE, reviewPage * ITEMS_PER_PAGE);
  const totalReviewPages = pendingApprovalsToReview ? Math.ceil(pendingApprovalsToReview.length / ITEMS_PER_PAGE) : 0;

  const paginatedMyRequests = myRequests?.slice((myReqPage - 1) * ITEMS_PER_PAGE, myReqPage * ITEMS_PER_PAGE);
  const totalMyReqPages = myRequests ? Math.ceil(myRequests.length / ITEMS_PER_PAGE) : 0;

  return (
    <>
    <DashboardShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="pb-2 border-b border-premium">
          <h1 className="text-lg font-bold tracking-tight text-premium-main">Approval Workflows</h1>
          <p className="text-xs text-premium-muted mt-0.5">Review and manage access requests.</p>
        </div>

        {/* What are approvals — info banner */}
        <div className="border border-premium bg-slate-50/20 dark:bg-zinc-900/10 rounded-lg p-4 flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <Shield className="w-4 h-4 text-premium-muted" />
          </div>
          <div>
            <p className="text-xs font-bold text-premium-main mb-0.5">About Approval Workflows</p>
            <p className="text-xs text-premium-muted leading-relaxed">
              When a team member requests a <span className="font-semibold">Delegated Session</span>{' '}
              to access a vault or reveal secrets, it can be configured to require approval from an Owner or Admin.
              This ensures sensitive access is always authorized before it is granted.
            </p>
          </div>
        </div>

        {/* Pending Approvals (Admin view) */}
        {organization?.role !== 'MEMBER' && (
          <section className="space-y-3">
            <div className="flex justify-between items-end">
              <h2 className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">Access Requests To Review</h2>
            </div>
            <div className="premium-card overflow-hidden shadow-none">
              {isLoadingPending ? (
                <div className="p-4 text-center text-xs text-slate-500">Loading...</div>
              ) : pendingApprovalsToReview?.length === 0 ? (
                <div className="p-8 text-center bg-premium-surface">
                  <div className="mx-auto w-8 h-8 bg-slate-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-3">
                    <Check className="w-4 h-4 text-premium-muted" />
                  </div>
                  <p className="text-xs font-bold text-premium-main mb-1">All clear — nothing to review</p>
                  <p className="text-xs text-premium-muted max-w-sm mx-auto leading-relaxed">
                    Approval requests appear here when a team member requests a{' '}
                    <span className="font-semibold">Delegated Session</span>.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-premium">
                    <thead className="bg-slate-50/20 dark:bg-zinc-900/10">
                      <tr>
                        <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-bold text-premium-muted uppercase tracking-wider border-b border-premium">Requester & Scope</th>
                        <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-bold text-premium-muted uppercase tracking-wider border-b border-premium">Request Details</th>
                        <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-bold text-premium-muted uppercase tracking-wider border-b border-premium">Requested On</th>
                        <th scope="col" className="px-5 py-2.5 text-right text-[10px] font-bold text-premium-muted uppercase tracking-wider border-b border-premium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-premium bg-premium-surface">
                      {paginatedReview?.map((request: any) => (
                        <tr key={request.id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-900/10 transition-colors">
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <p className="text-xs font-bold text-premium-main">
                              {request.requester?.fullName || request.requester?.email || 'Unknown'}
                            </p>
                            <p className="text-[10px] text-premium-muted font-semibold mt-0.5">
                              Scope: <span className="font-bold text-premium-main">{String(request.requestPayload?.scope || 'SECRET').replace('_', ' ')}</span>
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-[10px] text-premium-muted font-semibold space-y-0.5">
                              {request.requestPayload?.expiresAt && (
                                <div>
                                  <span className="font-bold text-premium-main">Expires:</span>{' '}
                                  {formatDateTime(request.requestPayload.expiresAt)}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-premium-main">Max reveals:</span>{' '}
                                {request.requestPayload?.maxReveals ? request.requestPayload.maxReveals : 'Unlimited'}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-xs text-premium-muted font-semibold">
                            {formatDate(request.createdAt)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleResolve(request.id, 'APPROVED')}
                                disabled={isResolving}
                                className="premium-button-primary py-1 px-2.5 text-[10px]"
                              >
                                <Check className="mr-1 h-3.5 w-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleResolve(request.id, 'REJECTED')}
                                disabled={isResolving}
                                className="py-1 px-2.5 text-[10px] font-semibold rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/30 transition-all duration-150 inline-flex items-center justify-center"
                              >
                                <X className="mr-1 h-3.5 w-3.5" /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {totalReviewPages > 1 && (
                    <div className="px-5 py-3 border-t border-premium flex items-center justify-between bg-premium-surface/50">
                      <p className="text-xs text-premium-muted font-bold">
                        Page <span className="text-premium-main">{reviewPage}</span> of <span className="text-premium-main">{totalReviewPages}</span>
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setReviewPage(p => Math.max(1, p - 1))} disabled={reviewPage === 1} className="premium-button-secondary py-1 px-2.5 text-[10px]">Prev</button>
                        <button onClick={() => setReviewPage(p => Math.min(totalReviewPages, p + 1))} disabled={reviewPage === totalReviewPages} className="premium-button-secondary py-1 px-2.5 text-[10px]">Next</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* My Requests (Member view) */}
        <section className="space-y-3 pt-4 border-t border-premium">
          <div className="flex justify-between items-end">
            <h2 className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">My Requests History</h2>
          </div>
          <div className="premium-card overflow-hidden shadow-none">
            {isLoadingRequests ? (
              <div className="p-4 text-center text-xs text-slate-500">Loading...</div>
            ) : myRequests?.length === 0 ? (
              <div className="p-8 text-center bg-premium-surface">
                <div className="mx-auto w-8 h-8 bg-slate-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-3">
                  <Clock className="w-4 h-4 text-premium-muted" />
                </div>
                <p className="text-xs font-bold text-premium-main mb-1">No requests submitted yet</p>
                <p className="text-xs text-premium-muted max-w-sm mx-auto leading-relaxed">
                  When you request a <span className="font-semibold">Delegated Session</span> that requires approval, it will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-premium">
                  <thead className="bg-slate-50/20 dark:bg-zinc-900/10">
                    <tr>
                      <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-bold text-premium-muted uppercase tracking-wider border-b border-premium">Request Type</th>
                      <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-bold text-premium-muted uppercase tracking-wider border-b border-premium">Scope & Expiry</th>
                      <th scope="col" className="px-5 py-2.5 text-left text-[10px] font-bold text-premium-muted uppercase tracking-wider border-b border-premium">Requested On</th>
                      <th scope="col" className="px-5 py-2.5 text-right text-[10px] font-bold text-premium-muted uppercase tracking-wider border-b border-premium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-premium bg-premium-surface">
                    {paginatedMyRequests?.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-900/10 transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-xs font-bold text-premium-main">Session Access Request</p>
                          {request.reason && (
                            <p className="mt-0.5 text-[10px] text-red-500 font-medium">
                              Reason: {request.reason}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[10px] text-premium-muted font-semibold">
                          {request.requestPayload?.scope && (
                            <div>Scope: <span className="font-bold text-premium-main">{String(request.requestPayload.scope).replace('_', ' ')}</span></div>
                          )}
                          {request.requestPayload?.expiresAt && (
                            <div>Expires: <span className="font-bold text-premium-main">{formatDateTime(request.requestPayload.expiresAt)}</span></div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-premium-muted font-semibold">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          {getStatusBadge(request.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalMyReqPages > 1 && (
                  <div className="px-5 py-3 border-t border-premium flex items-center justify-between bg-premium-surface/50">
                    <p className="text-xs text-premium-muted font-bold">
                      Page <span className="text-premium-main">{myReqPage}</span> of <span className="text-premium-main">{totalMyReqPages}</span>
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setMyReqPage(p => Math.max(1, p - 1))} disabled={myReqPage === 1} className="premium-button-secondary py-1 px-2.5 text-[10px]">Prev</button>
                      <button onClick={() => setMyReqPage(p => Math.min(totalMyReqPages, p + 1))} disabled={myReqPage === totalMyReqPages} className="premium-button-secondary py-1 px-2.5 text-[10px]">Next</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>

      {/* Rejection Reason Prompt Modal */}
      <PromptModal
        isOpen={!!rejectState}
        title="Reject Request"
        message="Provide an optional reason for the rejection. The requester will be able to see this."
        label="Reason (optional)"
        placeholder="e.g. Access not justified for this resource…"
        confirmLabel="Reject"
        isPending={isResolving}
        onConfirm={handleRejectWithReason}
        onCancel={() => setRejectState(null)}
      />
    </>
  );
}
