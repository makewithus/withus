'use client';

import React, { useState } from 'react';
import { DashboardShell } from '../../../components/layout/DashboardShell';
import { useAuth } from '../../../lib/auth/AuthContext';
import {
  useOrgMembers,
  useInviteMember,
  useOrgInvitations,
  useCancelInvitation,
  useChangeMemberRole,
  useRemoveMember,
  useOffboardMember,
} from '../../../hooks/useOrganization';
import { Loading } from '../../../components/common/Loading';
import { formatDate } from '../../../lib/formatters';
import { useToast } from '../../../components/common/Toast';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { CreateSessionModal } from '../../../components/sessions/CreateSessionModal';
import {
  UserPlus,
  Users,
  Shield,
  Crown,
  User,
  Loader2,
  Mail,
  Trash2,
  Clock,
  Copy,
  Check,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ShieldOff,
  ShieldAlert,
  Key,
  GitBranch,
  Globe,
  ArrowRight,
  Search,
  UserX,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { hasPermission } from '../../../lib/auth/permissions';

const roleIcons: Record<string, React.ReactNode> = {
  OWNER: <Crown className="w-3 h-3 text-amber-500" />,
  ADMIN: <Shield className="w-3 h-3 text-indigo-500" />,
  MEMBER: <User className="w-3 h-3 text-slate-400" />,
};

const roleBadge: Record<string, string> = {
  OWNER: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30',
  ADMIN: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30',
  MEMBER: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

const sessionStatusBadge: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50',
  EXPIRED: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700',
  REVOKED: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200/50',
  REVOKE_FAILED: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/50',
};

function Avatar({ name, email }: { name?: string; email?: string }) {
  const label = (name || email || '?')[0]?.toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  );
}

function ResourceIcon({ provider }: { provider?: string | null }) {
  if (provider === 'GITHUB') return <GitBranch className="w-3 h-3 text-slate-500" />;
  if (provider === 'GODADDY') return <Globe className="w-3 h-3 text-slate-500" />;
  return <Key className="w-3 h-3 text-slate-500" />;
}


