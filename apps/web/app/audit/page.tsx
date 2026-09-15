'use client';

import React, { useState } from 'react';
import { useAuditEvents } from '../../hooks/useAudit';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { useOrgMembers } from '../../hooks/useOrganization';
import { formatDate, formatDateTime } from '../../lib/formatters';
import {
  ChevronDown,
  ChevronUp,
  Shield,
  Eye,
  Plus,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  Mail,
  UserPlus,
  Check,
  X,
  Key,
  RefreshCw,
  Activity,
  Clock,
  Timer,
  UserX,
  ShieldOff,
  Link,
  Link2Off,
} from 'lucide-react';
import { AuditEventDto } from '@repo/types';
import { useAuth } from '../../lib/auth/AuthContext';

// ─── Human-readable action config ───────────────────────────────────────────

interface ActionConfig {
  label: string;
  icon: React.ReactNode;
}

const ACTION_MAP: Record<string, ActionConfig> = {
  'secret.created': { label: 'Secret Created', icon: <Plus className="h-3.5 w-3.5" /> },
  'secret.updated': { label: 'Secret Updated', icon: <Pencil className="h-3.5 w-3.5" /> },
  'secret.deleted': { label: 'Secret Deleted', icon: <Trash2 className="h-3.5 w-3.5" /> },
  'secret.revealed': { label: 'Secret Revealed', icon: <Eye className="h-3.5 w-3.5" /> },
  'session.created': { label: 'Session Granted', icon: <Key className="h-3.5 w-3.5" /> },
  'session.revoked': { label: 'Session Revoked', icon: <X className="h-3.5 w-3.5" /> },
  'session.expired': { label: 'Session Expired', icon: <Clock className="h-3.5 w-3.5" /> },
  'approval.requested': { label: 'Approval Requested', icon: <Shield className="h-3.5 w-3.5" /> },
  'approval.approved': { label: 'Approval Granted', icon: <Check className="h-3.5 w-3.5" /> },
  'approval.rejected': { label: 'Approval Rejected', icon: <X className="h-3.5 w-3.5" /> },
  'member.invited': { label: 'Invitation Sent', icon: <Mail className="h-3.5 w-3.5" /> },
  'member.joined': { label: 'Member Joined', icon: <UserPlus className="h-3.5 w-3.5" /> },
  'user.login': { label: 'Login', icon: <LogIn className="h-3.5 w-3.5" /> },
  'user.logout': { label: 'Logout', icon: <LogOut className="h-3.5 w-3.5" /> },
  'mek.rotated': { label: 'Key Rotated', icon: <RefreshCw className="h-3.5 w-3.5" /> },
  'session.revoke_all': { label: 'Sessions Bulk Revoked', icon: <ShieldOff className="h-3.5 w-3.5" /> },
  'member.offboarded': { label: 'Member Offboarded', icon: <UserX className="h-3.5 w-3.5" /> },
  'integration.connected': { label: 'Integration Connected', icon: <Link className="h-3.5 w-3.5" /> },
  'integration.disconnected': { label: 'Integration Disconnected', icon: <Link2Off className="h-3.5 w-3.5" /> },
};

const FALLBACK_ACTION: ActionConfig = {
  label: '',
  icon: <Activity className="h-3.5 w-3.5" />,
};

function getActionConfig(action: string): ActionConfig {
  return ACTION_MAP[action] ?? {
    ...FALLBACK_ACTION,
    label: action.split('.').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  };
}

