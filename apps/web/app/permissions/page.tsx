'use client';

import React from 'react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { useAuth } from '../../lib/auth/AuthContext';
import { hasPermission, OrgRole } from '../../lib/auth/permissions';
import {
  Shield,
  Crown,
  UserCheck,
  User,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  Key,
  Lock,
  Plug2,
  Clock,
  CheckSquare,
  Activity,
  FileText,
} from 'lucide-react';
import clsx from 'clsx';

interface PermissionRow {
  key: string;
  label: string;
  description: string;
}

interface PermissionGroup {
  id: string;
  title: string;
  icon: React.ElementType;
  permissions: PermissionRow[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'organization',
    title: 'Organization & Workspace',
    icon: Building2,
    permissions: [
      { key: 'ORGANIZATION_READ', label: 'View Workspace Details', description: 'Read organization metadata and workspace settings' },
      { key: 'ORGANIZATION_UPDATE', label: 'Update Workspace Settings', description: 'Modify workspace name and organization profile' },
      { key: 'ORGANIZATION_DELETE', label: 'Delete Workspace', description: 'Permanently remove organization and all associated data' },
    ],
  },
  {
    id: 'team',
    title: 'Team & Member Management',
    icon: Users,
    permissions: [
      { key: 'MEMBER_READ', label: 'View Team Members', description: 'See organization directory and member statuses' },
      { key: 'MEMBER_INVITE', label: 'Invite New Members', description: 'Send organization invitations and manage pending invites' },
      { key: 'MEMBER_REMOVE', label: 'Remove Members', description: 'Offboard or remove members from the organization' },
      { key: 'MEMBER_UPDATE_ROLE', label: 'Manage Member Roles', description: 'Promote members to Admin or demote Admins to Member' },
    ],
  },
  {
    id: 'vaults',
    title: 'Vault Management',
    icon: Key,
    permissions: [
      { key: 'VAULT_READ', label: 'View Vaults', description: 'Browse and view available organization vaults' },
      { key: 'VAULT_CREATE', label: 'Create Vaults', description: 'Initialize new secure credential vaults' },
      { key: 'VAULT_UPDATE', label: 'Update Vault Details', description: 'Modify vault name and description' },
      { key: 'VAULT_DELETE', label: 'Delete Vaults', description: 'Permanently delete a vault and all contained credentials' },
    ],
  },
  {
    id: 'secrets',
    title: 'Secret & Credential Operations',
    icon: Lock,
    permissions: [
      { key: 'SECRET_READ', label: 'View Secret Metadata', description: 'See secret names and metadata without revealing plaintext' },
      { key: 'SECRET_CREATE', label: 'Add Secrets', description: 'Store new credentials into existing vaults' },
      { key: 'SECRET_UPDATE', label: 'Edit Secrets', description: 'Update credential usernames, passwords, or notes' },
      { key: 'SECRET_DELETE', label: 'Delete Secrets', description: 'Remove individual credentials from a vault' },
      { key: 'SECRET_REVEAL', label: 'Reveal Secret Plaintext', description: 'Decrypt and reveal secret values directly in dashboard' },
    ],
  },
  {
    id: 'integrations',
    title: 'Platform Integrations',
    icon: Plug2,
    permissions: [
      { key: 'INTEGRATION_READ', label: 'View Connected Integrations', description: 'See active OAuth connections and custom portal configs' },
      { key: 'INTEGRATION_CONNECT', label: 'Connect Platforms', description: 'Authorize new OAuth integrations (Gmail, GitHub, Vercel)' },
      { key: 'INTEGRATION_DISCONNECT', label: 'Disconnect Platforms', description: 'Revoke connected platform integrations' },
    ],
  },
  {
    id: 'sessions',
    title: 'Delegated Sessions',
    icon: Clock,
    permissions: [
      { key: 'SESSION_START', label: 'Request / Use Delegated Access', description: 'Start authorized browser extension fill sessions' },
      { key: 'SESSION_REVOKE', label: 'Grant & Revoke Sessions', description: 'Directly issue delegated access or revoke active sessions' },
    ],
  },
  {
    id: 'approvals',
    title: 'Access Request Approvals',
    icon: CheckSquare,
    permissions: [
      { key: 'APPROVAL_READ', label: 'View Access Requests', description: 'Read incoming and outgoing access approval requests' },
      { key: 'APPROVAL_APPROVE', label: 'Approve Access Requests', description: 'Authorize delegated session access requests' },
      { key: 'APPROVAL_REJECT', label: 'Reject Access Requests', description: 'Decline delegated session access requests' },
    ],
  },
  {
    id: 'presence',
    title: 'Real-time Activity & Presence',
    icon: Activity,
    permissions: [
      { key: 'PRESENCE_READ', label: 'View Live Activity Monitor', description: 'Monitor real-time team extension heartbeats and active sessions' },
    ],
  },
  {
    id: 'audit',
    title: 'Security Audit Log',
    icon: FileText,
    permissions: [
      { key: 'AUDIT_READ', label: 'View Audit Logs', description: 'Inspect immutable historical security audit events' },
    ],
  },
];