export default function MembersPage() {
  const router = useRouter();
  const { organization, user } = useAuth();
  const orgId = organization?.id || '';
  const currentUserId = user?.id || '';

  const { data: members = [], isLoading } = useOrgMembers(orgId);
  const { data: invitations = [] } = useOrgInvitations(orgId);
  const { mutate: inviteMember, isPending: isInviting } = useInviteMember(orgId);
  const { mutate: cancelInvitation, isPending: isCancelling } = useCancelInvitation(orgId);
  const { mutate: changeRole } = useChangeMemberRole(orgId);
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember(orgId);
  const { mutate: offboardMember, isPending: isOffboarding } = useOffboardMember(orgId);
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [grantAccessMemberId, setGrantAccessMemberId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{ memberId: string; email?: string } | null>(null);
  const [confirmOffboard, setConfirmOffboard] = useState<{ memberId: string; email?: string; name?: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentMember = members.find((m: any) => m.userId === currentUserId);
  const role = currentMember?.role as string | undefined;
  const canInvite     = hasPermission(role, 'MEMBER_INVITE');      // OWNER + ADMIN
  const canRemove     = hasPermission(role, 'MEMBER_REMOVE');      // OWNER + ADMIN
  const canChangeRole = hasPermission(role, 'MEMBER_UPDATE_ROLE'); // OWNER only

  const filteredMembers = members.filter((member: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = member.user?.fullName?.toLowerCase() || '';
    const emailStr = member.user?.email?.toLowerCase() || '';
    return name.includes(term) || emailStr.includes(term);
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    inviteMember(email.trim(), {
      onSuccess: (data) => {
        toast('success', `Invitation sent to ${email}.`);
        if (data?.data?.rawToken) setInviteToken(data.data.rawToken);
        setEmail('');
      },
      onError: (err) => toast('error', err.message || 'Failed to send invitation.'),
    });
  };

  const handleCopyInvite = (inviteId: string, token?: string, email?: string) => {
    if (token) {
      const link = `${window.location.origin}/invite/${token}`;
      navigator.clipboard.writeText(link).then(() => {
        setCopiedInviteId(inviteId);
        setTimeout(() => setCopiedInviteId(null), 2000);
      });
    } else if (email) {
      inviteMember(email, {
        onSuccess: (data) => {
          if (data?.data?.rawToken) {
            const link = `${window.location.origin}/invite/${data.data.rawToken}`;
            navigator.clipboard.writeText(link).then(() => {
              setCopiedInviteId(inviteId);
              toast('success', 'New invite link copied to clipboard.');
              setTimeout(() => setCopiedInviteId(null), 2000);
            });
          }
        },
        onError: () => toast('error', 'Failed to generate a new invite link.'),
      });
    }
  };

  const handleResendInvite = (email: string) => {
    inviteMember(email, {
      onSuccess: () => toast('success', `Invitation resent to ${email}.`),
      onError: (err) => toast('error', err.message || 'Failed to resend invitation.'),
    });
  };

  const handleCancelInvitation = (inviteId: string) => {
    cancelInvitation(inviteId, {
      onSuccess: () => toast('success', 'Invitation cancelled.'),
      onError: (err) => toast('error', err.message || 'Failed to cancel invitation.'),
    });
  };

  const handleChangeRole = (memberId: string, role: 'ADMIN' | 'MEMBER') => {
    changeRole(
      { memberId, role },
      {
        onSuccess: () => toast('success', 'Role updated successfully.'),
        onError: (err) => toast('error', err.message || 'Failed to update role.'),
      },
    );
  };

  const handleRemoveMember = (memberId: string, memberEmail?: string) => {
    setConfirmRemove({ memberId, email: memberEmail });
  };

  const handleRemoveConfirmed = () => {
    if (!confirmRemove) return;
    const { memberId } = confirmRemove;
    setConfirmRemove(null);
    removeMember(memberId, {
      onSuccess: () => toast('success', 'Member removed.'),
      onError: (err) => toast('error', err.message || 'Failed to remove member.'),
    });
  };

  const handleOffboardMember = (memberId: string, memberEmail?: string, memberName?: string) => {
    setConfirmOffboard({ memberId, email: memberEmail, name: memberName });
  };

  const handleOffboardConfirmed = () => {
    if (!confirmOffboard) return;
    const { memberId, email, name } = confirmOffboard;
    setConfirmOffboard(null);
    offboardMember(memberId, {
      onSuccess: (data: any) => {
        const label = name || email || 'Member';
        toast('success', `${label} offboarded. ${data?.sessionsRevoked ?? 0} session(s) revoked.`);
      },
      onError: (err: any) => toast('error', err.message || 'Failed to offboard member.'),
    });
  };

  const pendingInvitations = invitations.filter((inv: { status: string }) => inv.status === 'PENDING');

  return (
  <DashboardShell>
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
              Team Members
            </h1>
            <p className="mt-1 text-sm text-[#777777]">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Invite */}
      {canInvite && (
        <div className="bg-[#181818] p-5">
          <form onSubmit={handleInvite} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="
                  w-full
                  bg-[#111111]
                  py-2.5
                  pl-10
                  pr-4
                  text-sm
                  text-[#eeeeee]
                  placeholder:text-[#555555]
                  outline-none
                  transition-colors
                  focus:bg-[#151515]
                "
              />
            </div>

            <button
              type="submit"
              disabled={isInviting || !email.trim()}
              className="
                flex
                items-center
                gap-2
                bg-[#eeeeee]
                px-4
                text-sm
                font-medium
                text-[#111111]
                transition-colors
                hover:bg-white
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {isInviting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}

              Send Invite
            </button>
          </form>

          {/* Newly generated invite */}
          {inviteToken && (
            <div className="mt-4 bg-[#111111] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-[#eeeeee]">
                  Invite link
                </span>

                <button
                  onClick={() => setInviteToken(null)}
                  className="text-[#666666] transition-colors hover:text-[#eeeeee]"
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 break-all font-mono text-xs text-[#888888]">
                  {typeof window !== 'undefined'
                    ? window.location.origin
                    : ''}
                  /invite/{inviteToken}
                </p>

                <button
                  onClick={() => handleCopyInvite('new', inviteToken)}
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-1.5
                    bg-[#242424]
                    px-3
                    py-2
                    text-xs
                    font-medium
                    text-[#dddddd]
                    transition-colors
                    hover:bg-[#2c2c2c]
                  "
                >
                  {copiedInviteId === 'new' ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pending Invitations */}
      {canInvite && pendingInvitations.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#eeeeee]">
              Pending invitations
            </h2>

            <span className="text-xs text-[#666666]">
              {pendingInvitations.length}
            </span>
          </div>

          <div className="space-y-px">
            {pendingInvitations.map(
              (inv: {
                id: string;
                email: string;
                createdAt: string;
                expiresAt: string;
              }) => {
                const isExpired =
                  new Date() > new Date(inv.expiresAt);

                const daysLeft = Math.ceil(
                  (new Date(inv.expiresAt).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={inv.id}
                    className="
                      flex
                      items-center
                      justify-between
                      bg-[#181818]
                      px-5
                      py-4
                      transition-colors
                      hover:bg-[#1e1e1e]
                    "
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[#eeeeee]">
                        {inv.email}
                      </p>

                      <p className="mt-1 text-xs text-[#666666]">
                        Invited {formatDate(inv.createdAt)}
                        <span className="mx-2">·</span>

                        {isExpired
                          ? 'Expired'
                          : `Expires in ${daysLeft} day${
                              daysLeft !== 1 ? 's' : ''
                            }`}
                      </p>
                    </div>

                    <div className="ml-4 flex shrink-0 items-center gap-1">
                      <button
                        onClick={() =>
                          handleCopyInvite(
                            inv.id,
                            undefined,
                            inv.email
                          )
                        }
                        title="Copy invite link"
                        className="
                          p-2
                          text-[#666666]
                          transition-colors
                          hover:text-[#eeeeee]
                        "
                      >
                        {copiedInviteId === inv.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          handleResendInvite(inv.email)
                        }
                        title="Resend invitation"
                        className="
                          p-2
                          text-[#666666]
                          transition-colors
                          hover:text-[#eeeeee]
                        "
                      >
                        <Mail className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleCancelInvitation(inv.id)
                        }
                        disabled={isCancelling}
                        title="Cancel invitation"
                        className="
                          p-2
                          text-[#666666]
                          transition-colors
                          hover:text-[#eeeeee]
                          disabled:opacity-40
                        "
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Members */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#eeeeee]">
            Members
          </h2>

          <span className="text-xs text-[#666666]">
            {filteredMembers.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555555]" />

          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full
              bg-[#181818]
              py-3
              pl-10
              pr-4
              text-sm
              text-[#eeeeee]
              placeholder:text-[#555555]
              outline-none
              transition-colors
              focus:bg-[#1c1c1c]
            "
          />
        </div>

        {isLoading ? (
          <div className="bg-[#181818] p-8">
            <Loading message="Loading members…" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-[#181818] p-8 text-center text-sm text-[#666666]">
            No members match your search.
          </div>
        ) : (
          <div className="space-y-px">
            {filteredMembers.map((member: any) => {
              const isOwner = member.role === 'OWNER';
              const isSelf = member.userId === currentUserId;
              const canEdit =
                canRemove && !isOwner && !isSelf;

              return (
                <div
                  key={member.id}
                  className="
                    relative
                    flex
                    items-center
                    justify-between
                    bg-[#181818]
                    px-5
                    py-4
                    transition-colors
                    hover:bg-[#1e1e1e]
                  "
                >
                  {/* Member info */}
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      name={member.user?.fullName}
                      email={member.user?.email}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#eeeeee]">
                        {member.user?.fullName || '—'}

                        {isSelf && (
                          <span className="ml-2 text-xs font-normal text-[#666666]">
                            you
                          </span>
                        )}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-[#666666]">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="ml-4 flex shrink-0 items-center gap-3">
                    <span className="text-xs text-[#888888]">
                      {member.role}
                    </span>

                    {canInvite && (
                      <button
                        onClick={() =>
                          router.push(
                            '/settings/members/' +
                              member.userId
                          )
                        }
                        className="
                          px-2
                          py-1
                          text-xs
                          text-[#777777]
                          transition-colors
                          hover:text-[#eeeeee]
                        "
                      >
                        View access
                      </button>
                    )}

                    {canEdit && (
                      <div
                        className="relative"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === member.id
                                ? null
                                : member.id
                            )
                          }
                          className="
                            p-1.5
                            text-[#666666]
                            transition-colors
                            hover:text-[#eeeeee]
                          "
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openMenuId === member.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() =>
                                setOpenMenuId(null)
                              }
                            />

                            <div
                              className="
                                absolute
                                right-0
                                z-50
                                mt-1
                                w-48
                                bg-[#202020]
                                py-1
                              "
                            >
                              {canChangeRole &&
                                member.role === 'MEMBER' && (
                                  <button
                                    onClick={() => {
                                      handleChangeRole(
                                        member.id,
                                        'ADMIN'
                                      );
                                      setOpenMenuId(null);
                                    }}
                                    className="
                                      flex
                                      w-full
                                      items-center
                                      gap-2
                                      px-3
                                      py-2.5
                                      text-left
                                      text-sm
                                      text-[#cccccc]
                                      transition-colors
                                      hover:bg-[#292929]
                                      hover:text-white
                                    "
                                  >
                                    <Shield className="h-4 w-4" />
                                    Promote to Admin
                                  </button>
                                )}

                              {canChangeRole &&
                                member.role === 'ADMIN' && (
                                  <button
                                    onClick={() => {
                                      handleChangeRole(
                                        member.id,
                                        'MEMBER'
                                      );
                                      setOpenMenuId(null);
                                    }}
                                    className="
                                      flex
                                      w-full
                                      items-center
                                      gap-2
                                      px-3
                                      py-2.5
                                      text-left
                                      text-sm
                                      text-[#cccccc]
                                      transition-colors
                                      hover:bg-[#292929]
                                      hover:text-white
                                    "
                                  >
                                    <ShieldOff className="h-4 w-4" />
                                    Demote to Member
                                  </button>
                                )}

                              {canRemove && (
                                <button
                                  onClick={() => {
                                    handleOffboardMember(
                                      member.id,
                                      member.user?.email,
                                      member.user?.fullName
                                    );
                                    setOpenMenuId(null);
                                  }}
                                  disabled={isOffboarding}
                                  className="
                                    flex
                                    w-full
                                    items-center
                                    gap-2
                                    px-3
                                    py-2.5
                                    text-left
                                    text-sm
                                    text-[#cccccc]
                                    transition-colors
                                    hover:bg-[#292929]
                                    hover:text-white
                                    disabled:opacity-40
                                  "
                                >
                                  <UserX className="h-4 w-4" />
                                  Offboard Employee
                                </button>
                              )}

                              {canRemove && (
                                <button
                                  onClick={() => {
                                    handleRemoveMember(
                                      member.id,
                                      member.user?.email
                                    );
                                    setOpenMenuId(null);
                                  }}
                                  disabled={isRemoving}
                                  className="
                                    flex
                                    w-full
                                    items-center
                                    gap-2
                                    px-3
                                    py-2.5
                                    text-left
                                    text-sm
                                    text-[#cccccc]
                                    transition-colors
                                    hover:bg-[#292929]
                                    hover:text-white
                                    disabled:opacity-40
                                  "
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove Member
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

    {/* Grant Access */}
    {grantAccessMemberId && (
      <CreateSessionModal
        orgId={orgId}
        isOpen={!!grantAccessMemberId}
        onClose={() => setGrantAccessMemberId(null)}
        preselectedGranteeId={grantAccessMemberId}
      />
    )}

    {/* Remove */}
    <ConfirmModal
      isOpen={!!confirmRemove}
      title="Remove Member"
      message={`Remove ${
        confirmRemove?.email || 'this member'
      } from the organization? They will lose all access immediately.`}
      confirmLabel="Remove"
      danger
      isPending={isRemoving}
      onConfirm={handleRemoveConfirmed}
      onCancel={() => setConfirmRemove(null)}
    />

    {/* Offboard */}
    <ConfirmModal
      isOpen={!!confirmOffboard}
      title="Offboard Employee"
      message={`This will permanently offboard ${
        confirmOffboard?.name ||
        confirmOffboard?.email ||
        'this member'
      } from WITHUS:\n\n• Revoke all active delegated sessions\n• Invalidate all refresh tokens (login sessions)\n• Cancel any pending approval requests\n• Remove from this organization\n\nNote: External portals (GitHub, Vercel, etc.) that WITHUS granted access to will have that access revoked. Any short-lived access JWTs (≤15 min) may briefly remain valid until expiry.`}
      confirmLabel="Offboard Now"
      danger
      isPending={isOffboarding}
      onConfirm={handleOffboardConfirmed}
      onCancel={() => setConfirmOffboard(null)}
    />
  </DashboardShell>
);
}

