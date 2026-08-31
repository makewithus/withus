/**
 * permissions.ts — Frontend role-permission helper.
 *
 * Mirrors the backend PermissionEvaluator matrix exactly.
 * This is the ONLY place in the frontend where role-to-permission
 * mappings are defined. All components must import from here.
 *
 * Architectural contract:
 *   - Do NOT duplicate role checks in individual components.
 *   - UI restrictions are a UX layer only; the backend remains the
 *     authoritative security gate.
 *   - Keep this file in sync with:
 *     apps/api/src/authorization/evaluators/permission.evaluator.ts
 */

export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER' | string;

/** Granular permissions — mirrors backend Permission enum */
export const rolePermissions: Record<string, readonly string[]> = {
  OWNER: [
    'ORGANIZATION_READ',
    'ORGANIZATION_UPDATE',
    'ORGANIZATION_DELETE',
    'MEMBER_READ',
    'MEMBER_INVITE',
    'MEMBER_REMOVE',
    'MEMBER_UPDATE_ROLE',
    'VAULT_READ',
    'VAULT_CREATE',
    'VAULT_UPDATE',
    'VAULT_DELETE',
    'SECRET_READ',
    'SECRET_CREATE',
    'SECRET_UPDATE',
    'SECRET_DELETE',
    'SECRET_REVEAL',
    'APPLICATION_READ',
    'APPLICATION_CREATE',
    'APPLICATION_UPDATE',
    'APPLICATION_DELETE',
    'APPROVAL_READ',
    'APPROVAL_APPROVE',
    'APPROVAL_REJECT',
    'AUDIT_READ',
    'PRESENCE_READ',
    'SESSION_START',
    'SESSION_REVOKE',
    'INTEGRATION_READ',
    'INTEGRATION_CONNECT',
    'INTEGRATION_DISCONNECT',
  ],
  ADMIN: [
    'ORGANIZATION_READ',
    'MEMBER_READ',
    'MEMBER_INVITE',
    'MEMBER_REMOVE',
    'VAULT_READ',
    'VAULT_CREATE',
    'VAULT_UPDATE',
    // NOTE: No VAULT_DELETE — ADMIN cannot delete vaults
    'SECRET_READ',
    'SECRET_CREATE',
    'SECRET_UPDATE',
    'SECRET_DELETE',
    'SECRET_REVEAL',
    'APPLICATION_READ',
    'APPLICATION_CREATE',
    'APPROVAL_READ',
    'APPROVAL_APPROVE',
    'APPROVAL_REJECT',
    'AUDIT_READ',
    'PRESENCE_READ',
    'SESSION_START',
    'SESSION_REVOKE',
    'INTEGRATION_READ',
    'INTEGRATION_CONNECT',
    'INTEGRATION_DISCONNECT',
  ],
  MEMBER: [
    'ORGANIZATION_READ',
    'MEMBER_READ',
    'VAULT_READ',
    'SECRET_READ',
    'APPLICATION_READ',
    'APPROVAL_READ',
    'SESSION_START',
    'INTEGRATION_READ',
  ],
} as const;

/**
 * Returns true if the given role has the specified permission.
 * Matches backend PermissionEvaluator.evaluate() logic.
 */
export function hasPermission(role: OrgRole | null | undefined, permission: string): boolean {
  if (!role) return false;
  const perms = rolePermissions[role] ?? [];
  return (perms as readonly string[]).includes(permission);
}