export default function PermissionMatrixPage() {
  const { organization } = useAuth();
  const currentRole: OrgRole = (organization?.role as OrgRole) || 'MEMBER';

  const roles: { id: OrgRole; title: string; icon: React.ElementType; badgeStyle: string; cardBorder: string }[] = [
    {
      id: 'OWNER',
      title: 'Owner',
      icon: Crown,
      badgeStyle: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
      cardBorder: 'border-amber-400/40 dark:border-amber-600/40',
    },
    {
      id: 'ADMIN',
      title: 'Admin',
      icon: UserCheck,
      badgeStyle: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50',
      cardBorder: 'border-indigo-400/40 dark:border-indigo-600/40',
    },
    {
      id: 'MEMBER',
      title: 'Member',
      icon: User,
      badgeStyle: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
      cardBorder: 'border-slate-300 dark:border-zinc-700',
    },
  ];

  return (
  <DashboardShell>
    <div className="mx-auto max-w-6xl space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
            Permission Matrix
          </h1>

          <p className="mt-1 text-sm text-[#777777]">
            Access permissions by organization role.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-[#555555]">
            Your role
          </p>
          <p className="mt-0.5 text-sm font-medium text-[#eeeeee]">
            {currentRole}
          </p>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">

          <thead>
            <tr className="bg-[#181818]">
              <th className="px-5 py-4 text-sm font-medium text-[#eeeeee]">
                Permission
              </th>

              {roles.map((role) => (
                <th
                  key={role.id}
                  className={clsx(
                    'w-32 px-4 py-4 text-center text-xs font-medium',
                    currentRole === role.id
                      ? 'text-[#eeeeee]'
                      : 'text-[#666666]'
                  )}
                >
                  {role.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {PERMISSION_GROUPS.map((group) => {
              const GroupIcon = group.icon;

              return (
                <React.Fragment key={group.id}>

                  {/* Group */}
                  <tr>
                    <td
                      colSpan={4}
                      className="bg-[#111111] px-5 pt-7 pb-2"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-[#eeeeee]">
                        <GroupIcon className="h-4 w-4 text-[#777777]" />
                        {group.title}
                      </div>
                    </td>
                  </tr>

                  {/* Permissions */}
                  {group.permissions.map((permission) => (
                    <tr
                      key={permission.key}
                      className="group bg-[#181818] transition-colors hover:bg-[#1d1d1d]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#dddddd]">
                          {permission.label}
                        </p>

                        <p className="mt-0.5 max-w-xl text-xs leading-5 text-[#666666]">
                          {permission.description}
                        </p>
                      </td>

                      {roles.map((role) => {
                        const allowed = hasPermission(
                          role.id,
                          permission.key
                        );

                        const isCurrent =
                          currentRole === role.id;

                        return (
                          <td
                            key={role.id}
                            className={clsx(
                              'px-4 py-4 text-center',
                              isCurrent && 'bg-[#1d1d1d]'
                            )}
                          >
                            {allowed ? (
                              <CheckCircle2
                                className="mx-auto h-4 w-4 text-[#eeeeee]"
                              />
                            ) : (
                              <XCircle
                                className="mx-auto h-4 w-4 text-[#444444]"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  </DashboardShell>
);
}