// ─── Relative timestamp ───────────────────────────────────────────────────────
function relativeTime(date: string | Date): string {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = now - d;
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}d ago`;
  return formatDate(date);
}

// ─── Action filter options ────────────────────────────────────────────────────
const ACTION_OPTIONS = [
  { value: '', label: 'All Events' },
  { value: 'secret.created', label: 'Secret Created' },
  { value: 'secret.revealed', label: 'Secret Revealed' },
  { value: 'secret.updated', label: 'Secret Updated' },
  { value: 'secret.deleted', label: 'Secret Deleted' },
  { value: 'session.created', label: 'Session Granted' },
  { value: 'session.revoked', label: 'Session Revoked' },
  { value: 'session.expired', label: 'Session Expired' },
  { value: 'session.revoke_all', label: 'Sessions Bulk Revoked' },
  { value: 'approval.requested', label: 'Approval Requested' },
  { value: 'approval.approved', label: 'Approval Granted' },
  { value: 'approval.rejected', label: 'Approval Rejected' },
  { value: 'member.offboarded', label: 'Member Offboarded' },
  { value: 'integration.connected', label: 'Integration Connected' },
  { value: 'integration.disconnected', label: 'Integration Disconnected' },
];

// ─── Duration formatter ───────────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} minute${m !== 1 ? 's' : ''}`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h} hour${h !== 1 ? 's' : ''}`;
}

// ─── Smart metadata row renderer ─────────────────────────────────────────────
// Shows human-readable fields for known session events.
// For all events, a collapsible "View raw" section preserves the original JSON.
function AuditMetaDetails({ action, metadata }: { action: string; metadata: Record<string, any> }) {
  const [showRaw, setShowRaw] = useState(false);
  const hasRaw = Object.keys(metadata).length > 0;

  const platformLabel = metadata.platform
    ? metadata.platform.charAt(0) + metadata.platform.slice(1).toLowerCase()
    : null;

  const expiresLabel = metadata.expiresAt
    ? formatDateTime(metadata.expiresAt)
    : null;

  const durationLabel =
    typeof metadata.durationSeconds === 'number'
      ? formatDuration(metadata.durationSeconds)
      : null;

  // Fields to render per action type
  const rows: { label: string; value: string }[] = [];

  if (action === 'session.created') {
    if (platformLabel) rows.push({ label: 'Platform', value: platformLabel });
    if (metadata.grantee) rows.push({ label: 'Granted to', value: String(metadata.grantee) });
    if (metadata.reason) rows.push({ label: 'Reason', value: String(metadata.reason) });
    if (metadata.scope) rows.push({ label: 'Scope', value: String(metadata.scope) });
    if (expiresLabel) rows.push({ label: 'Expires', value: expiresLabel });
  } else if (action === 'session.revoked') {
    if (platformLabel) rows.push({ label: 'Platform', value: platformLabel });
    if (durationLabel) rows.push({ label: 'Duration', value: durationLabel });
    if (metadata.reason) rows.push({ label: 'Reason', value: String(metadata.reason) });
  } else if (action === 'session.expired') {
    if (platformLabel) rows.push({ label: 'Platform', value: platformLabel });
    if (durationLabel) rows.push({ label: 'Duration', value: durationLabel });
    rows.push({ label: 'Status', value: 'Expired — automatic' });
  } else if (action === 'session.revoke_all') {
    if (typeof metadata.revokedCount === 'number') rows.push({ label: 'Revoked', value: `${metadata.revokedCount} session${metadata.revokedCount !== 1 ? 's' : ''}` });
    if (typeof metadata.skippedCount === 'number' && metadata.skippedCount > 0) rows.push({ label: 'Retrying', value: `${metadata.skippedCount} failed (scheduled retry)` });
  } else if (action === 'member.offboarded') {
    if (metadata.name || metadata.email) rows.push({ label: 'Member', value: String(metadata.name || metadata.email) });
    if (typeof metadata.sessionsRevoked === 'number') rows.push({ label: 'Sessions', value: `${metadata.sessionsRevoked} revoked` });
    if (typeof metadata.refreshTokensRevoked === 'number') rows.push({ label: 'Tokens', value: `${metadata.refreshTokensRevoked} invalidated` });
    if (typeof metadata.approvalsCancelled === 'number' && metadata.approvalsCancelled > 0) rows.push({ label: 'Approvals', value: `${metadata.approvalsCancelled} cancelled` });
  }

  return (
    <div className="space-y-2">
      {/* Human-readable fields — shown when we know the event type */}
      {rows.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-1.5">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-baseline gap-1.5 min-w-[140px]">
              <span className="w-20 shrink-0 text-xs font-medium text-[#666666]">{label}</span>
              <span className="text-sm text-[#dddddd]">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Raw JSON — always available, collapsed by default */}
      {hasRaw && (
        <div>
          <button
            onClick={() => setShowRaw(r => !r)}
            className="mt-1 flex items-center gap-1 text-xs font-medium text-[#666666] transition-colors hover:text-[#dddddd]"
          >
            {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showRaw ? 'Hide raw details' : 'View raw details'}
          </button>
          {showRaw && (
            <pre className="mt-2 overflow-x-auto bg-[#0b0b0b] p-3 text-xs leading-relaxed font-mono text-[#999999]">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Fallback for events with no metadata at all */}
      {!hasRaw && rows.length === 0 && (
        <span className="text-sm text-[#666666]">No additional details.</span>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AuditPage() {
  const { organization } = useAuth();
  const orgId = organization?.id || '';
  const [actionFilter, setActionFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data: membersData = [] } = useOrgMembers(orgId);

  const { data, isLoading } = useAuditEvents(orgId, {
    action: actionFilter || undefined,
    actorId: actorFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page: String(page),
    limit: '10',
  });

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setActionFilter('');
    setActorFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
            Audit Log
          </h1>
          <p className="mt-1 text-sm text-[#777777]">
            Security and operational events across {organization?.name}.
          </p>
        </div>

        <section className="bg-[#181818] p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#cccccc]">Event type</label>
              <select
                className="w-full bg-[#111111] px-3.5 py-2.5 text-sm text-[#dddddd] outline-none"
                value={actionFilter}
                onChange={handleFilterChange(setActionFilter)}
              >
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#cccccc]">Actor</label>
              <select
                className="w-full bg-[#111111] px-3.5 py-2.5 text-sm text-[#dddddd] outline-none"
                value={actorFilter}
                onChange={handleFilterChange(setActorFilter)}
              >
                <option value="">All Members</option>
                {membersData.map((m: any) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.fullName || m.user?.email || m.userId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#cccccc]">From</label>
              <input
                type="date"
                className="w-full bg-[#111111] px-3.5 py-2.5 text-sm text-[#dddddd] outline-none"
                value={startDate}
                onChange={handleFilterChange(setStartDate)}
                max={endDate || undefined}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#cccccc]">To</label>
              <input
                type="date"
                className="w-full bg-[#111111] px-3.5 py-2.5 text-sm text-[#dddddd] outline-none"
                value={endDate}
                onChange={handleFilterChange(setEndDate)}
                min={startDate || undefined}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="bg-[#242424] px-4 py-2.5 text-sm font-medium text-[#cccccc] transition-colors hover:bg-[#2c2c2c] hover:text-white"
            >
              Clear filters
            </button>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#eeeeee]">Events</h2>
            {data && (
              <span className="text-xs text-[#555555]">
                {data.total} total events
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-[#181818]">
                  <th className="px-5 py-4 text-sm font-medium text-[#777777]">Event</th>
                  <th className="px-5 py-4 text-sm font-medium text-[#777777]">Actor</th>
                  <th className="hidden px-5 py-4 text-sm font-medium text-[#777777] sm:table-cell">
                    Resource
                  </th>
                  <th className="px-5 py-4 text-sm font-medium text-[#777777]">When</th>
                  <th className="px-5 py-4 text-right text-sm font-medium text-[#777777]">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="bg-[#181818] px-5 py-14 text-center">
                      <Activity className="mx-auto mb-3 h-5 w-5 animate-pulse text-[#777777]" />
                      <p className="text-sm text-[#777777]">Loading events...</p>
                    </td>
                  </tr>
                ) : data?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="bg-[#181818] px-5 py-14 text-center">
                      <Shield className="mx-auto mb-3 h-7 w-7 text-[#555555]" />
                      <p className="text-sm font-medium text-[#cccccc]">No events found</p>
                      <p className="mt-1 text-sm text-[#666666]">
                        Events will appear here as your team uses WithUs.
                      </p>
                    </td>
                  </tr>
                ) : (
                  data?.data?.map((event: AuditEventDto) => {
                    const cfg = getActionConfig(event.action);
                    const actorName =
                      (event.actor as any)?.fullName ||
                      (event.actor as any)?.email ||
                      'System';
                    const actorEmail = (event.actor as any)?.fullName
                      ? (event.actor as any)?.email
                      : null;

                    const typeLabel = event.resourceType
                      ? event.resourceType
                          .charAt(0)
                          .toUpperCase() +
                        event.resourceType.slice(1).toLowerCase().replace('_', ' ')
                      : null;

                    const resourceLabel = typeLabel
                      ? (event as any).resourceName
                        ? `${typeLabel}: ${(event as any).resourceName.split('_deleted_')[0]}`
                        : typeLabel
                      : null;

                    return (
                      <React.Fragment key={event.id}>
                        <tr className="bg-[#181818] transition-colors hover:bg-[#1d1d1d]">
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#dddddd]">
                              <span className="text-[#777777]">{cfg.icon}</span>
                              {cfg.label}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#242424]">
                                <span className="text-xs font-medium text-[#999999]">
                                  {actorName[0]?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-[#dddddd]">
                                  {actorName}
                                </p>
                                {actorEmail && (
                                  <p className="mt-0.5 truncate text-xs text-[#666666]">
                                    {actorEmail}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="hidden px-5 py-4 sm:table-cell">
                            {resourceLabel ? (
                              <span className="text-sm text-[#777777]">{resourceLabel}</span>
                            ) : (
                              <span className="text-sm text-[#444444]">—</span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className="text-sm text-[#777777]"
                              title={formatDateTime(event.createdAt)}
                            >
                              {relativeTime(event.createdAt)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => toggleRow(event.id)}
                              className="text-[#666666] transition-colors hover:text-[#dddddd]"
                              title="View details"
                            >
                              {expandedRow === event.id ? (
                                <ChevronUp className="ml-auto h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-auto h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {expandedRow === event.id && (
                          <tr>
                            <td colSpan={5} className="bg-[#141414] px-5 py-5">
                              <div className="text-sm text-[#777777]">
                                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                                  <div>
                                    <p className="text-xs font-medium text-[#555555]">Event time</p>
                                    <p className="mt-1 text-sm text-[#dddddd]">
                                      {formatDateTime(event.createdAt)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-[#555555]">Resource type</p>
                                    <p className="mt-1 text-sm text-[#dddddd]">
                                      {event.resourceType || '—'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-[#555555]">Event version</p>
                                    <p className="mt-1 text-sm text-[#dddddd]">
                                      v{event.eventVersion}
                                    </p>
                                  </div>
                                </div>

                                {Boolean(event.metadata) && (
                                  <div className="mt-5">
                                    <p className="mb-3 text-xs font-medium text-[#555555]">Details</p>
                                    <AuditMetaDetails
                                      action={event.action}
                                      metadata={(event.metadata as Record<string, any>) ?? {}}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-1 flex items-center justify-between bg-[#181818] px-5 py-4">
              <p className="text-sm text-[#666666]">
                Page <span className="text-[#dddddd]">{page}</span> of{' '}
                <span className="text-[#dddddd]">{data.totalPages}</span>
              </p>

              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-[#242424] px-3 py-2 text-xs font-medium text-[#cccccc] transition-colors hover:bg-[#2c2c2c] disabled:cursor-not-allowed disabled:bg-[#181818] disabled:text-[#444444]"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="bg-[#242424] px-3 py-2 text-xs font-medium text-[#cccccc] transition-colors hover:bg-[#2c2c2c] disabled:cursor-not-allowed disabled:bg-[#181818] disabled:text-[#444444]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}