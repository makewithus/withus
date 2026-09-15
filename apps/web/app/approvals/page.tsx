'use client';

import React, { useState } from 'react';
import { useMyRequests, usePendingApprovals, useResolveApproval } from '../../hooks/useApprovals';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { PromptModal } from '../../components/common/PromptModal';
import { Check, X, Clock, CheckCircle, XCircle } from 'lucide-react';
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
  const pendingApprovalsToReview = pendingApprovals?.filter(
    (request: any) => request.requesterId !== user?.id
  );

  const { mutate: resolveApproval, isPending: isResolving } = useResolveApproval(orgId);

  const [rejectState, setRejectState] = useState<string | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [myReqPage, setMyReqPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  const handleApprove = (approvalId: string) => {
    resolveApproval(
      { approvalId, data: { status: 'APPROVED' } },
      {
        onSuccess: () =>
          toast(
            'success',
            'Access Granted. A delegated session has been created automatically.'
          ),
        onError: (err: any) =>
          toast('error', err.message || 'Failed to approve request.'),
      }
    );
  };

  const handleRejectWithReason = (reason: string) => {
    if (!rejectState) return;

    const id = rejectState;
    setRejectState(null);

    resolveApproval({
      approvalId: id,
      data: { status: 'REJECTED', reason: reason || undefined },
    });
  };

  const handleResolve = (
    approvalId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    if (status === 'APPROVED') {
      handleApprove(approvalId);
    } else {
      setRejectState(approvalId);
    }
  };

  const getStatus = (status: ApprovalRequestStatus) => {
    switch (status) {
      case ApprovalRequestStatus.PENDING:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#b0b0b0]">
            <Clock className="h-3.5 w-3.5 text-[#777777]" />
            Pending
          </span>
        );
      case ApprovalRequestStatus.APPROVED:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#eeeeee]">
            <CheckCircle className="h-3.5 w-3.5" />
            Approved
          </span>
        );
      case ApprovalRequestStatus.REJECTED:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777777]">
            <XCircle className="h-3.5 w-3.5 text-[#555555]" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const paginatedReview = pendingApprovalsToReview?.slice(
    (reviewPage - 1) * ITEMS_PER_PAGE,
    reviewPage * ITEMS_PER_PAGE
  );
  const totalReviewPages = pendingApprovalsToReview
    ? Math.ceil(pendingApprovalsToReview.length / ITEMS_PER_PAGE)
    : 0;

  const paginatedMyRequests = myRequests?.slice(
    (myReqPage - 1) * ITEMS_PER_PAGE,
    myReqPage * ITEMS_PER_PAGE
  );
  const totalMyReqPages = myRequests
    ? Math.ceil(myRequests.length / ITEMS_PER_PAGE)
    : 0;

  return (
    <>
      <DashboardShell>
        <div className="mx-auto max-w-6xl space-y-6">
          <header>
            <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
              Approval Workflows
            </h1>
            <p className="mt-1 text-sm text-[#777777]">
              Review and manage access requests.
            </p>
          </header>

          {organization?.role !== 'MEMBER' && (
            <section>
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <h2 className="text-base font-medium text-[#eeeeee]">
                    Access Requests
                  </h2>
                  <p className="mt-1 text-xs text-[#666666]">
                    Requests waiting for your review.
                  </p>
                </div>
                {pendingApprovalsToReview && pendingApprovalsToReview.length > 0 && (
                  <span className="text-xs text-[#666666]">
                    {pendingApprovalsToReview.length} pending
                  </span>
                )}
              </div>

              <div className="overflow-hidden bg-[#181818]">
                {isLoadingPending ? (
                  <div className="px-5 py-10 text-center text-sm text-[#666666]">
                    Loading...
                  </div>
                ) : pendingApprovalsToReview?.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center bg-[#242424] text-[#b0b0b0]">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-[#eeeeee]">
                      Nothing to review
                    </p>
                    <p className="mt-1 text-xs text-[#666666]">
                      New access requests will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left">
                        <thead>
                          <tr className="bg-[#1d1d1d]">
                            <th className="px-5 py-3 text-xs font-medium text-[#777777]">
                              Requester
                            </th>
                            <th className="px-5 py-3 text-xs font-medium text-[#777777]">
                              Request
                            </th>
                            <th className="px-5 py-3 text-xs font-medium text-[#777777]">
                              Requested
                            </th>
                            <th className="px-5 py-3 text-right text-xs font-medium text-[#777777]">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedReview?.map((request: any) => (
                            <tr
                              key={request.id}
                              className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                            >
                              <td className="px-5 py-4 align-top">
                                <p className="text-sm font-medium text-[#eeeeee]">
                                  {request.requester?.fullName ||
                                    request.requester?.email ||
                                    'Unknown'}
                                </p>
                                {request.requester?.fullName &&
                                  request.requester?.email && (
                                    <p className="mt-1 text-xs text-[#666666]">
                                      {request.requester.email}
                                    </p>
                                  )}
                              </td>
                              <td className="px-5 py-4 align-top">
                                <p className="text-sm text-[#cccccc]">
                                  {String(
                                    request.requestPayload?.scope || 'SECRET'
                                  ).replace('_', ' ')}
                                </p>
                                <div className="mt-1.5 space-y-0.5 text-xs text-[#666666]">
                                  {request.requestPayload?.expiresAt && (
                                    <p>
                                      Expires:{' '}
                                      {formatDateTime(
                                        request.requestPayload.expiresAt
                                      )}
                                    </p>
                                  )}
                                  <p>
                                    Max reveals:{' '}
                                    {request.requestPayload?.maxReveals
                                      ? request.requestPayload.maxReveals
                                      : 'Unlimited'}
                                  </p>
                                </div>
                              </td>
                              <td className="px-5 py-4 align-top text-sm text-[#777777]">
                                {formatDate(request.createdAt)}
                              </td>
                              <td className="px-5 py-4 align-top">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      handleResolve(request.id, 'APPROVED')
                                    }
                                    disabled={isResolving}
                                    className="inline-flex items-center justify-center bg-[#eeeeee] px-3 py-2 text-xs font-medium text-[#111111] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-[#333333] disabled:text-[#666666]"
                                  >
                                    <Check className="mr-1.5 h-3.5 w-3.5" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleResolve(request.id, 'REJECTED')
                                    }
                                    disabled={isResolving}
                                    className="inline-flex items-center justify-center bg-[#242424] px-3 py-2 text-xs font-medium text-[#cccccc] transition-colors hover:bg-[#2d2d2d] disabled:cursor-not-allowed disabled:text-[#555555]"
                                  >
                                    <X className="mr-1.5 h-3.5 w-3.5" />
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {totalReviewPages > 1 && (
                      <div className="flex items-center justify-between bg-[#151515] px-5 py-3">
                        <p className="text-xs text-[#666666]">
                          Page {reviewPage} of {totalReviewPages}
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              setReviewPage((page) => Math.max(1, page - 1))
                            }
                            disabled={reviewPage === 1}
                            className="bg-[#242424] px-3 py-1.5 text-xs text-[#cccccc] transition-colors hover:bg-[#2d2d2d] disabled:cursor-not-allowed disabled:text-[#555555]"
                          >
                            Prev
                          </button>
                          <button
                            onClick={() =>
                              setReviewPage((page) =>
                                Math.min(totalReviewPages, page + 1)
                              )
                            }
                            disabled={reviewPage === totalReviewPages}
                            className="bg-[#242424] px-3 py-1.5 text-xs text-[#cccccc] transition-colors hover:bg-[#2d2d2d] disabled:cursor-not-allowed disabled:text-[#555555]"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          <section>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-base font-medium text-[#eeeeee]">
                  My Requests
                </h2>
                <p className="mt-1 text-xs text-[#666666]">
                  Your previous access requests and their status.
                </p>
              </div>
            </div>

            <div className="overflow-hidden bg-[#181818]">
              {isLoadingRequests ? (
                <div className="px-5 py-10 text-center text-sm text-[#666666]">
                  Loading...
                </div>
              ) : myRequests?.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center bg-[#242424] text-[#888888]">
                    <Clock className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-[#eeeeee]">
                    No requests submitted yet
                  </p>
                  <p className="mt-1 text-xs text-[#666666]">
                    Requests that require approval will appear here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left">
                      <thead>
                        <tr className="bg-[#1d1d1d]">
                          <th className="px-5 py-3 text-xs font-medium text-[#777777]">
                            Request
                          </th>
                          <th className="px-5 py-3 text-xs font-medium text-[#777777]">
                            Scope & Expiry
                          </th>
                          <th className="px-5 py-3 text-xs font-medium text-[#777777]">
                            Requested
                          </th>
                          <th className="px-5 py-3 text-right text-xs font-medium text-[#777777]">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedMyRequests?.map((request) => (
                          <tr
                            key={request.id}
                            className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                          >
                            <td className="px-5 py-4 align-top">
                              <p className="text-sm font-medium text-[#dddddd]">
                                Session Access Request
                              </p>
                              {request.reason && (
                                <p className="mt-1 text-xs text-[#777777]">
                                  Reason: {request.reason}
                                </p>
                              )}
                            </td>
                            <td className="px-5 py-4 align-top text-xs text-[#777777]">
                              {request.requestPayload?.scope && (
                                <div>
                                  Scope:{' '}
                                  <span className="text-[#cccccc]">
                                    {String(request.requestPayload.scope).replace(
                                      '_',
                                      ' '
                                    )}
                                  </span>
                                </div>
                              )}
                              {request.requestPayload?.expiresAt && (
                                <div className="mt-1">
                                  Expires:{' '}
                                  <span className="text-[#cccccc]">
                                    {formatDateTime(
                                      request.requestPayload.expiresAt
                                    )}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 align-top text-sm text-[#777777]">
                              {formatDate(request.createdAt)}
                            </td>
                            <td className="px-5 py-4 align-top text-right">
                              {getStatus(request.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalMyReqPages > 1 && (
                    <div className="flex items-center justify-between bg-[#151515] px-5 py-3">
                      <p className="text-xs text-[#666666]">
                        Page {myReqPage} of {totalMyReqPages}
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            setMyReqPage((page) => Math.max(1, page - 1))
                          }
                          disabled={myReqPage === 1}
                          className="bg-[#242424] px-3 py-1.5 text-xs text-[#cccccc] transition-colors hover:bg-[#2d2d2d] disabled:cursor-not-allowed disabled:text-[#555555]"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() =>
                            setMyReqPage((page) =>
                              Math.min(totalMyReqPages, page + 1)
                            )
                          }
                          disabled={myReqPage === totalMyReqPages}
                          className="bg-[#242424] px-3 py-1.5 text-xs text-[#cccccc] transition-colors hover:bg-[#2d2d2d] disabled:cursor-not-allowed disabled:text-[#555555]"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </DashboardShell>

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
