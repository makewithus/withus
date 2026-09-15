'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { useAuth } from '../../lib/auth/AuthContext';
import { useUpdateOrganization } from '../../hooks/useOrganization';
import { useUpdateProfile, useChangePassword, useProfile } from '../../hooks/useProfile';
import { useToast } from '../../components/common/Toast';
import { Loader2, Building2, User, Lock, Eye, EyeOff, GitBranch } from 'lucide-react';
import { hasPermission } from '../../lib/auth/permissions';

export default function SettingsPage() {
  const { organization, refreshContext } = useAuth();
  const { toast } = useToast();
  const role = (organization as any)?.role as string | undefined;
  // ORGANIZATION_UPDATE is OWNER-only per the backend permission matrix
  const canUpdateOrg = hasPermission(role, 'ORGANIZATION_UPDATE');

  // ── Workspace ──────────────────────────────────────────────
  const [orgName, setOrgName] = useState(organization?.name || '');
  const { mutate: updateOrg, isPending: orgPending } = useUpdateOrganization(organization?.id || '');

  useEffect(() => {
    if (organization?.name) setOrgName(organization.name);
  }, [organization?.name]);

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    updateOrg(
      { name: orgName.trim() },
      {
        onSuccess: () => { toast('success', 'Workspace name updated.'); refreshContext(); },
        onError: (err: any) => toast('error', err.message || 'Failed to update workspace.'),
      }
    );
  };

  // ── Profile ────────────────────────────────────────────────
  const { data: profile } = useProfile();
  const [fullName, setFullName] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const { mutate: updateProfile, isPending: profilePending } = useUpdateProfile();

  useEffect(() => {
    if (profile?.fullName) setFullName(profile.fullName);
    if (profile?.providerProfiles?.githubUsername) setGithubUsername(profile.providerProfiles.githubUsername);
  }, [profile]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    updateProfile(
      { fullName: fullName.trim(), githubUsername: githubUsername.trim() },
      {
        onSuccess: () => { toast('success', 'Profile updated.'); refreshContext(); },
        onError: (err: any) => toast('error', err.message || 'Failed to update profile.'),
      }
    );
  };

  // ── Change Password ────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwError, setPwError] = useState('');
  const { mutate: changePassword, isPending: pwPending } = useChangePassword();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (newPassword !== confirmPassword) { setPwError('New passwords do not match.'); return; }
    if (newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return; }

    changePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast('success', 'Password changed. You will be logged out of all devices.');
          setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        },
        onError: (err: any) => setPwError(err?.response?.data?.message || 'Failed to change password.'),
      }
    );
  };

  const inputClass =
    'w-full bg-[#111111] px-3.5 py-2.5 text-sm text-[#eeeeee] placeholder:text-[#555555] outline-none transition-colors focus:bg-[#161616] disabled:cursor-not-allowed disabled:text-[#555555]';

  const labelClass = 'block text-sm font-medium text-[#cccccc] mb-2';

  const saveBtn =
    'inline-flex items-center justify-center bg-[#eeeeee] px-4 py-2.5 text-sm font-medium text-[#111111] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-[#666666]';

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#eeeeee]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[#777777]">
            Manage your profile, workspace, and password.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-1 lg:grid-cols-2 lg:items-start">
          <div className="space-y-1">
            {/* Profile */}
            <section className="bg-[#181818]">
              <div className="px-6 py-5">
                <h2 className="text-base font-medium text-[#eeeeee]">Profile</h2>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6 px-6 pb-6">
                <div>
                  <label htmlFor="profile-fullname" className={labelClass}>
                    Full Name
                  </label>
                  <input
                    id="profile-fullname"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="profile-email" className={labelClass}>
                    Email Address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    readOnly
                    value={profile?.email || ''}
                    className={`${inputClass} cursor-not-allowed bg-[#151515] text-[#666666]`}
                  />
                  <p className="mt-2 text-xs text-[#555555]">
                    Email changes require email verification — coming soon.
                  </p>
                </div>

                <div>
                  <label htmlFor="profile-github" className={labelClass}>
                    GitHub Username
                  </label>
                  <input
                    id="profile-github"
                    type="text"
                    value={githubUsername}
                    onChange={e => setGithubUsername(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. octocat"
                  />
                  <p className="mt-2 text-xs text-[#555555]">
                    Required to receive delegated access to GitHub repositories.
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={profilePending || (!fullName.trim() && !githubUsername.trim())}
                    className={saveBtn}
                  >
                    {profilePending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Profile
                  </button>
                </div>
              </form>
            </section>

            {/* Workspace */}
            {canUpdateOrg && (
              <section className="bg-[#181818]">
                <div className="px-6 py-5">
                  <h2 className="text-base font-medium text-[#eeeeee]">Workspace</h2>
                  <p className="mt-1 text-sm text-[#666666]">
                    Manage your organization settings.
                  </p>
                </div>

                <form onSubmit={handleOrgSubmit} className="space-y-6 px-6 pb-6">
                  <div>
                    <label htmlFor="settings-org-name" className={labelClass}>
                      Workspace Name
                    </label>
                    <input
                      id="settings-org-name"
                      type="text"
                      required
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-org-id" className={labelClass}>
                      Organization ID
                    </label>
                    <input
                      id="settings-org-id"
                      type="text"
                      readOnly
                      value={organization?.id || ''}
                      className={`${inputClass} cursor-not-allowed bg-[#151515] font-mono text-[#666666]`}
                    />
                    <p className="mt-2 text-xs text-[#555555]">
                      Use this ID when calling the API directly.
                    </p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={
                        orgPending ||
                        !orgName.trim() ||
                        orgName === organization?.name
                      }
                      className={saveBtn}
                    >
                      {orgPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>

          {/* Password */}
          <section className="bg-[#181818]">
            <div className="px-6 py-5">
              <h2 className="text-base font-medium text-[#eeeeee]">
                Change Password
              </h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6 px-6 pb-6">
              <div>
                <label htmlFor="settings-current-password" className={labelClass}>
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="settings-current-password"
                    type={showPasswords ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={e => {
                      setCurrentPassword(e.target.value);
                      setPwError('');
                    }}
                    className={`${inputClass} pr-11`}
                    placeholder="Your current password"
                  />
                  <button
                    type="button"
                    aria-label={showPasswords ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPasswords(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] transition-colors hover:text-[#cccccc]"
                  >
                    {showPasswords ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="settings-new-password" className={labelClass}>
                  New Password
                </label>
                <input
                  id="settings-new-password"
                  type={showPasswords ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value);
                    setPwError('');
                  }}
                  className={inputClass}
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label htmlFor="settings-confirm-password" className={labelClass}>
                  Confirm New Password
                </label>
                <input
                  id="settings-confirm-password"
                  type={showPasswords ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    setPwError('');
                  }}
                  className={inputClass}
                  placeholder="Repeat new password"
                />
              </div>

              {pwError && (
                <p className="bg-[#242424] px-3 py-2.5 text-sm text-[#cccccc]">
                  {pwError}
                </p>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={
                    pwPending ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className={saveBtn}
                >
                  {pwPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Change Password
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}